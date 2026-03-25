
CREATE TABLE t_p32559361_trash_disposal_app.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  age INTEGER,
  verified BOOLEAN DEFAULT FALSE,
  parent_phone VARCHAR(20),
  parent_consent BOOLEAN DEFAULT FALSE,
  wallet_balance INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 5.0,
  orders_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p32559361_trash_disposal_app.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_p32559361_trash_disposal_app.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES t_p32559361_trash_disposal_app.users(id),
  token VARCHAR(64) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_otp_phone ON t_p32559361_trash_disposal_app.otp_codes(phone);
CREATE INDEX idx_sessions_token ON t_p32559361_trash_disposal_app.sessions(token);
