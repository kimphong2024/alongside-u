import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

type Props = {
  checkedCount: number;
  totalCount: number;
  nextItemTitle?: string;
};

export function JourneyProgressCard({ checkedCount, totalCount, nextItemTitle }: Props) {
  const ratio = totalCount > 0 ? checkedCount / totalCount : 0;
  return (
    <Link to="/care-journey" className="block group">
      <div className="rounded-[1.75rem] bg-card border border-border p-7 shadow-soft hover:shadow-paper transition-all duration-500">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-2xl leading-snug">The journey so far</h3>
          <span className="text-sm text-muted-foreground tabular-nums shrink-0">
            {checkedCount} of {totalCount}
          </span>
        </div>
        <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-sage transition-all duration-700"
            style={{ width: `${Math.max(ratio * 100, checkedCount > 0 ? 4 : 0)}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          {nextItemTitle ? (
            <>Up next: <span className="text-foreground/80">{nextItemTitle}</span></>
          ) : (
            "Every step is done. That took real strength."
          )}
        </p>
        <div className="flex items-center gap-1.5 mt-4 text-sm text-foreground/70 group-hover:text-foreground transition">
          <span>Open the journey</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </Link>
  );
}
