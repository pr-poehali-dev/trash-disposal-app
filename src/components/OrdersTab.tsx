import { useState } from "react";
import Icon from "@/components/ui/icon";

type Order = {
  id: string;
  address: string;
  floor: string;
  price: number;
  weight: string;
  distance: string;
  status: "new" | "taken" | "done";
  time: string;
  type: string;
  customerName: string;
  rating: number;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    address: "ул. Ленина, 42, кв. 15",
    floor: "3 этаж, подъезд 2",
    price: 150,
    weight: "~5 кг",
    distance: "200 м",
    status: "new",
    time: "Сейчас",
    type: "Обычный мусор",
    customerName: "Анна М.",
    rating: 4.9,
  },
  {
    id: "2",
    address: "пр. Победы, 18, кв. 7",
    floor: "1 этаж, подъезд 1",
    price: 220,
    weight: "~12 кг",
    distance: "450 м",
    status: "new",
    time: "Через 30 мин",
    type: "Крупный мусор",
    customerName: "Дмитрий К.",
    rating: 5.0,
  },
  {
    id: "3",
    address: "ул. Садовая, 5, кв. 31",
    floor: "5 этаж, подъезд 3",
    price: 180,
    weight: "~8 кг",
    distance: "650 м",
    status: "taken",
    time: "В процессе",
    type: "Раздельный сбор",
    customerName: "Мария С.",
    rating: 4.7,
  },
];

const statusConfig = {
  new: { label: "Новый", color: "#aaff00", bg: "rgba(170,255,0,0.1)" },
  taken: { label: "Взят", color: "#ff8c1a", bg: "rgba(255,140,26,0.1)" },
  done: { label: "Выполнен", color: "#00dcff", bg: "rgba(0,220,255,0.1)" },
};

type Props = {
  role: "customer" | "executor";
};

export default function OrdersTab({ role }: Props) {
  const [activeOrder, setActiveOrder] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [photoStep, setPhotoStep] = useState<"before" | "after" | null>(null);

  return (
    <div className="flex flex-col h-full">
      {role === "customer" && (
        <div className="p-4 pb-2">
          <button
            onClick={() => setShowCreate(true)}
            className="w-full py-4 rounded-2xl gradient-lime font-display font-700 text-[hsl(220,20%,8%)] text-base glow-lime transition-transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Icon name="Plus" size={20} />
            Создать заказ на вывоз мусора
          </button>
        </div>
      )}

      {showCreate && role === "customer" && (
        <CreateOrderModal onClose={() => setShowCreate(false)} />
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 fade-in-stagger">
        {role === "executor" && (
          <div className="glass rounded-2xl p-3 flex items-center gap-3 border border-lime/20">
            <div className="w-10 h-10 rounded-xl gradient-lime flex items-center justify-center flex-shrink-0">
              <Icon name="Navigation" size={18} className="text-[hsl(220,20%,8%)]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Рядом с тобой</p>
              <p className="font-display font-bold text-lime text-sm">3 заказа в радиусе 700 м</p>
            </div>
          </div>
        )}

        {MOCK_ORDERS.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            role={role}
            isActive={activeOrder === order.id}
            onTap={() => setActiveOrder(activeOrder === order.id ? null : order.id)}
            onPhoto={(step) => setPhotoStep(step)}
          />
        ))}
      </div>

      {photoStep && (
        <PhotoModal step={photoStep} onClose={() => setPhotoStep(null)} />
      )}
    </div>
  );
}

