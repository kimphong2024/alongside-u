import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Plus, Sparkles, Check } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppState, type BucketItem, type Moment } from "@/lib/store";
import { BUCKET_TEMPLATES } from "@/lib/content";

export const Route = createFileRoute("/moments")({
  head: () => ({
    meta: [
      { title: "Moments — Alongside" },
      { name: "description", content: "A quiet space to plan and remember meaningful moments." },
    ],
  }),
  component: Moments,
});

function Moments() {
  const { state, update, hydrated } = useAppState();
  const [tab, setTab] = useState<"bucket" | "journal">("bucket");
  const [newBucket, setNewBucket] = useState("");
  const [newMomentTitle, setNewMomentTitle] = useState("");
  const [newMomentNote, setNewMomentNote] = useState("");

  if (!hydrated) return null;

  const loveeName = state.onboarding.loveeName?.trim() || "your loved one";

  const seedBucket = () => {
    const seeded: BucketItem[] = BUCKET_TEMPLATES.slice(0, 8).map((t, i) => ({
      id: `seed-${i}-${Date.now()}`,
      title: t.title,
      category: t.category,
      done: false,
    }));
    update((s) => ({ ...s, bucketList: [...s.bucketList, ...seeded] }));
  };

  const addBucket = () => {
    if (!newBucket.trim()) return;
    update((s) => ({
      ...s,
      bucketList: [...s.bucketList, { id: String(Date.now()), title: newBucket.trim(), category: "Personal", done: false }],
    }));
    setNewBucket("");
  };

  const toggleBucket = (id: string) =>
    update((s) => ({
      ...s,
      bucketList: s.bucketList.map((b) => (b.id === id ? { ...b, done: !b.done } : b)),
    }));

  const addMoment = () => {
    if (!newMomentTitle.trim()) return;
    const m: Moment = {
      id: String(Date.now()),
      date: new Date().toISOString().slice(0, 10),
      title: newMomentTitle.trim(),
      note: newMomentNote.trim(),
    };
    update((s) => ({ ...s, moments: [m, ...s.moments] }));
    setNewMomentTitle("");
    setNewMomentNote("");
  };

  const grouped = state.bucketList.reduce<Record<string, BucketItem[]>>((acc, b) => {
    (acc[b.category] ??= []).push(b);
    return acc;
  }, {});

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-xs uppercase tracking-[0.14em]">Moments</span>
          </div>
          <h1 className="text-4xl font-serif mt-1.5 text-balance">Small things, deeply remembered</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            A quiet space to plan meaningful moments with {loveeName} and gather memories along the way.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-2 p-1 bg-muted/60 rounded-full">
          {[
            { id: "bucket", label: "Bucket list" },
            { id: "journal", label: "Memory journal" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as "bucket" | "journal")}
              className={`py-2.5 rounded-full text-sm transition relative ${
                tab === t.id ? "" : "text-muted-foreground"
              }`}
            >
              {tab === t.id && (
                <motion.span layoutId="moments-pill" className="absolute inset-0 rounded-full bg-card shadow-soft" />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </div>

        {tab === "bucket" && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-card border border-border p-4 space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newBucket}
                  onChange={(e) => setNewBucket(e.target.value)}
                  placeholder={`Something to share with ${loveeName}…`}
                  className="rounded-xl bg-background h-11"
                  onKeyDown={(e) => e.key === "Enter" && addBucket()}
                />
                <Button onClick={addBucket} className="rounded-xl bg-foreground text-background hover:bg-foreground/90 h-11">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {state.bucketList.length === 0 && (
                <Button onClick={seedBucket} variant="ghost" className="w-full text-sage hover:text-sage rounded-xl">
                  <Sparkles className="h-4 w-4 mr-2" /> Suggest a few gentle ideas
                </Button>
              )}
            </div>

            {Object.keys(grouped).length === 0 && (
              <div className="text-center py-12 px-6">
                <Heart className="h-8 w-8 mx-auto text-muted-foreground/50" strokeWidth={1.4} />
                <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto leading-relaxed">
                  Even the simplest things — a favourite meal, a familiar song — become precious.
                </p>
              </div>
            )}

            {Object.entries(grouped).map(([cat, items]) => (
              <div key={cat} className="space-y-2">
                <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">{cat}</h3>
                <div className="space-y-2">
                  {items.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => toggleBucket(b.id)}
                      className={`w-full text-left flex items-center gap-3 p-4 rounded-2xl border transition ${
                        b.done ? "bg-clay-soft/40 border-clay/30" : "bg-card border-border hover:border-clay/40"
                      }`}
                    >
                      <span className={`h-5 w-5 rounded-full flex items-center justify-center border flex-shrink-0 ${
                        b.done ? "bg-clay border-clay" : "border-border"
                      }`}>
                        {b.done && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                      </span>
                      <span className={`text-sm flex-1 ${b.done ? "text-muted-foreground line-through decoration-muted-foreground/30" : ""}`}>
                        {b.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "journal" && (
          <div className="space-y-5">
            <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
              <Input
                value={newMomentTitle}
                onChange={(e) => setNewMomentTitle(e.target.value)}
                placeholder="A moment to remember…"
                className="rounded-xl bg-background h-11"
              />
              <Textarea
                value={newMomentNote}
                onChange={(e) => setNewMomentNote(e.target.value)}
                placeholder="A few words, a story, or a feeling. Whatever you'd like to keep."
                className="rounded-xl bg-background min-h-[100px] resize-none"
              />
              <Button onClick={addMoment} className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90">
                Save this moment
              </Button>
            </div>

            {state.moments.length === 0 ? (
              <div className="relative py-10">
                <div className="polaroid-right mx-auto max-w-[78%] bg-card border border-border p-4 pb-6 shadow-paper paper-grain rounded-md">
                  <div className="aspect-[4/3] rounded-sm bg-gradient-warm flex items-center justify-center">
                    <Heart className="h-7 w-7 text-foreground/30" strokeWidth={1.4} />
                  </div>
                  <p className="font-hand text-2xl text-foreground/70 mt-3 text-center leading-snug">
                    a place for the small, treasured things…
                  </p>
                </div>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed text-center mt-6">
                  Your moments will appear here, gently held.
                </p>
              </div>
            ) : (
              <div className="space-y-5 pt-2">
                {state.moments.map((m, i) => {
                  const tilt = i % 3 === 0 ? "polaroid-left" : i % 3 === 1 ? "polaroid-right" : "polaroid-tiny";
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 10, rotate: 0 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className={`${tilt} mx-auto max-w-[92%] bg-card border border-border p-5 pb-7 shadow-paper paper-grain rounded-md`}
                    >
                      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {new Date(m.date).toLocaleDateString("en-SG", { month: "long", day: "numeric" })}
                      </p>
                      <h3 className="font-serif text-2xl italic mt-1 leading-snug">{m.title}</h3>
                      {m.note && (
                        <p className="font-hand text-xl text-foreground/80 mt-3 leading-snug whitespace-pre-line">
                          {m.note}
                        </p>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
