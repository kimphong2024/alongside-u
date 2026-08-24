import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Play, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchConsultationAudio, useHealthData } from "@/lib/health-store";
import type { Consultation } from "@/lib/health-store";
import type { OnboardingData } from "@/lib/store";
import { runTranscription } from "./ConsultationRecorder";

type Props = {
  consultation: Consultation | null;
  onboarding: OnboardingData;
  onClose: () => void;
};

export function ConsultationDetail({ consultation, onboarding, onClose }: Props) {
  const { updateConsultation, removeConsultation } = useHealthData();
  const [summaryDraft, setSummaryDraft] = useState("");
  const [editingSummary, setEditingSummary] = useState(false);
  const [newStep, setNewStep] = useState("");
  const [transcriptOpen, setTranscriptOpen] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLoading, setAudioLoading] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    setSummaryDraft(consultation?.summary ?? "");
    setEditingSummary(false);
    setTranscriptOpen(false);
    setAudioUrl(null);
    setNewStep("");
  }, [consultation?.id]);

  if (!consultation) return <Dialog open={false}><span /></Dialog>;
  const c = consultation;

  const saveSummary = () => {
    setEditingSummary(false);
    if (summaryDraft !== c.summary) void updateConsultation(c.id, { summary: summaryDraft });
  };

  const toggleStep = (i: number) => {
    const steps = c.actionSteps.map((s, j) => (j === i ? { ...s, done: !s.done } : s));
    void updateConsultation(c.id, { actionSteps: steps });
  };

  const addStep = () => {
    const text = newStep.trim();
    if (!text) return;
    void updateConsultation(c.id, { actionSteps: [...c.actionSteps, { text, done: false }] });
    setNewStep("");
  };

  const removeStep = (i: number) => {
    void updateConsultation(c.id, { actionSteps: c.actionSteps.filter((_, j) => j !== i) });
  };

  const loadAudio = async () => {
    setAudioLoading(true);
    const audio = await fetchConsultationAudio(c.id);
    setAudioLoading(false);
    if (audio) setAudioUrl(audio);
    else toast.error("Couldn't load the recording.");
  };

  const retry = async () => {
    if (retrying) return;
    setRetrying(true);
    const audio = await fetchConsultationAudio(c.id);
    if (!audio) {
      toast.error("The original recording is missing.");
      setRetrying(false);
      return;
    }
    await updateConsultation(c.id, { status: "processing" });
    const ok = await runTranscription(
      { id: c.id, audio, mime: c.audioMime ?? "audio/webm" },
      onboarding,
      updateConsultation,
    );
    setRetrying(false);
    if (ok) toast.success("Visit notes are ready.");
    else toast.error("Still couldn't transcribe — try again in a moment.");
  };

  const handleDelete = async () => {
    onClose();
    await removeConsultation(c.id);
    toast.success("Visit deleted.");
  };

  return (
    <Dialog open={!!consultation} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl">
        <DialogHeader className="text-left">
          <p className="text-xs text-muted-foreground">{c.date}</p>
          <DialogTitle className="font-serif italic text-2xl font-light text-foreground/90">
            {c.title || "Doctor visit"}
          </DialogTitle>
        </DialogHeader>

        {c.status === "processing" && (
          <div className="rounded-2xl bg-sage-soft/30 border border-sage/30 p-4 text-sm text-muted-foreground flex items-center gap-3">
            <motion.span
              className="h-4 w-4 rounded-full border-2 border-clay border-t-transparent shrink-0"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
            />
            Listening back and writing notes… this usually takes about a minute.
          </div>
        )}

        {c.status === "failed" && (
          <div className="rounded-2xl bg-clay-soft/30 border border-clay/30 p-4 text-sm">
            <p className="text-foreground/80">The write-up didn't go through. Your recording is safe.</p>
            <Button size="sm" onClick={retry} disabled={retrying} className="mt-2 rounded-full h-8 text-xs bg-foreground text-background">
              <RefreshCw className={`h-3.5 w-3.5 mr-1 ${retrying ? "animate-spin" : ""}`} strokeWidth={1.8} />
              {retrying ? "Retrying…" : "Try again"}
            </Button>
          </div>
        )}

        {c.status === "ready" && (
          <div className="space-y-5">
            <section className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">What was said</h4>
                {!editingSummary && (
                  <button onClick={() => setEditingSummary(true)} className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">
                    Edit
                  </button>
                )}
              </div>
              {editingSummary ? (
                <div className="space-y-2">
                  <Textarea
                    value={summaryDraft}
                    onChange={(e) => setSummaryDraft(e.target.value)}
                    className="rounded-xl bg-background min-h-[110px] leading-relaxed"
                  />
                  <Button size="sm" onClick={saveSummary} className="rounded-full h-8 text-xs bg-foreground text-background">
                    <Check className="h-3.5 w-3.5 mr-1" strokeWidth={2} /> Save
                  </Button>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-foreground/85">{c.summary || "No summary yet."}</p>
              )}
            </section>

            <section className="space-y-2">
              <h4 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Next steps</h4>
              {c.actionSteps.length === 0 && (
                <p className="text-sm text-muted-foreground">No action steps were picked up.</p>
              )}
              <div className="space-y-1.5">
                {c.actionSteps.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5 group">
                    <button
                      onClick={() => toggleStep(i)}
                      className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                        s.done ? "bg-sage border-sage text-background" : "border-border bg-background"
                      }`}
                      aria-label={s.done ? "Mark not done" : "Mark done"}
                    >
                      {s.done && <Check className="h-3 w-3" strokeWidth={2.5} />}
                    </button>
                    <span className={`text-sm flex-1 leading-relaxed ${s.done ? "line-through text-muted-foreground" : "text-foreground/85"}`}>
                      {s.text}
                    </span>
                    <button
                      onClick={() => removeStep(i)}
                      className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-foreground"
                      aria-label="Remove step"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <Input
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addStep()}
                  placeholder="Add a step…"
                  className="rounded-xl bg-background h-9 text-sm"
                />
                <Button size="sm" variant="outline" onClick={addStep} className="rounded-xl h-9 px-3">
                  <Plus className="h-4 w-4" strokeWidth={1.8} />
                </Button>
              </div>
            </section>

            <section className="space-y-2">
              <button
                onClick={() => setTranscriptOpen((v) => !v)}
                className="flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground transition"
              >
                Full transcript
                <motion.span animate={{ rotate: transcriptOpen ? 180 : 0 }}>
                  <ChevronDown className="h-3.5 w-3.5" strokeWidth={1.8} />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {transcriptOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-sm leading-relaxed text-foreground/75 whitespace-pre-wrap rounded-xl bg-background border border-border/70 p-3">
                      {c.transcript || "No transcript available."}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-border/60">
          {audioUrl ? (
            <audio src={audioUrl} controls className="h-9 flex-1 mr-3" />
          ) : (
            <button
              onClick={loadAudio}
              disabled={audioLoading}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition"
            >
              <Play className="h-4 w-4" strokeWidth={1.6} />
              {audioLoading ? "Loading…" : "Play recording"}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-clay transition"
          >
            <Trash2 className="h-4 w-4" strokeWidth={1.6} /> Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
