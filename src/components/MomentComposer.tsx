import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Mic, Square, Trash2, X, Check } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Moment } from "@/lib/store";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (m: Omit<Moment, "id" | "date">) => void;
};

export function MomentComposer({ open, onOpenChange, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [audio, setAudio] = useState<string | undefined>();
  const [audioDuration, setAudioDuration] = useState<number | undefined>();
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = () => {
    setTitle(""); setNote(""); setPhoto(undefined);
    setAudio(undefined); setAudioDuration(undefined);
    setRecording(false); setElapsed(0);
  };

  useEffect(() => {
    if (!open) reset();
  }, [open]);

  const handlePhoto = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size > 0 && chunksRef.current.push(e.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          setAudio(reader.result as string);
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
      tickRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
    if (tickRef.current) clearInterval(tickRef.current);
  };

  const canSave = title.trim() || note.trim() || photo || audio;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      title: title.trim() || "A quiet moment",
      note: note.trim(),
      photo,
      audio,
      audioDuration,
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          // Defensive cleanup for the known Radix issue where body
          // pointer-events lock can persist after close, blocking the FAB.
          if (typeof document !== "undefined") {
            document.body.style.pointerEvents = "";
          }
        }}
        className="rounded-t-3xl bg-card border-border max-h-[92vh] overflow-y-auto p-0"
      >
        <div className="paper-grain p-6 pb-8">
          <SheetHeader className="text-left mb-5">
            <div className="mx-auto h-1 w-10 rounded-full bg-border mb-4" />
            <SheetTitle className="font-serif text-3xl italic font-light text-foreground/90">
              hold this moment
            </SheetTitle>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              A photo, a few words, or just a voice — whatever feels right.
            </p>
          </SheetHeader>

          <div className="space-y-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A title, like 'Sunday tea on the porch'"
              className="rounded-xl bg-background h-12 font-serif italic text-lg placeholder:font-sans placeholder:not-italic placeholder:text-base"
            />
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What do you want to remember about this?"
              className="rounded-xl bg-background min-h-[110px] resize-none leading-relaxed"
            />

            <AnimatePresence>
              {photo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative mx-auto max-w-[80%]"
                >
                  <div className="bg-card border border-border p-3 pb-5 shadow-paper rounded-md polaroid-left">
                    <img src={photo} alt="" className="w-full aspect-[4/3] object-cover rounded-sm" />
                  </div>
                  <button
                    onClick={() => setPhoto(undefined)}
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center shadow-soft"
                    aria-label="Remove photo"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {audio && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-sage-soft/40 border border-sage/30"
                >
                  <Mic className="h-4 w-4 text-foreground/60" strokeWidth={1.6} />
                  <div className="flex-1 flex items-center gap-[3px] h-8">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-[3px] rounded-full bg-foreground/40"
                        style={{ height: `${30 + Math.sin(i * 0.7) * 18 + (i % 3) * 6}%` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    0:{String(audioDuration ?? 0).padStart(2, "0")}
                  </span>
                  <button onClick={() => { setAudio(undefined); setAudioDuration(undefined); }} aria-label="Remove voice note">
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-foreground" strokeWidth={1.6} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-2 pt-1">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handlePhoto(e.target.files[0])}
                />
                <div className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-background hover:bg-muted/40 transition text-sm">
                  <ImagePlus className="h-4 w-4" strokeWidth={1.6} />
                  <span>{photo ? "Change photo" : "Add photo"}</span>
                </div>
              </label>
              {!recording ? (
                <button
                  onClick={startRecording}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-background hover:bg-muted/40 transition text-sm"
                >
                  <Mic className="h-4 w-4" strokeWidth={1.6} />
                  <span>{audio ? "Re-record" : "Voice note"}</span>
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-clay text-primary-foreground transition text-sm animate-pulse"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                  <span>Stop · 0:{String(elapsed).padStart(2, "0")}</span>
                </button>
              )}
            </div>

            <div className="flex gap-2 pt-3">
              <Button
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl h-12 text-muted-foreground hover:text-foreground"
              >
                Not now
              </Button>
              <Button
                onClick={handleSave}
                disabled={!canSave}
                className="flex-[2] rounded-xl h-12 bg-foreground text-background hover:bg-foreground/90 font-serif italic text-base"
              >
                <Check className="h-4 w-4 mr-1.5" strokeWidth={2} /> Keep this moment
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
