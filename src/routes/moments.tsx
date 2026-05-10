import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Plus, Sparkles, Check, Play, Pause, Mic, Film, ArrowLeft, Share2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, type BucketItem, type Moment } from "@/lib/store";
import { BUCKET_TEMPLATES } from "@/lib/content";
import { MomentComposer } from "@/components/MomentComposer";
import { supabase } from "@/integrations/supabase/client";
import momentsTea from "@/assets/moments-tea.jpg";
import momentsHands from "@/assets/moments-hands.jpg";
import momentsGarden from "@/assets/moments-garden.jpg";
import { DEMO_MOMENTS } from "@/lib/demo-moments";

export const Route = createFileRoute("/moments")({
  head: () => ({
    meta: [
      { title: "Moments - Alongside" },
      { name: "description", content: "A quiet space to plan and remember meaningful moments." },
    ],
  }),
  component: Moments,
});

function Moments() {
  const { state, update, hydrated } = useAppState();
  const { user } = useAuth();
  const [journalView, setJournalView] = useState<"collage" | "timeline">("collage");
  const [composerOpen, setComposerOpen] = useState(false);
  const [newBucket, setNewBucket] = useState("");
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [sharing, setSharing] = useState(false);

  const shareTimeline = async () => {
    if (!user || sharing) return;
    setSharing(true);
    try {
      const { data: existing } = await supabase
        .from("profiles").select("share_token").eq("id", user.id).maybeSingle();
      let token = existing?.share_token as string | null;
      if (!token) {
        token = crypto.randomUUID();
        await supabase.from("profiles").update({ share_token: token }).eq("id", user.id);
      }
      const url = `${window.location.origin}/scrapbook/${token}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: "A shared scrapbook", url });
        } catch { /* user cancelled */ }
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Public link copied", { description: url });
      }
    } finally {
      setSharing(false);
    }
  };

  // Group moments by relative date for the timeline (must be before any early return)
  const isDemo = state.moments.length === 0;
  const timelineSource = isDemo ? DEMO_MOMENTS : state.moments;
  const timeline = useMemo(() => groupByRelativeDate(timelineSource), [timelineSource]);
  const photoMoments = useMemo(
    () => state.moments.filter((m) => !!m.photo || !!m.video).slice(0, 5),
    [state.moments],
  );

  if (!hydrated) return null;

  const loveeName = state.onboarding.loveeName?.trim() || "your loved one";

  const suggestIdeas = async () => {
    if (suggesting) return;
    setSuggesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("suggest-bucket-ideas", {
        body: {
          loveeName,
          existing: state.bucketList.map((b) => b.title),
        },
      });
      const ideas: { title: string; category: string }[] = data?.ideas ?? [];
      if (error || ideas.length === 0) {
        // Fallback to seed templates so the user always gets something
        const seeded: BucketItem[] = BUCKET_TEMPLATES.slice(0, 6).map((t) => ({
          id: crypto.randomUUID(),
          title: t.title,
          category: t.category,
          done: false,
        }));
        update((s) => ({ ...s, bucketList: [...s.bucketList, ...seeded] }));
        setConfirmation("Added a few gentle ideas.");
      } else {
        const seeded: BucketItem[] = ideas.map((i) => ({
          id: crypto.randomUUID(),
          title: i.title,
          category: i.category || "Personal",
          done: false,
        }));
        update((s) => ({ ...s, bucketList: [...s.bucketList, ...seeded] }));
        setConfirmation(`${seeded.length} new ideas added.`);
      }
      setTimeout(() => setConfirmation(null), 2800);
    } finally {
      setSuggesting(false);
    }
  };

  const addBucket = () => {
    if (!newBucket.trim()) return;
    update((s) => ({
      ...s,
      bucketList: [...s.bucketList, { id: crypto.randomUUID(), title: newBucket.trim(), category: "Personal", done: false }],
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
      id: crypto.randomUUID(),
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
      <div className="space-y-10 pb-24 relative">
        {journalView === "collage" && (
          <MemoryCollage
            loveeName={loveeName}
            photoMoments={photoMoments}
            totalCount={state.moments.length}
            onOpen={() => setJournalView("timeline")}
            onAdd={() => setComposerOpen(true)}
          />
        )}

        {journalView === "timeline" && (
          <div className="space-y-10">
            <div className="flex items-center justify-between max-w-3xl mx-auto px-1">
              <button
                onClick={() => setJournalView("collage")}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
                Back to collage
              </button>
              <div className="flex items-center gap-1">
                <Button
                  onClick={shareTimeline}
                  disabled={sharing}
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-foreground/80 hover:text-foreground"
                >
                  <Share2 className="h-4 w-4 mr-1.5" />
                  {sharing ? "Preparing…" : "Share link"}
                </Button>
                <Button
                  onClick={() => setComposerOpen(true)}
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-foreground/80 hover:text-foreground"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add a moment
                </Button>
              </div>
            </div>

            {isDemo && (
              <div className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  Demo scrapbook
                </p>
                <p className="text-sm text-foreground/75 mt-1 leading-relaxed">
                  A few sample memories so you can see the clothesline. They'll
                  step aside as soon as you add your first real moment.
                </p>
              </div>
            )}

            {timeline.map((group) => (
              <TimelineGroup key={group.label} group={group} isDemo={isDemo} />
            ))}
          </div>
        )}

        {/* Bucket list section, always below the clothesline */}
        <div className="space-y-5 max-w-2xl mx-auto pt-4">
          <div className="text-center">
            <h2 className="font-serif italic text-3xl text-foreground/85">Bucket list</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Small wishes and gentle plans to share with {loveeName}.
            </p>
          </div>

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
            <Button
              onClick={suggestIdeas}
              disabled={suggesting}
              variant="ghost"
              className="w-full text-sage hover:text-sage rounded-xl"
            >
              <Sparkles className={`h-4 w-4 mr-2 ${suggesting ? "animate-pulse" : ""}`} />
              {suggesting ? "Thinking of gentle ideas…" : "Suggest a few gentle ideas with AI"}
            </Button>
          </div>

          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-10 px-6">
              <Heart className="h-8 w-8 mx-auto text-muted-foreground/50" strokeWidth={1.4} />
              <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed">
                Even the simplest things - a favourite meal, a familiar song - become precious.
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
      </div>

      {/* Floating Add Moment Button removed - use the "+" card in the scrapbook hero */}

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

/* -------------------- Memory collage (default view) -------------------- */

function MemoryCollage({
  loveeName,
  photoMoments,
  totalCount,
  onOpen,
  onAdd,
}: {
  loveeName: string;
  photoMoments: Moment[];
  totalCount: number;
  onOpen: () => void;
  onAdd: () => void;
}) {
  const seedCards = [
    { id: "seed-tea", src: momentsTea, kind: "photo" as const, caption: "tea on the porch" },
    { id: "seed-hands", src: momentsHands, kind: "photo" as const, caption: "her hands" },
    { id: "seed-garden", src: momentsGarden, kind: "photo" as const, caption: "spring garden" },
  ];

  const userCards = photoMoments.slice(0, 3).map((m, i) => ({
    id: m.id,
    src: (m.photo || m.video)!,
    kind: (m.photo ? "photo" : "video") as "photo" | "video",
    caption: m.title?.toLowerCase() || seedCards[i]?.caption || "",
  }));

  const hasUserMoments = totalCount > 0;
  const cards = (hasUserMoments ? userCards : seedCards).slice(0, 3);

  // Slight alternating tilt for a hand-pinned clothesline feel.
  const tilts = [-3, 2, -2];

  const tagline =
    totalCount === 0
      ? "Your scrapbook starts with one quiet moment."
      : totalCount === 1
        ? "One quiet moment, kept."
        : "A lot happened recently.";

  return (
    <section className="relative pt-2">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4" strokeWidth={1.6} />
          <span className="text-xs uppercase tracking-[0.18em]">Scrapbook</span>
        </div>
        <h1 className="font-serif italic text-4xl md:text-5xl text-foreground/90 leading-[1.1] mt-4">
          Small things,<br />deeply remembered
        </h1>
        <p className="text-muted-foreground mt-4 leading-relaxed text-sm md:text-base max-w-md mx-auto">
          A quiet space to hold meaningful moments with {loveeName} - kept gently, like pages in a family album.
        </p>
      </div>

      <button
        type="button"
        onClick={onOpen}
        aria-label="Open memory timeline"
        className="group relative mt-8 mx-auto block w-full max-w-2xl"
      >
        <div className="relative pt-6 pb-2">
          {/* Clothesline string */}
          <div className="absolute left-4 right-4 top-10 border-t border-foreground/20" aria-hidden />

          <div className="relative flex items-start justify-center gap-3 md:gap-6 px-2">
            {cards.map((c, i) => {
              const tilt = tilts[i % tilts.length];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: -40, rotate: 0 }}
                  animate={{ opacity: 1, y: 0, rotate: tilt }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 80, damping: 14 }}
                  whileHover={{ y: -6, rotate: tilt * 0.4, transition: { duration: 0.3 } }}
                  className="relative"
                  style={{ transformOrigin: "top center" }}
                >
                  {/* Peg */}
                  <span
                    className="absolute left-1/2 -translate-x-1/2 -top-3 h-5 w-3 rounded-sm bg-clay/80 shadow-sm z-10"
                    aria-hidden
                  />
                  <div className="bg-card border border-border p-2 pb-6 shadow-paper paper-grain rounded-md w-[150px] md:w-[180px] mt-2">
                    <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-muted">
                      {c.kind === "video" ? (
                        <video
                          src={c.src}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img src={c.src} alt="" loading="lazy" className="w-full h-full object-cover" />
                      )}
                      {c.kind === "video" && (
                        <span className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-foreground/70 backdrop-blur-sm flex items-center justify-center">
                          <Film className="h-3 w-3 text-background" strokeWidth={2} />
                        </span>
                      )}
                    </div>
                    {c.caption && (
                      <p className="font-serif italic text-center text-foreground/70 text-sm mt-2 truncate">
                        {c.caption}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Empty polaroid - quick add */}
            <motion.div
              initial={{ opacity: 0, y: -40, rotate: 0 }}
              animate={{ opacity: 1, y: 0, rotate: 4 }}
              transition={{ delay: cards.length * 0.12, type: "spring", stiffness: 80, damping: 14 }}
              whileHover={{ y: -6, rotate: 1.6, transition: { duration: 0.3 } }}
              className="relative"
              style={{ transformOrigin: "top center" }}
            >
              <span
                className="absolute left-1/2 -translate-x-1/2 -top-3 h-5 w-3 rounded-sm bg-clay/80 shadow-sm z-10"
                aria-hidden
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd();
                }}
                aria-label="Add a moment"
                className="group/add bg-card border border-dashed border-foreground/25 hover:border-clay/70 p-2 pb-6 shadow-paper paper-grain rounded-md w-[150px] md:w-[180px] mt-2 transition-colors"
              >
                <div className="relative aspect-[4/5] rounded-sm bg-muted/40 flex flex-col items-center justify-center text-muted-foreground group-hover/add:text-clay transition-colors">
                  <Plus className="h-8 w-8" strokeWidth={1.4} />
                </div>
                <p className="font-serif italic text-center text-foreground/60 text-sm mt-2 truncate">
                  add a moment
                </p>
              </button>
            </motion.div>
          </div>
        </div>

        <p className="font-serif italic text-2xl md:text-3xl text-foreground/80 text-center mt-4 leading-snug">
          {tagline}
        </p>
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground text-center mt-2 opacity-0 group-hover:opacity-100 transition">
          Tap to open the timeline
        </p>
      </button>

    </section>
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

function TimelineGroup({ group, isDemo }: { group: Group; isDemo?: boolean }) {
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

      <div className="relative">
        {/* Clothesline string with gentle sag */}
        <svg
          aria-hidden
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          className="absolute left-0 right-0 top-3 w-full h-5 pointer-events-none"
        >
          <path
            d="M0,4 Q50,18 100,4"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="relative flex gap-6 overflow-x-auto pb-8 pt-6 px-2 snap-x snap-mandatory scrollbar-none">
          {group.items.map((m, i) => (
            <PeggedCard key={m.id} index={i}>
              {isDemo && (
                <span className="absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-[9px] uppercase tracking-[0.16em] bg-foreground/85 text-background px-2 py-0.5 rounded-full shadow-soft">
                  Demo
                </span>
              )}
              <MomentCard moment={m} index={i} stacked={false} expanded />
            </PeggedCard>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

function PeggedCard({ index, children }: { index: number; children: ReactNode }) {
  const tilts = [-3, 2, -1, 3, -2, 1];
  const rotate = tilts[index % tilts.length];
  return (
    <div
      className="relative flex-shrink-0 snap-center pt-3"
      style={{ transform: `rotate(${rotate}deg)`, transformOrigin: "top center" }}
    >
      {/* Pegs */}
      <span
        aria-hidden
        className="absolute -top-1 left-6 h-2.5 w-2.5 rounded-[3px] bg-clay shadow-soft z-10"
        style={{ transform: "rotate(12deg)" }}
      />
      <span
        aria-hidden
        className="absolute -top-1 right-6 h-2.5 w-2.5 rounded-[3px] bg-clay shadow-soft z-10"
        style={{ transform: "rotate(-12deg)" }}
      />
      {children}
    </div>
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
      id={`moment-${moment.id}`}
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
