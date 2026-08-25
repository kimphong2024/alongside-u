import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/store";
import { useHealthData } from "@/lib/health-store";
import { CARE_JOURNEY } from "@/lib/content";
import { MOCK_KEYS, readMockFlag } from "@/lib/mock-health";
import { FloralBlur, BlanketArt } from "@/components/today/art";
import { NextUpSection, deriveOpenSteps, nextJourneyItem } from "@/components/today/NextUpSection";
import { FocusCards } from "@/components/today/FocusCards";
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

  const journeyStats = useMemo(() => {
    let total = 0;
    let checked = 0;
    for (const phase of CARE_JOURNEY)
      for (const cat of phase.categories)
        for (const item of cat.items) {
          total += 1;
          if (local.checkedItems[item.id]) checked += 1;
        }
    return { total, checked };
  }, [local.checkedItems]);

  if (!hydrated || !user || !onboarding.completed) {
    return <div className="min-h-screen bg-background" />;
  }

  const greetingName = onboarding.caregiverName?.trim();
  const loveeName = onboarding.loveeName?.trim() || "your loved one";
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const today = new Date().toISOString().slice(0, 10);
  const todayMood = local.checkInHistory.find((c) => c.date === today)?.mood;
  const isHeavy = todayMood
    ? HEAVY_MOODS.includes(todayMood)
    : HEAVY_ONBOARDING.includes(onboarding.emotional ?? "");

  const openSteps = deriveOpenSteps(health.consultations);
  const nextJourney = nextJourneyItem(local.checkedItems);

  const toggleStep = (consultationId: string, stepIndex: number) => {
    const c = health.consultations.find((x) => x.id === consultationId);
    if (!c) return;
    void health.updateConsultation(consultationId, {
      actionSteps: c.actionSteps.map((s, j) => (j === stepIndex ? { ...s, done: !s.done } : s)),
    });
  };

  return (
    <AppShell>
      <div className="space-y-16">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-card border border-border shadow-soft px-7 py-10 paper-grain">
          <FloralBlur />
          <div className="relative flex items-start justify-between gap-3">
            <div className="space-y-3 max-w-md">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {timeGreeting}
                {greetingName ? `, ${greetingName}` : ""}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-balance leading-[1.1]">
                You're doing the best you can.
              </h1>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                Here's what needs the family today. Move at your own pace.
              </p>
            </div>
          </div>
        </section>

        {!onboarding.relationship && <IntakeNudgeCard />}

        {/* CHECK-IN */}
        <section className="space-y-5">
          <SectionLabel label="Check in" />
          <div className="rounded-[1.75rem] bg-gradient-warm border border-border p-7 shadow-soft">
            <h3 className="font-serif text-2xl leading-snug">How are you feeling, right now?</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Today adapts gently to how you're doing.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              {MOODS.map((m) => {
                const active = todayMood === m.label;
                return (
                  <button
                    key={m.label}
                    onClick={() =>
                      updateLocal((s) => ({
                        ...s,
                        checkInHistory: [
                          ...s.checkInHistory.filter((c) => c.date !== today),
                          { date: today, mood: m.label },
                        ],
                      }))
                    }
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm transition-all duration-300 ${
                      active
                        ? "bg-card border-border/60 shadow-soft scale-[1.02] text-accent-active"
                        : "bg-transparent border-border hover:bg-card/60 text-foreground/80"
                    }`}
                  >
                    <span className="text-lg leading-none">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* NEXT UP */}
        <section className="space-y-5">
          <SectionLabel label="Next up" />
          <NextUpSection
            openSteps={openSteps}
            healthHydrated={health.hydrated}
            hubConnected={hubConnected}
            checkedItems={local.checkedItems}
            onToggleStep={toggleStep}
          />
        </section>

        {/* FOCUS CARDS */}
        <section className="space-y-5">
          <SectionLabel label="Today's focus" />
          <FocusCards isHeavy={isHeavy} loveeName={loveeName} hasOpenSteps={openSteps.length > 0} />
        </section>

        {/* MEANINGFUL MOMENT */}
        <section className="space-y-5">
          <SectionLabel label="A meaningful moment" />
          <MomentPrompt
            loveeName={loveeName}
            pendingBucketTitle={local.bucketList.find((b) => !b.done)?.title}
          />
        </section>

        {/* JOURNEY PROGRESS */}
        <section className="space-y-5">
          <SectionLabel label="The path ahead" />
          <JourneyProgressCard
            checkedCount={journeyStats.checked}
            totalCount={journeyStats.total}
            nextItemTitle={nextJourney?.item.title}
          />
        </section>

        {/* SELF-CARE */}
        <section className="space-y-5">
          <SectionLabel label="For you" />
          <div className="rounded-[1.75rem] bg-gradient-sage border border-sage/30 p-7 shadow-soft relative overflow-hidden">
            <BlanketArt />
            <div className="relative max-w-md">
              <h3 className="font-serif text-2xl leading-snug">Take a moment for yourself.</h3>
              <p className="text-[15px] leading-relaxed text-foreground/80 mt-3">
                Drink water. Eat something gentle. Rest when you can. Caring for yourself is part of
                caring for them.
              </p>
              <Link
                to="/support"
                className="inline-flex items-center gap-1.5 mt-5 text-sm text-foreground/85 hover:text-foreground"
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

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-1">
      <span className="h-px w-6 bg-border" />
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">
        {label}
      </span>
    </div>
  );
}
