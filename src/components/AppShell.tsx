import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Compass, Heart, LogOut, Stethoscope, Sun, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { toast } from "sonner";
import flowerLogo from "@/assets/flower-logo.png";
import { useAuth, signOut } from "@/hooks/use-auth";

const tabs = [
  { to: "/", label: "Today", icon: Sun },
  { to: "/care-journey", label: "Journey", icon: Compass },
  { to: "/health", label: "Health", icon: Stethoscope },
  { to: "/moments", label: "Moments", icon: Heart },
  { to: "/support", label: "You", icon: UserRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full bg-background/85 backdrop-blur-md border-b border-border/40">
        <div className="px-5 py-3 flex items-center justify-between max-w-2xl mx-auto w-full">
          <Link to="/" className="flex items-center gap-2" aria-label="Today">
            <img src={flowerLogo} alt="" className="h-9 w-9 object-contain" />
            <span className="font-serif text-2xl tracking-tight">Alongside</span>
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 h-9 px-2 sm:px-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.6} />
              <span className="hidden sm:inline text-sm">Log out</span>
            </button>
          )}
        </div>
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
          <div className="rounded-3xl bg-card/90 backdrop-blur-xl border border-border/70 shadow-soft px-2 py-2 flex justify-between">
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
                      className="absolute inset-0 rounded-2xl bg-background shadow-soft border border-border/50"
                      transition={{ type: "spring", stiffness: 500, damping: 40 }}
                    />
                  )}
                  <Icon className={`relative h-5 w-5 ${active ? "text-accent-active" : "text-muted-foreground"}`} strokeWidth={1.6} />
                  <span className={`relative text-[11px] ${active ? "text-accent-active font-medium" : "text-muted-foreground"}`}>
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
