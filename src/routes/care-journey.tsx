import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  FileText,
  Heart,
  Home,
  Scale,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CARE_JOURNEY, SG_RESOURCES } from "@/lib/content";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/care-journey")({
  head: () => ({
    meta: [
      { title: "Care Journey — Alongside" },
      { name: "description", content: "Gentle, structured guidance through each phase of caregiving." },
    ],
  }),
  component: CareJourney,
});

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Family Coordination": Users,
  "Medical": Stethoscope,
  "Medical Clarity": Stethoscope,
  "Emotional": Heart,
  "Emotional Stabilization": Heart,
  "Financial (Singapore)": Wallet,
  "Legal": Scale,
  "Practical": FileText,
  "Home Preparation": Home,
  "Memories": BookOpen,
  "Burnout Prevention": Sun,
  "Relationship": Heart,
  "Comfort & Care": Heart,
  "After-Care Logistics": FileText,
};

function iconFor(category: string): LucideIcon {
  return CATEGORY_ICONS[category] ?? Sparkles;
}

function CareJourney() {
  const { state, update, hydrated } = useAppState();
  const [activePhase, setActivePhase] = useState(CARE_JOURNEY[0].id);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const { totalCount, checkedCount } = useMemo(() => {
    let total = 0;
    for (const p of CARE_JOURNEY) for (const c of p.categories) total += c.items.length;
    const checked = Object.values(state?.checkedItems ?? {}).filter(Boolean).length;
    return { totalCount: total, checkedCount: Math.min(checked, total) };
  }, [state?.checkedItems]);

  if (!hydrated) return null;

  const phase = CARE_JOURNEY.find((p) => p.id === activePhase)!;
  const ratio = totalCount > 0 ? checkedCount / totalCount : 0;

  const toggle = (id: string) => setOpenItems((o) => ({ ...o, [id]: !o[id] }));
  const check = (id: string) =>
    update((s) => ({ ...s, checkedItems: { ...s.checkedItems, [id]: !s.checkedItems[id] } }));

  return (
    <AppShell>
      <div className="space-y-4">
        <header className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Compass className="h-4 w-4" strokeWidth={1.6} />
              <span className="text-xs uppercase tracking-[0.14em]">Care journey</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-serif mt-1 text-balance leading-tight">
              A gentle path forward
            </h1>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              A few suggestions for each chapter.
            </p>
          </div>
          <HeartMeter ratio={ratio} checked={checkedCount} total={totalCount} />
        </header>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          {CARE_JOURNEY.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm border transition ${
                activePhase === p.id
                  ? "bg-card border-border/60 text-accent-active shadow-soft"
                  : "bg-transparent border-border text-foreground/70 hover:bg-card/60"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={phase.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="rounded-2xl bg-gradient-warm border border-border px-4 py-3">
              <h2 className="font-serif text-xl">{phase.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{phase.subtitle}</p>
            </div>

            {phase.categories.map((cat) => {
              const Icon = iconFor(cat.category);
              return (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center gap-2 px-1">
                    <span className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-foreground/70" strokeWidth={1.5} />
                    </span>
                    <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {cat.category}
                    </h3>
                  </div>
                  <div className="space-y-1.5">
                    {cat.items.map((item) => {
                      const checked = !!state.checkedItems[item.id];
                      const open = !!openItems[item.id];
                      return (
                        <div
                          key={item.id}
                          className={`rounded-2xl border transition overflow-hidden ${
                            checked ? "bg-sage-soft/40 border-sage/30" : "bg-card border-border"
                          }`}
                        >
                          <div className="flex items-start gap-3 px-4 py-3">
                            <button
                              onClick={() => check(item.id)}
                              className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center border flex-shrink-0 transition ${
                                checked ? "bg-sage border-sage" : "border-border hover:border-sage"
                              }`}
                              aria-label="Mark complete"
                            >
                              {checked && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                            </button>
                            <button onClick={() => toggle(item.id)} className="flex-1 text-left">
                              <div className="flex items-start justify-between gap-2">
                                <span className={`text-sm font-medium leading-snug ${checked ? "text-muted-foreground" : ""}`}>
                                  {item.title}
                                </span>
                                <ChevronDown className={`h-4 w-4 mt-0.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
                              </div>
                            </button>
                          </div>
                          <AnimatePresence>
                            {open && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pl-12 space-y-2 text-sm">
                                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                                  <p className="text-foreground/80 leading-relaxed">
                                    <span className="text-xs uppercase tracking-wider text-muted-foreground/80">Why it matters · </span>
                                    {item.why}
                                  </p>
                                  <p className="text-sage leading-relaxed italic">{item.reassurance}</p>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <section className="pt-4">
          <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1 mb-3">
            Singapore resources
          </h3>
          <div className="grid gap-2">
            {SG_RESOURCES.map((r) => (
              <a
                key={r.name}
                href={r.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl bg-card border border-border p-4 hover:border-sage/40 transition"
              >
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.desc}</p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

/* -------------------- Heart completion meter -------------------- */

function HeartMeter({ ratio, checked, total }: { ratio: number; checked: number; total: number }) {
  // Clamp & smooth
  const r = Math.max(0, Math.min(1, ratio));
  // The heart path occupies y range roughly 4..28. We fill from the bottom.
  const fillHeight = 24 * r;
  const fillY = 28 - fillHeight;

  return (
    <div className="flex flex-col items-center flex-shrink-0 pt-1" aria-label={`${checked} of ${total} tasks complete`}>
      <svg viewBox="0 0 32 32" className="h-10 w-10" aria-hidden>
        <defs>
          <clipPath id="heart-clip">
            <path d="M16 28 C 4 20, 4 10, 10 7 C 13 5.5, 15.5 7, 16 9 C 16.5 7, 19 5.5, 22 7 C 28 10, 28 20, 16 28 Z" />
          </clipPath>
          <linearGradient id="heart-fill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--sage)" />
            <stop offset="100%" stopColor="var(--sage)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* Outline */}
        <path
          d="M16 28 C 4 20, 4 10, 10 7 C 13 5.5, 15.5 7, 16 9 C 16.5 7, 19 5.5, 22 7 C 28 10, 28 20, 16 28 Z"
          fill="var(--sage)"
          fillOpacity="0.12"
          stroke="var(--sage)"
          strokeWidth="1.2"
        />
        {/* Animated fill */}
        <g clipPath="url(#heart-clip)">
          <motion.rect
            x="0"
            width="32"
            initial={false}
            animate={{ y: fillY, height: fillHeight }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            fill="url(#heart-fill)"
          />
        </g>
      </svg>
      <span className="text-[10px] tabular-nums text-muted-foreground mt-1">
        {checked}/{total}
      </span>
    </div>
  );
}
