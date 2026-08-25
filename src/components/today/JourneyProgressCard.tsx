import { Link } from "@tanstack/react-router";
import { ArrowRight, Compass } from "lucide-react";

type Props = {
  phaseTitle: string;
  checkedInPhase: number;
  totalInPhase: number;
  allDone: boolean;
};

// Phase-scoped on purpose: "2 of 6 in this chapter" is gentle; "0 of 44" is a wall.
export function JourneyProgressCard({ phaseTitle, checkedInPhase, totalInPhase, allDone }: Props) {
  const ratio = totalInPhase > 0 ? checkedInPhase / totalInPhase : 0;
  return (
    <Link
      to="/care-journey"
      className="group block rounded-2xl bg-card border border-border p-5 shadow-soft hover:shadow-paper transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        <Compass className="h-4 w-4" strokeWidth={1.6} />
        <span className="text-sm">The journey</span>
      </div>
      {allDone ? (
        <p className="font-serif text-xl leading-snug mt-2">Every step is done.</p>
      ) : (
        <>
          <p className="font-serif text-xl leading-snug mt-2">{phaseTitle}</p>
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-sage transition-all duration-700"
              style={{ width: `${Math.max(ratio * 100, checkedInPhase > 0 ? 6 : 0)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {checkedInPhase} of {totalInPhase} in this chapter
          </p>
        </>
      )}
      <span className="inline-flex items-center gap-1.5 mt-3 text-sm text-foreground/75 group-hover:text-foreground transition">
        Open the journey
        <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
      </span>
    </Link>
  );
}
