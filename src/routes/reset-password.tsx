import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import authBg from "@/assets/auth-bg.png";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password - Alongside" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  // Wait for Supabase to parse the recovery hash and establish a session
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
      navigate({ to: "/onboarding" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px] rounded-3xl bg-card/95 backdrop-blur border border-border shadow-paper p-7 paper-grain"
      >
        <h1 className="font-serif italic text-3xl text-center mb-1.5">Set a new password</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Choose something you'll remember.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              strokeWidth={1.6}
            />
            <Input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              className="pl-9 h-11 rounded-xl bg-background"
            />
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              strokeWidth={1.6}
            />
            <Input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm password"
              className="pl-9 h-11 rounded-xl bg-background"
            />
          </div>
          <Button
            type="submit"
            disabled={busy || !ready}
            className="w-full h-11 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-serif italic text-base"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : ready ? (
              "Update password"
            ) : (
              "Verifying link…"
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
