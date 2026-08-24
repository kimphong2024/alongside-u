import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { OnboardingData } from "@/lib/store";

type ChatMessage = { role: "user" | "assistant"; content: string };

const TOPIC_CHIPS = [
  "She refuses her pills",
  "TCM and chemo together",
  "So many appointments, so tired",
  "He won't see the doctor",
  "Talking about what's ahead",
  "Getting siblings to help",
];

// Session-only transcript — survives tab switches, never persisted.
let sessionMessages: ChatMessage[] = [];
let sessionFollowUps: string[] = [];

function profilePayload(o: OnboardingData) {
  return {
    loveeName: o.loveeName,
    relationship: o.relationship,
    illnessType: o.illnessType,
    illnessStage: o.illnessStage,
    language: o.language,
    patientKnows: o.patientKnows,
  };
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

export function GuideChat({ onboarding }: { onboarding: OnboardingData }) {
  const [messages, setMessages] = useState<ChatMessage[]>(sessionMessages);
  const [followUps, setFollowUps] = useState<string[]>(sessionFollowUps);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length, thinking]);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || thinking) return;
    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    sessionMessages = next;
    setFollowUps([]);
    setInput("");
    setThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke("care-guide-chat", {
        body: { messages: next.slice(-12), profile: profilePayload(onboarding) },
      });
      if (error || !data?.reply) throw new Error(data?.error ?? "No reply");
      const withReply: ChatMessage[] = [...next, { role: "assistant", content: data.reply }];
      setMessages(withReply);
      sessionMessages = withReply;
      const fu = (data.followUps ?? []) as string[];
      setFollowUps(fu);
      sessionFollowUps = fu;
    } catch {
      toast.error("That didn't go through — try sending again.");
    } finally {
      setThinking(false);
    }
  };

  const loveeName = onboarding.loveeName?.trim() || "your loved one";

  return (
    <div className="flex flex-col min-h-[calc(100dvh-240px)]">
      <div className="flex-1 space-y-3">
        {messages.length === 0 && (
          <div className="pt-2">
            <h1 className="font-serif italic text-4xl font-light text-foreground/90 leading-tight">
              talk it through
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-md">
              The everyday battles of caring for {loveeName} — medication, beliefs, energy,
              family. Ask anything, or start from one of these.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {TOPIC_CHIPS.map((chip, i) => (
                <motion.button
                  key={chip}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => void send(chip)}
                  className="px-3.5 py-2 rounded-full text-sm border border-border bg-card paper-grain shadow-soft text-foreground/80 hover:bg-muted/40 transition"
                >
                  {chip}
                </motion.button>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground mt-6 leading-relaxed max-w-md">
              This is guidance from a companion, not medical advice — for medication or
              symptoms, your care team decides. If it ever feels too heavy, SOS is at 1-767,
              any time.
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-clay-soft/50 border border-clay/25 text-foreground/90 rounded-br-md"
                    : "bg-card border border-border shadow-soft paper-grain text-foreground/85 rounded-bl-md"
                }`}
              >
                {m.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-card border border-border shadow-soft">
              <TypingDots />
            </div>
          </motion.div>
        )}

        {!thinking && followUps.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {followUps.map((f) => (
              <button
                key={f}
                onClick={() => void send(f)}
                className="px-3 py-1.5 rounded-full text-xs border border-sage/40 bg-sage-soft/30 text-foreground/75 hover:bg-sage-soft/60 transition"
              >
                {f}
              </button>
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-24 pt-4">
        <form
          onSubmit={(e) => { e.preventDefault(); void send(input); }}
          className="flex gap-2 bg-card/90 backdrop-blur-xl border border-border shadow-soft rounded-2xl p-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the everyday battles…"
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 h-10"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            className="h-10 w-10 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-40 transition shrink-0"
            aria-label="Send"
          >
            <Send className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </form>
      </div>
    </div>
  );
}
