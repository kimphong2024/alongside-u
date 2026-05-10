import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData, type OnboardingData } from "@/lib/store";

export const Route = createFileRoute("/care-journey-intro")({
  component: CareJourneyIntro,
});

type StepProps = {
  data: OnboardingData;
  set: <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) => void;
  toggleArray: (k: keyof OnboardingData, v: string) => void;
};

type Step = {
  id: string;
  render: (props: StepProps) => React.ReactNode;
  canContinue?: (d: OnboardingData) => boolean;
};

const RELATIONSHIPS = ["Son", "Daughter", "Spouse", "Grandchild", "Sibling", "Parent", "Friend"];
const ILLNESSES = ["Cancer", "Dementia", "Heart failure", "ALS", "Parkinson's", "Other"];
const STAGES = ["Recently diagnosed", "Early stage", "Advanced", "Not sure yet"];
const EMOTIONS = ["Overwhelmed", "Numb", "Anxious", "Lost", "Trying to stay strong", "Managing okay"];
const PRIORITIES = [
  "Understanding what to do next",
  "Managing responsibilities",
  "Spending meaningful time together",
  "Coordinating family updates",
  "Emotional support",
];

function ChoiceGrid({
  options, selected, onSelect, multi = false,
}: { options: string[]; selected?: string | string[]; onSelect: (v: string) => void; multi?: boolean }) {
  const isSelected = (o: string) =>
    multi ? Array.isArray(selected) && selected.includes(o) : selected === o;
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onSelect(o)}
          className={`group relative text-left px-4 py-4 rounded-2xl border transition-all duration-200 ${
            isSelected(o)
              ? "bg-card border-border/70 shadow-soft text-accent-active"
              : "bg-transparent border-border text-foreground hover:bg-card/60"
          }`}
        >
          <span className="text-sm font-medium">{o}</span>
          {isSelected(o) && (
            <Check className="absolute top-3 right-3 h-4 w-4 text-accent-active" strokeWidth={2.4} />
          )}
        </button>
      ))}
    </div>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-serif text-balance">{title}</h2>
      {subtitle && <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>}
    </div>
  );
}