function OrderCard({
  order,
  role,
  isActive,
  onTap,
  onPhoto,
}: {
  order: Order;
  role: "customer" | "executor";
  isActive: boolean;
  onTap: () => void;
  onPhoto: (step: "before" | "after") => void;
}) {
  const status = statusConfig[order.status];

  return (
    <div
      className={`glass rounded-2xl border transition-all duration-300 card-hover cursor-pointer overflow-hidden ${
        isActive ? "border-lime/40 glow-lime" : "border-white/8"
      }`}
      onClick={onTap}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full status-pulse"
              style={{ backgroundColor: status.color }}
            />
            <span
              className="text-xs font-600 px-2 py-0.5 rounded-full"
              style={{ color: status.color, background: status.bg }}
            >
              {status.label}
            </span>
            <span className="text-xs text-muted-foreground">{order.time}</span>
          </div>
          <div className="text-right">
            <span className="font-display font-900 text-lime text-xl">{order.price}₽</span>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
            🗑️
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-600 text-sm text-foreground truncate">{order.address}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{order.floor}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="Weight" size={12} fallback="Package" />
                {order.weight}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="MapPin" size={12} />
                {order.distance}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full glass border border-white/10 text-foreground/70">
                {order.type}
              </span>
            </div>
          </div>
        </div>

        {role === "executor" && (
          <div className="flex items-center gap-1 mt-3">
            <div className="w-5 h-5 rounded-full gradient-lime flex items-center justify-center">
              <Icon name="User" size={11} className="text-[hsl(220,20%,8%)]" />
            </div>
            <span className="text-xs text-muted-foreground">{order.customerName}</span>
            <Icon name="Star" size={11} className="text-yellow-400 ml-1" />
            <span className="text-xs text-yellow-400">{order.rating}</span>
          </div>
        )}
      </div>

      {isActive && (
        <div className="px-4 pb-4 space-y-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          <div className="h-px bg-white/8" />
          {role === "executor" && order.status === "new" && (
            <button className="w-full py-3 rounded-xl gradient-lime font-display font-700 text-[hsl(220,20%,8%)] text-sm glow-lime transition-transform active:scale-95">
              Взять заказ
            </button>
          )}
          {role === "executor" && order.status === "taken" && (
            <div className="flex gap-2">
              <button
                onClick={() => onPhoto("before")}
                className="flex-1 py-3 rounded-xl glass border border-orange/40 text-orange text-sm font-600 flex items-center justify-center gap-2"
              >
                <Icon name="Camera" size={16} />
                Фото ДО
              </button>
              <button
                onClick={() => onPhoto("after")}
                className="flex-1 py-3 rounded-xl glass border border-lime/40 text-lime text-sm font-600 flex items-center justify-center gap-2"
              >
                <Icon name="Camera" size={16} />
                Фото ПОСЛЕ
              </button>
            </div>
          )}
          {role === "customer" && (
            <div className="flex gap-2">
              <button className="flex-1 py-3 rounded-xl glass border border-white/15 text-foreground text-sm font-600">
                Отслеживать
              </button>
              <button className="flex-1 py-3 rounded-xl glass border border-destructive/40 text-destructive text-sm font-600">
                Отменить
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const TRASH_TYPES = [
  { id: "ordinary", label: "Обычный мусор", emoji: "🗑️" },
  { id: "bulk", label: "Крупный мусор", emoji: "📦" },
  { id: "construction", label: "Строительный", emoji: "🧱" },
];

const BULK_PRESETS = ["Коробка (телевизор)", "Холодильник", "Стиральная машина", "Диван", "Матрас", "Велосипед", "Другое"];
const CONSTRUCTION_PRESETS = ["Кирпичи", "Обои", "Пластик", "Плитка", "Доски", "Металл", "Стекло", "Другое"];

function CreateOrderModal({ onClose }: { onClose: () => void }) {
  const [trashType, setTrashType] = useState("ordinary");
  const [price, setPrice] = useState(150);

  const [weight, setWeight] = useState("");
  const [bags, setBags] = useState("");

  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [bulkCustom, setBulkCustom] = useState("");

  const [constSelected, setConstSelected] = useState<string[]>([]);
  const [constCustom, setConstCustom] = useState("");

  function toggleBulk(item: string) {
    setBulkSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  function toggleConst(item: string) {
    setConstSelected((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  }

  const savedUser = localStorage.getItem("user");
  const userAddress = savedUser ? (JSON.parse(savedUser)?.address || "") : "";

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl animate-fade-in overflow-y-auto"
        style={{
          background: "hsl(220,18%,12%)",
          borderTop: "1px solid rgba(170,255,0,0.2)",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-900 text-lg">Новый заказ</h3>
            <button onClick={onClose} className="w-8 h-8 glass rounded-full flex items-center justify-center">
              <Icon name="X" size={16} />
            </button>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-2">Тип мусора</p>
            <div className="grid grid-cols-3 gap-2">
              {TRASH_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTrashType(t.id)}
                  className={`py-3 rounded-xl text-xs font-600 transition-all border flex flex-col items-center gap-1 ${
                    trashType === t.id
                      ? "border-lime/50 text-lime bg-lime/10"
                      : "glass border-white/10 text-foreground/70"
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {trashType === "ordinary" && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Вес мусора (примерно)</p>
                <div className="glass rounded-xl px-4 py-3 border border-white/10 flex items-center gap-2">
                  <input
                    type="text"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="например: 5 кг"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  />
                  <span className="text-xs text-muted-foreground">кг</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Количество пакетов</p>
                <div className="glass rounded-xl px-4 py-3 border border-white/10 flex items-center gap-2">
                  <input
                    type="number"
                    value={bags}
                    onChange={(e) => setBags(e.target.value)}
                    placeholder="например: 3"
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    min={1}
                  />
                  <span className="text-xs text-muted-foreground">шт</span>
                </div>
              </div>
            </div>
          )}

          {trashType === "bulk" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Что нужно вынести?</p>
              <div className="flex flex-wrap gap-2">
                {BULK_PRESETS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleBulk(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-500 border transition-all ${
                      bulkSelected.includes(item)
                        ? "border-lime/50 text-lime bg-lime/10"
                        : "glass border-white/10 text-foreground/70"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Или опишите своими словами</p>
                <div className="glass rounded-xl px-4 py-3 border border-white/10">
                  <textarea
                    value={bulkCustom}
                    onChange={(e) => setBulkCustom(e.target.value)}
                    placeholder="Опишите крупный мусор..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {trashType === "construction" && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Тип строительного мусора</p>
              <div className="flex flex-wrap gap-2">
                {CONSTRUCTION_PRESETS.map((item) => (
                  <button
                    key={item}
                    onClick={() => toggleConst(item)}
                    className={`px-3 py-1.5 rounded-full text-xs font-500 border transition-all ${
                      constSelected.includes(item)
                        ? "border-lime/50 text-lime bg-lime/10"
                        : "glass border-white/10 text-foreground/70"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1.5">Или опишите своими словами</p>
                <div className="glass rounded-xl px-4 py-3 border border-white/10">
                  <textarea
                    value={constCustom}
                    onChange={(e) => setConstCustom(e.target.value)}
                    placeholder="Опишите строительный мусор..."
                    className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="flex justify-between mb-2">
              <p className="text-xs text-muted-foreground">Вознаграждение</p>
              <span className="text-lime font-display font-900">{price} ₽</span>
            </div>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full accent-lime"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50 ₽</span>
              <span>500 ₽</span>
            </div>
          </div>

          {userAddress && (
            <div className="glass rounded-xl p-3 border border-white/8">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon name="MapPin" size={14} className="text-lime" />
                <span className="text-sm">{userAddress}</span>
              </div>
            </div>
          )}

          <button className="w-full py-4 rounded-2xl gradient-lime font-display font-700 text-[hsl(220,20%,8%)] text-base glow-lime transition-transform active:scale-95">
            Разместить заказ за {price} ₽
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoModal({ step, onClose }: { step: "before" | "after"; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-3xl p-6 space-y-4"
        style={{ background: "hsl(220,18%,12%)", border: "1px solid rgba(170,255,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-900">
            Фото{" "}
            <span className="text-lime">{step === "before" ? "ДО выноса" : "ПОСЛЕ выноса"}</span>
          </h3>
          <button onClick={onClose} className="w-8 h-8 glass rounded-full flex items-center justify-center">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="aspect-square rounded-2xl glass border border-white/10 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-lime/30 transition-colors">
          <div className="w-16 h-16 rounded-2xl gradient-lime flex items-center justify-center">
            <Icon name="Camera" size={28} className="text-[hsl(220,20%,8%)]" />
          </div>
          <p className="text-sm text-muted-foreground">Нажмите для съёмки</p>
          <p className="text-xs text-muted-foreground/60">Геопозиция добавится автоматически</p>
        </div>

        <div className="flex items-center gap-2 glass rounded-xl p-3 border border-lime/20">
          <Icon name="MapPin" size={14} className="text-lime" />
          <div>
            <p className="text-xs text-lime font-600">Геопозиция активна</p>
            <p className="text-xs text-muted-foreground">55.7558° N, 37.6176° E</p>
          </div>
        </div>

        <button className="w-full py-3 rounded-xl gradient-lime font-display font-700 text-[hsl(220,20%,8%)] glow-lime active:scale-95 transition-transform">
          Отправить фото
        </button>
      </div>
    </div>
  );
}