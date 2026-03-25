import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import OrdersTab from "@/components/OrdersTab";
import MapTab from "@/components/MapTab";
import WalletTab from "@/components/WalletTab";
import ProfileTab from "@/components/ProfileTab";
import AuthScreen from "@/components/AuthScreen";

type Role = "customer" | "executor";
type Tab = "orders" | "map" | "wallet" | "profile";
type Screen = "welcome" | "auth" | "app";

type User = {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  verified: boolean;
};

export default function Index() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [role, setRole] = useState<Role>("customer");
  const [tab, setTab] = useState<Tab>("orders");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("auth_token");
    if (savedUser && savedToken) {
      try {
        const u = JSON.parse(savedUser) as User;
        setUser(u);
        setRole((u.role as Role) || "customer");
        setScreen("app");
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
      }
    }
  }, []);

  function handleAuthSuccess(u: User) {
    setUser(u);
    setRole((u.role as Role) || "customer");
    setScreen("app");
  }

  function handleLogout() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    setUser(null);
    setScreen("welcome");
  }

  if (screen === "welcome") {
    return <WelcomeScreen onSelect={(r) => { setRole(r); setScreen("auth"); }} />;
  }

  if (screen === "auth") {
    return (
      <AuthScreen
        role={role}
        onSuccess={handleAuthSuccess}
        onBack={() => setScreen("welcome")}
      />
    );
  }

  return (
    <AppShell
      role={role}
      tab={tab}
      setTab={setTab}
      user={user}
      onLogout={handleLogout}
    />
  );
}

