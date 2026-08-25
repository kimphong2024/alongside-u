import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CardVignette } from "./art";
import type { CardKind } from "./art";

export type Suggestion = {
  kind: CardKind;
  title: string;
  why: string;
  effort: string;
  link: "/support" | "/care-journey" | "/moments" | "/health" | "/health/guide";
};

// One gentle suggestion, chosen for the day — never a stack of demands.
export function pickSuggestion(isHeavy: boolean): Suggestion {
  if (isHeavy) {
    return {
      kind: "breath",
      title: "Take three slow breaths",
      why: "Begin with the smallest step.",
      effort: "1 minute",
      link: "/support",
    };
  }
  return new Date().getDate() % 2 === 0
    ? {
        kind: "subsidies",
        title: "Review available caregiving subsidies",
        why: "Many families find this eases long-term stress.",
        effort: "10 minutes",
        link: "/care-journey",
      }
    : {
        kind: "questions",
        title: "Note one question for the next medical visit",
        why: "Clarity often matters more than answers.",
        effort: "5 minutes",
        link: "/care-journey",
      };
}

export function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <Link
      to={suggestion.link}
      className="group block rounded-2xl bg-gradient-warm border border-border p-5 shadow-soft hover:shadow-paper transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            If you have {suggestion.effort}
          </p>
          <h3 className="font-serif text-xl leading-snug mt-1">{suggestion.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{suggestion.why}</p>
        </div>
        <CardVignette kind={suggestion.kind} />
        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition flex-shrink-0" />
      </div>
    </Link>
  );
}