function RelationshipInline({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSelect = (v: string) => {
    onChange(v);
    setTimeout(() => setOpen(false), 150);
  };

  return (
    <span ref={ref} className="relative inline-block align-baseline">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1 font-serif font-light italic lowercase text-[0.9em] transition-all ${
          value
            ? "bg-card border-border/70 shadow-soft text-accent-active"
            : "bg-card border-border text-muted-foreground hover:bg-muted"
        }`}
      >
        <span>{value ?? "choose…"}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2.4}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            style={{ overflow: "hidden" }}
            className="absolute left-0 top-full z-20 mt-2 w-[min(22rem,80vw)]"
          >
            <div className="bg-card border border-border rounded-2xl shadow-soft p-3 flex flex-wrap gap-2 items-center">
              {RELATIONSHIPS.map((o) => {
                const sel = value === o;
                return (
                  <button
                    key={o}
                    type="button"
                    onClick={() => handleSelect(o)}
                    className={`rounded-full border px-3.5 py-1.5 font-serif font-light italic lowercase text-base transition-all ${
                      sel
                        ? "bg-card border-border/70 shadow-soft text-accent-active"
                        : "bg-transparent border-border hover:bg-card/60"
                    }`}
                  >
                    {o}
                  </button>
                );
              })}
              <input
                type="text"
                placeholder="other…"
                value={value && !RELATIONSHIPS.includes(value) ? value : ""}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    setOpen(false);
                  }
                }}
                className={`rounded-full border px-3.5 py-1.5 font-serif font-light italic lowercase text-base bg-transparent outline-none transition-all w-28 focus:w-40 placeholder:text-muted-foreground ${
                  value && !RELATIONSHIPS.includes(value)
                    ? "border-border/70 shadow-soft text-accent-active"
                    : "border-border"
                }`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

function CareJourneyIntro() {
  const navigate = useNavigate();
  const { onboarding, saveOnboarding, hydrated, user } = useAppData();
  const [data, setData] = useState<OnboardingData>({});
  const [step, setStep] = useState(0);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    const introDone = !!onboarding.relationship && !!onboarding.illnessType;
    if (introDone) { navigate({ to: "/care-journey" }); return; }
    if (!seeded) { setData(onboarding); setSeeded(true); }
  }, [hydrated, user, onboarding, navigate, seeded]);

  const set = <K extends keyof OnboardingData>(k: K, v: OnboardingData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const toggleArray = (k: keyof OnboardingData, v: string) => {
    setData((d) => {
      const arr = (d[k] as string[] | undefined) ?? [];
      const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
      return { ...d, [k]: next as OnboardingData[typeof k] };
    });
  };

  const steps: Step[] = [
    { id: "welcome", render: () => (
      <div className="text-center space-y-5 pt-8">
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-dawn shadow-glow" />
        <h1 className="text-4xl md:text-5xl text-balance font-serif">You do not have to navigate this alone.</h1>
        <p className="text-muted-foreground text-balance leading-relaxed max-w-md mx-auto">
          We'll help you organize next steps and create meaningful moments with your loved one — at your own pace.
        </p>
      </div>
    )},
    { id: "relationship", canContinue: (d) => !!d.relationship, render: ({ data, set }) => (
      <div className="space-y-6 pt-4">
        <h2 className="text-3xl md:text-4xl font-serif text-balance leading-snug">
          I am a{" "}
          <RelationshipInline
            value={data.relationship}
            onChange={(v) => set("relationship", v)}
          />{" "}
          to someone recently diagnosed.
        </h2>
      </div>
    )},
    { id: "illnessType", canContinue: (d) => !!d.illnessType, render: ({ data, set }) => {
      const lovedOne = lovedOneFor(data.relationship);
      return (
      <div className="space-y-6">
        <Header title="What diagnosis did your loved one receive?" subtitle="This helps us personalize guidance and support." />
        <ChoiceGrid options={ILLNESSES} selected={data.illnessType} onSelect={(v) => set("illnessType", v)} />
        <div className="space-y-2 pt-2">
          <span className="text-sm text-muted-foreground">Where is your {lovedOne} in their diagnosis? (optional)</span>
          <ChoiceGrid options={STAGES} selected={data.illnessStage} onSelect={(v) => set("illnessStage", v)} />
        </div>
      </div>
      );
    }},
    { id: "emotional", canContinue: (d) => !!d.emotional, render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="How are you feeling right now?" subtitle="Whatever it is, it's valid." />
        <ChoiceGrid options={EMOTIONS} selected={data.emotional} onSelect={(v) => set("emotional", v)} />
        {data.emotional && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm text-foreground/80 bg-sage-soft rounded-xl p-4 leading-relaxed">
            It's okay to take things one step at a time.
          </motion.p>
        )}
      </div>
    )},
    { id: "priorities", canContinue: (d) => !!d.priorities && d.priorities.length > 0, render: ({ data, toggleArray }) => (
      <div className="space-y-6">
        <Header title="What would help most right now?" subtitle="Choose as many as you like." />
        <div className="space-y-2">
          {PRIORITIES.map((p) => {
            const sel = data.priorities?.includes(p);
            return (
              <button key={p} type="button" onClick={() => toggleArray("priorities", p)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition ${
                  sel ? "bg-card border-border/70 shadow-soft" : "bg-transparent border-border hover:bg-card/60"
                }`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${sel ? "bg-accent-active border-accent-active" : "border-border"}`}>
                  {sel && <Check className="h-3 w-3 text-card" strokeWidth={3} />}
                </span>
                <span className={`text-sm ${sel ? "text-accent-active font-medium" : ""}`}>{p}</span>
              </button>
            );
          })}
        </div>
      </div>
    )},
    { id: "final", render: ({ data }) => (
      <div className="text-center space-y-5 pt-8">
        <div className="mx-auto h-20 w-20 rounded-full bg-gradient-dawn shadow-glow" />
        <h1 className="text-4xl font-serif text-balance">Here's a gentle starting point.</h1>
        <p className="text-muted-foreground text-balance max-w-md mx-auto leading-relaxed">
          {data.caregiverName ? `${data.caregiverName}, ` : ""}we've prepared a small set of next steps and a quiet space for meaningful moments. Nothing is urgent. You can return anytime.
        </p>
      </div>
    )},
  ];

  if (!hydrated) return null;

  const current = steps[step];
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const canNext = current.canContinue ? current.canContinue(data) : true;

  const next = async () => {
    if (isLast) {
      await saveOnboarding({ ...data, completed: true });
      navigate({ to: "/care-journey" });
      return;
    }
    setStep((s) => s + 1);
  };

  return (
    <div className="min-h-screen flex flex-col px-5 py-8 max-w-xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-8 w-8 rounded-full bg-gradient-dawn shadow-soft" />
        <span className="font-serif text-xl">Alongside</span>
        <div className="ml-auto flex gap-1.5">
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-6 bg-sage" : i < step ? "w-1.5 bg-sage/60" : "w-1.5 bg-border"
            }`} />
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35, ease: "easeOut" }} className="flex-1">
            {current.render({ data, set, toggleArray })}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center gap-3">
          {!isFirst && (
            <Button variant="ghost" size="lg" onClick={() => setStep((s) => s - 1)} className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          )}
          <Button size="lg" onClick={next} disabled={!canNext}
            className="ml-auto rounded-full px-7 h-12 bg-foreground text-background hover:bg-foreground/90">
            {isFirst ? "Begin" : isLast ? "Take me in" : "Continue"}
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