/* ─────────────── WELCOME ─────────────── */
function WelcomeScreen({ onSelect }: { onSelect: (r: Role) => void }) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col">
      <div
        className="fixed top-0 left-0 w-80 h-80 rounded-full pointer-events-none orb-animate"
        style={{ background: "radial-gradient(circle, rgba(170,255,0,0.07) 0%, transparent 70%)", transform: "translate(-40%, -40%)" }}
      />
      <div
        className="fixed bottom-0 right-0 w-96 h-96 rounded-full pointer-events-none orb-animate-reverse"
        style={{ background: "radial-gradient(circle, rgba(187,68,255,0.07) 0%, transparent 70%)", transform: "translate(40%, 40%)" }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
        <div className="mb-6 slide-up">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl"
            style={{
              background: "linear-gradient(135deg, rgba(170,255,0,0.2), rgba(170,255,0,0.05))",
              border: "1px solid rgba(170,255,0,0.3)",
              boxShadow: "0 0 40px rgba(170,255,0,0.15)",
            }}
          >
            🗑️
          </div>
          <h1 className="font-display font-900 text-4xl leading-none mb-2">
            Мусор<span className="text-lime text-glow-lime">Офф</span>
          </h1>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
            Выброси мусор — не выходя из дома. Школьники и соседи помогут за вознаграждение
          </p>
        </div>

        <div className="w-full max-w-xs space-y-3 slide-up" style={{ animationDelay: "0.1s" }}>
          <RoleCard role="customer" emoji="🏠" title="Я заказчик" desc="Создаю заявки на вывоз мусора" accent="lime" onSelect={onSelect} />
          <RoleCard role="executor" emoji="⚡" title="Я исполнитель" desc="Выполняю заказы и зарабатываю" accent="purple" onSelect={onSelect} />
        </div>

        <div className="flex gap-6 mt-8 slide-up" style={{ animationDelay: "0.2s" }}>
          {[{ icon: "🔒", text: "Верификация" }, { icon: "📸", text: "Фото-отчёт" }, { icon: "🎙️", text: "Алиса" }].map((f) => (
            <div key={f.text} className="flex flex-col items-center gap-1">
              <span className="text-xl">{f.icon}</span>
              <span className="text-xs text-muted-foreground">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground/40 pb-6 relative z-10">МусорОфф v1.0 — для молодых и активных</p>
    </div>
  );
}

function RoleCard({ role, emoji, title, desc, accent, onSelect }: {
  role: Role; emoji: string; title: string; desc: string; accent: "lime" | "purple"; onSelect: (r: Role) => void;
}) {
  const isLime = accent === "lime";
  return (
    <button
      onClick={() => onSelect(role)}
      className="w-full text-left rounded-2xl p-5 border transition-all duration-300 active:scale-95 group"
      style={{
        background: isLime ? "linear-gradient(135deg, rgba(170,255,0,0.08), rgba(170,255,0,0.02))" : "linear-gradient(135deg, rgba(187,68,255,0.08), rgba(187,68,255,0.02))",
        borderColor: isLime ? "rgba(170,255,0,0.25)" : "rgba(187,68,255,0.25)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: isLime ? "rgba(170,255,0,0.12)" : "rgba(187,68,255,0.12)", border: `1px solid ${isLime ? "rgba(170,255,0,0.3)" : "rgba(187,68,255,0.3)"}` }}>
          {emoji}
        </div>
        <div className="flex-1">
          <p className="font-display font-900 text-base" style={{ color: isLime ? "#aaff00" : "#bb44ff" }}>{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <Icon name="ChevronRight" size={20} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}

/* ─────────────── APP SHELL ─────────────── */
const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "orders", icon: "ListOrdered", label: "Заказы" },
  { id: "map", icon: "Map", label: "Карта" },
  { id: "wallet", icon: "Wallet", label: "Кошелёк" },
  { id: "profile", icon: "User", label: "Профиль" },
];

function AppShell({ role, tab, setTab, user, onLogout }: {
  role: Role; tab: Tab; setTab: (t: Tab) => void; user: User | null; onLogout: () => void;
}) {
  return (
    <div className="min-h-screen mesh-bg flex flex-col max-w-md mx-auto relative">
      <header className="glass border-b border-white/8 px-4">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗑️</span>
            <span className="font-display font-900 text-lg">Мусор<span className="text-lime">Офф</span></span>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <div className="flex items-center gap-1.5 px-2 py-1 glass rounded-full border border-white/10">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-display font-900"
                  style={{ background: "linear-gradient(135deg, #aaff00, #66dd00)", color: "hsl(220,20%,8%)" }}>
                  {(user.name || user.phone).charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-foreground/70 max-w-[80px] truncate">{user.name || user.phone}</span>
              </div>
            )}
            <button onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: role === "customer" ? "rgba(170,255,0,0.08)" : "rgba(187,68,255,0.08)",
                borderColor: role === "customer" ? "rgba(170,255,0,0.3)" : "rgba(187,68,255,0.3)",
              }}>
              <div className="w-3 h-3 rounded-full" style={{ background: role === "customer" ? "linear-gradient(135deg, #aaff00, #66dd00)" : "linear-gradient(135deg, #bb44ff, #7722cc)" }} />
              <span className="text-xs font-600" style={{ color: role === "customer" ? "#aaff00" : "#bb44ff" }}>
                {role === "customer" ? "Заказчик" : "Исполнитель"}
              </span>
              <Icon name="LogOut" size={11} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden" style={{ paddingBottom: "72px" }}>
        {tab === "orders" && <OrdersTab role={role} />}
        {tab === "map" && <MapTab role={role} />}
        {tab === "wallet" && <WalletTab role={role} />}
        {tab === "profile" && <ProfileTab role={role} />}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md glass border-t border-white/8 z-40">
        <div className="flex">
          {TABS.map((t) => {
            const isActive = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 flex flex-col items-center py-3 gap-1 transition-all relative">
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full" style={{ background: "linear-gradient(90deg, #aaff00, #66dd00)" }} />
                )}
                <Icon name={t.icon} size={20} className={isActive ? "text-lime" : "text-muted-foreground"} />
                <span className={`text-[10px] font-600 transition-colors ${isActive ? "text-lime" : "text-muted-foreground"}`}>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
