import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/store";
import { useHealthData } from "@/lib/health-store";
import { CARE_JOURNEY } from "@/lib/content";
import { MOCK_KEYS, readMockFlag } from "@/lib/mock-health";
import { FloralBlur, BlanketArt } from "@/components/today/art";
import { NextUpSection, deriveOpenSteps } from "@/components/today/NextUpSection";
import { SuggestionCard, pickSuggestion } from "@/components/today/SuggestionCard";
import { MomentPrompt } from "@/components/today/MomentPrompt";
import { JourneyProgressCard } from "@/components/today/JourneyProgressCard";
import { IntakeNudgeCard } from "@/components/today/IntakeNudgeCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today - Alongside" },
      {
        name: "description",
        content: "What needs the family today — visits, next steps, and moments.",
      },
    ],
  }),
  component: Today,
});

// Heavy states among the daily check-in pills vs the onboarding emotion options.
const HEAVY_MOODS = ["Overwhelmed", "Tired", "Numb"];
const HEAVY_ONBOARDING = ["Overwhelmed", "Numb", "Anxious", "Lost"];
const LIGHT_MOODS = ["Managing", "Hopeful"];

const MOODS = [
  { label: "Tired", emoji: "😔" },
  { label: "Overwhelmed", emoji: "😟" },
  { label: "Managing", emoji: "🙂" },
  { label: "Hopeful", emoji: "🌱" },
  { label: "Numb", emoji: "😶" },
];

function Today() {
  const navigate = useNavigate();
  const { onboarding, local, updateLocal, hydrated, user } = useAppData();
  const health = useHealthData();
  const [hubConnected] = useState(() => readMockFlag(MOCK_KEYS.healthhub));

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
    if (!onboarding.completed) navigate({ to: "/onboarding" });
  }, [hydrated, user, onboarding.completed, navigate]);

  // Phase-scoped journey progress: the current chapter, not the whole mountain.
  const journey = useMemo(() => {
    for (const phase of CARE_JOURNEY) {
      let total = 0;
      let checked = 0;
      for (const cat of phase.categories)
        for (const item of cat.items) {
          total += 1;
          if (local.checkedItems[item.id]) checked += 1;
        }
      if (checked < total) return { phase, checked, total, allDone: false };
    }
    return { phase: CARE_JOURNEY[0], checked: 0, total: 0, allDone: true };
  }, [local.checkedItems]);

  if (!hydrated || !user || !onboarding.completed) {
    return <div className="min-h-screen bg-background" />;
  }

  const greetingName = onboarding.caregiverName?.trim();
  const loveeName = onboarding.loveeName?.trim() || "your loved one";
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLine = new Date().toLocaleDateString("en-SG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const today = new Date().toISOString().slice(0, 10);
  const todayMood = local.checkInHistory.find((c) => c.date === today)?.mood;
  const isHeavy = todayMood
    ? HEAVY_MOODS.includes(todayMood)
    : HEAVY_ONBOARDING.includes(onboarding.emotional ?? "");

  const heroLine = isHeavy
    ? "Be gentle with yourself today."
    : todayMood && LIGHT_MOODS.includes(todayMood)
      ? "Today has room for something good."
      : "You're doing the best you can.";

  const openSteps = deriveOpenSteps(health.consultations);

  const toggleStep = (consultationId: string, stepIndex: number) => {
    const c = health.consultations.find((x) => x.id === consultationId);
    if (!c) return;
    void health.updateConsultation(consultationId, {
      actionSteps: c.actionSteps.map((s, j) => (j === stepIndex ? { ...s, done: !s.done } : s)),
    });
  };

  const setMood = (label: string) =>
    updateLocal((s) => ({
      ...s,
      checkInHistory: [
        ...s.checkInHistory.filter((c) => c.date !== today),
        { date: today, mood: label },
      ],
    }));

  return (
    <AppShell>
      <div className="space-y-10">
        {/* HERO — greeting, adaptive headline, inline check-in */}
        <section className="relative overflow-hidden rounded-[2rem] bg-card border border-border shadow-soft px-7 pt-9 pb-7 paper-grain">
          <FloralBlur />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {timeGreeting}
              {greetingName ? `, ${greetingName}` : ""} · {dateLine}
            </p>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-balance leading-[1.1] mt-3 max-w-md">
              {heroLine}
            </h1>
            <div className="mt-7 pt-5 border-t border-border/60">
              <p className="text-sm text-muted-foreground">How are you feeling, right now?</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {MOODS.map((m) => {
                  const active = todayMood === m.label;
                  return (
                    <button
                      key={m.label}
                      onClick={() => setMood(m.label)}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        active
                          ? "bg-background border-border/60 shadow-soft text-accent-active"
                          : "bg-transparent border-border hover:bg-background/60 text-foreground/80"
                      }`}
                    >
                      <span className="text-base leading-none">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {!onboarding.relationship && <IntakeNudgeCard />}

        {/* WHAT NEEDS THE FAMILY */}
        <section className="space-y-4">
          <h2 className="font-serif italic text-2xl font-light text-foreground/90 px-1">
            what needs the family
          </h2>
          <NextUpSection
            openSteps={openSteps}
            healthHydrated={health.hydrated}
            hubConnected={hubConnected}
            checkedItems={local.checkedItems}
            onToggleStep={toggleStep}
          />
          <SuggestionCard suggestion={pickSuggestion(isHeavy)} />
        </section>

        {/* A MOMENT WORTH KEEPING */}
        <section className="space-y-4">
          <h2 className="font-serif italic text-2xl font-light text-foreground/90 px-1">
            a moment worth keeping
          </h2>
          <MomentPrompt
            loveeName={loveeName}
            pendingBucketTitle={local.bucketList.find((b) => !b.done)?.title}
          />
        </section>

        {/* FOOTER — journey chapter + self-care, side by side when room allows */}
        <section className="grid gap-4 sm:grid-cols-2">
          <JourneyProgressCard
            phaseTitle={journey.phase.title}
            checkedInPhase={journey.checked}
            totalInPhase={journey.total}
            allDone={journey.allDone}
          />
          <div className="rounded-2xl bg-gradient-sage border border-sage/30 p-5 shadow-soft relative overflow-hidden">
            <BlanketArt />
            <div className="relative">
              <p className="font-serif text-xl leading-snug">Take a moment for yourself.</p>
              <p className="text-sm leading-relaxed text-foreground/80 mt-2">
                Rest when you can. Caring for yourself is part of caring for {loveeName}.
              </p>
              <Link
                to="/support"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-foreground/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                Open your space
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
