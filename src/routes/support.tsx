import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserRound, Phone, Mail, Trash2, Copy, Check, Share2, Plus, BookHeart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { useAppData } from "@/lib/store";
import { HELPLINES } from "@/lib/content";
import { getScrapbookShareUrl } from "@/lib/share";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "You - Alongside" },
      { name: "description", content: "Care for yourself, and keep your circle close." },
    ],
  }),
  component: You,
});

const RELATIONSHIP_PRESETS = ["Sibling", "Child", "Spouse", "Relative", "Friend"];

export function BreathExercise() {
  const [running, setRunning] = useState(false);
  return (
    <div className="rounded-3xl bg-gradient-warm border border-border p-8 text-center">
      <div className="relative mx-auto h-44 w-44 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-sage-soft"
          animate={running ? { scale: [1, 1.4, 1.4, 1, 1] } : { scale: 1 }}
          transition={
            running
              ? {
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.33, 0.5, 0.83, 1],
                }
              : {}
          }
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-sage/40"
          animate={running ? { scale: [1, 1.3, 1.3, 1, 1] } : { scale: 1 }}
          transition={
            running
              ? {
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.33, 0.5, 0.83, 1],
                }
              : {}
          }
        />
        <motion.p
          className="relative font-serif text-2xl"
          animate={running ? { opacity: [1, 1, 0.6, 1, 1] } : {}}
          transition={running ? { duration: 12, repeat: Infinity } : {}}
        >
          {running ? "Breathe" : "Begin"}
        </motion.p>
      </div>
      <p className="text-sm text-muted-foreground mt-5 leading-relaxed max-w-xs mx-auto">
        Inhale slowly. Hold gently. Exhale longer. As long as you need.
      </p>
      <Button
        onClick={() => setRunning((r) => !r)}
        className="mt-5 rounded-full px-7 bg-foreground text-background hover:bg-foreground/90"
      >
        {running ? "End" : "Start a moment"}
      </Button>
    </div>
  );
}

