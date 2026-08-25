import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BottomSheet } from "@/components/BottomSheet";
import {
  MOCK_CARE_TEAM,
  MESSAGE_SUBJECTS,
  MOCK_KEYS,
  readMockJson,
  writeMockJson,
} from "@/lib/mock-health";
import type { DoctorMessage } from "@/lib/mock-health";

export function MessageDoctorCard() {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState<string | null>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<DoctorMessage[]>(() =>
    readMockJson<DoctorMessage[]>(MOCK_KEYS.doctorMessages, []),
  );

  const send = () => {
    if (!body.trim() || sending) return;
    setSending(true);
    setTimeout(() => {
      const msg: DoctorMessage = {
        id: crypto.randomUUID(),
        subject: subject ?? "Message",
        body: body.trim(),
        sentAt: new Date().toISOString(),
      };
      const next = [msg, ...messages];
      setMessages(next);
      writeMockJson(MOCK_KEYS.doctorMessages, next);
      setSending(false);
      setSubject(null);
      setBody("");
      setOpen(false);
      toast.success("Message sent to your care team — replies usually come within 2 working days.");
    }, 1200);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left rounded-2xl bg-card border border-border shadow-soft p-4 paper-grain hover:bg-muted/30 transition flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="h-10 w-10 rounded-full bg-sage-soft/50 flex items-center justify-center shrink-0">
          <MessageCircle className="h-5 w-5 text-foreground/70" strokeWidth={1.6} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground/85">Message the care team</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {MOCK_CARE_TEAM.doctor} · {MOCK_CARE_TEAM.clinic}
          </p>
        </div>
        {messages.length > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">{messages.length} sent</span>
        )}
      </button>

      <BottomSheet open={open} onOpenChange={setOpen} labelledBy="msg-doctor-title">
        <h2
          id="msg-doctor-title"
          className="font-serif text-3xl italic font-light text-foreground/90"
        >
          message the care team
        </h2>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          {MOCK_CARE_TEAM.doctor}, {MOCK_CARE_TEAM.role} · {MOCK_CARE_TEAM.clinic}. For anything
          urgent, please call the clinic or 995.
        </p>

        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            {MESSAGE_SUBJECTS.map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={`px-3 py-1.5 rounded-full text-xs border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  subject === s
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What would you like to ask or share?"
            className="rounded-xl bg-background min-h-[110px] leading-relaxed"
          />

          <Button
            onClick={send}
            disabled={!body.trim() || sending}
            className="w-full rounded-xl h-12 bg-foreground text-background hover:bg-foreground/90 font-serif italic text-base"
          >
            {sending ? (
              <motion.span
                className="h-4 w-4 rounded-full border-2 border-background border-t-transparent mr-2"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
              />
            ) : (
              <Send className="h-4 w-4 mr-1.5" strokeWidth={1.8} />
            )}
            {sending ? "Sending…" : "Send message"}
          </Button>

          {messages.length > 0 && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Sent</h4>
              {messages.map((m) => (
                <div key={m.id} className="rounded-xl bg-background border border-border/70 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground/80">{m.subject}</p>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Check className="h-3 w-3 text-sage" strokeWidth={2} />
                      {new Date(m.sentAt).toLocaleDateString("en-SG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                    {m.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </BottomSheet>
    </>
  );
}
