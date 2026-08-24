import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, ShieldCheck, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/BottomSheet";
import { MOCK_KEYS, readMockFlag, writeMockFlag } from "@/lib/mock-health";
import singpassMock from "@/assets/singpass-mock.png";

const CONNECT_STAGES = [
  "Contacting Singpass…",
  "Verifying your identity…",
  "Syncing HealthHub & NUHS records…",
];

type Props = { onConnectedChange: (v: boolean) => void };

export function HealthHubCard({ onConnectedChange }: Props) {
  const [connected, setConnected] = useState(() => readMockFlag(MOCK_KEYS.healthhub));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [stage, setStage] = useState<number | null>(null);

  const startConnect = () => {
    setStage(0);
    CONNECT_STAGES.forEach((_, i) => {
      setTimeout(() => setStage(i), i * 850);
    });
    setTimeout(() => {
      setStage(null);
      setSheetOpen(false);
      setConnected(true);
      writeMockFlag(MOCK_KEYS.healthhub, true);
      onConnectedChange(true);
    }, CONNECT_STAGES.length * 850 + 400);
  };

  if (connected) {
    return (
      <div className="rounded-2xl bg-sage-soft/40 border border-sage/30 p-4 flex items-center gap-3 paper-grain">
        <div className="h-10 w-10 rounded-full bg-sage/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-5 w-5 text-foreground/70" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground/85">HealthHub & NUHS connected</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-sage inline-block" />
            Last synced just now
          </p>
        </div>
        <button
          className="text-muted-foreground hover:text-foreground transition p-2"
          aria-label="Sync now"
          onClick={() => {}}
        >
          <RefreshCw className="h-4 w-4" strokeWidth={1.6} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl bg-card border border-border shadow-soft p-5 paper-grain">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-clay-soft/40 flex items-center justify-center shrink-0">
            <Link2 className="h-5 w-5 text-foreground/70" strokeWidth={1.6} />
          </div>
          <div className="flex-1">
            <h4 className="font-serif italic text-lg text-foreground/90 leading-snug">
              Bring their records together
            </h4>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Sync appointments, medications and reports from HealthHub and NUHS — so
              everything lives in one gentle place.
            </p>
            <Button
              onClick={() => setSheetOpen(true)}
              className="mt-3 rounded-xl h-10 bg-foreground text-background hover:bg-foreground/90"
            >
              Connect with Singpass
            </Button>
          </div>
        </div>
      </div>

      <BottomSheet open={sheetOpen} onOpenChange={(v) => stage === null && setSheetOpen(v)} labelledBy="healthhub-sheet-title">
        <h2 id="healthhub-sheet-title" className="font-serif text-3xl italic font-light text-foreground/90">
          connect your records
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Log in with Singpass to sync HealthHub and NUHS — appointments, medications and
          reports, kept private to your family.
        </p>

        <div className="mt-5 rounded-2xl overflow-hidden border border-border">
          <img src={singpassMock} alt="Singpass login" className="w-full object-cover" />
        </div>

        <AnimatePresence mode="wait">
          {stage === null ? (
            <motion.div key="cta" exit={{ opacity: 0 }} className="pt-4">
              <Button
                onClick={startConnect}
                className="w-full rounded-xl h-12 bg-[#B0262D] hover:bg-[#9a2127] text-white font-medium"
              >
                Log in with Singpass
              </Button>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Demo preview — no real Singpass login happens here.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-5 space-y-2.5"
            >
              {CONNECT_STAGES.map((label, i) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  {i < stage ? (
                    <Check className="h-4 w-4 text-sage" strokeWidth={2} />
                  ) : i === stage ? (
                    <motion.span
                      className="h-4 w-4 rounded-full border-2 border-clay border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                    />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-border" />
                  )}
                  <span className={i <= stage ? "text-foreground/85" : "text-muted-foreground"}>{label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </BottomSheet>
    </>
  );
}
