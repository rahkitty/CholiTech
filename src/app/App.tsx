import { useState, type ReactNode } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import {
  Bell, Moon, Activity, Utensils, Calendar, Home,
  AlertTriangle, Check, ChevronRight, Plus, X,
  Flame, Clock, MapPin, Shield, Zap,
  QrCode, ScanLine, UserPlus, Users, Copy, CheckCheck,
  Radio, WifiOff, BatteryLow, ThumbsUp, ThumbsDown,
  ChevronDown, Brain, RefreshCw,
} from "lucide-react";

// ── palette ────────────────────────────────────────────────────────────────
const G = "#4CAF50";
const A = "#FFC107";
const R = "#F4511E";
const P = "#6C63FF";

// ── static data ────────────────────────────────────────────────────────────
const sleepWeek = [
  { day: "L", profundo: 4.8, ligero: 2.1, interrupciones: 0.2 },
  { day: "M", profundo: 5.2, ligero: 1.9, interrupciones: 0.4 },
  { day: "X", profundo: 3.1, ligero: 2.8, interrupciones: 1.1 },
  { day: "J", profundo: 4.9, ligero: 2.0, interrupciones: 0.3 },
  { day: "V", profundo: 5.0, ligero: 1.8, interrupciones: 0.2 },
  { day: "S", profundo: 4.7, ligero: 2.3, interrupciones: 0.5 },
  { day: "D", profundo: 5.1, ligero: 1.8, interrupciones: 0.3 },
];

const stepsWeek = [
  { day: "L", pasos: 9200 },
  { day: "M", pasos: 11400 },
  { day: "X", pasos: 6847 },
  { day: "J", pasos: 8900 },
  { day: "V", pasos: 7800 },
  { day: "S", pasos: 12100 },
  { day: "D", pasos: 10300 },
];

const anxietyWeek = [
  { day: "L", ansiedad: 38 },
  { day: "M", ansiedad: 44 },
  { day: "X", ansiedad: 61 },
  { day: "J", ansiedad: 47 },
  { day: "V", ansiedad: 54 },
  { day: "S", ansiedad: 41 },
  { day: "D", ansiedad: 36 },
];

const anxietyEpisodes = [
  { event: "Giros repetitivos", time: "14:32", dur: "8 min", icon: "↻" },
  { event: "Deambulación circular", time: "13:15", dur: "4 min", icon: "◎" },
  { event: "Rascado", time: "11:40", dur: "5 min", icon: "⚡" },
];

const behaviorTimeline = [
  { time: "14:32", event: "Rascado compulsivo",    dur: "8 min",  sev: R },
  { time: "13:15", event: "Deambulación circular", dur: "4 min",  sev: A },
  { time: "11:40", event: "Rascado compulsivo",    dur: "5 min",  sev: R },
  { time: "09:22", event: "Hiperactividad",        dur: "12 min", sev: A },
];

const alertHistory = [
  { date: "Hoy",    type: "Rascado compulsivo",        n: 3, active: true  },
  { date: "Ayer",   type: "Deambulación por ansiedad", n: 1, active: false },
  { date: "12 jul", type: "Hiperactividad nocturna",   n: 2, active: false },
  { date: "10 jul", type: "Rascado compulsivo",        n: 4, active: false },
];

// ── July 2026 calendar events ──────────────────────────────────────────────
const CAL_EVENTS: Record<number, { dot: string }[]> = {
  15: [{ dot: P }],
  22: [{ dot: R }],
  28: [{ dot: A }],
};

// ── food configs ───────────────────────────────────────────────────────────
type FoodType = "seca" | "humeda" | "mixta";
const FOOD: Record<FoodType, { g: number; yest: number; dens: string; em: string; lbl: string }> = {
  seca:   { g: 357,  yest: 340,  dens: "3,5 kcal/g", em: "🥣", lbl: "Seca"   },
  humeda: { g: 1135, yest: 1080, dens: "1,1 kcal/g", em: "🥫", lbl: "Húmeda" },
  mixta:  { g: 446,  yest: 430,  dens: "2,8 kcal/g", em: "🍽️", lbl: "Mixta"  },
};

