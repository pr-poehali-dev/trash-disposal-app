import json
import os
import secrets
import psycopg2
from datetime import datetime, timedelta, timezone

SCHEMA = os.environ.get('MAIN_DB_SCHEMA', 't_p32559361_trash_disposal_app')

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    """Верификация OTP-кода и выдача сессионного токена. Создаёт пользователя если его нет."""
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
    code = (body.get('code') or '').strip()
    role = body.get('role', 'customer')
    reg_name = (body.get('name') or '').strip()
    reg_address = (body.get('address') or '').strip()

    if not phone or not code:
        return {
            'statusCode': 400,
            'headers': headers,
            'body': json.dumps({'error': 'Укажите телефон и код'})
        }

    # Нормализуем телефон
    phone = ''.join(c for c in phone if c.isdigit() or c == '+')
    if phone.startswith('8'):
        phone = '+7' + phone[1:]
    if not phone.startswith('+'):
        phone = '+' + phone

    now = datetime.now(timezone.utc)

    conn = get_conn()
    try:
        cur = conn.cursor()

        # Проверяем код
        cur.execute(
            f"""SELECT id FROM {SCHEMA}.otp_codes
                WHERE phone = %s AND code = %s AND used = FALSE AND expires_at > %s
                ORDER BY created_at DESC LIMIT 1""",
            (phone, code, now)
        )
        otp_row = cur.fetchone()

        if not otp_row:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Неверный или истёкший код'})
            }

        otp_id = otp_row[0]

        # Помечаем код как использованный
        cur.execute(f"UPDATE {SCHEMA}.otp_codes SET used = TRUE WHERE id = %s", (otp_id,))

        # Ищем или создаём пользователя
        cur.execute(f"SELECT id, name, role, verified, address FROM {SCHEMA}.users WHERE phone = %s", (phone,))
        user_row = cur.fetchone()

        is_new = False
        if user_row:
            user_id, name, user_role, verified, user_address = user_row
            if reg_name and not name:
                cur.execute(f"UPDATE {SCHEMA}.users SET name = %s WHERE id = %s", (reg_name, str(user_id)))
                name = reg_name
        else:
            is_new = True
            cur.execute(
                f"""INSERT INTO {SCHEMA}.users (phone, role, name, address) VALUES (%s, %s, %s, %s)
                    RETURNING id, name, role, verified, address""",
                (phone, role, reg_name or None, reg_address or None)
            )
            user_id, name, user_role, verified, user_address = cur.fetchone()

        # Создаём сессию на 30 дней
        token = secrets.token_hex(32)
        expires_at = now + timedelta(days=30)
        cur.execute(
            f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s, %s, %s)",
            (str(user_id), token, expires_at)
        )

        conn.commit()
    finally:
        conn.close()

    return {
        'statusCode': 200,
        'headers': headers,
        'body': json.dumps({
            'success': True,
            'token': token,
            'is_new': is_new,
            'user': {
                'id': str(user_id),
                'phone': phone,
                'name': name,
                'role': user_role,
                'verified': verified,
                'address': user_address,
            }
        })
    }