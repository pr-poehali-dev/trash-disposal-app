import Icon from "@/components/ui/icon";

const TRANSACTIONS = [
  { id: "1", type: "income", amount: 150, desc: "Вывоз мусора — ул. Ленина, 42", time: "Сегодня, 14:23", icon: "🗑️" },
  { id: "2", type: "income", amount: 220, desc: "Крупный мусор — пр. Победы, 18", time: "Вчера, 09:10", icon: "📦" },
  { id: "3", type: "withdrawal", amount: 500, desc: "Вывод на карту •••• 4231", time: "23 марта", icon: "💳" },
  { id: "4", type: "income", amount: 180, desc: "Раздельный сбор — ул. Садовая", time: "22 марта", icon: "♻️" },
  { id: "5", type: "income", amount: 120, desc: "Вывоз мусора — ул. Мира, 9", time: "20 марта", icon: "🗑️" },
];

export default function WalletTab({ role }: { role: "customer" | "executor" }) {
  const balance = 1240;
  const earned = 670;
  const pending = 150;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 space-y-3">
        {/* Главная карточка баланса */}
        <div
          className="relative rounded-3xl p-6 overflow-hidden"
          style={{
            background: "linear-gradient(135deg, rgba(170,255,0,0.15) 0%, rgba(187,68,255,0.1) 100%)",
            border: "1px solid rgba(170,255,0,0.25)",
          }}
        >
          {/* Декоративные орбы */}
          <div
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full orb-animate"
            style={{ background: "radial-gradient(circle, rgba(170,255,0,0.15) 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full orb-animate-reverse"
            style={{ background: "radial-gradient(circle, rgba(187,68,255,0.2) 0%, transparent 70%)" }}
          />

          <p className="text-sm text-muted-foreground mb-1 relative z-10">
            {role === "executor" ? "Мой кошелёк" : "Баланс для заказов"}
          </p>
          <div className="relative z-10">
            <span className="font-display font-900 text-4xl text-lime text-glow-lime">
              {balance.toLocaleString("ru")}
            </span>
            <span className="text-xl text-lime/70 ml-1">₽</span>
          </div>

          {role === "executor" && (
            <div className="flex gap-4 mt-4 relative z-10">
              <div>
                <p className="text-xs text-muted-foreground">Заработано сегодня</p>
                <p className="font-display font-700 text-white">{earned} ₽</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-xs text-muted-foreground">Ожидает выплаты</p>
                <p className="font-display font-700 text-orange">{pending} ₽</p>
              </div>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="grid grid-cols-3 gap-2">
          {role === "executor" ? (
            <>
              <ActionBtn icon="ArrowDownToLine" label="Вывести" color="lime" />
              <ActionBtn icon="CreditCard" label="Карта" color="default" />
              <ActionBtn icon="History" label="История" color="default" />
            </>
          ) : (
            <>
              <ActionBtn icon="Plus" label="Пополнить" color="lime" />
              <ActionBtn icon="CreditCard" label="Карты" color="default" />
              <ActionBtn icon="History" label="История" color="default" />
            </>
          )}
        </div>

        {/* Уровень исполнителя */}
        {role === "executor" && (
          <div className="glass rounded-2xl p-4 border border-white/8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="font-display font-700 text-sm">Уровень: Новичок</p>
                  <p className="text-xs text-muted-foreground">12 выполненных заданий</p>
                </div>
              </div>
              <span className="text-xs text-lime font-600">до Про: 8</span>
            </div>
            <div className="h-2 rounded-full bg-white/8 overflow-hidden">
              <div
                className="h-full rounded-full gradient-lime transition-all"
                style={{ width: "60%" }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">60% до следующего уровня</p>
          </div>
        )}

        {/* История транзакций */}
        <div>
          <h3 className="font-display font-700 text-sm text-muted-foreground mb-3 px-1">
            Последние операции
          </h3>
          <div className="space-y-2 fade-in-stagger">
            {TRANSACTIONS.map((tx) => (
              <div
                key={tx.id}
                className="glass rounded-xl p-3 border border-white/8 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl glass flex items-center justify-center text-lg flex-shrink-0">
                  {tx.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-500 truncate">{tx.desc}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tx.time}</p>
                </div>
                <span
                  className={`font-display font-700 text-sm flex-shrink-0 ${
                    tx.type === "income" ? "text-lime" : "text-muted-foreground"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {tx.amount} ₽
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionBtn({
  icon,
  label,
  color,
}: {
  icon: string;
  label: string;
  color: "lime" | "default";
}) {
  return (
    <button
      className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-transform active:scale-95 border ${
        color === "lime"
          ? "gradient-lime border-lime/0 glow-lime"
          : "glass border-white/10 text-foreground"
      }`}
    >
      <Icon
        name={icon}
        size={20}
        className={color === "lime" ? "text-[hsl(220,20%,8%)]" : "text-lime"}
      />
      <span
        className={`text-xs font-600 ${
          color === "lime" ? "text-[hsl(220,20%,8%)]" : "text-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
}
