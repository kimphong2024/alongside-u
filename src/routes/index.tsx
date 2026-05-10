import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/store";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today - Alongside" },
      { name: "description", content: "A calm, gentle starting point for caregivers in Singapore navigating terminal illness." },
    ],
  }),
  component: Today,
});

type CardKind = "subsidies" | "questions" | "moment" | "family" | "rest" | "breath" | "message";

function Today() {
  const navigate = useNavigate();
  const { onboarding, local, updateLocal, hydrated, user } = useAppData();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!onboarding.completed) navigate({ to: "/onboarding" });
  }, [hydrated, user, onboarding.completed, navigate]);

  if (!hydrated || !user || !onboarding.completed) {
    return <div className="min-h-screen bg-background" />;
  }

  const greetingName = onboarding.caregiverName?.trim();
  const loveeName = onboarding.loveeName?.trim() || "your loved one";
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const isOverwhelmed = ["Overwhelmed", "Exhausted", "Numb"].includes(onboarding.emotional ?? "");

  const focuses: { kind: CardKind; title: string; why: string; effort: string; link: "/support" | "/family" | "/care-journey" | "/moments" }[] =
    isOverwhelmed
      ? [
          { kind: "breath", title: "Take three slow breaths", why: "Begin with the smallest step.", effort: "1 minute", link: "/support" },
          { kind: "message", title: "A short, kind message to one family member", why: "You don't need to explain everything.", effort: "5 minutes", link: "/family" },
        ]
      : [
          { kind: "subsidies", title: "Review available caregiving subsidies", why: "Many families find this eases long-term stress.", effort: "10 minutes", link: "/care-journey" },
          { kind: "questions", title: "Note one question for the next medical visit", why: "Clarity often matters more than answers.", effort: "5 minutes", link: "/care-journey" },
          { kind: "moment", title: `Suggest one small moment with ${loveeName}`, why: "These are the memories that stay.", effort: "Today", link: "/moments" },
        ];

  const today = new Date().toISOString().slice(0, 10);
  const todayMood = local.checkInHistory.find((c) => c.date === today)?.mood;

  const moods = [
    { label: "Tired", emoji: "😔" },
    { label: "Overwhelmed", emoji: "😟" },
    { label: "Managing", emoji: "🙂" },
    { label: "Hopeful", emoji: "🌱" },
    { label: "Numb", emoji: "😶" },
  ];

  return (
    <AppShell>
      <div className="space-y-16">
        {/* HERO */}
        <section className="relative overflow-hidden rounded-[2rem] bg-card border border-border shadow-soft px-7 py-10 paper-grain">
          <FloralBlur />
          <div className="relative flex items-start justify-between gap-3">
            <div className="space-y-3 max-w-md">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {timeGreeting}{greetingName ? `, ${greetingName}` : ""}
              </p>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-balance leading-[1.1]">
                You're doing the best you can.
              </h1>
              <p className="text-muted-foreground leading-relaxed text-[15px]">
                A few things worth a look today. Move at your own pace.
              </p>
            </div>
          </div>
        </section>

        {/* FOCUS CARDS */}
        <section className="space-y-5">
          <SectionLabel label="Today's focus" />
          <div className="space-y-4">
            {focuses.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
              >
                <Link to={f.link} className="block group">
                  <div className="rounded-[1.5rem] bg-card border border-border p-6 shadow-soft hover:shadow-paper transition-all duration-500 hover:-translate-y-0.5">
                    <div className="flex items-center gap-5">
                      <div className="flex-1 space-y-2 min-w-0">
                        <h3 className="font-serif text-2xl text-balance leading-snug">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.why}</p>
                        <div className="flex items-center gap-2 pt-1.5 text-xs text-muted-foreground/80">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                          <span>~ {f.effort}</span>
                        </div>
                      </div>
                      <CardVignette kind={f.kind} />
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CHECK-IN */}
        <section className="space-y-5">
          <SectionLabel label="Check in" />
          <div className="rounded-[1.75rem] bg-gradient-warm border border-border p-7 shadow-soft">
            <h3 className="font-serif text-2xl leading-snug">How are you feeling, right now?</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              You can come back to this anytime.
            </p>
            <div className="flex flex-wrap gap-2.5 mt-6">
              {moods.map((m) => {
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

        {/* MEANINGFUL MOMENT (polaroid) */}
        <section className="space-y-5">
          <SectionLabel label="A meaningful moment" />
          <Link to="/moments" className="block">
            <div className="polaroid-left bg-card border border-border p-5 pb-7 shadow-paper paper-grain rounded-md hover:rotate-0 transition-transform duration-700">
              <div className="aspect-[5/3] rounded-sm bg-gradient-sage flex items-center justify-center">
                <TeaCupArt />
              </div>
              <h3 className="font-serif text-2xl italic leading-snug mt-5">
                Share a quiet cup of tea with {loveeName}.
              </h3>
              <p className="font-hand text-xl text-foreground/70 mt-2 leading-snug">
                small, ordinary moments often become the ones we treasure most.
              </p>
            </div>
          </Link>
        </section>

        {/* JOURNEY PREVIEW */}
        <section className="space-y-5">
          <SectionLabel label="The path ahead" />
          <Link to="/care-journey" className="block group">
            <div className="rounded-[1.75rem] bg-card border border-border p-7 shadow-soft hover:shadow-paper transition-all duration-500">
              <h3 className="font-serif text-2xl leading-snug">Explore the journey ahead</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">
                You do not need to think about everything at once.
              </p>

              <div className="relative mt-8 mb-2">
                <div className="absolute left-5 right-5 top-1/2 -translate-y-1/2 h-px bg-border" />
                <div className="relative flex items-center justify-between">
                  {[
                    { label: "First Week", soft: true },
                    { label: "First Month", soft: true },
                    { label: "Ongoing", muted: true },
                  ].map((m, i) => (
                    <div key={m.label} className="flex flex-col items-center gap-3">
                      <span
                        className={`h-3.5 w-3.5 rounded-full border-2 ${
                          m.muted
                            ? "bg-card border-border"
                            : "bg-sage-soft border-sage shadow-soft"
                        }`}
                      />
                      <span
                        className={`rounded-full px-3.5 py-1.5 text-xs border ${
                          m.muted
                            ? "border-dashed border-border text-muted-foreground/70 bg-transparent"
                            : "bg-secondary border-sage/40 text-foreground/85 shadow-soft"
                        }`}
                      >
                        {m.label}
                      </span>
                      {i === 2 && (
                        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
                          later
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1.5 mt-6 text-sm text-foreground/70 group-hover:text-foreground transition">
                <span>Open the journey</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
              </div>
            </div>
          </Link>
        </section>

        {/* SELF-CARE */}
        <section className="space-y-5">
          <SectionLabel label="For you" />
          <div className="rounded-[1.75rem] bg-gradient-sage border border-sage/30 p-7 shadow-soft relative overflow-hidden">
            <BlanketArt />
            <div className="relative max-w-md">
              <h3 className="font-serif text-2xl leading-snug">Take a moment for yourself.</h3>
              <p className="text-[15px] leading-relaxed text-foreground/80 mt-3">
                Drink water. Eat something gentle. Rest when you can. Caring for yourself is part of caring for them.
              </p>
              <Link
                to="/support"
                className="inline-flex items-center gap-1.5 mt-5 text-sm text-foreground/85 hover:text-foreground"
              >
                Open the support space
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
      <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground/80">{label}</span>
    </div>
  );
}

/* ---------- Soft inline illustrations ---------- */

function FloralBlur() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-16 -right-10 h-64 w-64 rounded-full bg-clay-soft/55 blur-3xl" />
      <div className="absolute -bottom-20 -left-12 h-72 w-72 rounded-full bg-sage-soft/70 blur-3xl" />
      <div className="absolute top-6 right-24 h-24 w-24 rounded-full bg-secondary/80 blur-2xl" />
    </div>
  );
}

function CardVignette({ kind }: { kind: CardKind }) {
  return (
    <div className="hidden sm:flex flex-shrink-0 h-20 w-20 rounded-2xl bg-gradient-warm border border-border items-center justify-center overflow-hidden">
      {kind === "subsidies" && <EnvelopeArt />}
      {kind === "questions" && <NotebookArt />}
      {kind === "moment" && <PolaroidArt />}
      {kind === "family" && <FamilyArt />}
      {kind === "rest" && <PlantArt />}
      {kind === "breath" && <BreathArt />}
      {kind === "message" && <LetterArt />}
    </div>
  );
}

const STROKE = "#5E4636";
const SAGE = "#8FA88A";
const SAGE_SOFT = "#C7D8C4";
const CLAY = "#D8B6A4";
const PAPER = "#FAF8F5";

function EnvelopeArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect x="10" y="20" width="44" height="30" rx="4" fill={PAPER} stroke={STROKE} strokeWidth="1.2" />
      <path d="M10 22 L32 38 L54 22" fill="none" stroke={STROKE} strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="48" cy="18" r="6" fill={CLAY} opacity="0.7" />
    </svg>
  );
}

function NotebookArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect x="14" y="12" width="36" height="44" rx="3" fill={PAPER} stroke={STROKE} strokeWidth="1.2" />
      <line x1="14" y1="22" x2="50" y2="22" stroke={SAGE} strokeWidth="1" />
      <line x1="20" y1="32" x2="44" y2="32" stroke={STROKE} strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="38" x2="40" y2="38" stroke={STROKE} strokeWidth="0.8" opacity="0.5" />
      <line x1="20" y1="44" x2="42" y2="44" stroke={STROKE} strokeWidth="0.8" opacity="0.5" />
      <circle cx="46" cy="48" r="4" fill={CLAY} opacity="0.7" />
    </svg>
  );
}

function PolaroidArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <g transform="rotate(-6 32 32)">
        <rect x="14" y="12" width="36" height="40" rx="2" fill={PAPER} stroke={STROKE} strokeWidth="1.2" />
        <rect x="18" y="16" width="28" height="22" fill={SAGE_SOFT} />
        <circle cx="32" cy="27" r="5" fill={CLAY} opacity="0.8" />
      </g>
    </svg>
  );
}

function FamilyArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <circle cx="22" cy="26" r="6" fill={SAGE_SOFT} stroke={STROKE} strokeWidth="1.1" />
      <circle cx="42" cy="26" r="6" fill={CLAY} stroke={STROKE} strokeWidth="1.1" opacity="0.85" />
      <circle cx="32" cy="38" r="5" fill={PAPER} stroke={STROKE} strokeWidth="1.1" />
      <path d="M10 54 q22 -14 44 0" fill="none" stroke={STROKE} strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function PlantArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <path d="M32 44 q-10 -8 -10 -20" fill="none" stroke={SAGE} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M32 44 q10 -6 10 -18" fill="none" stroke={SAGE} strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="22" cy="24" rx="5" ry="3" fill={SAGE_SOFT} />
      <ellipse cx="42" cy="26" rx="5" ry="3" fill={SAGE_SOFT} />
      <path d="M22 44 h20 l-2 10 h-16 z" fill={CLAY} opacity="0.7" stroke={STROKE} strokeWidth="1" />
    </svg>
  );
}

function BreathArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <circle cx="32" cy="32" r="18" fill="none" stroke={SAGE} strokeWidth="1" opacity="0.5" />
      <circle cx="32" cy="32" r="12" fill={SAGE_SOFT} opacity="0.7" />
      <circle cx="32" cy="32" r="6" fill={SAGE} opacity="0.6" />
    </svg>
  );
}

function LetterArt() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect x="12" y="18" width="40" height="28" rx="2" fill={PAPER} stroke={STROKE} strokeWidth="1.2" />
      <line x1="18" y1="26" x2="44" y2="26" stroke={STROKE} strokeWidth="0.8" opacity="0.6" />
      <line x1="18" y1="32" x2="40" y2="32" stroke={STROKE} strokeWidth="0.8" opacity="0.6" />
      <line x1="18" y1="38" x2="36" y2="38" stroke={STROKE} strokeWidth="0.8" opacity="0.6" />
      <path d="M44 14 l4 -2 -2 4 z" fill={CLAY} />
    </svg>
  );
}

function TeaCupArt() {
  return (
    <svg viewBox="0 0 120 80" className="h-16 w-24">
      <path d="M30 50 q4 -4 8 -8 M40 46 q3 -5 6 -10 M50 48 q2 -4 4 -8"
        stroke={STROKE} strokeWidth="0.9" fill="none" opacity="0.5" strokeLinecap="round" />
      <path d="M28 38 h44 v14 a14 14 0 0 1 -14 14 h-16 a14 14 0 0 1 -14 -14 z"
        fill={PAPER} stroke={STROKE} strokeWidth="1.2" />
      <path d="M72 42 q10 0 10 8 t-10 8" fill="none" stroke={STROKE} strokeWidth="1.2" />
      <ellipse cx="50" cy="40" rx="22" ry="3" fill={CLAY} opacity="0.5" />
    </svg>
  );
}

function BlanketArt() {
  return (
    <svg viewBox="0 0 200 120" aria-hidden className="absolute -bottom-2 -right-2 h-32 w-44 opacity-70">
      <path d="M20 80 q40 -30 80 -10 t80 -5 v40 h-160z" fill={PAPER} stroke={STROKE} strokeWidth="1" opacity="0.7" />
      <path d="M40 92 q40 -20 80 -5 t60 -2" fill="none" stroke={CLAY} strokeWidth="1.2" opacity="0.7" />
      <path d="M30 100 q40 -16 80 -4 t70 -3" fill="none" stroke={SAGE} strokeWidth="1.2" opacity="0.7" />
    </svg>
  );
}
