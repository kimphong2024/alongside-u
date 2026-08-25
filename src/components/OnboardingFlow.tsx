import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAppData } from "@/lib/store";
import heartImg from "@/assets/arms-hugging-heart.png";
import processWavesImg from "@/assets/onboarding-process-waves.png";
import checklistImg from "@/assets/onboarding-checklist.png";

const TILES = [
  {
    title: "Let me process this a bit more",
    description: "A quiet space to breathe, with gentle support around you.",
    meta: "Open anytime",
    illustration: processWavesImg,
    to: "/support" as const,
    // This path skips the intake questionnaire, so it must mark onboarding
    // complete itself or the Today gate bounces the user back here forever.
    completes: true,
    gradient: "radial-gradient(120% 100% at 20% 15%, #F4D7DE 0%, #EBD5E6 45%, #E0D2EC 100%)",
  },
  {
    title: "Show me what needs to be done",
    description: "A few questions, then a clear path of next steps for the family.",
    meta: "About 5 minutes",
    illustration: checklistImg,
    to: "/care-journey-intro" as const,
    completes: false,
    gradient: "radial-gradient(120% 100% at 25% 20%, #DDEAD3 0%, #CFE5CC 50%, #D8EBD4 100%)",
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
              className="group flex items-center gap-4 sm:gap-5 rounded-3xl border border-border/40 p-5 sm:p-6 shadow-soft paper-grain hover:shadow-paper hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left"
              style={{ backgroundImage: t.gradient }}
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-2xl leading-tight text-foreground/90 text-balance">
                  {t.title}
                </h3>
                <p className="text-sm text-foreground/75 leading-relaxed mt-1.5">{t.description}</p>
                <p className="text-xs text-foreground/60 mt-2.5">{t.meta}</p>
              </div>
              <img
                src={t.illustration}
                alt=""
                className="h-24 w-28 sm:h-28 sm:w-36 object-contain shrink-0 select-none group-hover:scale-105 transition-transform duration-500"
              />
              <ArrowRight
                className="h-4 w-4 text-foreground/50 group-hover:translate-x-0.5 group-hover:text-foreground/80 transition shrink-0"
                strokeWidth={1.6}
              />
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
