import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";

export function IntakeNudgeCard() {
  return (
    <Link to="/care-journey-intro" className="block group">
      <div className="rounded-2xl bg-clay-soft/30 border border-clay/30 p-5 flex items-center gap-3 hover:bg-clay-soft/40 transition">
        <div className="h-10 w-10 rounded-full bg-background/70 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5 text-foreground/70" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground/85">Make Alongside yours</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            A few questions about your situation, so the journey fits your family. ~5 minutes.
          </p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition shrink-0" />
      </div>
    </Link>
  );
}
