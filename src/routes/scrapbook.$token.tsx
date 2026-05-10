import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import type { Moment } from "@/lib/store";
import { DEMO_MOMENTS } from "@/lib/demo-moments";

export const Route = createFileRoute("/scrapbook/$token")({
  head: () => ({
    meta: [
      { title: "A shared scrapbook — Alongside" },
      { name: "description", content: "A quiet collection of meaningful moments." },
    ],
  }),
  component: SharedScrapbook,
});

type Group = { label: string; items: Moment[] };

function groupByRelativeDate(moments: Moment[]): Group[] {
  const map = new Map<string, Moment[]>();
  for (const m of moments) {
    const label = new Date(m.date).toLocaleDateString("en-SG", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(m);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function SharedScrapbook() {
  const { token } = Route.useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ loveeName: string | null; moments: Moment[] }>({
    loveeName: null,
    moments: [],
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/public-scrapbook?token=${encodeURIComponent(token)}`;
      const res = await fetch(url, {
        headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "" },
      });
      if (cancelled) return;
      if (!res.ok) {
        setError("This link is no longer available.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData({ loveeName: json.loveeName, moments: json.moments });
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const isDemo = !loading && !error && data.moments.length === 0;
  const displayMoments = isDemo ? DEMO_MOMENTS : data.moments;
  const groups = groupByRelativeDate(displayMoments);

  return (
    <div className="min-h-screen bg-background">
      <header className="max-w-3xl mx-auto px-5 pt-10 pb-6 text-center">
        <div className="inline-flex items-center gap-2 text-muted-foreground">
          <Heart className="h-4 w-4" strokeWidth={1.6} />
          <span className="text-xs uppercase tracking-[0.18em]">A shared scrapbook</span>
        </div>
        <h1 className="font-serif italic text-3xl md:text-4xl mt-3 text-foreground/85 leading-snug">
          {data.loveeName ? `Moments with ${data.loveeName}` : "Quiet moments, kept."}
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-5 pb-24 space-y-12">
        {loading && (
          <p className="text-center text-sm text-muted-foreground">Loading…</p>
        )}
        {error && (
          <p className="text-center text-sm text-muted-foreground">{error}</p>
        )}
        {isDemo && (
          <div className="rounded-2xl border border-dashed border-border bg-card/60 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Demo scrapbook</p>
            <p className="text-sm text-foreground/75 mt-1 leading-relaxed">
              A few sample memories so you can see what a shared scrapbook looks like.
            </p>
          </div>
        )}
        {groups.map((g) => (
          <section key={g.label}>
            <div className="flex items-baseline gap-3 mb-5 px-1">
              <span className="h-px flex-1 bg-border" />
              <h2 className="font-serif italic text-2xl text-foreground/80">{g.label}</h2>
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="relative">
              <svg
                aria-hidden
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
                className="absolute left-0 right-0 top-3 w-full h-5 pointer-events-none"
              >
                <path d="M0,4 Q50,18 100,4" fill="none" stroke="hsl(var(--border))" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
              </svg>
              <div className="relative flex gap-6 overflow-x-auto pb-8 pt-6 px-2 snap-x snap-mandatory scrollbar-none">
                {g.items.map((m, i) => (
                  <PeggedPolaroid key={m.id} moment={m} index={i} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center pb-10">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Shared via Alongside
        </p>
      </footer>
    </div>
  );
}

function PeggedPolaroid({ moment, index }: { moment: Moment; index: number }) {
  const tilts = [-3, 2, -1, 3, -2, 1];
  const rotate = tilts[index % tilts.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative flex-shrink-0 snap-center pt-3"
      style={{ transform: `rotate(${rotate}deg)`, transformOrigin: "top center" }}
    >
      <span aria-hidden className="absolute -top-1 left-6 h-2.5 w-2.5 rounded-[3px] bg-clay shadow-soft z-10" style={{ transform: "rotate(12deg)" }} />
      <span aria-hidden className="absolute -top-1 right-6 h-2.5 w-2.5 rounded-[3px] bg-clay shadow-soft z-10" style={{ transform: "rotate(-12deg)" }} />
      <article className="w-[300px] sm:w-[340px] bg-card border border-border p-5 pb-7 shadow-paper paper-grain rounded-md">
        {moment.photo && (
          <div className="mb-4 rounded-sm overflow-hidden aspect-[4/3] bg-muted">
            <img src={moment.photo} alt={moment.title} className="w-full h-full object-cover" />
          </div>
        )}
        {moment.video && (
          <div className="mb-4 rounded-sm overflow-hidden aspect-[4/3] bg-black">
            <video src={moment.video} controls className="w-full h-full object-cover" />
          </div>
        )}
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {new Date(moment.date).toLocaleDateString("en-SG", { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h3 className="font-serif text-2xl italic mt-1 leading-snug text-foreground/90">{moment.title}</h3>
        {moment.note && (
          <p className="font-hand text-xl text-foreground/80 mt-3 leading-snug whitespace-pre-line">{moment.note}</p>
        )}
        {moment.audio && (
          <audio src={moment.audio} controls className="w-full mt-3" />
        )}
      </article>
    </motion.div>
  );
}
