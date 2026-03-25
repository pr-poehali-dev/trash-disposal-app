const URLS = {
  'send-otp': 'https://functions.poehali.dev/32ec347a-a216-4b13-acbe-031e1ee74371',
  'verify-otp': 'https://functions.poehali.dev/f7c8b26f-cebb-49ed-bdb9-ce9ed8970d94',
};

export async function sendOtp(phone: string): Promise<{ success: boolean; dev_code?: string; message?: string; error?: string }> {
  const res = await fetch(URLS['send-otp'], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  const text = await res.text();
  try { return JSON.parse(JSON.parse(text)); } catch { return JSON.parse(text); }
}

export async function verifyOtp(phone: string, code: string, role: string): Promise<{
  success?: boolean;
  token?: string;
  is_new?: boolean;
  user?: { id: string; phone: string; name: string | null; role: string; verified: boolean };
  error?: string;
}> {
  const res = await fetch(URLS['verify-otp'], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, role }),
  });
  const text = await res.text();
  try { return JSON.parse(JSON.parse(text)); } catch { return JSON.parse(text); }
}
