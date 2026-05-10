import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import singpassMock from "@/assets/singpass-mock.png";
import authBg from "@/assets/auth-bg.png";

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
    if (busy) return;
    setBusy(true);
    setStatus("Redirecting to Singpass…");
    try {
      await new Promise((r) => setTimeout(r, 800));
      setStatus("Verifying your identity…");

      const key = "singpass_demo_id";
      let demoId = localStorage.getItem(key);
      if (!demoId) {
        demoId = crypto.randomUUID();
        localStorage.setItem(key, demoId);
      }
      const email = `demo-${demoId}@singpass.local`;
      const password = `Sp!${demoId}`;

      const signIn = await supabase.auth.signInWithPassword({ email, password });
      let userId = signIn.data.user?.id;
      if (signIn.error || !userId) {
        const signUp = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (signUp.error) throw signUp.error;
        const retry = await supabase.auth.signInWithPassword({ email, password });
        userId = retry.data.user?.id;
      }

      // Always land on the 3-tile chooser after login
      navigate({ to: "/onboarding" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
      setStatus(null);
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-cover bg-center relative"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: busy ? 0 : 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px]"
      >
        <button
          type="button"
          onClick={handleSingpass}
          disabled={busy}
          aria-label="Sign in with Singpass (demo)"
          className="block w-full rounded-2xl overflow-hidden shadow-soft transition-transform active:scale-[0.99] disabled:cursor-wait"
        >
          <img src={singpassMock} alt="Sign in with Singpass" className="w-full h-auto block" />
        </button>

        <p className="text-xs text-muted-foreground/80 text-center mt-6">
          Powered by Alongside · Demo mode — tap to continue
        </p>
      </motion.div>

      {/* Full-bleed loading overlay — covers the auth UI and persists across navigation */}
      {busy && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center gap-4"
        >
          <div className="h-8 w-8 rounded-full border-2 border-border border-t-foreground/60 animate-spin" />
          {status && (
            <p className="text-sm text-muted-foreground font-serif italic">{status}</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
