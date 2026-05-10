import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  BookOpen,
  Check,
  ChevronDown,
  Compass,
  ExternalLink,
  FileText,
  Heart,
  Home,
  Info,
  Lightbulb,
  Scale,
  Sparkles,
  Stethoscope,
  Sun,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { CARE_JOURNEY, SG_RESOURCES, type ChecklistItem } from "@/lib/content";
import { useAppState } from "@/lib/store";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { flyHeart, setHeartTarget } from "@/lib/heart-flight";
import { HeartFlyer } from "@/components/HeartFlyer";

function originFromEvent(e: React.MouseEvent | React.TouchEvent | undefined): { x: number; y: number } | null {
  if (!e) return null;
  const t = e.currentTarget as HTMLElement;
  const r = t.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function notifyCompleted(title: string, undo: () => void) {
  toast.success(`Marked done · ${title}`, {
    duration: 5000,
    action: { label: "Undo", onClick: undo },
  });
}

import imgPause from "@/assets/care/01_pause_process_emotions.png";
import imgSupport from "@/assets/care/02_identify_support_person.png";
import imgDoctor from "@/assets/care/03_write_doctor_contact.png";
import imgDocs from "@/assets/care/04_gather_medical_documents.png";
import imgPauseDecisions from "@/assets/care/05_avoid_big_decisions.png";
import imgDiagnosis from "@/assets/care/06_understand_diagnosis.png";
import imgPrognosis from "@/assets/care/07_clarify_prognosis.png";
import imgGoals from "@/assets/care/08_ask_treatment_goals.png";
import imgSummary from "@/assets/care/09_request_medical_summary.png";

const ITEM_IMAGES: Record<string, string> = {
  p2: imgSupport,
  p3: imgDoctor,
  p4: imgDocs,
  m1: imgDiagnosis,
  m2: imgPrognosis,
  m3: imgGoals,
  m4: imgSummary,
};

export const Route = createFileRoute("/care-journey")({
  head: () => ({
    meta: [
      { title: "Care Journey — Alongside" },
      { name: "description", content: "Gentle, structured guidance through each phase of caregiving." },
    ],
  }),
  component: CareJourney,
});

const EMOTIONAL_CATEGORY = "When you are ready, let's note down what has been happening";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "Family Coordination": Users,
  "Medical": Stethoscope,
  "Medical Clarity": Stethoscope,
  "Emotional": Heart,
  [EMOTIONAL_CATEGORY]: Heart,
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
  const [progressOpen, setProgressOpen] = useState(false);

  const { totalCount, checkedCount, completedItems, pendingItems } = useMemo(() => {
    let total = 0;
    const completed: { id: string; title: string; phase: string; category: string }[] = [];
    const pending: { id: string; title: string; phase: string; category: string }[] = [];
    const checks = state?.checkedItems ?? {};
    for (const p of CARE_JOURNEY) {
      for (const c of p.categories) {
        total += c.items.length;
        for (const item of c.items) {
          const entry = { id: item.id, title: item.title, phase: p.title, category: c.category };
          if (checks[item.id]) completed.push(entry);
          else pending.push(entry);
        }
      }
    }
    return {
      totalCount: total,
      checkedCount: Math.min(completed.length, total),
      completedItems: completed,
      pendingItems: pending,
    };
  }, [state?.checkedItems]);

  if (!hydrated) return null;

  const phase = CARE_JOURNEY.find((p) => p.id === activePhase)!;
  const ratio = totalCount > 0 ? checkedCount / totalCount : 0;

  const toggleOpen = (id: string) => setOpenItems((o) => ({ ...o, [id]: !o[id] }));
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
          <HeartMeter ratio={ratio} checked={checkedCount} total={totalCount} onClick={() => setProgressOpen(true)} />
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
            className="space-y-5"
          >
            <div className="rounded-2xl bg-gradient-warm border border-border px-4 py-3">
              <h2 className="font-serif text-xl">{phase.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{phase.subtitle}</p>
            </div>

            {phase.categories.map((cat) => {
              const Icon = iconFor(cat.category);
              return (
                <section key={cat.category} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-foreground/70" strokeWidth={1.5} />
                    </span>
                    <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {cat.category}
                    </h3>
                  </div>

                  {cat.category === EMOTIONAL_CATEGORY ? (
                    <div className="space-y-3">
                      <div className="rounded-2xl border border-border bg-gradient-sage px-4 py-3 flex items-center gap-3">
                        <img src={imgPause} alt="" className="h-14 w-14 object-contain flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Info className="h-3.5 w-3.5 text-foreground/70" strokeWidth={1.8} />
                            <p className="text-sm font-medium leading-snug">Quick Check</p>
                          </div>
                          <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">
                            If you have had the time to pause and process all of this.
                          </p>
                        </div>
                      </div>
                      <EmotionalCarousel items={cat.items} checkedItems={state.checkedItems} onToggle={check} />
                      <div className="rounded-2xl border border-border bg-gradient-warm px-4 py-3 flex items-center gap-3">
                        <img src={imgPauseDecisions} alt="" className="h-14 w-14 object-contain flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <Lightbulb className="h-3.5 w-3.5 text-foreground/70" strokeWidth={1.8} />
                            <p className="text-sm font-medium leading-snug">Tip</p>
                          </div>
                          <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">
                            Big decisions today can wait.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : cat.category === "Medical Clarity" ? (
                    <MedicalTiles items={cat.items} checkedItems={state.checkedItems} onToggle={check} />
                  ) : (
                    <ChecklistAccordion
                      items={cat.items}
                      checkedItems={state.checkedItems}
                      openItems={openItems}
                      onToggleOpen={toggleOpen}
                      onToggleCheck={check}
                    />
                  )}
                </section>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <section className="pt-4">
          <div className="flex items-center gap-2 px-1 mb-3">
            <span className="h-6 w-6 rounded-full bg-card border border-border flex items-center justify-center">
              <Sparkles className="h-3.5 w-3.5 text-foreground/70" strokeWidth={1.5} />
            </span>
            <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
              Care resources in Singapore
            </h3>
          </div>
          <ResourcesCarousel />
        </section>
      </div>
      <ProgressDialog
        open={progressOpen}
        onOpenChange={setProgressOpen}
        completed={completedItems}
        pending={pendingItems}
        onUncheck={(id) => update((s) => ({ ...s, checkedItems: { ...s.checkedItems, [id]: false } }))}
        onCheck={(id) => update((s) => ({ ...s, checkedItems: { ...s.checkedItems, [id]: true } }))}
      />
      <HeartFlyer />
    </AppShell>
  );
}

/* -------------------- Emotional carousel (modal_1) -------------------- */

function EmotionalCarousel({
  items,
  checkedItems,
  onToggle,
}: {
  items: ChecklistItem[];
  checkedItems: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const [active, setActive] = useState<ChecklistItem | null>(null);
  const [leaving, setLeaving] = useState<Record<string, boolean>>({});
  const gradients = ["bg-gradient-sage", "bg-gradient-warm", "bg-gradient-dawn"];

  const handleComplete = (id: string, e?: React.MouseEvent) => {
    const item = items.find((i) => i.id === id);
    const origin = originFromEvent(e);
    if (origin) flyHeart(origin);
    setLeaving((p) => ({ ...p, [id]: true }));
    setTimeout(() => {
      onToggle(id);
      setLeaving((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      if (item) notifyCompleted(item.title, () => onToggle(id));
    }, 550);
  };

  const visibleItems = items.filter((i) => !checkedItems[i.id]);
  const allDone = visibleItems.length === 0;

  return (
    <>
      {allDone ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-sage/30 bg-sage-soft/40 p-6 text-center"
        >
          <p className="font-serif text-lg text-foreground">All done for now.</p>
          <p className="text-sm text-muted-foreground mt-1">Come back when you're ready for the next gentle step.</p>
        </motion.div>
      ) : (
        <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
          <CarouselContent className="-ml-3">
            {visibleItems.map((item, i) => {
              const grad = gradients[i % gradients.length];
              const isLeaving = !!leaving[item.id];
              return (
                <CarouselItem key={item.id} className="pl-3 basis-[72%] sm:basis-[48%] md:basis-[34%]">
                  <motion.button
                    onClick={() => setActive(item)}
                    initial={{ opacity: 1, scale: 1 }}
                    animate={
                      isLeaving
                        ? { opacity: 0, scale: 0.9, filter: "blur(3px)" }
                        : { opacity: 1, scale: 1, filter: "blur(0px)" }
                    }
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`relative w-full text-left rounded-3xl border border-border ${grad} p-4 h-64 flex flex-col shadow-soft hover:shadow-paper`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] uppercase tracking-[0.14em] text-foreground/60 bg-card/70 backdrop-blur px-2 py-1 rounded-full border border-border/60">
                        Reflect
                      </span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLeaving) handleComplete(item.id, e);
                        }}
                        role="button"
                        aria-label="Mark complete"
                        className="h-6 w-6 rounded-full flex items-center justify-center border bg-card/70 border-border transition hover:bg-sage hover:border-sage"
                      />
                    </div>
                    <div className="flex-1 flex items-center justify-center my-1">
                      {ITEM_IMAGES[item.id] && (
                        <img
                          src={ITEM_IMAGES[item.id]}
                          alt=""
                          className="max-h-28 w-auto object-contain"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-serif text-base leading-tight text-foreground">{item.title}</h4>
                    </div>
                  </motion.button>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4" />
          <CarouselNext className="hidden md:flex -right-4" />
        </Carousel>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-md">
          {active && (
            <>
              {ITEM_IMAGES[active.id] && (
                <div className="flex justify-center -mt-2">
                  <img src={ITEM_IMAGES[active.id]} alt="" className="h-32 w-auto object-contain" />
                </div>
              )}
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">{active.title}</DialogTitle>
                <DialogDescription>{active.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="text-foreground/80 leading-relaxed">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground/80">Why it matters · </span>
                  {active.why}
                </p>
                <p className="text-sage leading-relaxed italic">{active.reassurance}</p>
              </div>
              <Button
                variant={checkedItems[active.id] ? "secondary" : "default"}
                onClick={() => {
                  onToggle(active.id);
                  setActive(null);
                }}
                className="w-full"
              >
                {checkedItems[active.id] ? "Mark as not done" : "Mark as done"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------- Medical tiles (modal_2) -------------------- */

function MedicalTiles({
  items,
  checkedItems,
  onToggle,
}: {
  items: ChecklistItem[];
  checkedItems: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const [active, setActive] = useState<ChecklistItem | null>(null);
  const [leaving, setLeaving] = useState<Record<string, boolean>>({});
  const tints = [
    { wrap: "bg-card", icon: "bg-sage-soft/50 text-sage" },
    { wrap: "bg-card", icon: "bg-accent text-accent-active" },
    { wrap: "bg-card", icon: "bg-gradient-warm text-foreground/70" },
    { wrap: "bg-card", icon: "bg-sage-soft/40 text-sage" },
  ];

  const handleComplete = (id: string, e?: React.MouseEvent) => {
    const item = items.find((i) => i.id === id);
    const origin = originFromEvent(e);
    if (origin) flyHeart(origin);
    setLeaving((p) => ({ ...p, [id]: true }));
    setTimeout(() => {
      onToggle(id);
      setLeaving((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      if (item) notifyCompleted(item.title, () => onToggle(id));
    }, 550);
  };

  const visibleItems = items.filter((i) => !checkedItems[i.id]);

  return (
    <>
      {visibleItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-sage/30 bg-sage-soft/40 p-6 text-center"
        >
          <p className="font-serif text-lg text-foreground">All clear here.</p>
          <p className="text-sm text-muted-foreground mt-1">You've gathered what you need for now.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {visibleItems.map((item, i) => {
            const t = tints[i % tints.length];
            const isLeaving = !!leaving[item.id];
            return (
              <motion.button
                key={item.id}
                onClick={() => setActive(item)}
                initial={{ opacity: 1, scale: 1 }}
                animate={
                  isLeaving
                    ? { opacity: 0, scale: 0.9, filter: "blur(3px)" }
                    : { opacity: 1, scale: 1, filter: "blur(0px)" }
                }
                transition={{ duration: 0.5, ease: "easeOut" }}
                className={`relative aspect-square rounded-3xl border ${t.wrap} border-border shadow-soft p-4 flex flex-col items-center justify-center text-center gap-3 hover:shadow-paper`}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isLeaving) handleComplete(item.id, e);
                  }}
                  role="button"
                  aria-label="Mark complete"
                  className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full border border-border bg-card/80 hover:bg-sage hover:border-sage transition"
                />
                {ITEM_IMAGES[item.id] ? (
                  <img src={ITEM_IMAGES[item.id]} alt="" className="h-20 w-20 object-contain" />
                ) : (
                  <span className={`h-14 w-14 rounded-2xl flex items-center justify-center ${t.icon}`}>
                    <Stethoscope className="h-7 w-7" strokeWidth={1.4} />
                  </span>
                )}
                <span className="text-sm font-medium leading-snug text-foreground/85 line-clamp-2">
                  {item.title}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-md">
          {active && (
            <>
              {ITEM_IMAGES[active.id] && (
                <div className="flex justify-center -mt-2">
                  <img src={ITEM_IMAGES[active.id]} alt="" className="h-32 w-auto object-contain" />
                </div>
              )}
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">{active.title}</DialogTitle>
                <DialogDescription>{active.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <p className="text-foreground/80 leading-relaxed">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground/80">Why it matters · </span>
                  {active.why}
                </p>
                <p className="text-sage leading-relaxed italic">{active.reassurance}</p>
              </div>
              <Button
                variant={checkedItems[active.id] ? "secondary" : "default"}
                onClick={() => {
                  onToggle(active.id);
                  setActive(null);
                }}
                className="w-full"
              >
                {checkedItems[active.id] ? "Mark as not done" : "Mark as done"}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* -------------------- Default accordion (modal_4) -------------------- */

function ChecklistAccordion({
  items,
  checkedItems,
  openItems,
  onToggleOpen,
  onToggleCheck,
}: {
  items: ChecklistItem[];
  checkedItems: Record<string, boolean>;
  openItems: Record<string, boolean>;
  onToggleOpen: (id: string) => void;
  onToggleCheck: (id: string) => void;
}) {
  const [leaving, setLeaving] = useState<Record<string, boolean>>({});

  const handleComplete = (id: string, e?: React.MouseEvent) => {
    const item = items.find((i) => i.id === id);
    const origin = originFromEvent(e);
    if (origin) flyHeart(origin);
    setLeaving((p) => ({ ...p, [id]: true }));
    setTimeout(() => {
      onToggleCheck(id);
      setLeaving((p) => {
        const n = { ...p };
        delete n[id];
        return n;
      });
      if (item) notifyCompleted(item.title, () => onToggleCheck(id));
    }, 550);
  };

  const visibleItems = items.filter((i) => !checkedItems[i.id]);

  if (visibleItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-sage/30 bg-sage-soft/40 p-5 text-center"
      >
        <p className="font-serif text-base text-foreground">All done here.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-1.5">
      {visibleItems.map((item) => {
        const open = !!openItems[item.id];
        const isLeaving = !!leaving[item.id];
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 1, scale: 1, height: "auto" }}
            animate={
              isLeaving
                ? { opacity: 0, scale: 0.96, filter: "blur(2px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border bg-card border-border overflow-hidden"
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <button
                onClick={(e) => {
                  if (!isLeaving) handleComplete(item.id, e);
                }}
                className="mt-0.5 h-5 w-5 rounded-full flex items-center justify-center border border-border hover:border-sage hover:bg-sage/20 flex-shrink-0 transition"
                aria-label="Mark complete"
              />
              <button onClick={() => onToggleOpen(item.id)} className="flex-1 text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-sm font-medium leading-snug block">
                      {item.title}
                    </span>
                    <span className="text-xs text-muted-foreground mt-0.5 block leading-relaxed">
                      {item.description}
                    </span>
                  </div>
                  <ChevronDown className={`h-4 w-4 mt-0.5 text-muted-foreground transition flex-shrink-0 ${open ? "rotate-180" : ""}`} />
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
                    <p className="text-foreground/80 leading-relaxed">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground/80">Why it matters · </span>
                      {item.why}
                    </p>
                    <p className="text-sage leading-relaxed italic">{item.reassurance}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

/* -------------------- Singapore resources carousel (modal_3) -------------------- */

const RESOURCE_ICONS: LucideIcon[] = [Heart, BookOpen, Home, Wallet, FileText, Scale, Sparkles, Stethoscope];
const RESOURCE_GRADIENTS = [
  "bg-gradient-sage",
  "bg-gradient-warm",
  "bg-gradient-dawn",
  "bg-gradient-sage",
];

function ResourcesCarousel() {
  return (
    <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
      <CarouselContent className="-ml-3">
        {SG_RESOURCES.map((r, i) => {
          const Icon = RESOURCE_ICONS[i % RESOURCE_ICONS.length];
          const grad = RESOURCE_GRADIENTS[i % RESOURCE_GRADIENTS.length];
          return (
            <CarouselItem key={r.name} className="pl-3 basis-[60%] sm:basis-[40%] md:basis-[28%]">
              <a href={r.url} target="_blank" rel="noreferrer" className="block group">
                <div
                  className={`relative aspect-[4/3] rounded-3xl border border-border ${r.logo ? "bg-card" : grad} shadow-soft overflow-hidden flex items-center justify-center p-5 transition group-hover:shadow-paper`}
                >
                  {r.logo ? (
                    <img
                      src={r.logo}
                      alt={`${r.name} logo`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <Icon className="h-16 w-16 text-foreground/40" strokeWidth={1.2} />
                  )}
                  <span className="absolute top-3 right-3 h-7 w-7 rounded-full bg-card/80 backdrop-blur border border-border/60 flex items-center justify-center">
                    <ExternalLink className="h-3.5 w-3.5 text-foreground/60" strokeWidth={1.6} />
                  </span>
                </div>
                <p className="font-medium text-sm mt-2.5 leading-snug text-foreground">{r.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{r.desc}</p>
              </a>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-4" />
      <CarouselNext className="hidden md:flex -right-4" />
    </Carousel>
  );
}

/* -------------------- Heart completion meter -------------------- */

function HeartMeter({ ratio, checked, total, onClick }: { ratio: number; checked: number; total: number; onClick?: () => void }) {
  const r = Math.max(0, Math.min(1, ratio));
  const fillHeight = 24 * r;
  const fillY = 28 - fillHeight;

  // Shrink from 4x (h-40) to 1x (h-10) over the first 240px of scroll.
  const { scrollY } = useScroll();
  const size = useTransform(scrollY, [0, 240], [160, 40], { clamp: true });
  const labelSize = useTransform(scrollY, [0, 240], [16, 10], { clamp: true });

  // Squarer heart path: flatter top lobes, broader shoulders, gentler bottom point.
  const heartPath =
    "M16 26 C 3 19, 3 9, 9 6 C 13 4.5, 15.5 6.5, 16 8.5 C 16.5 6.5, 19 4.5, 23 6 C 29 9, 29 19, 16 26 Z";

  const svgRef = useRef<SVGSVGElement | null>(null);
  useEffect(() => {
    const update = () => {
      const el = svgRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      setHeartTarget({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const interval = window.setInterval(update, 250);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.clearInterval(interval);
      setHeartTarget(null);
    };
  }, []);

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center flex-shrink-0 pt-1 sticky top-2 z-20 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sage rounded-2xl"
      aria-label={`View progress: ${checked} of ${total} tasks complete`}
    >
      <motion.svg ref={svgRef} viewBox="0 0 32 32" style={{ width: size, height: size }} aria-hidden>
        <defs>
          <clipPath id="heart-clip">
            <path d={heartPath} />
          </clipPath>
          <linearGradient id="heart-fill" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="var(--sage)" />
            <stop offset="100%" stopColor="var(--sage)" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path
          d={heartPath}
          fill="var(--sage)"
          fillOpacity="0.12"
          stroke="var(--sage)"
          strokeWidth="1.2"
        />
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
      </motion.svg>
      <motion.span
        className="tabular-nums text-muted-foreground mt-1"
        style={{ fontSize: labelSize }}
      >
        {checked}/{total}
      </motion.span>
    </motion.button>
  );
}

/* -------------------- Progress dialog -------------------- */

type ProgressItem = { id: string; title: string; phase: string; category: string };

function ProgressDialog({
  open,
  onOpenChange,
  completed,
  pending,
  onUncheck,
  onCheck,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  completed: ProgressItem[];
  pending: ProgressItem[];
  onUncheck: (id: string) => void;
  onCheck: (id: string) => void;
}) {
  const total = completed.length + pending.length;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Your progress</DialogTitle>
          <DialogDescription>
            {completed.length} of {total} gentle steps complete.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <section>
            <h4 className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-sage" strokeWidth={2} />
              Completed · {completed.length}
            </h4>
            {completed.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Nothing checked off yet — that's okay.</p>
            ) : (
              <ul className="space-y-1.5">
                {completed.map((it) => (
                  <li key={it.id} className="flex items-start gap-2 rounded-xl border border-border bg-sage-soft/30 px-3 py-2">
                    <button
                      onClick={() => onUncheck(it.id)}
                      aria-label="Mark as not done"
                      className="h-5 w-5 mt-0.5 rounded-full bg-sage border border-sage flex items-center justify-center flex-shrink-0 hover:opacity-80"
                    >
                      <Check className="h-3 w-3 text-card" strokeWidth={3} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-foreground/80 line-through">{it.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{it.phase} · {it.category}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h4 className="text-xs uppercase tracking-[0.14em] text-muted-foreground mb-2 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-foreground/60" strokeWidth={1.6} />
              Still pending · {pending.length}
            </h4>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">All done. Take a breath.</p>
            ) : (
              <ul className="space-y-1.5">
                {pending.map((it) => (
                  <li key={it.id} className="flex items-start gap-2 rounded-xl border border-border bg-card px-3 py-2">
                    <button
                      onClick={() => onCheck(it.id)}
                      aria-label="Mark as done"
                      className="h-5 w-5 mt-0.5 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0 hover:bg-sage hover:border-sage"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug text-foreground">{it.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{it.phase} · {it.category}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
