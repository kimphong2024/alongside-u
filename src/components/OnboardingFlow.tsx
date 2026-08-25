import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight, Wind, ListChecks } from "lucide-react";
import { useAppData } from "@/lib/store";
import heartImg from "@/assets/arms-hugging-heart.png";
import processWavesImg from "@/assets/onboarding-process-waves.png";
import checklistImg from "@/assets/onboarding-checklist.png";

const TILES = [
  {
    title: "Let me process this a bit more",
    icon: Wind,
    illustration: processWavesImg,
    to: "/support" as const,
    // This path skips the intake questionnaire, so it must mark onboarding
    // complete itself or the Today gate bounces the user back here forever.
    completes: true,
    gradient: "radial-gradient(120% 100% at 20% 15%, #F4D7DE 0%, #EBD5E6 45%, #E0D2EC 100%)",
  },
  {
    title: "Show me what needs to be done",
    icon: ListChecks,
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
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 max-w-4xl mx-auto w-full">
      <motion.img
        src={heartImg}
        alt=""
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-40 w-40 object-contain"
      />

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="mt-4 w-full max-w-2xl mx-auto text-3xl md:text-4xl font-serif font-light text-balance text-center leading-snug"
      >
        Welcome back. What shall we do today?
      </motion.h1>

      <div className="mt-10 w-full grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-stretch">
        {TILES.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.07, ease: "easeOut" }}
            >
              <Link
                to={t.to}
                className="block group"
                onClick={() => {
                  // Spread the current onboarding — saveOnboarding upserts the
                  // full profiles row and would null out absent fields.
                  if (t.completes) void saveOnboarding({ ...onboarding, completed: true });
                }}
              >
                <div
                  className="relative aspect-square rounded-3xl border border-border/40 shadow-soft p-6 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-paper"
                  style={{ backgroundImage: t.gradient }}
                >
                  <img
                    src={t.illustration}
                    alt=""
                    className="absolute inset-x-0 top-1/2 -translate-y-[58%] mx-auto w-[78%] max-h-[68%] object-contain pointer-events-none select-none opacity-95 transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="relative flex items-start justify-between">
                    <Icon className="h-7 w-7 text-foreground/70" strokeWidth={1.4} />
                    <ArrowRight
                      className="h-4 w-4 text-foreground/50 group-hover:translate-x-0.5 group-hover:text-foreground/80 transition"
                      strokeWidth={1.6}
                    />
                  </div>
                  <h3 className="relative font-serif text-2xl leading-tight text-foreground/90 text-balance">
                    {t.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <p className="mt-10 text-xs uppercase tracking-[0.2em] text-muted-foreground/70">
        Move at your own pace
      </p>
    </div>
  );
}
