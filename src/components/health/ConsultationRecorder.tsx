import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Square, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/BottomSheet";
import { supabase } from "@/integrations/supabase/client";
import { useHealthData } from "@/lib/health-store";
import type { Consultation } from "@/lib/health-store";
import type { OnboardingData } from "@/lib/store";

const MAX_SECONDS = 600; // 10 min — keeps the base64 payload well under invoke limits

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onboarding: OnboardingData;
  onSaved: (c: Consultation) => void;
};

export function transcriptionBody(audio: string, mime: string, onboarding: OnboardingData) {
  return {
    audioBase64: audio.replace(/^data:[^,]*,/, ""),
    mime,
    loveeName: onboarding.loveeName,
    illnessType: onboarding.illnessType,
    illnessStage: onboarding.illnessStage,
  };
}

/** Runs transcription for a saved consultation row and patches it with the result. */
export async function runTranscription(
  consultation: { id: string; audio: string; mime: string },
  onboarding: OnboardingData,
  updateConsultation: ReturnType<typeof useHealthData>["updateConsultation"],
): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke("transcribe-consultation", {
    body: transcriptionBody(consultation.audio, consultation.mime, onboarding),
  });
  if (error || !data || data.error) {
    await updateConsultation(consultation.id, { status: "failed" });
    return false;
  }
  await updateConsultation(consultation.id, {
    transcript: data.transcript ?? "",
    summary: data.summary ?? "",
    actionSteps: ((data.actionSteps ?? []) as string[]).map((text) => ({ text, done: false })),
    status: "ready",
  });
  return true;
}

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function ConsultationRecorder({ open, onOpenChange, onboarding, onSaved }: Props) {
  const { addConsultation, updateConsultation } = useHealthData();
  const [title, setTitle] = useState("");
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audio, setAudio] = useState<string | undefined>();
  const [audioMime, setAudioMime] = useState("audio/webm");
  const [audioDuration, setAudioDuration] = useState(0);
  const [saving, setSaving] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetAll = () => {
    setTitle("");
    setAudio(undefined);
    setAudioDuration(0);
    setElapsed(0);
    setRecording(false);
    setSaving(false);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { audioBitsPerSecond: 32000 });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const mime = rec.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mime });
        const reader = new FileReader();
        reader.onload = () => {
          setAudio(reader.result as string);
          setAudioMime(mime);
          setAudioDuration(Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000)));
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      recorderRef.current = rec;
      startedAtRef.current = Date.now();
      setElapsed(0);
      setRecording(true);
      tickRef.current = setInterval(() => {
        setElapsed((s) => {
          if (s + 1 >= MAX_SECONDS) {
            stopRecording();
            toast.info("Recording stopped at 10 minutes.");
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      toast.error("Microphone access was denied.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (tickRef.current) clearInterval(tickRef.current);
  };

  const handleSave = async () => {
    if (!audio || saving) return;
    setSaving(true);
    const today = new Date().toISOString().slice(0, 10);
    // Save the row (with audio) first — the recording is safe even if AI fails.
    const created = await addConsultation({
      date: today,
      title: title.trim() || "Doctor visit",
      audio,
      audioMime,
      audioDuration,
    });
    if (!created) {
      toast.error("Couldn't save the recording. Please try again.");
      setSaving(false);
      return;
    }
    onOpenChange(false);
    resetAll();
    onSaved(created);
    const ok = await runTranscription(
      { id: created.id, audio, mime: audioMime },
      onboarding,
      updateConsultation,
    );
    if (ok) toast.success("Visit notes are ready.");
    else toast.error("Transcription didn't go through — the recording is saved, you can retry.");
  };

  const close = (v: boolean) => {
    if (recording) stopRecording();
    if (!v) resetAll();
    onOpenChange(v);
  };

  return (
    <BottomSheet open={open} onOpenChange={close} labelledBy="consult-recorder-title">
      <h2
        id="consult-recorder-title"
        className="font-serif text-3xl italic font-light text-foreground/90"
      >
        record this visit
      </h2>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
        Set your phone down and be present — we'll listen, write it up, and pull out the next steps
        for the family. Do let the doctor know you're recording.
      </p>

      <div className="mt-5 space-y-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 'Oncology review with Dr. Tan'"
          className="rounded-xl bg-background h-12 font-serif italic text-lg placeholder:font-sans placeholder:not-italic placeholder:text-base"
        />

        <div className="flex flex-col items-center py-4">
          {!recording && !audio && (
            <button
              onClick={startRecording}
              className="h-24 w-24 rounded-full bg-clay text-primary-foreground flex flex-col items-center justify-center gap-1 shadow-glow hover:bg-clay/90 transition"
            >
              <Mic className="h-8 w-8" strokeWidth={1.6} />
              <span className="text-xs">Record</span>
            </button>
          )}
          {recording && (
            <button
              onClick={stopRecording}
              className="h-24 w-24 rounded-full bg-clay text-primary-foreground flex flex-col items-center justify-center gap-1 shadow-glow animate-pulse"
            >
              <Square className="h-7 w-7 fill-current" />
              <span className="text-xs tabular-nums">{fmt(elapsed)}</span>
            </button>
          )}
          {audio && !recording && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-sage-soft/40 border border-sage/30"
            >
              <Mic className="h-4 w-4 text-foreground/60" strokeWidth={1.6} />
              <audio src={audio} controls className="flex-1 h-9" />
              <span className="text-xs tabular-nums text-muted-foreground">
                {fmt(audioDuration)}
              </span>
              <button
                onClick={() => {
                  setAudio(undefined);
                  setAudioDuration(0);
                }}
                aria-label="Discard recording"
              >
                <Trash2
                  className="h-4 w-4 text-muted-foreground hover:text-foreground"
                  strokeWidth={1.6}
                />
              </button>
            </motion.div>
          )}
          {recording && (
            <p className="text-xs text-muted-foreground mt-3">Up to 10 minutes · tap to stop</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() => close(false)}
            className="flex-1 rounded-xl h-12 text-muted-foreground hover:text-foreground"
          >
            Not now
          </Button>
          <Button
            onClick={handleSave}
            disabled={!audio || saving}
            className="flex-[2] rounded-xl h-12 bg-foreground text-background hover:bg-foreground/90 font-serif italic text-base"
          >
            <Check className="h-4 w-4 mr-1.5" strokeWidth={2} />
            {saving ? "Saving…" : "Save & write it up"}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
