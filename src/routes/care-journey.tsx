import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, ChevronRight, Compass, Sun } from "lucide-react";
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

function CareJourney() {
  const { state, update, hydrated } = useAppState();
  const [activePhase, setActivePhase] = useState(CARE_JOURNEY[0].id);
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  if (!hydrated) return null;

  const phase = CARE_JOURNEY.find((p) => p.id === activePhase)!;

  const toggle = (id: string) => setOpenItems((o) => ({ ...o, [id]: !o[id] }));
  const check = (id: string) =>
    update((s) => ({ ...s, checkedItems: { ...s.checkedItems, [id]: !s.checkedItems[id] } }));

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Compass className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-xs uppercase tracking-[0.14em]">Care journey</span>
          </div>
          <h1 className="text-4xl font-serif mt-1.5 text-balance">A gentle path forward</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            A few suggestions for each chapter. Tick what feels useful — skip the rest.
          </p>
        </header>

        <Link
          to="/"
          className="block rounded-2xl bg-gradient-warm border border-border p-4 hover:border-sage/40 transition"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-card/70 flex items-center justify-center flex-shrink-0">
              <Sun className="h-4 w-4 text-foreground/80" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Today</p>
              <p className="font-serif text-lg leading-snug">
                {state.checkInHistory.length > 0
                  ? `Your last check-in: ${state.checkInHistory[state.checkInHistory.length - 1].mood.toLowerCase()}.`
                  : "A small moment to begin the day."}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </Link>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
          {CARE_JOURNEY.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePhase(p.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm border transition ${
                activePhase === p.id
                  ? "bg-foreground text-background border-foreground"
                  : "bg-card border-border text-foreground/80 hover:bg-muted"
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
            className="space-y-6"
          >
            <div className="rounded-2xl bg-gradient-warm border border-border p-5">
              <h2 className="font-serif text-2xl">{phase.title}</h2>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{phase.subtitle}</p>
            </div>

            {phase.categories.map((cat) => (
              <div key={cat.category} className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">
                  {cat.category}
                </h3>
                <div className="space-y-2">
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
                        <div className="flex items-start gap-3 p-4">
                          <button
                            onClick={() => check(item.id)}
                            className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center border flex-shrink-0 transition ${
                              checked ? "bg-sage border-sage" : "border-border hover:border-sage"
                            }`}
                            aria-label="Mark complete"
                          >
                            {checked && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                          </button>
                          <button
                            onClick={() => toggle(item.id)}
                            className="flex-1 text-left"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className={`text-sm font-medium leading-snug ${checked ? "text-muted-foreground" : ""}`}>
                                {item.title}
                              </span>
                              <ChevronDown className={`h-4 w-4 mt-0.5 text-muted-foreground transition ${open ? "rotate-180" : ""}`} />
                            </div>
                            {!open && (
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-1">
                                {item.description}
                              </p>
                            )}
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
                                <p className="text-foreground/80 leading-relaxed"><span className="text-xs uppercase tracking-wider text-muted-foreground/80">Why it matters · </span>{item.why}</p>
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
            ))}
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
