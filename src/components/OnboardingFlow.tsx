import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData, type OnboardingData } from "@/lib/store";

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
              ? "bg-sage-soft border-sage shadow-soft"
              : "bg-card border-border hover:bg-muted hover:border-sage/40"
          }`}
        >
          <span className="text-sm font-medium text-foreground">{o}</span>
          {isSelected(o) && (
            <Check className="absolute top-3 right-3 h-4 w-4 text-sage" strokeWidth={2.4} />
          )}
        </button>
      ))}
    </div>
  );
}

const RELATIONSHIPS = ["Son", "Daughter", "Spouse", "Grandchild", "Sibling", "Parent", "Friend", "Other"];
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

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { onboarding, saveOnboarding, hydrated, user } = useAppData();
  const [data, setData] = useState<OnboardingData>({});
  const [step, setStep] = useState(0);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (onboarding.completed) { navigate({ to: "/" }); return; }
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
    { id: "names", render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="A few gentle details" subtitle="So we can speak to you both by name." />
        <div className="space-y-3">
          <label className="block">
            <span className="text-sm text-muted-foreground">Your name (optional)</span>
            <Input value={data.caregiverName ?? ""} onChange={(e) => set("caregiverName", e.target.value)} className="mt-1.5 h-12 rounded-xl bg-card" placeholder="e.g. Mei Ling" />
          </label>
          <label className="block">
            <span className="text-sm text-muted-foreground">Your loved one's name (optional)</span>
            <Input value={data.loveeName ?? ""} onChange={(e) => set("loveeName", e.target.value)} className="mt-1.5 h-12 rounded-xl bg-card" placeholder="e.g. Pa, Ma, Ah Gong" />
          </label>
        </div>
      </div>
    )},
    { id: "relationship", canContinue: (d) => !!d.relationship, render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="Who are you caring for?" subtitle="There are no wrong answers." />
        <ChoiceGrid options={RELATIONSHIPS} selected={data.relationship} onSelect={(v) => set("relationship", v)} />
      </div>
    )},
    { id: "illnessType", canContinue: (d) => !!d.illnessType, render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="What diagnosis did they receive?" subtitle="This helps us tailor gentle guidance — not for medical diagnosis." />
        <ChoiceGrid options={ILLNESSES} selected={data.illnessType} onSelect={(v) => set("illnessType", v)} />
        <p className="text-xs text-muted-foreground bg-muted/60 rounded-xl p-3 leading-relaxed">
          This information helps personalize support and recommendations. It is not used for medical diagnosis.
        </p>
      </div>
    )},
    { id: "illnessStage", canContinue: (d) => !!d.illnessStage, render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="Where are you in the journey?" subtitle="It's okay if things are still unclear." />
        <ChoiceGrid options={STAGES} selected={data.illnessStage} onSelect={(v) => set("illnessStage", v)} />
      </div>
    )},
    { id: "situation", render: ({ data, toggleArray }) => (
      <div className="space-y-6">
        <Header title="Where are they being cared for?" subtitle="Select any that apply." />
        <ChoiceGrid options={SITUATIONS} selected={data.situation} onSelect={(v) => toggleArray("situation", v)} multi />
      </div>
    )},
    { id: "mobility", render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="How is their mobility?" />
        <ChoiceGrid options={MOBILITY} selected={data.mobility} onSelect={(v) => set("mobility", v)} />
      </div>
    )},
    { id: "communication", render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="And their ability to communicate?" />
        <ChoiceGrid options={COMMUNICATION} selected={data.communication} onSelect={(v) => set("communication", v)} />
      </div>
    )},
    { id: "patientKnows", render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="Does your loved one know the diagnosis?" subtitle="There is no judgement here." />
        <ChoiceGrid options={PATIENT_KNOWS} selected={data.patientKnows} onSelect={(v) => set("patientKnows", v)} />
      </div>
    )},
    { id: "emotional", canContinue: (d) => !!d.emotional, render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="How are you feeling right now?" subtitle="Whatever it is, it's valid." />
        <ChoiceGrid options={EMOTIONS} selected={data.emotional} onSelect={(v) => set("emotional", v)} />
        {data.emotional && (
          <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="text-sm text-foreground/80 bg-sage-soft rounded-xl p-4 leading-relaxed">
            It's okay to take things one step at a time. We'll only show you a little at a time.
          </motion.p>
        )}
      </div>
    )},
    { id: "isPrimary", render: ({ data, set }) => (
      <div className="space-y-6">
        <Header title="Are you the primary caregiver?" />
        <ChoiceGrid options={["Yes", "Shared with family", "No, just helping"]} selected={data.isPrimary} onSelect={(v) => set("isPrimary", v)} />
      </div>
    )},
    { id: "priorities", render: ({ data, toggleArray }) => (
      <div className="space-y-6">
        <Header title="What would help most right now?" subtitle="Choose as many as you like." />
        <div className="space-y-2">
          {PRIORITIES.map((p) => {
            const sel = data.priorities?.includes(p);
            return (
              <button key={p} type="button" onClick={() => toggleArray("priorities", p)}
                className={`w-full text-left flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition ${
                  sel ? "bg-sage-soft border-sage" : "bg-card border-border hover:bg-muted"
                }`}>
                <span className={`h-5 w-5 rounded-full flex items-center justify-center border ${sel ? "bg-sage border-sage" : "border-border"}`}>
                  {sel && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                </span>
                <span className="text-sm">{p}</span>
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
      navigate({ to: "/" });
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

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-2">
      <h2 className="text-3xl font-serif text-balance">{title}</h2>
      {subtitle && <p className="text-muted-foreground text-sm leading-relaxed">{subtitle}</p>}
    </div>
  );
}
