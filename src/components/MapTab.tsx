import { useState } from "react";
import Icon from "@/components/ui/icon";

type Pin = {
  id: string;
  x: number;
  y: number;
  price: number;
  type: string;
  address: string;
  status: "new" | "taken";
};

const PINS: Pin[] = [
  { id: "1", x: 22, y: 38, price: 150, type: "🗑️", address: "ул. Ленина, 42", status: "new" },
  { id: "2", x: 58, y: 25, price: 220, type: "📦", address: "пр. Победы, 18", status: "new" },
  { id: "3", x: 75, y: 55, price: 180, type: "♻️", address: "ул. Садовая, 5", status: "taken" },
  { id: "4", x: 40, y: 65, price: 120, type: "🗑️", address: "ул. Мира, 9", status: "new" },
  { id: "5", x: 85, y: 30, price: 300, type: "📦", address: "пр. Ленина, 77", status: "new" },
];

export default function MapTab({ role }: { role: "customer" | "executor" }) {
  const [selected, setSelected] = useState<Pin | null>(null);
  const [filter, setFilter] = useState<"all" | "new" | "taken">("all");

  const filtered = PINS.filter((p) => filter === "all" || p.status === filter);

  return (
    <div className="flex flex-col h-full relative">
      <div className="px-4 pt-3 pb-2 flex gap-2">
        {(["all", "new", "taken"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-600 border transition-all ${
              filter === f ? "tab-active" : "glass border-white/10 text-muted-foreground"
            }`}
          >
            {f === "all" ? "Все" : f === "new" ? "Новые" : "Взятые"}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 glass border border-white/10 rounded-full px-3 py-1.5">
          <Icon name="Navigation" size={12} className="text-lime" />
          <span className="text-xs text-lime">700 м</span>
        </div>
      </div>

      {/* Псевдо-карта */}
      <div className="flex-1 relative overflow-hidden mx-4 mb-4 rounded-2xl glass border border-white/8">
        {/* Сетка карты */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Имитация улиц */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.15 }}>
          <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#aaff00" strokeWidth="2" />
          <line x1="0" y1="60%" x2="100%" y2="60%" stroke="#aaff00" strokeWidth="1.5" />
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#aaff00" strokeWidth="2" />
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#aaff00" strokeWidth="1.5" />
          <line x1="50%" y1="0" x2="20%" y2="100%" stroke="#aaff00" strokeWidth="1" />
        </svg>

        {/* Моя позиция */}
        <div
          className="absolute z-10"
          style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "rgba(170,255,0,0.3)", width: 40, height: 40, margin: -10 }}
            />
            <div className="w-5 h-5 rounded-full gradient-lime border-2 border-white shadow-lg glow-lime" />
          </div>
        </div>

        {/* Пины заказов */}
        {filtered.map((pin) => (
          <button
            key={pin.id}
            onClick={() => setSelected(selected?.id === pin.id ? null : pin)}
            className="absolute z-20 transform -translate-x-1/2 -translate-y-full"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            <div
              className={`flex flex-col items-center transition-transform ${
                selected?.id === pin.id ? "scale-125" : "hover:scale-110"
              }`}
            >
              <div
                className={`px-2 py-1 rounded-xl text-xs font-display font-700 mb-1 transition-all ${
                  pin.status === "new"
                    ? "bg-lime text-[hsl(220,20%,8%)] glow-lime"
                    : "bg-orange/80 text-white"
                }`}
              >
                {pin.price}₽
              </div>
              <div className="w-8 h-8 glass rounded-xl border border-white/20 flex items-center justify-center text-base">
                {pin.type}
              </div>
              <div
                className="w-2 h-2 rounded-full mx-auto mt-0.5"
                style={{ background: pin.status === "new" ? "#aaff00" : "#ff8c1a" }}
              />
            </div>
          </button>
        ))}

        {/* Радиус поиска */}
        <div
          className="absolute rounded-full border border-lime/20 pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            width: 200,
            height: 200,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Водяной знак */}
        <div className="absolute bottom-2 right-2 text-muted-foreground/30 text-xs">
          МусорОфф Карта
        </div>
      </div>

      {/* Попап заказа */}
      {selected && (
        <div
          className="absolute bottom-4 left-4 right-4 glass-bright rounded-2xl p-4 z-30 animate-fade-in"
          style={{ border: "1px solid rgba(170,255,0,0.3)" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{selected.type}</span>
                <div>
                  <p className="font-display font-700 text-sm">{selected.address}</p>
                  <p className="text-xs text-muted-foreground">{selected.price} ₽ за выполнение</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="w-7 h-7 glass rounded-full flex items-center justify-center"
            >
              <Icon name="X" size={14} />
            </button>
          </div>
          {role === "executor" && (
            <button className="w-full mt-3 py-2.5 rounded-xl gradient-lime font-display font-700 text-[hsl(220,20%,8%)] text-sm glow-lime active:scale-95 transition-transform">
              Взять заказ — {selected.price} ₽
            </button>
          )}
        </div>
      )}
    </div>
  );
}
