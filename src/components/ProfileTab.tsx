import { useState } from "react";
import Icon from "@/components/ui/icon";

type VerifyStatus = "none" | "pending" | "verified";

export default function ProfileTab({ role }: { role: "customer" | "executor" }) {
  const [verifyStatus] = useState<VerifyStatus>("pending");
  const [parentConsent] = useState(true);
  const isUnder14 = role === "executor";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {/* Аватар и имя */}
        <div className="flex items-center gap-4 glass rounded-2xl p-4 border border-white/8">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-lime flex items-center justify-center text-3xl font-display font-900 text-[hsl(220,20%,8%)]">
              А
            </div>
            {verifyStatus === "verified" && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-lime flex items-center justify-center glow-lime">
                <Icon name="Check" size={11} className="text-[hsl(220,20%,8%)]" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="font-display font-900 text-base">Алексей Петров</h2>
            <p className="text-xs text-muted-foreground">+7 (999) 123-45-67</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Icon
                    key={i}
                    name="Star"
                    size={12}
                    className={i <= 4 ? "text-yellow-400" : "text-white/20"}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">4.8 (12 отзывов)</span>
            </div>
          </div>
          <button className="w-9 h-9 glass rounded-xl flex items-center justify-center border border-white/10">
            <Icon name="Pencil" size={15} className="text-lime" />
          </button>
        </div>

        {/* Верификация */}
        <VerificationCard status={verifyStatus} />

        {/* Для школьников — согласие родителя */}
        {role === "executor" && isUnder14 && (
          <ParentConsentCard hasConsent={parentConsent} />
        )}

        {/* Интеграция с Алисой */}
        <AliceIntegration />

        {/* Настройки */}
        <div className="space-y-2">
          <h3 className="font-display font-700 text-sm text-muted-foreground px-1">Настройки</h3>
          {[
            { icon: "Bell", label: "Уведомления о заказах", value: "Включены" },
            { icon: "MapPin", label: "Геопозиция", value: "Всегда" },
            { icon: "Shield", label: "Конфиденциальность", value: "" },
            { icon: "HelpCircle", label: "Поддержка", value: "" },
          ].map((item) => (
            <button
              key={item.label}
              className="w-full glass rounded-xl p-3.5 border border-white/8 flex items-center gap-3 active:scale-99 transition-transform"
            >
              <Icon name={item.icon} size={18} className="text-lime" />
              <span className="flex-1 text-sm text-left">{item.label}</span>
              {item.value && (
                <span className="text-xs text-muted-foreground">{item.value}</span>
              )}
              <Icon name="ChevronRight" size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <button className="w-full glass rounded-xl p-3.5 border border-destructive/20 flex items-center justify-center gap-2 text-destructive text-sm font-600">
          <Icon name="LogOut" size={16} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
}

function VerificationCard({ status }: { status: VerifyStatus }) {
  const configs = {
    none: {
      color: "border-white/15",
      icon: "ShieldOff",
      iconColor: "text-muted-foreground",
      title: "Верификация не пройдена",
      desc: "Пройдите верификацию для полного доступа",
      badge: { text: "Требуется", bg: "bg-muted", color: "text-muted-foreground" },
    },
    pending: {
      color: "border-orange/30",
      icon: "Clock",
      iconColor: "text-orange",
      title: "Верификация на проверке",
      desc: "Документы отправлены, ожидайте 1-2 рабочих дня",
      badge: { text: "На проверке", bg: "bg-orange/10", color: "text-orange" },
    },
    verified: {
      color: "border-lime/30",
      icon: "ShieldCheck",
      iconColor: "text-lime",
      title: "Аккаунт верифицирован",
      desc: "Доступны все функции приложения",
      badge: { text: "Подтверждён", bg: "bg-lime/10", color: "text-lime" },
    },
  };

  const cfg = configs[status];

  return (
    <div className={`glass rounded-2xl p-4 border ${cfg.color}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name={cfg.icon} size={20} className={cfg.iconColor} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-600 text-sm">{cfg.title}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full ${cfg.badge.bg} ${cfg.badge.color}`}>
              {cfg.badge.text}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{cfg.desc}</p>
        </div>
      </div>

      {status === "none" && (
        <button className="w-full mt-3 py-2.5 rounded-xl gradient-lime font-display font-700 text-[hsl(220,20%,8%)] text-sm glow-lime active:scale-95 transition-transform">
          Пройти верификацию
        </button>
      )}

      {status === "pending" && (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            {["Паспорт/свидет.", "Фото с документом", "Подтверждение"].map((s, i) => (
              <div key={s} className="flex-1 text-center">
                <div
                  className={`h-1 rounded-full mb-1 ${i < 2 ? "bg-orange" : "bg-white/15"}`}
                />
                <p className="text-[10px] text-muted-foreground">{s}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ParentConsentCard({ hasConsent }: { hasConsent: boolean }) {
  return (
    <div
      className={`glass rounded-2xl p-4 border ${
        hasConsent ? "border-lime/25" : "border-purple/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 glass rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
          👨‍👦
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-600 text-sm">Согласие родителя</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                hasConsent ? "bg-lime/10 text-lime" : "bg-purple/10 text-purple"
              }`}
            >
              {hasConsent ? "Получено" : "Требуется"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {hasConsent
              ? "Родитель Петров И.В. подтвердил разрешение. Выплаты идут на его счёт."
              : "Для исполнителей до 14 лет необходимо согласие родителя"}
          </p>
        </div>
      </div>

      {hasConsent && (
        <div className="mt-3 glass rounded-xl p-3 border border-lime/15">
          <div className="flex items-center gap-2">
            <Icon name="CreditCard" size={14} className="text-lime" />
            <p className="text-xs text-muted-foreground">
              Выплаты → счёт родителя <span className="text-foreground">•••• 4231</span>
            </p>
          </div>
        </div>
      )}

      {!hasConsent && (
        <button className="w-full mt-3 py-2.5 rounded-xl glass border border-purple/40 text-purple text-sm font-600 active:scale-95 transition-transform">
          Пригласить родителя
        </button>
      )}
    </div>
  );
}

function AliceIntegration() {
  const [connected, setConnected] = useState(false);

  return (
    <div
      className={`glass rounded-2xl p-4 border ${
        connected ? "border-cyan/30" : "border-white/10"
      }`}
      style={connected ? { boxShadow: "0 0 20px rgba(0,220,255,0.1)" } : {}}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
          style={
            connected
              ? { background: "rgba(0,220,255,0.15)", border: "1px solid rgba(0,220,255,0.3)" }
              : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
          }
        >
          🎙️
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-600 text-sm">Алиса / Умный дом</p>
            {connected && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan/10 text-cyan">
                Подключено
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {connected
              ? 'Скажи "Алиса, выброси мусор" — заявка создастся автоматически'
              : "Подключи Алису и создавай заказы голосом без телефона"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setConnected(!connected)}
        className={`w-full mt-3 py-2.5 rounded-xl text-sm font-600 active:scale-95 transition-all border ${
          connected
            ? "border-cyan/30 text-cyan glass"
            : "gradient-lime border-0 text-[hsl(220,20%,8%)] glow-lime font-display font-700"
        }`}
      >
        {connected ? "Управление навыком" : "Подключить Алису"}
      </button>

      {connected && (
        <div className="mt-3 glass rounded-xl p-3 border border-white/8">
          <p className="text-xs text-muted-foreground mb-2">Примеры команд:</p>
          <div className="space-y-1">
            {[
              "«Алиса, выброси мусор»",
              "«Алиса, вызови уборщика»",
              "«Алиса, где мой заказ»",
            ].map((cmd) => (
              <div key={cmd} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-cyan" />
                <span className="text-xs text-cyan/80">{cmd}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
