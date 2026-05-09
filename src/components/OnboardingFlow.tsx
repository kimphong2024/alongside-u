import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "@tanstack/react-router";
import { ArrowRight, Wind, ListChecks, Images } from "lucide-react";
import { useAppData } from "@/lib/store";
import heartImg from "@/assets/arms-hugging-heart.png";

const TILES = [
  { title: "Let me process this a bit more", icon: Wind, to: "/support" as const },
  { title: "Show me what needs to be done", icon: ListChecks, to: "/care-journey" as const },
  { title: "Help me relive my memories", icon: Images, to: "/moments" as const },
];

export function OnboardingFlow() {
  const navigate = useNavigate();
  const { hydrated, user, onboarding, saveOnboarding } = useAppData();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!onboarding.completed) {
      saveOnboarding({ completed: true });
    }
  }, [hydrated, user, onboarding.completed, navigate, saveOnboarding]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 max-w-xl mx-auto w-full">
      <motion.img
        src={heartImg}
        alt=""
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="h-40 w-40 object-contain drop-shadow-sm"
      />

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        className="mt-6 text-3xl md:text-4xl font-serif font-light text-balance text-center leading-snug"
      >
        You are not alone. What shall we do today?
      </motion.h1>

      <div className="mt-10 w-full space-y-3">
        {TILES.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.to}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: "easeOut" }}
            >
              <Link to={t.to} className="block group">
                <div className="flex items-center gap-5 rounded-2xl bg-card border border-border shadow-soft px-5 py-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-paper">
                  <Icon className="h-7 w-7 text-muted-foreground flex-shrink-0" strokeWidth={1.4} />
                  <span className="flex-1 font-serif text-lg leading-snug">{t.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition" strokeWidth={1.6} />
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
