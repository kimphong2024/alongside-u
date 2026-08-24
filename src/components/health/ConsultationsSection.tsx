import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, ChevronRight, AlertCircle, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConsultationRecorder } from "./ConsultationRecorder";
import { ConsultationDetail } from "./ConsultationDetail";
import type { Consultation } from "@/lib/health-store";
import type { OnboardingData } from "@/lib/store";

type Props = {
  consultations: Consultation[];
  onboarding: OnboardingData;
};

const fmtDate = (iso: string) => {
  const d = new Date(iso + "T00:00:00");
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-SG", { weekday: "short", day: "numeric", month: "short" });
};

function StatusChip({ status }: { status: Consultation["status"] }) {
  if (status === "processing") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <motion.span
          className="h-3 w-3 rounded-full border-[1.5px] border-clay border-t-transparent inline-block"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
        Writing notes…
      </span>
    );
  }
  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-clay">
        <AlertCircle className="h-3 w-3" strokeWidth={1.8} /> Needs retry
      </span>
    );
  }
  return null;
}

export function ConsultationsSection({ consultations, onboarding }: Props) {
  const [recorderOpen, setRecorderOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const detail = consultations.find((c) => c.id === detailId) ?? null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Doctor visits</h3>
        <Button
          size="sm"
          onClick={() => setRecorderOpen(true)}
          className="rounded-full h-8 px-3 bg-foreground text-background hover:bg-foreground/90 text-xs"
        >
          <Mic className="h-3.5 w-3.5 mr-1" strokeWidth={1.8} /> Record a visit
        </Button>
      </div>

      {consultations.length === 0 ? (
        <div className="rounded-2xl bg-card border border-border shadow-soft p-5 paper-grain text-center">
          <Stethoscope className="h-6 w-6 mx-auto text-muted-foreground" strokeWidth={1.4} />
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Record the next consultation and we'll turn it into notes, a summary and next
            steps — so the whole family stays on the same page.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {consultations.map((c) => (
            <button
              key={c.id}
              onClick={() => setDetailId(c.id)}
              className="w-full text-left rounded-2xl bg-card border border-border shadow-soft p-4 paper-grain hover:bg-muted/30 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{fmtDate(c.date)}</p>
                  <p className="font-serif italic text-lg text-foreground/90 truncate leading-snug">
                    {c.title || "Doctor visit"}
                  </p>
                  {c.status === "ready" && c.summary && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {c.summary}
                    </p>
                  )}
                  <div className="mt-1"><StatusChip status={c.status} /></div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={1.6} />
              </div>
            </button>
          ))}
        </div>
      )}

      <ConsultationRecorder
        open={recorderOpen}
        onOpenChange={setRecorderOpen}
        onboarding={onboarding}
        onSaved={(c) => setDetailId(c.id)}
      />
      <ConsultationDetail
        consultation={detail}
        onboarding={onboarding}
        onClose={() => setDetailId(null)}
      />
    </section>
  );
}
