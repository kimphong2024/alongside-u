import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAppData } from "@/lib/store";
import heartImg from "@/assets/arms-hugging-heart.png";
import processBleedImg from "@/assets/onboarding-process-bleed.jpg";
import checklistBleedImg from "@/assets/onboarding-checklist-bleed.jpg";

const TILES = [
  {
    title: "Let me process this a bit more",
    description: "A quiet space to breathe, with gentle support around you.",
    meta: "Open anytime",
    art: processBleedImg,
    to: "/support" as const,
    // This path skips the intake questionnaire, so it must mark onboarding
    // complete itself or the Today gate bounces the user back here forever.
    completes: true,
  },
  {
    title: "Show me what needs to be done",
    description: "A few questions, then a clear path of next steps for the family.",
    meta: "About 5 minutes",
    art: checklistBleedImg,
    to: "/care-journey-intro" as const,
    completes: false,
  },
];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { hydrated, user, onboarding, saveOnboarding } = useAppData();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      navigate({ to: "/auth" });
      return;
    }
  }, [hydrated, user, navigate]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center px-5 py-10 max-w-xl mx-auto w-full">
      <motion.img
        src={heartImg}
        alt=""
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto h-20 w-20 object-contain"
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="text-center mt-4"
      >
        <h1 className="text-4xl font-serif font-light text-balance leading-snug">
          How would you like to begin?
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mt-2">
          There's no wrong door — both spaces stay open to you.
        </p>
      </motion.div>

      <div className="mt-8 space-y-4">
        {TILES.map((t, i) => (
          <motion.div
            key={t.to}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease: "easeOut" }}
          >
            <Link
              to={t.to}
              onClick={() => {
                // Spread the current onboarding — saveOnboarding upserts the
                // full profiles row and would null out absent fields.
                if (t.completes) void saveOnboarding({ ...onboarding, completed: true });
              }}
              className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-border/40 p-5 sm:p-6 min-h-[10rem] shadow-soft paper-grain hover:shadow-paper hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
            >
              {/* Full-bleed watercolor: motif lives on the right, wash on the left. */}
              <img
                src={t.art}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-right select-none group-hover:scale-[1.03] transition-transform duration-700"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-card/70 via-card/20 to-transparent"
              />
              <div className="relative flex-1 min-w-0 max-w-[62%] sm:max-w-[58%]">
                <h3 className="font-serif text-2xl leading-tight text-foreground/90 text-balance">
                  {t.title}
                </h3>
                <p className="text-sm text-foreground/75 leading-relaxed mt-1.5">{t.description}</p>
                <p className="text-xs text-foreground/70 mt-2.5">{t.meta}</p>
              </div>
              <span className="relative ml-auto h-8 w-8 rounded-full bg-card/70 border border-border/50 flex items-center justify-center shrink-0 group-hover:bg-card transition">
                <ArrowRight
                  className="h-4 w-4 text-foreground/70 group-hover:translate-x-0.5 transition"
                  strokeWidth={1.6}
                />
              </span>
            </Link>
          </motion.div>
        ))}
      </div>

      <p className="mt-10 text-xs uppercase tracking-[0.2em] text-muted-foreground/70 text-center">
        Move at your own pace
      </p>
    </div>
  );
}
