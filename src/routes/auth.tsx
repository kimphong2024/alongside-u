import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Lock } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Alongside" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, loading, navigate]);

  const handleSingpass = async () => {
    setBusy(true);
    setStatus("Redirecting to Singpass…");
    try {
      // Mock the Singpass redirect feel
      await new Promise((r) => setTimeout(r, 1200));
      setStatus("Verifying your identity…");

      // Demo session — generates a stable per-browser identity so the rest
      // of the app (profiles, RLS, _authenticated routes) keeps working.
      const key = "singpass_demo_id";
      let demoId = localStorage.getItem(key);
      if (!demoId) {
        demoId = crypto.randomUUID();
        localStorage.setItem(key, demoId);
      }
      const email = `demo-${demoId}@singpass.local`;
      const password = `Sp!${demoId}`;

      const signIn = await supabase.auth.signInWithPassword({ email, password });
      if (signIn.error) {
        const signUp = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (signUp.error) throw signUp.error;
        await supabase.auth.signInWithPassword({ email, password });
      }
      navigate({ to: "/" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
      setStatus(null);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <span className="h-9 w-9 rounded-full bg-gradient-dawn shadow-glow" />
          <span className="font-serif text-2xl">Alongside</span>
        </Link>

        <div className="rounded-3xl bg-card border border-border shadow-soft p-7">
          <h1 className="font-serif text-3xl text-balance text-center">
            Welcome.
          </h1>
          <p className="text-sm text-muted-foreground text-center mt-2 leading-relaxed">
            Sign in securely with your Singpass account to continue your journey.
          </p>

          <Button
            type="button"
            onClick={handleSingpass}
            disabled={busy}
            className="w-full h-14 rounded-xl mt-6 bg-[#F4333D] hover:bg-[#D92A33] text-white font-semibold text-base shadow-soft transition-colors"
          >
            <Lock className="h-4 w-4 mr-2" strokeWidth={2.5} />
            <span>Sign in with</span>
            <span className="ml-1.5 font-bold tracking-tight italic">
              singpass
            </span>
          </Button>

          {status && (
            <p className="text-sm text-muted-foreground text-center mt-4 animate-pulse">
              {status}
            </p>
          )}

          <div className="mt-6 rounded-xl bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              <span className="font-medium text-foreground">Demo mode</span> — full
              Singpass integration coming soon. A private demo session will be created for you.
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/80 text-center mt-6 leading-relaxed max-w-xs mx-auto">
          Your information is private and only visible to you.
        </p>
      </motion.div>
    </div>
  );
}
