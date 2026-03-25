import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { sendOtp, verifyOtp } from "@/lib/api";

type Role = "customer" | "executor";

type User = {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  verified: boolean;
};

type Props = {
  role: Role;
  onSuccess: (user: User) => void;
  onBack: () => void;
};

type Step = "phone" | "code";

export default function AuthScreen({ role, onSuccess, onBack }: Props) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
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
    const raw = getRawPhone();
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 11) {
      setError("Введите полный номер телефона");
      return;
    }
    setLoading(true);
    try {
      const res = await sendOtp(raw);
      if (res.error) {
        setError(res.error);
        return;
      }
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

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length < 6) {
      setError("Введите 6-значный код");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(getRawPhone(), fullCode, role);
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

  function handleCodeInput(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
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
      const res = await verifyOtp(getRawPhone(), fullCode, role);
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

      <div className="flex-1 flex flex-col px-6 pt-12 pb-8 relative z-10">
        <button
          onClick={step === "code" ? () => setStep("phone") : onBack}
          className="flex items-center gap-2 text-muted-foreground mb-8 w-fit"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="text-sm">Назад</span>
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-xs mx-auto w-full">
          {/* Иконка роли */}
          <div
            className="w-16 h-16 rounded-2xl mb-6 flex items-center justify-center text-3xl"
            style={{
              background: isLime ? "rgba(170,255,0,0.12)" : "rgba(187,68,255,0.12)",
              border: `1px solid ${isLime ? "rgba(170,255,0,0.3)" : "rgba(187,68,255,0.3)"}`,
            }}
          >
            {role === "customer" ? "🏠" : "⚡"}
          </div>

          {step === "phone" ? (
            <>
              <h1 className="font-display font-900 text-2xl mb-1">
                {role === "customer" ? "Вход заказчика" : "Вход исполнителя"}
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                Введи номер телефона — пришлём код подтверждения
              </p>

              <div className="space-y-4">
                <div>
                  <div
                    className="flex items-center gap-3 glass rounded-2xl px-4 py-4 border transition-all"
                    style={{ borderColor: phone ? `${accentColor}40` : "rgba(255,255,255,0.1)" }}
                  >
                    <span className="text-muted-foreground text-sm">🇷🇺</span>
                    <input
                      type="tel"
                      value={formatPhone(phone)}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "");
                        setPhone(digits.slice(0, 11));
                        setError("");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
                      placeholder="+7 (999) 000-00-00"
                      className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-base outline-none"
                      autoFocus
                    />
                    {phone && (
                      <button onClick={() => setPhone("")}>
                        <Icon name="X" size={16} className="text-muted-foreground" />
                      </button>
                    )}
                  </div>
                  {error && (
                    <p className="text-destructive text-xs mt-2 flex items-center gap-1">
                      <Icon name="AlertCircle" size={12} />
                      {error}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full py-4 rounded-2xl font-display font-700 text-base transition-all active:scale-95 disabled:opacity-50"
                  style={{
                    background: isLime
                      ? "linear-gradient(135deg, #aaff00, #66dd00)"
                      : "linear-gradient(135deg, #bb44ff, #7722cc)",
                    color: isLime ? "hsl(220,20%,8%)" : "#ffffff",
                    boxShadow: isLime
                      ? "0 0 20px rgba(170,255,0,0.3)"
                      : "0 0 20px rgba(187,68,255,0.3)",
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="Loader2" size={18} className="animate-spin" />
                      Отправляем...
                    </span>
                  ) : (
                    "Получить код"
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display font-900 text-2xl mb-1">Код подтверждения</h1>
              <p className="text-sm text-muted-foreground mb-2">
                Отправили SMS на{" "}
                <span className="text-foreground">{formatPhone(phone)}</span>
              </p>

              {devCode && (
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl mb-6 text-xs"
                  style={{ background: "rgba(170,255,0,0.08)", border: "1px solid rgba(170,255,0,0.2)" }}
                >
                  <Icon name="Code2" size={13} className="text-lime" />
                  <span className="text-lime">
                    Тестовый код: <strong>{devCode}</strong>
                  </span>
                </div>
              )}

              <div className="flex gap-2 mb-4 mt-4">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputsRef.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={2}
                    value={digit}
                    onChange={(e) => handleCodeInput(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKey(i, e)}
                    className="flex-1 aspect-square text-center text-xl font-display font-900 glass rounded-2xl border outline-none transition-all"
                    style={{
                      borderColor: digit ? `${accentColor}60` : "rgba(255,255,255,0.1)",
                      color: digit ? accentColor : undefined,
                      boxShadow: digit ? `0 0 12px ${accentColor}20` : undefined,
                    }}
                  />
                ))}
              </div>

              {error && (
                <p className="text-destructive text-xs mb-3 flex items-center gap-1">
                  <Icon name="AlertCircle" size={12} />
                  {error}
                </p>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || code.join("").length < 6}
                className="w-full py-4 rounded-2xl font-display font-700 text-base transition-all active:scale-95 disabled:opacity-50 mb-4"
                style={{
                  background: isLime
                    ? "linear-gradient(135deg, #aaff00, #66dd00)"
                    : "linear-gradient(135deg, #bb44ff, #7722cc)",
                  color: isLime ? "hsl(220,20%,8%)" : "#ffffff",
                  boxShadow: isLime
                    ? "0 0 20px rgba(170,255,0,0.3)"
                    : "0 0 20px rgba(187,68,255,0.3)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Проверяем...
                  </span>
                ) : (
                  "Войти"
                )}
              </button>

              <button
                onClick={() => {
                  if (countdown === 0) {
                    setCode(["", "", "", "", "", ""]);
                    handleSendOtp();
                  }
                }}
                disabled={countdown > 0}
                className="text-sm text-center w-full"
              >
                {countdown > 0 ? (
                  <span className="text-muted-foreground">
                    Повторить через <span style={{ color: accentColor }}>{countdown}с</span>
                  </span>
                ) : (
                  <span style={{ color: accentColor }}>Отправить код повторно</span>
                )}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground/40 mt-8">
          Нажимая «Войти», вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
}