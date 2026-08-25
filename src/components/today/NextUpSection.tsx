import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CalendarDays, Check, ChevronRight, Compass } from "lucide-react";
import type { Consultation } from "@/lib/health-store";
import { MOCK_APPOINTMENTS, appointmentDate } from "@/lib/mock-health";
import { CARE_JOURNEY } from "@/lib/content";

export type OpenStep = {
  consultationId: string;
  stepIndex: number;
  text: string;
  visitTitle: string;
  date: string;
};

export function deriveOpenSteps(consultations: Consultation[]): OpenStep[] {
  return consultations
    .filter((c) => c.status === "ready")
    .flatMap((c) =>
      c.actionSteps
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => !s.done)
        .map(({ s, i }) => ({
          consultationId: c.id,
          stepIndex: i,
          text: s.text,
          visitTitle: c.title || "Doctor visit",
          date: c.date,
        })),
    )
    .slice(0, 3);
}

export function nextJourneyItem(checked: Record<string, boolean>) {
  for (const phase of CARE_JOURNEY)
    for (const cat of phase.categories)
      for (const item of cat.items) if (!checked[item.id]) return { item, phase };
  return null;
}

type Props = {
  openSteps: OpenStep[];
  healthHydrated: boolean;
  hubConnected: boolean;
  checkedItems: Record<string, boolean>;
  onToggleStep: (consultationId: string, stepIndex: number) => void;
};

const rowMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
};

export function NextUpSection({
  openSteps,
  healthHydrated,
  hubConnected,
  checkedItems,
  onToggleStep,
}: Props) {
  const nextAppt = hubConnected ? MOCK_APPOINTMENTS[0] : null;
  const journey = nextJourneyItem(checkedItems);
  const empty = healthHydrated && openSteps.length === 0 && !nextAppt && !journey;

  return (
    <div className="space-y-2.5">
      {!healthHydrated && (
        <div className="rounded-2xl bg-card border border-border p-4 shadow-soft animate-pulse">
          <div className="h-3 w-2/3 rounded-full bg-muted" />
        </div>
      )}

      {openSteps.map((step, i) => (
        <motion.div
          key={`${step.consultationId}-${step.stepIndex}`}
          {...rowMotion}
          transition={{ delay: i * 0.05 }}
        >
          <div className="rounded-2xl bg-card border border-border p-4 shadow-soft paper-grain flex items-start gap-3">
            <button
              onClick={() => onToggleStep(step.consultationId, step.stepIndex)}
              className="mt-0.5 h-5 w-5 rounded-full border border-border bg-background flex items-center justify-center shrink-0 hover:border-sage transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Mark step done"
            >
              <Check className="h-3 w-3 opacity-0" strokeWidth={2.5} />
            </button>
            <Link to="/health" className="flex-1 min-w-0 group">
              <p className="text-sm text-foreground/85 leading-relaxed">{step.text}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                From {step.visitTitle} · {step.date}
              </p>
            </Link>
            <ChevronRight
              className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5"
              strokeWidth={1.6}
            />
          </div>
        </motion.div>
      ))}

      {nextAppt && (
        <motion.div {...rowMotion} transition={{ delay: openSteps.length * 0.05 }}>
          <Link
            to="/health"
            search={{ view: "team" }}
            className="rounded-2xl bg-card border border-border p-4 shadow-soft paper-grain flex items-center gap-3 hover:bg-muted/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="h-9 w-9 rounded-full bg-clay-soft/40 flex items-center justify-center shrink-0">
              <CalendarDays className="h-4 w-4 text-foreground/70" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/85">{nextAppt.purpose}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {appointmentDate(nextAppt).toLocaleDateString("en-SG", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
                {" · "}
                {nextAppt.time} · {nextAppt.clinic}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.6} />
          </Link>
        </motion.div>
      )}

      {journey && (
        <motion.div
          {...rowMotion}
          transition={{ delay: (openSteps.length + (nextAppt ? 1 : 0)) * 0.05 }}
        >
          <Link
            to="/care-journey"
            className="rounded-2xl bg-card border border-border p-4 shadow-soft paper-grain flex items-center gap-3 hover:bg-muted/30 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="h-9 w-9 rounded-full bg-sage-soft/50 flex items-center justify-center shrink-0">
              <Compass className="h-4 w-4 text-foreground/70" strokeWidth={1.6} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground/85">{journey.item.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Next on the journey · {journey.phase.title}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.6} />
          </Link>
        </motion.div>
      )}

      {empty && (
        <div className="rounded-2xl bg-card border border-dashed border-border p-5 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nothing pressing today. Rest counts as progress.
          </p>
        </div>
      )}
    </div>
  );
}
