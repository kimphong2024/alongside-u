import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import authBg from "@/assets/auth-bg.png";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Alongside" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/onboarding" });
  }, [isAuthenticated, loading, navigate]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      if (tab === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/onboarding" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/onboarding` },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw result.error;
      if (result.redirected) return;
      navigate({ to: "/onboarding" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not sign in with Google";
      toast.error(msg);
      setBusy(false);
    }
  };

  const handleGuest = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      navigate({ to: "/onboarding" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not continue as guest";
      toast.error(msg);
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Reset link sent — check your inbox.");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[420px] rounded-3xl bg-card/95 backdrop-blur border border-border shadow-paper p-7 paper-grain"
      >
        <div className="text-center mb-6">
          <h1 className="font-serif italic text-3xl text-foreground/90 leading-snug">
            Welcome to Alongside
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            A gentle place to walk this journey.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-muted/50 rounded-full mb-5">
          {(["signin", "signup"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative py-2 rounded-full text-sm transition ${
                tab === t ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="auth-tab-pill"
                  className="absolute inset-0 rounded-full bg-card shadow-soft border border-border/60"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t === "signin" ? "Sign in" : "Sign up"}</span>
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full h-11 rounded-xl bg-background border-border hover:bg-muted/40 gap-2 font-normal"
        >
          <GoogleIcon className="h-4 w-4" />
          Continue with Google
        </Button>

        <div className="flex items-center gap-3 my-5">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleEmail} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="pl-9 h-11 rounded-xl bg-background"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" strokeWidth={1.6} />
            <Input
              type="password"
              required
              minLength={6}
              autoComplete={tab === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="pl-9 h-11 rounded-xl bg-background"
            />
          </div>

          {tab === "signin" && (
            <button
              type="button"
              onClick={handleForgot}
              className="text-xs text-muted-foreground hover:text-foreground transition block ml-auto"
            >
              Forgot password?
            </button>
          )}

          <Button
            type="submit"
            disabled={busy}
            className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-serif italic text-base"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : tab === "signin" ? "Sign in" : "Create account"}
          </Button>
        </form>

        <p className="text-[11px] text-muted-foreground/70 text-center mt-5 leading-relaxed">
          By continuing you agree to our gentle promise to keep your reflections private.
        </p>
      </motion.div>

      <Link to="/" className="text-xs text-muted-foreground/70 mt-6 hover:text-foreground transition">
        ← Back home
      </Link>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.1l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.1z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.1 5.6l6.2 5.2C40.9 35.6 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
