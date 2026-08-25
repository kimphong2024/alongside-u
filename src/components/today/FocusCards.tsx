import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { CardVignette } from "./art";
import type { CardKind } from "./art";

type Focus = {
  kind: CardKind;
  title: string;
  why: string;
  effort: string;
  link: "/support" | "/care-journey" | "/moments" | "/health" | "/health/guide";
};

type Props = {
  isHeavy: boolean;
  loveeName: string;
  hasOpenSteps: boolean;
};

export function FocusCards({ isHeavy, loveeName, hasOpenSteps }: Props) {
  const focuses: Focus[] = isHeavy
    ? [
        { kind: "breath", title: "Take three slow breaths", why: "Begin with the smallest step.", effort: "1 minute", link: "/support" },
        { kind: "talk", title: "Talk it through, no judgement", why: "The everyday battles are easier said out loud.", effort: "5 minutes", link: "/health/guide" },
      ]
    : [
        { kind: "subsidies", title: "Review available caregiving subsidies", why: "Many families find this eases long-term stress.", effort: "10 minutes", link: "/care-journey" },
        { kind: "questions", title: "Note one question for the next medical visit", why: "Clarity often matters more than answers.", effort: "5 minutes", link: "/care-journey" },
        hasOpenSteps
          ? { kind: "visitSteps", title: "Pick up where the last visit left off", why: "A few next steps are waiting from the doctor.", effort: "5 minutes", link: "/health" }
          : { kind: "moment", title: `Suggest one small moment with ${loveeName}`, why: "These are the memories that stay.", effort: "Today", link: "/moments" },
      ];

  return (
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
  );
}