// ── Activity Ring ──────────────────────────────────────────────────────────
function Ring({ pct, size = 156 }: { pct: number; size?: number }) {
  const sw = 13;
  const r = (size - sw * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ede9fe" strokeWidth={sw} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={P} strokeWidth={sw}
        strokeDasharray={c}
        strokeDashoffset={c * (1 - Math.min(pct, 1))}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

// ── Calendar ───────────────────────────────────────────────────────────────
function CalGrid({ sel, onSel }: { sel: number; onSel: (d: number) => void }) {
  // July 2026 starts Wednesday (3, 0=Sun)
  const cells: (number | null)[] = [...Array(3).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {["D","L","M","X","J","V","S"].map(d => (
          <span key={d} className="text-center text-xs font-bold text-muted-foreground py-1">{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const evs = CAL_EVENTS[day] ?? [];
          const today = day === 15;
          const active = day === sel;
          return (
            <button key={i} onClick={() => onSel(day)}
              className={`flex flex-col items-center py-0.5 rounded-xl transition-colors ${active && !today ? "bg-secondary" : "hover:bg-muted"}`}>
              <span className="text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full"
                style={today ? { background: P, color: "#fff" } : { color: active ? P : "#1a1826" }}>
                {day}
              </span>
              {evs.length > 0 && (
                <div className="flex gap-0.5 mt-0.5">
                  {evs.map((e, j) => <span key={j} className="w-1.5 h-1.5 rounded-full" style={{ background: e.dot }} />)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Chip ───────────────────────────────────────────────────────────────────
function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span className="inline-flex px-3 py-1.5 rounded-full text-xs font-bold border border-border bg-card shadow-sm"
      style={{ color }}>
      {label}
    </span>
  );
}

// ── Section card ───────────────────────────────────────────────────────────
function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-4 bg-card rounded-2xl p-4 border border-border shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ── Tooltip style ──────────────────────────────────────────────────────────
const TT = { borderRadius: 14, border: "1px solid #e5e7eb", fontSize: 13, fontFamily: "Nunito" };

// ── Tab type ───────────────────────────────────────────────────────────────
type Tab = "inicio" | "sueno" | "actividad" | "alimentacion" | "agenda";
type ConnectionState = "connected" | "offline" | "lowBattery";

// ══════════════════════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab]         = useState<Tab>("inicio");
  const [alertOpen, setAlertOpen] = useState(false);
  const [whyOpen, setWhyOpen]     = useState(false);
  const [alertFeedback, setAlertFeedback] = useState<"useful" | "incorrect" | null>(null);
  const [food, setFood]       = useState<FoodType>("seca");
  const [rationRegistered, setRationRegistered] = useState(false);
  const [calDay, setCalDay]   = useState(15);
  const [connection, setConnection] = useState<ConnectionState>("connected");

  // collar
  const [collarLinked, setCollarLinked]   = useState(true);
  const [showCollar, setShowCollar]       = useState(false);
  const [scanState, setScanState]         = useState<"idle" | "scanning" | "done">("idle");
  const [collarQrCode]                    = useState(() =>
    "CT-" + Math.random().toString(36).slice(2, 6).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase()
  );
  const [manualCode, setManualCode]       = useState("");
  const [manualError, setManualError]     = useState(false);

  // co-owner sharing
  const [showShare, setShowShare]   = useState(false);
  const [shareCode]                 = useState(() =>
    Math.random().toString(36).slice(2, 8).toUpperCase()
  );
  const [copied, setCopied]         = useState(false);
  const [joinInput, setJoinInput]   = useState("");
  const [joinError, setJoinError]   = useState(false);
  const [coOwners, setCoOwners]     = useState([
    { name: "María López", role: "Pareja", initials: "ML", color: "#ec4899" },
  ]);

  const f = FOOD[food];
  const connectionInfo = {
    connected: {
      label: "Conectado",
      text: "Collar conectado · sincronizado hace 4 min · Red LoRa",
      color: "#2f7d32",
      bg: "#f0fdf4",
      icon: <Radio size={16} />,
    },
    offline: {
      label: "Sin cobertura",
      text: "Sin conexión desde 10:42. El collar guarda los datos y los enviará al recuperar la señal",
      color: "#9a6700",
      bg: "#fffbeb",
      icon: <WifiOff size={16} />,
    },
    lowBattery: {
      label: "Batería baja",
      text: "Batería 12%. Carga el collar pronto",
      color: "#b83212",
      bg: "#fff1ee",
      icon: <BatteryLow size={16} />,
    },
  } satisfies Record<ConnectionState, { label: string; text: string; color: string; bg: string; icon: ReactNode }>;
  const currentConnection = connectionInfo[connection];

  function handleCopy() {
    navigator.clipboard.writeText(shareCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleJoin() {
    if (joinInput.trim().length < 4) { setJoinError(true); return; }
    // In a real app this would validate against the server.
    // Here we just simulate a successful link.
    setCoOwners(prev => [
      ...prev,
      { name: "Nuevo codueño", role: "Invitado", initials: joinInput.slice(0, 2).toUpperCase(), color: P },
    ]);
    setJoinInput("");
    setJoinError(false);
  }

  function startScan() {
    setScanState("scanning");
    setTimeout(() => setScanState("done"), 2800);
  }

  function confirmLink() {
    setCollarLinked(true);
    setConnection("connected");
    setShowCollar(false);
    setScanState("idle");
    setManualCode("");
  }

  function handleManualLink() {
    if (manualCode.trim().length < 6) { setManualError(true); return; }
    setManualError(false);
    confirmLink();
  }

  function nav(t: Tab) { setTab(t); setAlertOpen(false); }

  // ── bottom nav items ────────────────────────────────────────────────────
  const navItems: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "inicio",       label: "Inicio",    icon: <Home size={22} />     },
    { id: "sueno",        label: "Sueño",     icon: <Moon size={22} />     },
    { id: "actividad",    label: "Actividad", icon: <Activity size={22} /> },
    { id: "alimentacion", label: "Comida",    icon: <Utensils size={22} /> },
    { id: "agenda",       label: "Agenda",    icon: <Calendar size={22} /> },
  ];

  return (
    <div className="min-h-screen bg-background flex justify-center [&_.text-xs]:text-[13px]">
      <div className="relative w-full max-w-sm flex flex-col" style={{ minHeight: "100svh" }}>

        {/* ── scrollable content ── */}
        <div className="flex-1 overflow-y-auto pb-28" style={{ scrollbarWidth: "none" }}>

          {/* ════════ INICIO – dashboard ════════ */}
          {tab === "inicio" && !alertOpen && (
            <div>
              {/* header */}
              <div className="flex items-center justify-between px-5 pt-12 pb-2">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Buenas tardes</p>
                  <h1 className="text-3xl font-black leading-tight">Choli 🐾</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">Golden Retriever · 3 años · 28 kg</p>
                </div>
                <div className="flex items-center gap-2">
                  {/* collar button */}
                  <button onClick={() => { setShowCollar(true); setScanState("idle"); }}
                    className="relative w-11 h-11 rounded-full bg-card border border-border shadow-sm flex items-center justify-center transition-all active:scale-95"
                    title="Vincular collar">
                    <QrCode size={18} style={{ color: collarLinked ? G : undefined }} className={collarLinked ? "" : "text-muted-foreground"} />
                    {collarLinked && (
                      <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-background" style={{ background: G }} />
                    )}
                  </button>
                  {/* share button */}
                  <button onClick={() => setShowShare(true)}
                    className="w-11 h-11 rounded-full bg-card border border-border shadow-sm flex items-center justify-center transition-all active:scale-95"
                    title="Compartir con codueño">
                    <Users size={18} className="text-muted-foreground" />
                  </button>
                  {/* bell */}
                  <button className="relative w-11 h-11 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
                    <Bell size={18} />
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-background" style={{ background: R }} />
                  </button>
                </div>
              </div>

              {/* LoRa connection status */}
              <div className="px-5 mt-2">
                <div className="rounded-2xl border border-border p-3" style={{ background: currentConnection.bg }}>
                  <div className="flex items-start gap-2.5" style={{ color: currentConnection.color }}>
                    <span className="mt-0.5 flex-shrink-0">{currentConnection.icon}</span>
                    <p className="text-[13px] font-bold leading-relaxed">{currentConnection.text}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 mt-3" aria-label="Cambiar estado de conexión para la demostración">
                    {(Object.keys(connectionInfo) as ConnectionState[]).map(state => {
                      const item = connectionInfo[state];
                      const active = connection === state;
                      return (
                        <button
                          key={state}
                          onClick={() => setConnection(state)}
                          aria-pressed={active}
                          className="rounded-xl px-2 py-2 text-[13px] font-black border transition-all"
                          style={{
                            background: active ? item.color : "#fff",
                            borderColor: active ? item.color : "rgba(26,24,38,.10)",
                            color: active ? "#fff" : "#5f5c68",
                          }}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* semaphore */}
              <div className="flex justify-center py-8">
                <div className="relative flex flex-col items-center">
                  <div className="w-48 h-48 rounded-full flex flex-col items-center justify-center border-[10px]"
                    style={{
                      borderColor: A,
                      background: "radial-gradient(circle at 38% 32%, #fffdf0, #fff8d6)",
                      boxShadow: `0 0 52px ${A}70, 0 12px 40px rgba(0,0,0,.10)`,
                    }}>
                    <span className="text-5xl mb-1">⚠️</span>
                    <span className="font-black text-lg" style={{ color: "#92660a" }}>En Alerta</span>
                    <span className="text-xs font-bold mt-0.5" style={{ color: "#b07d0e" }}>Índice 68 / 100</span>
                  </div>
                  <span className="absolute -bottom-3 text-xs font-bold px-4 py-1.5 rounded-full border border-amber-200 shadow-sm bg-amber-50 text-amber-700 whitespace-nowrap">
                    Revisar comportamiento
                  </span>
                </div>
              </div>

              {/* mini-cards */}
              <div className="grid grid-cols-2 gap-2.5 px-4 mt-5">
                {[
                  { lbl: "Descanso",  val: "6,9 h",    sub: "Óptimo",      col: G, bg: "#f0fdf4", em: "🌙" },
                  { lbl: "Actividad", val: "6.8K",     sub: "Por debajo",  col: A, bg: "#fffbeb", em: "🐕" },
                  { lbl: "Ansiedad",  val: "54 / 100", sub: "Moderado",    col: "#9a6700", bg: "#fffbeb", em: "🧠" },
                  { lbl: "Conducta",  val: "Alerta",   sub: "3 episodios", col: R, bg: "#fff1ee", em: "⚡" },
                ].map(c => (
                  <div key={c.lbl} className="rounded-2xl p-3 border border-border shadow-sm" style={{ background: c.bg }}>
                    <span className="text-xl">{c.em}</span>
                    <p className="text-xs text-muted-foreground mt-1.5 font-bold">{c.lbl}</p>
                    <p className="font-black text-sm leading-tight" style={{ color: c.col }}>{c.val}</p>
                    <p className="text-xs text-muted-foreground">{c.sub}</p>
                  </div>
                ))}
              </div>

              {/* alert banner */}
              <button onClick={() => setAlertOpen(true)}
                className="mx-4 mt-4 w-[calc(100%-32px)] p-4 rounded-2xl border text-left flex items-start gap-3 transition-all active:scale-[.98] hover:brightness-95"
                style={{ background: "#fff1ee", borderColor: "#fecdc3" }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: R + "22" }}>
                  <AlertTriangle size={15} style={{ color: R }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: R }}>Rascado compulsivo detectado</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Hace 42 min · 3 episodios hoy · Toca para ver detalle</p>
                </div>
                <ChevronRight size={16} className="text-muted-foreground mt-1 flex-shrink-0" />
              </button>

              {/* daily bars */}
              <Card className="mt-4">
                <p className="text-sm font-bold mb-3">Resumen de hoy</p>
                {[
                  { lbl: "Pasos",             val: "6,847 / 10,000", pct: 68, col: P },
                  { lbl: "Sueño",             val: "6,9 h / 8 h",    pct: 86, col: G },
                  { lbl: "Calorías quemadas", val: "312 kcal",        pct: 78, col: A },
                ].map(i => (
                  <div key={i.lbl} className="mb-3 last:mb-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground font-bold">{i.lbl}</span>
                      <span className="font-black">{i.val}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${i.pct}%`, background: i.col }} />
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ════════ ALERTAS DE CONDUCTA (sub-view) ════════ */}
          {tab === "inicio" && alertOpen && (
            <div>
              <div className="flex items-center gap-3 px-5 pt-12 pb-4">
                <button onClick={() => setAlertOpen(false)}
                  className="w-9 h-9 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
                  <ChevronRight size={18} className="rotate-180" />
                </button>
                <h2 className="font-black text-xl">Alertas de conducta</h2>
              </div>

              {/* main alert pill */}
              <div className="mx-4 rounded-2xl border p-4 mb-4 flex items-start gap-3"
                style={{ background: "#fff1ee", borderColor: "#fecdc3" }}>
                <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: R + "22" }}>
                  <Zap size={20} style={{ color: R }} />
                </div>
                <div>
                  <p className="font-black text-base" style={{ color: R }}>Rascado compulsivo</p>
                  <p className="text-sm text-muted-foreground">3 episodios · 18 min acumulados hoy</p>
                </div>
              </div>

              {/* index explanation */}
              <div className="mx-4 mb-4 rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <button
                  onClick={() => setWhyOpen(prev => !prev)}
                  aria-expanded={whyOpen}
                  className="w-full p-4 flex items-center justify-between text-left"
                >
                  <span className="font-black text-sm">¿Por qué 68?</span>
                  <ChevronDown size={18} className={`text-muted-foreground transition-transform ${whyOpen ? "rotate-180" : ""}`} />
                </button>
                {whyOpen && (
                  <div className="px-4 pb-4 space-y-2 border-t border-border pt-3">
                    {[
                      { label: "Actividad bajo lo habitual", icon: <Activity size={15} />, color: A },
                      { label: "3 episodios de rascado", icon: <AlertTriangle size={15} />, color: R },
                      { label: "Descanso óptimo", icon: <Check size={15} />, color: G },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2.5 text-sm font-bold">
                        <span className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: item.color + "18", color: item.color }}>
                          {item.icon}
                        </span>
                        {item.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* timeline */}
              <Card className="mb-4">
                <p className="text-sm font-bold mb-4">Línea de tiempo · Hoy</p>
                {behaviorTimeline.map((e, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="flex flex-col items-center pt-1.5">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: e.sev }} />
                      {i < behaviorTimeline.length - 1 && <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[20px]" />}
                    </div>
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">{e.event}</span>
                        <span className="text-xs text-muted-foreground font-bold">{e.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Duración: {e.dur}</p>
                    </div>
                  </div>
                ))}
              </Card>

              {/* causes */}
              <div className="mx-4 mb-4">
                <p className="text-sm font-bold mb-2.5">Temas para consultar con tu veterinario</p>
                <div className="flex flex-wrap gap-2">
                  {["Alergia cutánea","Parásitos externos","Ansiedad","Dermatitis","Estrés ambiental"].map(c => (
                    <Chip key={c} label={c} color={R} />
                  ))}
                </div>
              </div>

              {/* feedback */}
              <Card className="mb-4">
                <p className="text-sm font-bold mb-3">¿Esta alerta te ayudó?</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setAlertFeedback("useful")}
                    aria-pressed={alertFeedback === "useful"}
                    className="py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                    style={alertFeedback === "useful"
                      ? { background: G, borderColor: G, color: "#fff" }
                      : { background: "#fff", borderColor: "rgba(26,24,38,.10)", color: "#4b4855" }}
                  >
                    <ThumbsUp size={16} />
                    Fue útil
                  </button>
                  <button
                    onClick={() => setAlertFeedback("incorrect")}
                    aria-pressed={alertFeedback === "incorrect"}
                    className="py-3 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                    style={alertFeedback === "incorrect"
                      ? { background: R, borderColor: R, color: "#fff" }
                      : { background: "#fff", borderColor: "rgba(26,24,38,.10)", color: "#4b4855" }}
                  >
                    <ThumbsDown size={16} />
                    Alerta incorrecta
                  </button>
                </div>
                <p className="text-[13px] text-muted-foreground font-bold mt-3 flex items-center gap-2">
                  <Shield size={14} />
                  Orientativo, no es un diagnóstico.
                </p>
              </Card>

              {/* action buttons */}
              <div className="mx-4 flex gap-3 mb-5">
                <button onClick={() => setAlertOpen(false)}
                  className="flex-1 py-3.5 rounded-2xl font-bold text-sm border border-border bg-card hover:bg-muted transition-colors">
                  Marcar resuelto
                </button>
                <button className="flex-1 py-3.5 rounded-2xl font-bold text-sm text-white transition-colors"
                  style={{ background: P }}>
                  Agendar visita
                </button>
              </div>

              {/* alert history */}
              <Card className="mb-6">
                <p className="text-sm font-bold mb-3">Historial de alertas</p>
                <div className="space-y-3">
                  {alertHistory.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: a.active ? R + "18" : G + "18" }}>
                        {a.active ? <AlertTriangle size={14} style={{ color: R }} /> : <Check size={14} style={{ color: G }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{a.type}</p>
                        <p className="text-xs text-muted-foreground">{a.date} · {a.n} episodio{a.n !== 1 ? "s" : ""}</p>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${a.active ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                        {a.active ? "Activo" : "Resuelto"}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ════════ SUEÑO ════════ */}
          {tab === "sueno" && (
            <div>
              <div className="flex items-center justify-between px-5 pt-12 pb-4">
                <div>
                  <h1 className="text-3xl font-black">Sueño 🌙</h1>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Choli · Julio 2026</p>
                </div>
                <button onClick={() => setShowShare(true)}
                  className="w-11 h-11 rounded-full bg-card border border-border shadow-sm flex items-center justify-center active:scale-95 transition-all">
                  <Users size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* anoche */}
              <div className="mx-4 rounded-2xl p-5 mb-4 border" style={{ background: "#f0f0ff", borderColor: "#c4bfff" }}>
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: P }}>Anoche</p>
                <div className="flex items-end gap-1.5 mb-4">
                  <span className="text-5xl font-black">6,9</span>
                  <span className="text-xl text-muted-foreground mb-1.5">horas</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { lbl: "Profundo",      val: "5,1 h", col: P        },
                    { lbl: "Ligero",        val: "1,8 h", col: "#a5b4fc"},
                    { lbl: "Interrupciones",val: "0,3 h", col: R + "cc" },
                  ].map(s => (
                    <div key={s.lbl} className="text-center">
                      <div className="w-2 h-2 rounded-full mx-auto mb-1" style={{ background: s.col }} />
                      <p className="text-base font-black" style={{ color: s.col }}>{s.val}</p>
                      <p className="text-xs text-muted-foreground font-bold leading-tight">{s.lbl}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* stacked bar chart */}
              <Card className="mb-4">
                <p className="text-sm font-bold mb-0.5">Tendencia semanal</p>
                <p className="text-xs text-muted-foreground mb-3">Sueño efectivo; interrupciones aparte</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart key="chart-sleep" data={sleepWeek} barSize={24} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                    <XAxis dataKey="day" tick={{ fontSize: 13, fill: "#6b6875", fontFamily: "Nunito" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 13, fill: "#6b6875", fontFamily: "Nunito" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TT} formatter={(v: number, name: string) => [`${v.toLocaleString("es-CL")} h`, name]} />
                    <Bar key="sleep-profundo"       dataKey="profundo"       stackId="sleep" fill={P}        name="Profundo"       />
                    <Bar key="sleep-ligero"         dataKey="ligero"         stackId="sleep" fill="#a5b4fc"  name="Ligero" radius={[5, 5, 0, 0]} />
                    <Bar key="sleep-interrupciones" dataKey="interrupciones" stackId="interruptions" fill={R + "cc"} name="Interrupciones" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* siestas del día */}
              <Card className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold">Siestas de hoy</p>
                  <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: P + "18", color: P }}>
                    ~2 h estimadas
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  {[
                    { desde: "10:15", hasta: "11:02", dur: "47 min", tipo: "Profunda",   col: P        },
                    { desde: "13:40", hasta: "14:25", dur: "45 min", tipo: "Ligera",     col: "#a5b4fc"},
                    { desde: "17:10", hasta: "17:38", dur: "28 min", tipo: "Ligera",     col: "#a5b4fc"},
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.col }} />
                      <div className="flex-1">
                        <span className="text-sm font-bold">{s.desde} – {s.hasta}</span>
                        <span className="text-xs text-muted-foreground font-bold ml-2">({s.tipo})</span>
                      </div>
                      <span className="text-sm font-black" style={{ color: s.col }}>{s.dur}</span>
                    </div>
                  ))}
                </div>
                {/* siesta timeline bar */}
                <p className="text-xs text-muted-foreground font-bold mb-2">Distribución en el día (6 am – 10 pm)</p>
                <div className="relative h-4 bg-muted rounded-full overflow-hidden">
                  {/* profunda 10:15–11:02 → 26%–31% */}
                  <div className="absolute h-full rounded-full" style={{ left: "26%", width: "5%",  background: P }} />
                  {/* ligera 13:40–14:25 → 46%–49% */}
                  <div className="absolute h-full rounded-full" style={{ left: "46%", width: "4%",  background: "#a5b4fc" }} />
                  {/* ligera 17:10–17:38 → 69%–72% */}
                  <div className="absolute h-full rounded-full" style={{ left: "69%", width: "3%",  background: "#a5b4fc" }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1 font-bold">
                  <span>6 am</span><span>12 pm</span><span>6 pm</span><span>10 pm</span>
                </div>
              </Card>

              {/* anomaly alert */}
              <div className="mx-4 rounded-2xl p-4 border mb-4 flex items-start gap-3"
                style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <AlertTriangle size={16} style={{ color: A }} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-700">Patrón anómalo · Miércoles 8 jul</p>
                  <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
                    1,1 h de interrupciones (3× el promedio). Cambio respecto a su patrón habitual.
                    Si se repite, consúltalo con tu veterinario.
                  </p>
                </div>
              </div>

              {/* weekly stats */}
              <Card className="mb-6">
                <p className="text-sm font-bold mb-3">Promedios semanales</p>
                {[
                  { lbl: "Horas totales / noche", val: "6,8 h"         },
                  { lbl: "Sueño profundo",         val: "4,7 h (69%)"  },
                  { lbl: "Mejor noche",            val: "Mar · 7,1 h"  },
                  { lbl: "Peor noche",             val: "Mié · 5,9 h"  },
                ].map(s => (
                  <div key={s.lbl} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground font-bold">{s.lbl}</span>
                    <span className="text-sm font-black">{s.val}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ════════ ACTIVIDAD ════════ */}
          {tab === "actividad" && (
            <div>
              <div className="flex items-center justify-between px-5 pt-12 pb-4">
                <div>
                  <h1 className="text-3xl font-black">Actividad 🏃</h1>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Hoy · Miércoles 15 jul 2026</p>
                </div>
                <button onClick={() => setShowShare(true)}
                  className="w-11 h-11 rounded-full bg-card border border-border shadow-sm flex items-center justify-center active:scale-95 transition-all">
                  <Users size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* ring */}
              <div className="flex justify-center mb-4">
                <div className="relative" style={{ width: 156, height: 156 }}>
                  <Ring pct={0.6847} size={156} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black">6,847</span>
                    <span className="text-xs text-muted-foreground font-bold">de 10,000 pasos</span>
                    <span className="text-xs font-black mt-1 px-2 py-0.5 rounded-full"
                      style={{ background: P + "18", color: P }}>68%</span>
                  </div>
                </div>
              </div>

              {/* metric cards */}
              <div className="grid grid-cols-3 gap-2.5 px-4 mb-4">
                {[
                  { lbl: "Distancia",     val: "5.2 km",   icon: <MapPin size={15} />,  col: G },
                  { lbl: "Tiempo activo", val: "48 min",   icon: <Clock size={15} />,   col: A },
                  { lbl: "Calorías",      val: "312 kcal", icon: <Flame size={15} />,   col: R },
                ].map(m => (
                  <div key={m.lbl} className="bg-card rounded-2xl p-3 border border-border shadow-sm text-center">
                    <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ background: m.col + "1a", color: m.col }}>
                      {m.icon}
                    </div>
                    <p className="font-black text-sm">{m.val}</p>
                    <p className="text-xs text-muted-foreground font-bold">{m.lbl}</p>
                  </div>
                ))}
              </div>

              {/* weekly bar chart */}
              <Card className="mb-4">
                <p className="text-sm font-bold mb-0.5">Pasos vs. meta diaria</p>
                <p className="text-xs text-muted-foreground mb-3">Esta semana · Meta: 10,000</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart key="chart-steps" data={stepsWeek} barSize={22} margin={{ top: 4, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                    <XAxis dataKey="day" tick={{ fontSize: 13, fill: "#6b6875", fontFamily: "Nunito" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 13, fill: "#6b6875", fontFamily: "Nunito" }} axisLine={false} tickLine={false}
                      tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={TT} formatter={(v: number) => [`${v.toLocaleString("es-CL")} pasos`]} />
                    <ReferenceLine y={10000} stroke={R} strokeDasharray="4 4" strokeWidth={1.5}
                      label={{ value: "Meta", position: "insideTopRight", fontSize: 13, fill: R }} />
                    <Bar key="steps-pasos" dataKey="pasos" fill={P} radius={[5, 5, 0, 0]} name="Pasos" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              {/* anxiety */}
              <Card className="mb-4">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-bold flex items-center gap-2">
                      <Brain size={16} style={{ color: A }} />
                      Ansiedad
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Indicador basado en patrones de movimiento</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[13px] font-black bg-amber-50 text-amber-700">
                    Moderado · 54
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart key="chart-anxiety" data={anxietyWeek} margin={{ top: 18, right: 8, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0efe9" />
                    <XAxis dataKey="day" tick={{ fontSize: 13, fill: "#6b6875", fontFamily: "Nunito" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 13, fill: "#6b6875", fontFamily: "Nunito" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={TT} formatter={(v: number) => [`${v} / 100`, "Ansiedad"]} />
                    <ReferenceLine y={60} stroke={A} strokeDasharray="4 4" />
                    <Line
                      key="anxiety-score"
                      type="monotone"
                      dataKey="ansiedad"
                      stroke={P}
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#fff", stroke: P, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="border-t border-border pt-3 mt-1">
                  <p className="text-sm font-bold mb-2">Episodios de hoy</p>
                  {anxietyEpisodes.map(episode => (
                    <div key={`${episode.time}-${episode.event}`} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                      <span className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center font-black" aria-hidden="true">
                        {episode.icon}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-bold">{episode.event}</p>
                        <p className="text-xs text-muted-foreground font-bold">{episode.time}</p>
                      </div>
                      <span className="text-sm font-black">{episode.dur}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* sessions */}
              <Card className="mb-6">
                <p className="text-sm font-bold mb-3">Sesiones de hoy</p>
                {[
                  { act: "Paseo mañana",    dur: "22 min", steps: "2,800", time: "08:30" },
                  { act: "Juego en jardín", dur: "15 min", steps: "1,900", time: "12:15" },
                  { act: "Paseo tarde",     dur: "11 min", steps: "2,147", time: "16:45" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: P + "18" }}>
                      <Activity size={14} style={{ color: P }} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{s.act}</p>
                      <p className="text-xs text-muted-foreground font-bold">{s.time} · {s.dur}</p>
                    </div>
                    <span className="text-sm font-black">{s.steps}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ════════ ALIMENTACIÓN ════════ */}
          {tab === "alimentacion" && (
            <div>
              <div className="flex items-center justify-between px-5 pt-12 pb-4">
                <div>
                  <h1 className="text-3xl font-black">Alimentación 🍖</h1>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Recomendación personalizada</p>
                </div>
                <button onClick={() => setShowShare(true)}
                  className="w-11 h-11 rounded-full bg-card border border-border shadow-sm flex items-center justify-center active:scale-95 transition-all">
                  <Users size={18} className="text-muted-foreground" />
                </button>
              </div>

              {/* hero result */}
              <div className="mx-4 rounded-2xl p-5 mb-4 text-white"
                style={{ background: `linear-gradient(135deg, ${G} 0%, #388e3c 100%)`, boxShadow: `0 8px 32px ${G}55` }}>
                <p className="text-sm font-bold text-green-100 mb-1">Ración recomendada · hoy</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-6xl font-black">{f.g.toLocaleString("es-CL")}</span>
                  <span className="text-xl mb-2.5 text-green-100">g / día</span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-green-100">
                  <span>🐕 Golden Retriever</span>
                  <span>⚖️ 28 kg</span>
                  <span>🔥 312 kcal quemadas</span>
                </div>
              </div>

              <div className="mx-4 mb-4">
                <button
                  onClick={() => setRationRegistered(prev => !prev)}
                  className="w-full py-3.5 rounded-2xl font-black text-sm border flex items-center justify-center gap-2 transition-all active:scale-[.98]"
                  style={rationRegistered
                    ? { background: G + "14", borderColor: G + "55", color: "#2f7d32" }
                    : { background: "#fff", borderColor: G, color: "#2f7d32" }}
                >
                  {rationRegistered ? <Check size={17} /> : <Plus size={17} />}
                  {rationRegistered ? "Ración de hoy registrada" : "Registrar ración de hoy"}
                </button>
                <p className="text-xs text-muted-foreground text-center mt-2 font-bold">
                  La cantidad consumida la ingresas tú; el collar no mide la ración.
                </p>
              </div>

              {/* food type selector */}
              <Card className="mb-4">
                <p className="text-sm font-bold mb-3">Tipo de alimento</p>
                <div className="grid grid-cols-3 gap-2">
                  {(["seca","humeda","mixta"] as FoodType[]).map(t => (
                    <button key={t} onClick={() => { setFood(t); setRationRegistered(false); }}
                      className="py-3 rounded-xl text-sm font-bold transition-all"
                      style={food === t
                        ? { background: G, color: "#fff", boxShadow: `0 4px 16px ${G}55` }
                        : { background: "#f5f5f5", color: "#8b8996" }}>
                      {FOOD[t].em} {FOOD[t].lbl}
                    </button>
                  ))}
                </div>
              </Card>

              {/* comparison */}
              <Card className="mb-4">
                <p className="text-sm font-bold mb-4">Comparación con ayer</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 text-center p-3 rounded-2xl bg-muted">
                    <p className="text-xs text-muted-foreground font-bold mb-1">Ayer</p>
                    <p className="text-3xl font-black">{f.yest.toLocaleString("es-CL")}g</p>
                    <p className="text-xs text-muted-foreground font-bold">Ingresado por ti</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <span className="px-3 py-1.5 rounded-full text-xs font-black"
                      style={f.g >= f.yest
                        ? { background: G + "18", color: G }
                        : { background: R + "18", color: R }}>
                      {f.g >= f.yest
                        ? `+${(f.g - f.yest).toLocaleString("es-CL")}g`
                        : `${(f.g - f.yest).toLocaleString("es-CL")}g`}
                    </span>
                    <p className="text-xs text-muted-foreground font-bold">vs hoy</p>
                  </div>
                  <div className="flex-1 text-center p-3 rounded-2xl" style={{ background: G + "12" }}>
                    <p className="text-xs font-bold mb-1" style={{ color: G }}>Hoy</p>
                    <p className="text-3xl font-black" style={{ color: G }}>{f.g.toLocaleString("es-CL")}g</p>
                    <p className="text-xs font-bold" style={{ color: G }}>recomendado</p>
                  </div>
                </div>
              </Card>

              {/* calculation basis */}
              <Card className="mb-6">
                <p className="text-sm font-bold mb-3">Cálculo basado en</p>
                {[
                  { lbl: "Peso actual",                val: "28 kg"              },
                  { lbl: "Raza",                       val: "Golden Retriever"   },
                  { lbl: "Edad",                       val: "3 años (adulto)"    },
                  { lbl: "Calorías quemadas (collar)", val: "312 kcal"           },
                  { lbl: "Necesidad energética diaria",val: "1.248 kcal"         },
                  { lbl: "Densidad calórica",          val: f.dens               },
                ].map(b => (
                  <div key={b.lbl} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                    <span className="text-sm text-muted-foreground font-bold">{b.lbl}</span>
                    <span className="text-sm font-black">{b.val}</span>
                  </div>
                ))}
              </Card>
            </div>
          )}

          {/* ════════ AGENDA ════════ */}
          {tab === "agenda" && (
            <div>
              <div className="flex items-center justify-between px-5 pt-12 pb-4">
                <div>
                  <h1 className="text-3xl font-black">Agenda 📅</h1>
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mt-0.5">Julio 2026</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowShare(true)}
                    className="w-11 h-11 rounded-full bg-card border border-border shadow-sm flex items-center justify-center active:scale-95 transition-all">
                    <Users size={18} className="text-muted-foreground" />
                  </button>
                  <button className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-all"
                    style={{ background: P }}>
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* calendar */}
              <Card className="mb-4">
                <CalGrid sel={calDay} onSel={setCalDay} />
              </Card>

              {/* upcoming events */}
              <div className="mx-4 mb-4">
                <p className="text-sm font-bold mb-3">Próximos eventos</p>
                {[
                  { dn: "22", dm: "jul", lbl: "Vacuna anual (Antirrábica)",  type: "Vacuna",     col: R, badge: "7 días" },
                  { dn: "28", dm: "jul", lbl: "Desparasitación interna",     type: "Prevención", col: A, badge: null     },
                  { dn: "15", dm: "ago", lbl: "Control veterinario anual",   type: "Control",    col: P, badge: null     },
                  { dn: "28", dm: "ago", lbl: "Desparasitación externa",     type: "Prevención", col: A, badge: null     },
                ].map((e, i) => (
                  <div key={i} className="flex items-center gap-3 bg-card rounded-2xl p-3 border border-border shadow-sm mb-2">
                    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 text-white"
                      style={{ background: e.col }}>
                      <span className="text-base font-black leading-none">{e.dn}</span>
                      <span className="text-xs font-bold leading-none">{e.dm}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold leading-snug">{e.lbl}</p>
                      <span className="inline-block text-xs font-bold px-2 py-0.5 rounded-full mt-0.5"
                        style={{ background: e.col + "18", color: e.col }}>{e.type}</span>
                    </div>
                    {e.badge && (
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl flex-shrink-0"
                        style={{ background: R + "18", color: R }}>{e.badge}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Ley 21.020 */}
              <Card className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={16} style={{ color: P }} />
                  <p className="text-sm font-bold">Cumplimiento · Ley 21.020</p>
                </div>
                {[
                  { lbl: "Identificación con microchip", ok: true, badge: null },
                  { lbl: "Vacuna antirrábica vigente", ok: false, badge: null },
                  { lbl: "Registro municipal", ok: true, badge: null },
                  { lbl: "Desparasitación al día", ok: true, badge: null },
                  { lbl: "Control veterinario anual", ok: true, badge: null },
                  { lbl: "Vinculación con Registro Nacional de Mascotas", ok: null, badge: "Próximamente" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2.5 border-b border-border last:border-0">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: item.ok === null ? P + "18" : item.ok ? G + "18" : R + "18" }}>
                      {item.ok === null
                        ? <Clock size={12} style={{ color: P }} />
                        : item.ok
                        ? <Check size={12} style={{ color: G }} />
                        : <X    size={12} style={{ color: R }} />}
                    </div>
                    <span className="text-sm font-bold flex-1" style={item.ok === false ? { color: R } : {}}>{item.lbl}</span>
                    {item.badge && (
                      <span className="text-[13px] font-black px-2 py-1 rounded-full whitespace-nowrap" style={{ background: P + "18", color: P }}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </Card>
            </div>
          )}

        </div>{/* end scroll */}

        {/* ════════ COLLAR MODAL ════════ */}
        {showCollar && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end"
            style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}>
            <div className="bg-background rounded-t-3xl shadow-2xl overflow-hidden"
              style={{ maxHeight: "92vh" }}>

              {/* drag handle */}
              <div className="pt-4 pb-2 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-border" />
              </div>

              <div className="px-6 pb-6 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-black">Vincular collar</h3>
                  <button onClick={() => { setShowCollar(false); setScanState("idle"); }}
                    className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                    <X size={16} />
                  </button>
                </div>

                {/* ── ya vinculado ── */}
                {collarLinked ? (
                  <>
                    <div className="rounded-2xl p-4 mb-5 border border-green-200 flex items-center gap-4"
                      style={{ background: G + "0f" }}>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                        style={{ background: G + "22" }}>🏷️</div>
                      <div className="flex-1">
                        <p className="font-black">Collar CholiTech C1</p>
                        <p className="text-xs text-muted-foreground font-bold mt-0.5">Vinculado · Batería 78% · Señal fuerte</p>
                      </div>
                      <div className="w-3 h-3 rounded-full" style={{ background: G }} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      {[
                        { lbl: "Batería", val: "78%",    em: "🔋" },
                        { lbl: "Señal",   val: "Fuerte", em: "📶" },
                      ].map(m => (
                        <div key={m.lbl} className="bg-card rounded-2xl p-3 border border-border text-center shadow-sm">
                          <span className="text-xl">{m.em}</span>
                          <p className="font-black text-sm mt-1">{m.val}</p>
                          <p className="text-xs text-muted-foreground font-bold">{m.lbl}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-muted px-3 py-2.5 mb-5 text-sm font-bold text-muted-foreground">
                      <RefreshCw size={15} style={{ color: G }} />
                      Última sincronización: hace 4 min
                    </div>
                    <button onClick={() => { setCollarLinked(false); setScanState("idle"); }}
                      className="w-full py-3.5 rounded-2xl font-bold text-sm border border-border bg-card hover:bg-muted transition-colors">
                      Desvincular collar
                    </button>
                  </>
                ) : (
                  <>
                    {scanState !== "done" ? (
                      <>
                        {/* viewfinder */}
                        <div className="rounded-3xl overflow-hidden mb-4 relative flex items-center justify-center"
                          style={{ background: "#0f0f14", height: 220 }}>
                          {[["top-4 left-4","border-t-2 border-l-2"],["top-4 right-4","border-t-2 border-r-2"],
                            ["bottom-4 left-4","border-b-2 border-l-2"],["bottom-4 right-4","border-b-2 border-r-2"]
                          ].map(([pos, border], i) => (
                            <div key={i} className={`absolute ${pos} ${border} w-6 h-6 rounded-sm border-white/80`} />
                          ))}
                          <div className="relative border border-white/20 rounded-2xl"
                            style={{ width: 140, height: 140 }}>
                            {scanState === "scanning" && (
                              <div className="absolute left-0 right-0 h-0.5 rounded-full"
                                style={{ background: P, top: "50%", animation: "scanline 1.4s ease-in-out infinite" }} />
                            )}
                            {scanState === "idle" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <QrCode size={40} className="text-white/20" />
                              </div>
                            )}
                            {scanState === "scanning" && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                                  style={{ borderColor: P, borderTopColor: "transparent" }} />
                              </div>
                            )}
                          </div>
                          <p className="absolute bottom-3 left-0 right-0 text-center text-xs font-bold text-white/70">
                            {scanState === "scanning" ? "Leyendo QR del collar…" : "Apunta la cámara al QR del collar"}
                          </p>
                        </div>

                        <style>{`
                          @keyframes scanline {
                            0%   { top: 8%;  opacity: 1; }
                            50%  { top: 86%; opacity: 1; }
                            100% { top: 8%;  opacity: 1; }
                          }
                        `}</style>

                        {scanState === "idle" && (
                          <button onClick={startScan}
                            className="w-full py-4 rounded-2xl font-black text-white text-sm mb-4 flex items-center justify-center gap-2 transition-all active:scale-[.98]"
                            style={{ background: P, boxShadow: `0 6px 24px ${P}55` }}>
                            <ScanLine size={18} />
                            Escanear QR del collar
                          </button>
                        )}

                        <div className="bg-card rounded-2xl p-4 border border-border">
                          <p className="text-xs font-black text-muted-foreground mb-2 uppercase tracking-wider">
                            ¿Sin cámara? Ingresa el código del collar
                          </p>
                          <p className="text-xs text-muted-foreground font-bold mb-3 leading-relaxed">
                            Encuéntralo impreso en la parte inferior del collar (ej. CT-A3F2-9KX1).
                          </p>
                          <div className="flex gap-2">
                            <input value={manualCode}
                              onChange={e => { setManualCode(e.target.value.toUpperCase().slice(0, 12)); setManualError(false); }}
                              placeholder="CT-XXXX-XXXX"
                              className="flex-1 min-w-0 px-4 py-3 rounded-xl border text-sm font-bold uppercase tracking-wider outline-none"
                              style={{ borderColor: manualError ? R : P + "44", background: manualError ? R + "08" : "#f9f9fb" }} />
                            <button onClick={handleManualLink}
                              className="px-4 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                              style={{ background: P }}>
                              Vincular
                            </button>
                          </div>
                          {manualError && (
                            <p className="text-xs font-bold mt-2" style={{ color: R }}>
                              Ingresa el código completo del collar.
                            </p>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center py-4">
                        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                          style={{ background: G + "18" }}>
                          <Check size={36} style={{ color: G }} strokeWidth={2.5} />
                        </div>
                        <p className="font-black text-xl mb-1" style={{ color: G }}>¡Collar vinculado!</p>
                        <p className="text-sm text-muted-foreground font-bold mb-2">Collar CholiTech C1</p>
                        <p className="text-xs text-muted-foreground mb-6">
                          Código leído: <span className="font-black">{collarQrCode}</span>
                        </p>
                        <button onClick={confirmLink}
                          className="w-full py-4 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2"
                          style={{ background: G, boxShadow: `0 6px 24px ${G}55` }}>
                          <Check size={18} />
                          Confirmar y continuar
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ════════ SHARE / CO-OWNER MODAL ════════ */}
        {showShare && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end"
            style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
            <div className="bg-background rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
              <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />

              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black">Compartir acceso</h3>
                <button onClick={() => setShowShare(false)}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <X size={16} />
                </button>
              </div>

              {/* my share code */}
              <div className="rounded-2xl p-5 mb-5 border text-center"
                style={{ background: P + "0c", borderColor: P + "33" }}>
                <p className="text-xs font-black uppercase tracking-widest mb-3" style={{ color: P }}>
                  Tu código de invitación
                </p>
                <div className="flex items-center justify-center gap-2 mb-3">
                  {shareCode.split("").map((ch, i) => (
                    <span key={i} className="w-9 h-11 rounded-xl flex items-center justify-center text-xl font-black border-2"
                      style={{ background: "#fff", borderColor: P + "44", color: P }}>
                      {ch}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground font-bold mb-4">
                  Comparte este código con tu pareja o codueño.<br />Expira en 24 horas.
                </p>
                <button onClick={handleCopy}
                  className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                  style={{ background: copied ? G : P }}>
                  {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                  {copied ? "¡Copiado!" : "Copiar código"}
                </button>
              </div>

              {/* join with code */}
              <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-5">
                <p className="text-sm font-black mb-3 flex items-center gap-2">
                  <UserPlus size={16} style={{ color: P }} />
                  Unirme con un código
                </p>
                <div className="flex gap-2">
                  <input
                    value={joinInput}
                    onChange={e => { setJoinInput(e.target.value.toUpperCase().slice(0, 6)); setJoinError(false); }}
                    placeholder="Ej. AB12CD"
                    className="flex-1 px-4 py-3 rounded-xl border text-sm font-bold uppercase tracking-widest outline-none transition-colors"
                    style={{
                      borderColor: joinError ? R : P + "44",
                      background: joinError ? R + "08" : "#f9f9fb",
                      color: "#1a1826",
                    }}
                    maxLength={6}
                  />
                  <button onClick={handleJoin}
                    className="px-5 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95"
                    style={{ background: P }}>
                    Unir
                  </button>
                </div>
                {joinError && (
                  <p className="text-xs font-bold mt-2" style={{ color: R }}>Ingresa un código válido de al menos 4 caracteres.</p>
                )}
              </div>

              {/* co-owners list */}
              {coOwners.length > 0 && (
                <div className="bg-card rounded-2xl p-4 border border-border shadow-sm mb-2">
                  <p className="text-sm font-black mb-3">Acceso compartido</p>
                  <div className="space-y-3">
                    {coOwners.map((o, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                          style={{ background: o.color }}>
                          {o.initials}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold">{o.name}</p>
                          <p className="text-xs text-muted-foreground font-bold">{o.role} · Acceso completo</p>
                        </div>
                        <button onClick={() => setCoOwners(prev => prev.filter((_, j) => j !== i))}
                          className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-red-50 transition-colors">
                          <X size={13} className="text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════ BOTTOM NAV ════════ */}
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-card/90 backdrop-blur-md border-t border-border px-2 pb-4 pt-2">
          <div className="flex justify-around">
            {navItems.map(item => {
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => nav(item.id)}
                  className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
                  style={{ color: active ? P : "#625f6b" }}>
                  <div style={{ transform: active ? "scale(1.12)" : "scale(1)", transition: "transform .2s" }}>
                    {item.icon}
                  </div>
                  <span className="text-xs font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
