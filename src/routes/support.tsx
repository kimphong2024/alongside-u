import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { LifeBuoy, Wind, Phone } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — Alongside" },
      { name: "description", content: "A space to pause, breathe, and care for yourself." },
    ],
  }),
  component: Support,
});

const HELPLINES = [
  { name: "Samaritans of Singapore (SOS)", number: "1-767", desc: "24-hour emotional support." },
  { name: "Caregiver Support — AIC", number: "1800 650 6060", desc: "Mon–Fri, 8.30am–8.30pm; Sat 8.30am–4pm." },
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
  const { state, hydrated } = useAppState();
  if (!hydrated) return null;

  const recent = state.checkInHistory.slice(-7);
  const overwhelmedCount = recent.filter((c) => ["Overwhelmed", "Tired", "Sad", "Numb"].includes(c.mood)).length;
  const showBurnoutNote = overwhelmedCount >= 3;

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-muted-foreground">
            <LifeBuoy className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-xs uppercase tracking-[0.14em]">Support</span>
          </div>
          <h1 className="text-4xl font-serif mt-1.5 text-balance">A space just for you</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Caring for someone else takes a quiet toll. Pause here, anytime.
          </p>
        </header>

        {showBurnoutNote && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-clay-soft border border-clay/30 p-5"
          >
            <p className="font-serif text-lg">A gentle observation</p>
            <p className="text-sm text-foreground/80 mt-1.5 leading-relaxed">
              The past week has felt heavy. That's a sign to lean on someone, even briefly. You deserve care too.
            </p>
          </motion.div>
        )}

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Wind className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-xs uppercase tracking-[0.14em]">A breathing moment</span>
          </div>
          <BreathExercise />
        </section>

        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">Reminders</h3>
          <div className="grid gap-2">
            {[
              "You are doing the best you can with what you have.",
              "Resting is not abandoning. It is sustaining.",
              "Asking for help is an act of love — for them, and for you.",
              "There is no perfect way to do this.",
            ].map((q) => (
              <div key={q} className="rounded-2xl bg-card border border-border p-4">
                <p className="font-serif text-lg leading-snug text-foreground/85">{q}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-xs uppercase tracking-[0.14em]">If you need to talk</span>
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
      </div>
    </AppShell>
  );
}
