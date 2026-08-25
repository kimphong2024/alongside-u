import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instagram, Facebook, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BottomSheet } from "@/components/BottomSheet";
import { MOCK_KEYS, readMockFlag, writeMockFlag } from "@/lib/mock-health";
import type { Moment } from "@/lib/store";
import momentsTea from "@/assets/moments-tea.jpg";
import momentsHands from "@/assets/moments-hands.jpg";
import momentsGarden from "@/assets/moments-garden.jpg";
import clothesline05 from "@/assets/demo-clothesline/05-noodles.jpg";

type SocialPhoto = { src: string; title: string; note: string; daysAgo: number };

const SOCIAL_PHOTOS: SocialPhoto[] = [
  {
    src: momentsTea,
    title: "Afternoon tea, just us",
    note: "Her favourite oolong, no rush at all. · from Instagram",
    daysAgo: 12,
  },
  {
    src: momentsHands,
    title: "Holding hands at the park",
    note: "She held on a little longer today. · from Instagram",
    daysAgo: 34,
  },
  {
    src: momentsGarden,
    title: "Back at the Botanic Gardens",
    note: "The orchids again — her happy place. · from Facebook",
    daysAgo: 61,
  },
  {
    src: clothesline05,
    title: "Her famous noodles",
    note: "She insisted on cooking for everyone again. · from Facebook",
    daysAgo: 90,
  },
];

const CONNECT_STAGES = [
  "Opening a secure sign-in…",
  "Signing in…",
  "Finding photos of the family…",
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (moments: Moment[]) => void;
};

async function assetToDataUrl(src: string): Promise<string> {
  // Persist real bytes, not the hashed Vite asset URL — those break after a redeploy.
  const blob = await (await fetch(src)).blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export function ImportMomentsSheet({ open, onOpenChange, onImport }: Props) {
  const [connected, setConnected] = useState(() => readMockFlag(MOCK_KEYS.instagram));
  const [source, setSource] = useState<"Instagram" | "Facebook" | null>(null);
  const [stage, setStage] = useState<number | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set(SOCIAL_PHOTOS.map((_, i) => i)));
  const [importing, setImporting] = useState(false);

  const startConnect = (which: "Instagram" | "Facebook") => {
    setSource(which);
    setStage(0);
    CONNECT_STAGES.forEach((_, i) => setTimeout(() => setStage(i), i * 750));
    setTimeout(
      () => {
        setStage(null);
        setConnected(true);
        writeMockFlag(MOCK_KEYS.instagram, true);
      },
      CONNECT_STAGES.length * 750 + 300,
    );
  };

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const doImport = async () => {
    if (importing || selected.size === 0) return;
    setImporting(true);
    try {
      const chosen = SOCIAL_PHOTOS.filter((_, i) => selected.has(i));
      const moments: Moment[] = await Promise.all(
        chosen.map(async (p) => {
          const d = new Date();
          d.setDate(d.getDate() - p.daysAgo);
          return {
            id: crypto.randomUUID(),
            date: d.toISOString().slice(0, 10),
            title: p.title,
            note: p.note,
            photo: await assetToDataUrl(p.src),
          };
        }),
      );
      onImport(moments);
      onOpenChange(false);
      toast.success(
        `${moments.length} ${moments.length === 1 ? "memory" : "memories"} brought into the wall.`,
      );
    } catch {
      toast.error("Couldn't import those photos. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(v) => stage === null && onOpenChange(v)}
      labelledBy="import-moments-title"
    >
      <h2
        id="import-moments-title"
        className="font-serif text-3xl italic font-light text-foreground/90"
      >
        bring in memories you already have
      </h2>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
        Years of photos already live on Instagram and Facebook. Pull the ones with the family into
        the memory wall.
      </p>

      <div className="mt-5 space-y-4">
        {!connected && stage === null && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => startConnect("Instagram")}
              className="flex items-center justify-center gap-2 h-12 rounded-xl text-white text-sm font-medium bg-[linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)] hover:opacity-95 transition"
            >
              <Instagram className="h-4 w-4" strokeWidth={1.8} /> Instagram
            </button>
            <button
              onClick={() => startConnect("Facebook")}
              className="flex items-center justify-center gap-2 h-12 rounded-xl text-white text-sm font-medium bg-[#1877F2] hover:bg-[#166ada] transition"
            >
              <Facebook className="h-4 w-4" strokeWidth={1.8} /> Facebook
            </button>
            <p className="col-span-2 text-[11px] text-muted-foreground text-center">
              Demo preview — no real account connection happens here.
            </p>
          </div>
        )}

        {stage !== null && (
          <div className="space-y-2.5 py-2">
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
                <span className={i <= stage ? "text-foreground/85" : "text-muted-foreground"}>
                  {i === 0 && source ? `Opening ${source}…` : label}
                </span>
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {connected && stage === null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sage inline-block" /> Connected ·
                photos of the family
              </p>
              <div className="grid grid-cols-2 gap-2">
                {SOCIAL_PHOTOS.map((p, i) => {
                  const on = selected.has(i);
                  return (
                    <button
                      key={p.title}
                      onClick={() => toggle(i)}
                      className="relative rounded-xl overflow-hidden border border-border text-left group"
                    >
                      <img
                        src={p.src}
                        alt={p.title}
                        className="w-full aspect-square object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6">
                        <p className="text-[11px] text-white/90 leading-tight line-clamp-2">
                          {p.title}
                        </p>
                      </div>
                      <span
                        className={`absolute top-2 right-2 h-6 w-6 rounded-full border-2 flex items-center justify-center transition ${
                          on ? "bg-sage border-sage text-white" : "bg-black/20 border-white/70"
                        }`}
                      >
                        {on && <Check className="h-3.5 w-3.5" strokeWidth={2.5} />}
                      </span>
                    </button>
                  );
                })}
              </div>
              <Button
                onClick={doImport}
                disabled={selected.size === 0 || importing}
                className="w-full rounded-xl h-12 bg-foreground text-background hover:bg-foreground/90 font-serif italic text-base"
              >
                {importing
                  ? "Bringing them in…"
                  : `Import ${selected.size} ${selected.size === 1 ? "photo" : "photos"}`}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  );
}
