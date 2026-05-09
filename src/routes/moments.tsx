import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Sparkles, Check, Play, Pause, Mic } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, type BucketItem, type Moment } from "@/lib/store";
import { BUCKET_TEMPLATES } from "@/lib/content";
import { MomentComposer } from "@/components/MomentComposer";

export const Route = createFileRoute("/moments")({
  head: () => ({
    meta: [
      { title: "Moments — Alongside" },
      { name: "description", content: "A quiet space to plan and remember meaningful moments." },
    ],
  }),
  component: Moments,
});

function Moments() {
  const { state, update, hydrated } = useAppState();
  const [tab, setTab] = useState<"journal" | "bucket">("journal");
  const [composerOpen, setComposerOpen] = useState(false);
  const [newBucket, setNewBucket] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);

  // Group moments by relative date for the timeline (must be before any early return)
  const timeline = useMemo(() => groupByRelativeDate(state.moments), [state.moments]);

  if (!hydrated) return null;

  const loveeName = state.onboarding.loveeName?.trim() || "your loved one";

  const seedBucket = () => {
    const seeded: BucketItem[] = BUCKET_TEMPLATES.slice(0, 8).map((t, i) => ({
      id: `seed-${i}-${Date.now()}`,
      title: t.title,
      category: t.category,
      done: false,
    }));
    update((s) => ({ ...s, bucketList: [...s.bucketList, ...seeded] }));
  };

  const addBucket = () => {
    if (!newBucket.trim()) return;
    update((s) => ({
      ...s,
      bucketList: [...s.bucketList, { id: String(Date.now()), title: newBucket.trim(), category: "Personal", done: false }],
    }));
    setNewBucket("");
  };

  const toggleBucket = (id: string) =>
    update((s) => ({
      ...s,
      bucketList: s.bucketList.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
    }));

  const saveMoment = (m: Omit<Moment, "id" | "date">) => {
    const moment: Moment = {
      id: String(Date.now()),
      date: new Date().toISOString().slice(0, 10),
      ...m,
    };
    update((s) => ({ ...s, moments: [moment, ...s.moments] }));
    setConfirmation("A memory added to your collection.");
    setTimeout(() => setConfirmation(null), 2800);
  };

  const grouped = state.bucketList.reduce<Record<string, BucketItem[]>>((acc, b) => {
    (acc[b.category] ??= []).push(b);
    return acc;
  }, {});


  return (
    <AppShell>
      <div className="space-y-6 pb-24 relative">
        {/* HERO SCRAPBOOK */}
        <section className="relative -mt-2 isolate">
          <ScrapbookHero loveeName={loveeName} />
        </section>

        {/* Toggle */}
        <div className="relative z-10 grid grid-cols-2 gap-1 p-1.5 bg-card border border-border rounded-full shadow-soft max-w-sm mx-auto">
          {[
            { id: "journal", label: "Memory journal" },
            { id: "bucket", label: "Bucket list" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "journal" | "bucket")}
              className={`relative py-2.5 rounded-full text-sm transition ${
                tab === t.id ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab === t.id && (
                <motion.span
                  layoutId="moments-pill"
                  className="absolute inset-0 rounded-full bg-gradient-sage shadow-soft"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative font-serif italic text-base">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === "journal" && (
          <div className="space-y-12">
            {timeline.length === 0 ? (
              <div className="text-center max-w-md mx-auto">
                <p className="font-serif italic text-2xl text-foreground/70 leading-snug">
                  Your scrapbook starts with one quiet moment.
                </p>
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                  Tap the <span className="font-medium text-foreground/80">+</span> below to keep your first memory with {loveeName}.
                </p>
              </div>
            ) : (
              timeline.map((group) => (
                <TimelineGroup key={group.label} group={group} />
              ))
            )}
          </div>
        )}

        {tab === "bucket" && (
          <div className="space-y-5 max-w-2xl mx-auto">
            <div className="rounded-2xl bg-card border border-border p-4 space-y-2 shadow-soft">
              <div className="flex gap-2">
                <Input
                  value={newBucket}
                  onChange={(e) => setNewBucket(e.target.value)}
                  placeholder={`Something to share with ${loveeName}…`}
                  className="rounded-xl bg-background h-11"
                  onKeyDown={(e) => e.key === "Enter" && addBucket()}
                />
                <Button onClick={addBucket} className="rounded-xl bg-foreground text-background hover:bg-foreground/90 h-11">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {state.bucketList.length === 0 && (
                <Button onClick={seedBucket} variant="ghost" className="w-full text-sage hover:text-sage rounded-xl">
                  <Sparkles className="h-4 w-4 mr-2" /> Suggest a few gentle ideas
                </Button>
              )}
            </div>

            {Object.keys(grouped).length === 0 && (
              <div className="text-center py-10 px-6">
                <Heart className="h-8 w-8 mx-auto text-muted-foreground/50" strokeWidth={1.4} />
                <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed">
                  Even the simplest things — a favourite meal, a familiar song — become precious.
                </p>
              </div>
            )}

            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">{cat}</h3>
                <div className="space-y-2">
                  {items.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => toggleBucket(b.id)}
                      className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl border transition ${
                        b.done ? "bg-clay-soft/40 border-clay/30" : "bg-card border-border hover:border-clay/40"
                      }`}
                    >
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center border flex-shrink-0 ${
                        b.done ? "bg-clay border-clay" : "border-border"
                      }`}>
                        {b.done && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                      </span>
                      <span className={`text-sm flex-1 ${b.done ? "text-muted-foreground line-through decoration-muted-foreground/30" : ""}`}>
                        {b.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Add Moment Button */}
      <AnimatePresence>
        {!composerOpen && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            onPointerUp={(event) => {
              event.preventDefault();
              setComposerOpen(true);
            }}
            onClick={() => setComposerOpen(true)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="fixed bottom-24 md:bottom-10 right-6 z-[60] h-16 px-6 rounded-full bg-foreground text-background shadow-paper flex items-center gap-2 font-serif italic text-base pointer-events-auto"
            aria-label="Add a moment"
          >
            <Plus className="h-5 w-5" strokeWidth={2} />
            <span className="hidden sm:inline">Add a moment</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Confirmation toast */}
      <AnimatePresence>
        {confirmation && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-44 md:bottom-28 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full bg-card border border-sage/40 shadow-paper flex items-center gap-2"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            <span className="font-serif italic text-foreground/80">{confirmation}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <MomentComposer open={composerOpen} onOpenChange={setComposerOpen} onSave={saveMoment} />
    </AppShell>
  );
}

/* -------------------- Hero scrapbook -------------------- */

function ScrapbookHero({ loveeName }: { loveeName: string }) {
  // Decorative inline SVG "photos" — warm watercolor washes so the page never feels empty.
  const cards = [
    { tilt: "-rotate-6", offset: "-translate-x-2 translate-y-1", art: <PorchArt />, caption: "tea on the porch" },
    { tilt: "rotate-3", offset: "translate-x-3 -translate-y-2", art: <HandsArt />, caption: "her hands" },
    { tilt: "-rotate-2", offset: "translate-x-1 translate-y-3", art: <GardenArt />, caption: "spring garden" },
  ];
  return (
    <div className="relative">
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4" strokeWidth={1.6} />
          <span className="text-xs uppercase tracking-[0.18em]">Scrapbook</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-serif italic font-light mt-3 text-balance leading-[1.05]">
          Small things,<br />deeply remembered
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed">
          A quiet space to hold meaningful moments with {loveeName} — kept gently, like pages in a family album.
        </p>
      </div>

      <div className="relative h-[260px] md:h-[280px] mt-2 mb-6 mx-auto max-w-3xl overflow-visible">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, rotate: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.7, ease: "easeOut" }}
            className={`absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 ${c.tilt} ${c.offset}`}
            style={{ marginLeft: `${(i - 1) * 110}px` }}
            whileHover={{ rotate: 0, y: -6, transition: { duration: 0.4 } }}
          >
            <div className="bg-card border border-border p-2.5 pb-5 shadow-paper paper-grain rounded-md w-[160px] md:w-[180px]">
              <div className="aspect-[4/5] rounded-sm overflow-hidden">{c.art}</div>
              <p className="font-hand text-lg text-foreground/70 mt-1.5 text-center leading-tight">
                {c.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function PorchArt() {
  return (
    <svg viewBox="0 0 200 250" className="w-full h-full">
      <defs>
        <linearGradient id="porch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E7EFE7" />
          <stop offset="100%" stopColor="#D8B6A4" />
        </linearGradient>
      </defs>
      <rect width="200" height="250" fill="url(#porch)" />
      <circle cx="150" cy="60" r="34" fill="#F6EFE7" opacity="0.9" />
      <ellipse cx="100" cy="200" rx="80" ry="22" fill="#8FA88A" opacity="0.5" />
      <path d="M70 180 Q100 150 130 180 L130 200 L70 200 Z" fill="#5E4636" opacity="0.7" />
      <path d="M85 175 L85 155 M115 175 L115 155" stroke="#5E4636" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}
function HandsArt() {
  return (
    <svg viewBox="0 0 200 250" className="w-full h-full">
      <defs>
        <linearGradient id="hands" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F6EFE7" />
          <stop offset="100%" stopColor="#D8B6A4" />
        </linearGradient>
      </defs>
      <rect width="200" height="250" fill="url(#hands)" />
      <ellipse cx="80" cy="140" rx="50" ry="32" fill="#C9886F" opacity="0.55" />
      <ellipse cx="125" cy="155" rx="45" ry="28" fill="#5E4636" opacity="0.35" />
      <circle cx="100" cy="120" r="10" fill="#FAF8F5" opacity="0.9" />
    </svg>
  );
}
function GardenArt() {
  return (
    <svg viewBox="0 0 200 250" className="w-full h-full">
      <defs>
        <linearGradient id="garden" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C7D8C4" />
          <stop offset="100%" stopColor="#E7EFE7" />
        </linearGradient>
      </defs>
      <rect width="200" height="250" fill="url(#garden)" />
      <circle cx="60" cy="90" r="22" fill="#D8B6A4" opacity="0.85" />
      <circle cx="140" cy="80" r="18" fill="#C9886F" opacity="0.6" />
      <circle cx="105" cy="130" r="26" fill="#FAF8F5" opacity="0.8" />
      <path d="M0 200 Q100 160 200 200 L200 250 L0 250 Z" fill="#8FA88A" opacity="0.5" />
    </svg>
  );
}

/* -------------------- Timeline -------------------- */

type Group = { label: string; items: Moment[] };

function groupByRelativeDate(moments: Moment[]): Group[] {
  const today = new Date();
  const ymd = (d: Date) => d.toISOString().slice(0, 10);
  const todayKey = ymd(today);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  const yKey = ymd(yesterday);

  const map = new Map<string, Moment[]>();
  for (const m of moments) {
    let label: string;
    if (m.date === todayKey) label = "Today";
    else if (m.date === yKey) label = "Yesterday";
    else label = new Date(m.date).toLocaleDateString("en-SG", { month: "long", day: "numeric" });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(m);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function TimelineGroup({ group }: { group: Group }) {
  const hasStack = group.items.length > 1;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="relative"
    >
      <div className="flex items-baseline gap-3 mb-5 px-1">
        <span className="h-px flex-1 bg-border" />
        <h2 className="font-serif italic text-2xl text-foreground/80">{group.label}</h2>
        <span className="h-px flex-1 bg-border" />
      </div>

      {!hasStack ? (
        <div className="space-y-6">
          {group.items.map((m, i) => (
            <MomentCard key={m.id} moment={m} index={i} />
          ))}
        </div>
      ) : (
        <div className="relative mx-auto w-full">
          {expanded && (
            <div className="flex justify-end mb-3">
              <button
                onClick={() => setExpanded(false)}
                className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
              >
                Restack
              </button>
            </div>
          )}
          {!expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="block w-full max-w-2xl mx-auto cursor-pointer"
              aria-label={`Open ${group.items.length} moments`}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                {group.items.slice(0, 4).map((m, i) => (
                  <MomentCard
                    key={m.id}
                    moment={m}
                    index={i}
                    stacked={false}
                    expanded={false}
                  />
                ))}
              </div>
            </button>
          ) : (
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="flex gap-6 overflow-x-auto pb-6 pt-2 px-2 snap-x snap-mandatory"
            >
              {group.items.map((m, i) => (
                <MomentCard
                  key={m.id}
                  moment={m}
                  index={i}
                  stacked={false}
                  expanded
                />
              ))}
            </motion.div>
          )}
          {!expanded && (
            <p className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground mt-4">
              {group.items.length} moments · tap to spread
            </p>
          )}
        </div>
      )}
    </motion.section>
  );
}

function MomentCard({
  moment,
  index,
  stacked,
  expanded,
}: {
  moment: Moment;
  index: number;
  stacked?: boolean;
  expanded?: boolean;
}) {
  const tilts = ["polaroid-left", "polaroid-right", "polaroid-tiny"];
  const tilt = stacked ? "" : tilts[index % tilts.length];
  const stackRotations = [-6, 4, -3, 7, -4];
  const i = Math.min(index, 4);
  const stackRotate = stackRotations[index % stackRotations.length];

  const stackedStyle = stacked
    ? {
        left: "50%",
        top: 0,
        width: 320,
        marginLeft: -160,
        zIndex: 20 - index,
      }
    : undefined;

  const initial = stacked
    ? { opacity: 0, x: -160 + i * 14, y: -10 + i * 18, rotate: stackRotate }
    : { opacity: 0, y: 16 };
  const animate = stacked
    ? { opacity: 1, x: -160 + i * 14, y: i * 18, rotate: stackRotate }
    : { opacity: 1, y: 0 };

  return (
    <motion.article
      initial={initial}
      animate={animate}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.06 }}
      whileHover={stacked ? undefined : { rotate: 0, y: -3, transition: { duration: 0.4 } }}
      style={stackedStyle}
      className={`${tilt} ${
        stacked
          ? "absolute origin-center"
          : expanded
          ? "w-[300px] sm:w-[340px] flex-shrink-0 snap-center"
          : "mx-auto max-w-[92%] sm:max-w-[520px]"
      } bg-card border border-border p-5 pb-7 shadow-paper paper-grain rounded-md`}
    >
      {moment.photo && (
        <div className="mb-4 rounded-sm overflow-hidden aspect-[4/3] bg-muted">
          <img src={moment.photo} alt={moment.title} className="w-full h-full object-cover" />
        </div>
      )}
      {moment.video && (
        <div className="mb-4 rounded-sm overflow-hidden aspect-[4/3] bg-black">
          <video src={moment.video} controls className="w-full h-full object-cover" />
        </div>
      )}
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {new Date(moment.date).toLocaleDateString("en-SG", { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <h3 className="font-serif text-2xl italic mt-1 leading-snug text-foreground/90">{moment.title}</h3>
      {moment.note && (
        <p className="font-hand text-xl text-foreground/80 mt-3 leading-snug whitespace-pre-line">
          {moment.note}
        </p>
      )}
      {moment.audio && <VoiceNote src={moment.audio} duration={moment.audioDuration ?? 0} />}
    </motion.article>
  );
}

/* -------------------- Voice note capsule -------------------- */

function VoiceNote({ src, duration }: { src: string; duration: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { void a.play(); }
  };

  return (
    <div className="mt-4 flex items-center gap-2 p-2 pl-2 pr-3 rounded-full bg-sage-soft/50 border border-sage/30 min-w-0 max-w-full overflow-hidden">
      <button
        onClick={toggle}
        className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center shrink-0 shadow-soft"
        aria-label={playing ? "Pause voice note" : "Play voice note"}
      >
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Play className="h-4 w-4 fill-current ml-0.5" />}
      </button>
      <Mic className="h-3.5 w-3.5 text-foreground/40 shrink-0" strokeWidth={1.6} />
      <div className="flex-1 min-w-0 flex items-center gap-[2px] h-6 overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => {
          const active = (i / 20) <= progress;
          return (
            <span
              key={i}
              className={`flex-1 min-w-[2px] rounded-full transition-colors ${active ? "bg-foreground/70" : "bg-foreground/25"}`}
              style={{ height: `${28 + Math.sin(i * 0.6) * 22 + (i % 4) * 5}%` }}
            />
          );
        })}
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground shrink-0">
        0:{String(duration).padStart(2, "0")}
      </span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (a.duration) setProgress(a.currentTime / a.duration);
        }}
      />
    </div>
  );
}
