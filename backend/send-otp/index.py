import json
import os
import random
import string
import psycopg2
from datetime import datetime, timedelta, timezone

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p32559361_trash_disposal_app')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Отправка OTP-кода на номер телефона для авторизации."""
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
        'Access-Control-Max-Age': '86400',
    }

    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': headers, 'body': ''}

    body = json.loads(event.get('body') or '{}')
    phone = (body.get('phone') or '').strip()

    if not phone or len(phone) < 10:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Укажите корректный номер телефона'})
        }

    # Нормализуем телефон
    phone = ''.join(c for c in phone if c.isdigit() or c == '+')
    if phone.startswith('8'):
        phone = '+7' + phone[1:]
    if not phone.startswith('+'):
        phone = '+' + phone

    # Генерируем 6-значный код
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)

    conn = get_conn()
    try:
        cur = conn.cursor()
        # Инвалидируем старые коды
        cur.execute(
            f"UPDATE {SCHEMA}.otp_codes SET used = TRUE WHERE phone = %s AND used = FALSE",
            (phone,)
        )
        # Сохраняем новый код
        cur.execute(
            f"INSERT INTO {SCHEMA}.otp_codes (phone, code, expires_at) VALUES (%s, %s, %s)",
            (phone, code, expires_at)
        )
        conn.commit()
    finally:
        conn.close()

    # В продакшене здесь будет реальная отправка SMS через провайдера
    # Пока возвращаем код в ответе (только для разработки!)
    print(f"OTP for {phone}: {code}")

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'message': f'Код отправлен на {phone}',
            'dev_code': code  # убрать в продакшене
        })
    }
