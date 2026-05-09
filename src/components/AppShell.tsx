import { Link, useRouterState } from "@tanstack/react-router";
import { Compass, Heart, LifeBuoy } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import flowerLogo from "@/assets/flower-logo.png";

const tabs = [
  { to: "/care-journey", label: "Journey", icon: Compass },
  { to: "/moments", label: "Moments", icon: Heart },
  { to: "/support", label: "Support", icon: LifeBuoy },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 pt-7 pb-2 flex items-center justify-between max-w-2xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2" aria-label="Today">
          <img src={flowerLogo} alt="" className="h-10 w-10 object-contain" />
          <span className="font-serif text-2xl tracking-tight">Alongside</span>
        </Link>
      </header>

      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1 w-full max-w-2xl mx-auto px-5 pb-32 pt-4"
      >
        {children}
      </motion.main>

      <nav className="fixed bottom-0 inset-x-0 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-2xl px-4 pb-4">
          <div className="rounded-3xl bg-card/85 backdrop-blur-xl border border-border shadow-soft px-2 py-2 flex justify-between">
            {tabs.map(({ to, label, icon: Icon }) => {
              const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative flex-1 flex flex-col items-center gap-0.5 py-2 px-1 rounded-2xl"
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-2xl bg-sage-soft"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className={`relative h-5 w-5 ${active ? "text-foreground" : "text-muted-foreground"}`} strokeWidth={1.6} />
                  <span className={`relative text-[11px] ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