function You() {
  const { local, family, addFamily, removeFamily, hydrated, user } = useAppData();
  const [mode, setMode] = useState<"self" | "circle">("self");
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [email, setEmail] = useState("");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!hydrated) return null;

  const recent = local.checkInHistory.slice(-7);
  const overwhelmedCount = recent.filter((c) =>
    ["Overwhelmed", "Tired", "Sad", "Numb"].includes(c.mood),
  ).length;
  const showBurnoutNote = overwhelmedCount >= 3;

  const submitMember = () => {
    if (!name.trim() || !relationship.trim()) return;
    void addFamily({
      name: name.trim(),
      relationship: relationship.trim(),
      email: email.trim() || undefined,
    });
    setName("");
    setRelationship("");
    setEmail("");
  };

  const shareScrapbook = async () => {
    if (!user || sharing) return;
    setSharing(true);
    try {
      const url = await getScrapbookShareUrl(user.id);
      if (navigator.share) {
        try {
          await navigator.share({ title: "A shared scrapbook", url });
          return;
        } catch {
          /* user cancelled */
        }
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success("Scrapbook link copied", { description: url });
    } finally {
      setSharing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-muted-foreground">
            <UserRound className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-xs uppercase tracking-[0.14em]">You</span>
          </div>
          <h1 className="text-4xl font-serif mt-1.5 text-balance">This space is for you, too</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Care for yourself, and keep your circle close.
          </p>
        </header>

        <div className="relative rounded-full bg-card/60 border border-border p-1 flex">
          {(["self", "circle"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="relative flex-1 py-2 text-sm rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {mode === m && (
                <motion.span
                  layoutId="support-mode-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-soft border border-border/60"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span
                className={`relative ${mode === m ? "font-medium text-accent-active" : "text-muted-foreground"}`}
              >
                {m === "self" ? "For you" : "Your circle"}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {mode === "self" ? (
            <motion.div
              key="self"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {showBurnoutNote && (
                <div className="rounded-2xl bg-clay-soft border border-clay/30 p-5">
                  <p className="font-serif text-lg">A gentle observation</p>
                  <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">
                    The past week has felt heavy. That's a sign to lean on someone, even briefly.
                    You deserve care too.
                  </p>
                </div>
              )}

              <section className="space-y-3">
                <h3 className="font-serif italic text-2xl font-light text-foreground/90 px-1">
                  gentle reminders
                </h3>
                <Carousel opts={{ align: "start" }} className="w-full relative">
                  <CarouselContent>
                    {[
                      {
                        text: "You are doing the best you can with what you have.",
                        grad: "bg-gradient-warm",
                      },
                      {
                        text: "Resting is not abandoning. It is sustaining.",
                        grad: "bg-gradient-sage",
                      },
                      {
                        text: "Asking for help is an act of love - for them, and for you.",
                        grad: "bg-gradient-dawn",
                      },
                      { text: "There is no perfect way to do this.", grad: "bg-gradient-warm" },
                    ].map((q) => (
                      <CarouselItem
                        key={q.text}
                        className="basis-[88%] sm:basis-[72%] md:basis-[60%]"
                      >
                        <div
                          className={`min-h-[200px] rounded-2xl ${q.grad} border border-border p-7 shadow-soft flex items-center`}
                        >
                          <p
                            className="font-serif italic leading-snug text-foreground/85 text-balance"
                            style={{ fontSize: 30 }}
                          >
                            {q.text}
                          </p>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="-left-3 md:-left-5" />
                  <CarouselNext className="-right-3 md:-right-5" />
                </Carousel>
              </section>

              <section className="space-y-3">
                <h3 className="font-serif italic text-2xl font-light text-foreground/90 px-1">
                  a moment to breathe
                </h3>
                <BreathExercise />
              </section>

              <section className="space-y-3">
                <h3 className="font-serif italic text-2xl font-light text-foreground/90 px-1">
                  if you need a listening ear
                </h3>
                <div className="grid gap-2">
                  {HELPLINES.map((h) => (
                    <a
                      key={h.name}
                      href={`tel:${h.number.replace(/\s+/g, "")}`}
                      className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3 hover:border-sage/40 transition"
                    >
                      <div className="h-10 w-10 rounded-full bg-sage-soft flex items-center justify-center">
                        <Phone className="h-4 w-4 text-sage" strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{h.name}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{h.desc}</p>
                      </div>
                      <span className="text-sm font-medium text-sage">{h.number}</span>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground/80 px-1 pt-1 leading-relaxed">
                  Alongside is a companion, not a medical or crisis service. Please reach out to a
                  doctor or helpline for urgent needs.
                </p>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="circle"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4 shadow-soft">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Plus className="h-4 w-4" strokeWidth={1.6} />
                  <span className="text-xs uppercase tracking-[0.14em]">Your circle</span>
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-serif text-xl">Who walks this with you?</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Keep track of the people sharing the care, so no one carries it alone.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Name"
                    className="rounded-xl bg-background h-11"
                  />
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIP_PRESETS.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRelationship(r)}
                        className={`px-3 py-1.5 rounded-full text-xs border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                          relationship === r
                            ? "bg-foreground text-background border-foreground"
                            : "bg-background border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional)"
                    type="email"
                    className="rounded-xl bg-background h-11"
                  />
                  <Button
                    onClick={submitMember}
                    disabled={!name.trim() || !relationship.trim()}
                    className="w-full rounded-xl h-11 bg-foreground text-background hover:bg-foreground/90"
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Add to the circle
                  </Button>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="font-serif italic text-2xl font-light text-foreground/90 px-1">
                  people in the circle
                </h3>
                {family.length === 0 ? (
                  <div className="rounded-2xl bg-card border border-border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      No one here yet. Add the people who share the care with you.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {family.map((m) => (
                      <div
                        key={m.id}
                        className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3"
                      >
                        <div className="h-10 w-10 rounded-full bg-gradient-dawn flex items-center justify-center text-sm font-medium">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{m.relationship}</p>
                        </div>
                        {m.email && (
                          <a
                            href={`mailto:${m.email}?subject=A%20gentle%20update`}
                            className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center"
                            aria-label="Email"
                          >
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </a>
                        )}
                        <button
                          onClick={() => void removeFamily(m.id)}
                          className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center"
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="rounded-2xl bg-card border border-border p-5 space-y-3 shadow-soft">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookHeart className="h-4 w-4" strokeWidth={1.6} />
                  <span className="text-xs uppercase tracking-[0.14em]">Share the scrapbook</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  A view-only page of your saved moments — anyone with the link can open it, no
                  account needed.
                </p>
                <Button
                  onClick={shareScrapbook}
                  disabled={sharing}
                  className="w-full rounded-xl h-11 bg-foreground text-background hover:bg-foreground/90"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1.5" /> Link copied
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4 mr-1.5" />{" "}
                      {sharing ? "Preparing…" : "Share the link"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Alongside is one shared login today — people you add above are your own notes
                  about the circle. The scrapbook link is the one thing others can open on their
                  own.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
