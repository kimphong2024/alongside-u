import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LifeBuoy, Wind, Phone, Mail, Trash2, Link2, Copy, Check, Share2, Eye } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support - Alongside" },
      { name: "description", content: "Support yourself, or invite family to support you." },
    ],
  }),
  component: Support,
});

const HELPLINES = [
  { name: "Samaritans of Singapore (SOS)", number: "1-767", desc: "24-hour emotional support." },
  { name: "Caregiver Support - AIC", number: "1800 650 6060", desc: "Mon–Fri, 8.30am–8.30pm; Sat 8.30am–4pm." },
  { name: "Singapore Hospice Council", number: "6538 2231", desc: "Information on hospice & palliative care." },
  { name: "Emergency", number: "995", desc: "Ambulance & medical emergencies." },
];

export function BreathExercise() {
  const [running, setRunning] = useState(false);
  return (
    <div className="rounded-3xl bg-gradient-warm border border-border p-8 text-center">
      <div className="relative mx-auto h-44 w-44 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-sage-soft"
          animate={running ? { scale: [1, 1.4, 1.4, 1, 1] } : { scale: 1 }}
          transition={running ? { duration: 12, repeat: Infinity, ease: "easeInOut", times: [0, 0.33, 0.5, 0.83, 1] } : {}}
        />
        <motion.div
          className="absolute inset-4 rounded-full bg-sage/40"
          animate={running ? { scale: [1, 1.3, 1.3, 1, 1] } : { scale: 1 }}
          transition={running ? { duration: 12, repeat: Infinity, ease: "easeInOut", times: [0, 0.33, 0.5, 0.83, 1] } : {}}
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

function Support() {
  const { state, update, hydrated } = useAppState();
  const [mode, setMode] = useState<"self" | "family">("self");
  const [copied, setCopied] = useState(false);

  const inviteLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    let token = "";
    try {
      token = localStorage.getItem("alongside.inviteToken") || "";
      if (!token) {
        token = crypto.randomUUID().slice(0, 8);
        localStorage.setItem("alongside.inviteToken", token);
      }
    } catch {
      token = "preview";
    }
    return `${window.location.origin}/join/${token}`;
  }, []);

  if (!hydrated) return null;

  const recent = state.checkInHistory.slice(-7);
  const overwhelmedCount = recent.filter((c) => ["Overwhelmed", "Tired", "Sad", "Numb"].includes(c.mood)).length;
  const showBurnoutNote = overwhelmedCount >= 3;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };
  const shareLink = async () => {
    const text = "I'd like to share my journey progress with you on Alongside.";
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({ title: "Alongside", text, url: inviteLink });
        return;
      } catch { /* user cancelled */ }
    }
    copyLink();
  };
  const removeMember = (id: string) =>
    update((s) => ({ ...s, family: s.family.filter((m) => m.id !== id) }));

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-muted-foreground">
            <LifeBuoy className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-xs uppercase tracking-[0.14em]">Support</span>
          </div>
          <h1 className="text-4xl font-serif mt-1.5 text-balance">Let your support meet you where you are</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Support yourself, or invite family to walk alongside you.
          </p>
        </header>

        <div className="relative rounded-full bg-card/60 border border-border p-1 flex">
          {(["self", "family"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="relative flex-1 py-2 text-sm rounded-full"
            >
              {mode === m && (
                <motion.span
                  layoutId="support-mode-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-soft border border-border/60"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className={`relative ${mode === m ? "font-medium text-accent-active" : "text-muted-foreground"}`}>
                {m === "self" ? "For you" : "From family"}
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
                    The past week has felt heavy. That's a sign to lean on someone, even briefly. You deserve care too.
                  </p>
                </div>
              )}

              <section className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">Reminders</h3>
                <div className="-mx-5 px-5 overflow-x-auto scrollbar-none">
                  <div className="flex gap-3 snap-x snap-mandatory pb-1">
                    {[
                      { text: "You are doing the best you can with what you have.", grad: "bg-gradient-warm" },
                      { text: "Resting is not abandoning. It is sustaining.", grad: "bg-gradient-sage" },
                      { text: "Asking for help is an act of love - for them, and for you.", grad: "bg-gradient-dawn" },
                      { text: "There is no perfect way to do this.", grad: "bg-gradient-warm" },
                    ].map((q) => (
                      <div
                        key={q.text}
                        className={`snap-start shrink-0 w-[88%] sm:w-[72%] md:w-[60%] min-h-[180px] rounded-2xl ${q.grad} border border-border p-7 shadow-soft flex items-center`}
                      >
                        <p className="font-serif italic text-2xl md:text-3xl leading-snug text-foreground/85 text-balance">{q.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wind className="h-4 w-4" strokeWidth={1.6} />
                  <span className="text-xs uppercase tracking-[0.14em]">Let's take a moment to breathe</span>
                </div>
                <BreathExercise />
              </section>

              <section className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" strokeWidth={1.6} />
                  <span className="text-xs uppercase tracking-[0.14em]">If you need a listening ear</span>
                </div>
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
                  Alongside is a companion, not a medical or crisis service. Please reach out to a doctor or helpline for urgent needs.
                </p>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="family"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-card border border-border p-5 space-y-4 shadow-soft">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Link2 className="h-4 w-4" strokeWidth={1.6} />
                  <span className="text-xs uppercase tracking-[0.14em]">Invite link</span>
                </div>
                <div className="space-y-1.5">
                  <h2 className="font-serif text-xl">Bring someone into the circle</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Share this private link with anyone who wants to walk alongside you.
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl bg-background border border-border px-3 py-2">
                  <Input
                    value={inviteLink}
                    readOnly
                    onFocus={(e) => e.currentTarget.select()}
                    className="border-0 bg-transparent h-9 px-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <button
                    onClick={copyLink}
                    aria-label="Copy link"
                    className="h-9 w-9 rounded-lg hover:bg-muted flex items-center justify-center flex-shrink-0 transition"
                  >
                    {copied ? <Check className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={copyLink} variant="outline" className="rounded-xl h-11">
                    {copied ? <><Check className="h-4 w-4 mr-1.5" /> Copied</> : <><Copy className="h-4 w-4 mr-1.5" /> Copy link</>}
                  </Button>
                  <Button onClick={shareLink} className="rounded-xl bg-foreground text-background hover:bg-foreground/90 h-11">
                    <Share2 className="h-4 w-4 mr-1.5" /> Share
                  </Button>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-sage-soft/40 border border-sage/20 px-3 py-2.5">
                  <Eye className="h-4 w-4 text-sage mt-0.5 flex-shrink-0" strokeWidth={1.8} />
                  <p className="text-xs text-foreground/80 leading-relaxed">
                    Linked accounts can only see your <span className="font-medium">Journey progress</span>. Moments, check-ins, and notes stay private to you.
                  </p>
                </div>
              </div>

              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">Linked accounts</h3>
                {state.family.length === 0 ? (
                  <div className="rounded-2xl bg-card border border-border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">No one linked yet. Share your invite link to bring someone in.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {state.family.map((m) => (
                      <div key={m.id} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-dawn flex items-center justify-center text-sm font-medium">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{m.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {m.relationship} · sees Journey progress
                          </p>
                        </div>
                        {m.email && (
                          <a href={`mailto:${m.email}?subject=A%20gentle%20update`} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center" aria-label="Email">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                          </a>
                        )}
                        <button onClick={() => removeMember(m.id)} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center" aria-label="Remove">
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">Suggested ways to share</h3>
                <div className="grid gap-2">
                  {[
                    { title: "Weekly family update", desc: "One short message every Sunday - saves repeating." },
                    { title: "Visit calendar", desc: "Spread visits across the week so everyone gets quiet time." },
                    { title: "Task circle", desc: "Groceries, meals, transport - small things, shared." },
                  ].map((s) => (
                    <div key={s.title} className="rounded-2xl bg-gradient-warm border border-border p-4">
                      <p className="font-serif text-lg">{s.title}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}
