import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { sendOtp, verifyOtp } from "@/lib/api";

type Role = "customer" | "executor";

type User = {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  address: string | null;
  verified: boolean;
};

type Props = {
  role: Role;
  onSuccess: (user: User) => void;
  onBack: () => void;
};

type Step = "register" | "code";

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  accentColor,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  accentColor: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div
        className="flex items-center gap-3 glass rounded-2xl px-4 py-3.5 border transition-all"
        style={{ borderColor: value ? `${accentColor}40` : "rgba(255,255,255,0.1)" }}
      >
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
        />
      </div>
    </div>
  );
}

export default function AuthScreen({ role, onSuccess, onBack }: Props) {
  const [step, setStep] = useState<Step>("register");

  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  function formatPhone(raw: string) {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    let d = digits;
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (d.startsWith("7")) {
      const n = d.slice(1);
      let result = "+7";
      if (n.length > 0) result += " (" + n.slice(0, 3);
      if (n.length >= 3) result += ") ";
      if (n.length > 3) result += n.slice(3, 6);
      if (n.length >= 6) result += "-";
      if (n.length > 6) result += n.slice(6, 8);
      if (n.length >= 8) result += "-";
      if (n.length > 8) result += n.slice(8, 10);
      return result;
    }
    return "+" + d;
  }

  function getRawPhone() {
    const digits = phone.replace(/\D/g, "");
    return digits.startsWith("8") ? "+7" + digits.slice(1) : "+" + digits;
  }

  async function handleSendOtp() {
    setError("");
    if (!lastName.trim()) { setError("Введите фамилию"); return; }
    if (!firstName.trim()) { setError("Введите имя"); return; }
    const raw = getRawPhone();
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 11) { setError("Введите полный номер телефона"); return; }
    if (!address.trim()) { setError("Введите адрес"); return; }
    if (!agreed) { setError("Необходимо согласие на обработку персональных данных"); return; }

    setLoading(true);
    try {
      const res = await sendOtp(raw);
      if (res.error) { setError(res.error); return; }
      if (res.dev_code) setDevCode(res.dev_code);
      setStep("code");
      setCountdown(60);
      setTimeout(() => inputsRef.current[0]?.focus(), 100);
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  function handleCodeInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) inputsRef.current[index + 1]?.focus();
    if (newCode.every((d) => d !== "") && digit) {
      setTimeout(() => handleVerifyCode(newCode), 100);
    }
  }

  function handleCodeKey(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  async function handleVerifyCode(c: string[]) {
    const fullCode = c.join("");
    if (fullCode.length < 6) return;
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(getRawPhone(), fullCode, role, {
        name: `${lastName.trim()} ${firstName.trim()}`,
        address: address.trim(),
      });
      if (res.error) {
        setError(res.error);
        setCode(["", "", "", "", "", ""]);
        inputsRef.current[0]?.focus();
        return;
      }
      if (res.success && res.user && res.token) {
        localStorage.setItem("auth_token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        onSuccess(res.user);
      }
    } catch {
      setError("Ошибка сети. Попробуйте снова.");
    } finally {
      setLoading(false);
    }
  }

  const isLime = role === "customer";
  const accentColor = isLime ? "#aaff00" : "#bb44ff";

  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <div
        className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none orb-animate"
        style={{
          background: `radial-gradient(circle, ${isLime ? "rgba(170,255,0,0.07)" : "rgba(187,68,255,0.07)"} 0%, transparent 70%)`,
          transform: "translate(-40%, -40%)",
        }}
      />

      <div className="flex-1 flex flex-col px-6 pt-10 pb-8 relative z-10 overflow-y-auto">
        <button
          onClick={step === "code" ? () => setStep("register") : onBack}
          className="flex items-center gap-2 text-muted-foreground mb-6 w-fit flex-shrink-0"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm">Назад</span>
        </button>

        <div className="max-w-xs mx-auto w-full">
          <div
            className="w-14 h-14 rounded-2xl mb-5 flex items-center justify-center text-2xl flex-shrink-0"
            style={{
              background: isLime ? "rgba(170,255,0,0.12)" : "rgba(187,68,255,0.12)",
              border: `1px solid ${isLime ? "rgba(170,255,0,0.3)" : "rgba(187,68,255,0.3)"}`,
            }}
          >
            {role === "customer" ? "🏠" : "⚡"}
          </div>

          {step === "register" ? (
            <>
              <h1 className="font-display font-900 text-2xl mb-1">
                {role === "customer" ? "Регистрация заказчика" : "Регистрация исполнителя"}
              </h1>
              <p className="text-sm text-muted-foreground mb-5">
                Заполни данные для регистрации
              </p>

              <div className="space-y-3">
                <div
                  className="px-3 py-2 rounded-xl border text-xs font-600 text-center"
                  style={{
                    background: isLime ? "rgba(170,255,0,0.08)" : "rgba(187,68,255,0.08)",
                    borderColor: isLime ? "rgba(170,255,0,0.25)" : "rgba(187,68,255,0.25)",
                    color: accentColor,
                  }}
                >
                  {role === "customer" ? "Я — заказчик" : "Я — исполнитель"}
                </div>

                <InputField label="Фамилия" value={lastName} onChange={setLastName} placeholder="Иванов" accentColor={accentColor} />
                <InputField label="Имя" value={firstName} onChange={setFirstName} placeholder="Иван" accentColor={accentColor} />

                <div>
                  <p className="text-xs text-muted-foreground mb-1.5">Номер телефона</p>
                  <div
                    className="flex items-center gap-3 glass rounded-2xl px-4 py-3.5 border transition-all"
                    style={{ borderColor: phone ? `${accentColor}40` : "rgba(255,255,255,0.1)" }}
                  >
                    <span className="text-sm">🇷🇺</span>
                    <input
                      type="tel"
                      value={formatPhone(phone)}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setPhone(digits.slice(0, 11));
                        setError("");
                      }}
                      placeholder="+7 (999) 000-00-00"
                      className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
                    />
                    {phone && (
                      <button onClick={() => setPhone("")}>
                        <Icon name="X" size={14} className="text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>

                <InputField
                  label="Адрес вывоза мусора"
                  value={address}
                  onChange={setAddress}
                  placeholder="ул. Ленина, д. 1, кв. 10"
                  accentColor={accentColor}
                />

                <button
                  onClick={() => setAgreed(!agreed)}
                  className="flex items-start gap-3 w-full text-left"
                >
                  <div
                    className="w-5 h-5 rounded-md border flex-shrink-0 mt-0.5 flex items-center justify-center transition-all"
                    style={{
                      borderColor: agreed ? accentColor : "rgba(255,255,255,0.25)",
                      background: agreed ? accentColor : "transparent",
                    }}
                  >
                    {agreed && <Icon name="Check" size={12} className={isLime ? "text-[hsl(220,20%,8%)]" : "text-white"} />}
                  </div>
                  <span className="text-xs text-muted-foreground leading-relaxed">
                    Я даю согласие на{" "}
                    <span style={{ color: accentColor }}>обработку персональных данных</span>{" "}
                    в соответствии с ФЗ № 152-ФЗ
                  </span>
                </button>

                {error && (
                  <p className="text-destructive text-xs flex items-center gap-1">
                    <Icon name="AlertCircle" size={12} />
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-display font-700 text-base transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    background: isLime
                      ? "linear-gradient(135deg, #aaff00, #66dd00)"
                      : "linear-gradient(135deg, #bb44ff, #7722cc)",
                    color: isLime ? "hsl(220,20%,8%)" : "#fff",
                  }}
                >
                  {loading ? "Отправка..." : "Получить код подтверждения"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display font-900 text-2xl mb-1">Введи код</h1>
              <p className="text-sm text-muted-foreground mb-6">
                Отправили на <span className="text-foreground font-600">{formatPhone(phone)}</span>
              </p>

              <div className="flex gap-2 justify-between mb-4">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKey(i, e)}
                    className="w-12 h-14 text-center text-xl font-display font-900 glass rounded-2xl border outline-none transition-all"
                    style={{
                      borderColor: digit ? `${accentColor}60` : "rgba(255,255,255,0.1)",
                      color: digit ? accentColor : "inherit",
                    }}
                  />
                ))}
              </div>

              {error && (
                <p className="text-destructive text-xs mb-4 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  {error}
                </p>
              )}

              {devCode && (
                <div className="mb-4 text-center">
                  <span className="text-xs text-muted-foreground">
                    Код для разработки: <span className="text-lime font-bold">{devCode}</span>
                  </span>
                </div>
              )}

              <button
                disabled={countdown > 0 || loading}
                onClick={handleSendOtp}
                className="w-full text-center text-sm text-muted-foreground disabled:opacity-40"
              >
                {countdown > 0 ? `Повторить через ${countdown} сек` : "Отправить код повторно"}
              </button>

              {loading && (
                <div className="flex justify-center mt-4">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: `${accentColor} transparent transparent transparent` }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
