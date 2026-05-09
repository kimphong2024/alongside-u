import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in — Alongside" }] }),
  component: AuthPage,
});

function QrGraphic() {
  // Decorative QR-like grid (21x21 modules), deterministic pattern
  const size = 21;
  const cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    // pseudo-random but stable
    cells.push(((i * 1103515245 + 12345) >> 8) % 3 === 0);
  }
  const finder = (x: number, y: number) => (
    <g key={`f-${x}-${y}`}>
      <rect x={x} y={y} width={7} height={7} fill="black" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="white" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="black" />
    </g>
  );
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" shapeRendering="crispEdges">
      <rect width={size} height={size} fill="white" />
      {cells.map((on, i) => {
        if (!on) return null;
        const x = i % size;
        const y = Math.floor(i / size);
        // skip finder regions
        if ((x < 8 && y < 8) || (x > size - 9 && y < 8) || (x < 8 && y > size - 9)) return null;
        // skip center icon area
        if (x >= 8 && x <= 12 && y >= 8 && y <= 12) return null;
        return <rect key={i} x={x} y={y} width={1} height={1} fill="black" />;
      })}
      {finder(0, 0)}
      {finder(size - 7, 0)}
      {finder(0, size - 7)}
    </svg>
  );
}

function SingpassWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-baseline font-extrabold lowercase tracking-tight text-[#F4333D] ${className}`}>
      <span>s</span>
      <span className="relative inline-block">
        <span>i</span>
        <span
          className="absolute left-1/2 -translate-x-1/2 -top-[0.18em] w-[0.32em] h-[0.32em] rounded-full bg-black"
          aria-hidden
        />
      </span>
      <span>ngpass</span>
    </span>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [tab, setTab] = useState<"app" | "password">("app");

  useEffect(() => {
    if (!loading && isAuthenticated) navigate({ to: "/" });
  }, [isAuthenticated, loading, navigate]);

  const handleSingpass = async () => {
    if (busy) return;
    setBusy(true);
    setStatus("Redirecting to Singpass…");
    try {
      await new Promise((r) => setTimeout(r, 1000));
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
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[420px]"
      >
        <div className="rounded-2xl bg-white shadow-soft border border-border overflow-hidden">
          {/* Tabs */}
          <div className="grid grid-cols-2 pt-5 px-2 bg-white">
            {(["app", "password"] as const).map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`relative pb-3 text-base transition-colors ${
                    active ? "text-[#F4333D] font-bold" : "text-muted-foreground font-semibold"
                  }`}
                >
                  {t === "app" ? "Singpass app" : "Password login"}
                  {active && (
                    <span className="absolute left-4 right-4 bottom-0 h-[2px] bg-[#F4333D] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="h-px bg-border/60" />

          {/* Body */}
          {tab === "app" ? (
            <div className="px-8 pt-8 pb-8 bg-white">
              <h1 className="text-center text-[22px] leading-tight">
                <span className="font-bold text-foreground">
                  {status ?? "Scan with Singpass app"}
                </span>
                {!status && (
                  <>
                    <br />
                    <span className="text-foreground/80 font-normal">to log in</span>
                  </>
                )}
              </h1>

              <button
                type="button"
                onClick={handleSingpass}
                disabled={busy}
                aria-label="Sign in with Singpass (demo)"
                className="mt-6 w-full aspect-square rounded-2xl border-[3px] border-[#F4333D] p-4 bg-white relative transition-transform active:scale-[0.99] disabled:cursor-wait"
              >
                <div className="w-full h-full relative">
                  <QrGraphic />
                  {/* Center person tile */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[22%] h-[22%] rounded-xl bg-[#F4333D] flex items-center justify-center shadow-md">
                      <svg viewBox="0 0 24 24" className="w-2/3 h-2/3 text-white" fill="currentColor" aria-hidden>
                        <circle cx="12" cy="8" r="3.2" />
                        <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6v1H5v-1z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </button>

              <div className="mt-5 flex justify-center">
                <SingpassWordmark className="text-3xl" />
              </div>
            </div>
          ) : (
            <div className="px-8 py-12 bg-white text-center">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Password login is disabled in this demo.
                <br />
                Please use the <span className="font-semibold text-foreground">Singpass app</span> tab.
              </p>
            </div>
          )}

          {/* Footer links */}
          <div className="bg-muted/50 px-6 py-5 border-t border-border/60 flex flex-col items-center gap-3">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[#3B4CCA] underline underline-offset-2 font-semibold text-base"
            >
              Register for Singpass
            </a>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[#3B4CCA] underline underline-offset-2 text-base"
            >
              Download Singpass app
            </a>
          </div>
        </div>

        <p className="text-xs text-muted-foreground/80 text-center mt-6">
          Powered by Alongside · Demo mode
        </p>
      </motion.div>
    </div>
  );
}
