import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sun, Wind, CalendarHeart, Heart, ArrowRight, Sparkles, LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/store";
import { signOut } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Today — Alongside" },
      { name: "description", content: "A calm, gentle starting point for caregivers in Singapore navigating terminal illness." },
    ],
  }),
  component: Today,
});

function Today() {
  const navigate = useNavigate();
  const { onboarding, local, updateLocal, hydrated, user } = useAppData();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) { navigate({ to: "/auth" }); return; }
    if (!onboarding.completed) navigate({ to: "/onboarding" });
  }, [hydrated, user, onboarding.completed, navigate]);

  if (!hydrated || !user) return null;

  const greetingName = onboarding.caregiverName?.trim();
  const loveeName = onboarding.loveeName?.trim() || "your loved one";
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const isOverwhelmed = ["Overwhelmed", "Exhausted", "Numb"].includes(onboarding.emotional ?? "");

  const focuses = isOverwhelmed
    ? [
        { title: "Take three slow breaths", why: "Begin with the smallest step.", effort: "1 minute", link: "/support" as const },
        { title: "A short, kind message to one family member", why: "You don't need to explain everything.", effort: "5 minutes", link: "/family" as const },
      ]
    : [
        { title: "Review available caregiving subsidies", why: "Many families find this eases long-term stress.", effort: "10 minutes", link: "/care-journey" as const },
        { title: "Note one question for the next medical visit", why: "Clarity often matters more than answers.", effort: "5 minutes", link: "/care-journey" as const },
        { title: "Suggest one small moment with " + loveeName, why: "These are the memories that stay.", effort: "Today", link: "/moments" as const },
      ];

  const today = new Date().toISOString().slice(0, 10);
  const todayMood = local.checkInHistory.find((c) => c.date === today)?.mood;

  return (
    <AppShell>
      <div className="space-y-7">
        <section className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{timeGreeting}{greetingName ? `, ${greetingName}` : ""}.</p>
            <h1 className="text-4xl font-serif mt-1 text-balance">You're doing the best you can.</h1>
            <p className="text-muted-foreground mt-2 leading-relaxed">
              A few gentle things you may want to look into. Move at your own pace — nothing here is urgent.
            </p>
          </div>
          <button onClick={signOut} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center flex-shrink-0" aria-label="Sign out">
            <LogOut className="h-4 w-4 text-muted-foreground" />
          </button>
        </section>

        <section className="space-y-3">
          <SectionLabel icon={Sun} label="Today's focus" />
          <div className="space-y-3">
            {focuses.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Link to={f.link} className="block">
                  <div className="rounded-2xl bg-card border border-border p-5 shadow-soft hover:border-sage/40 transition group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1.5">
                        <h3 className="font-serif text-xl text-balance">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.why}</p>
                        <p className="text-xs text-muted-foreground/80 pt-1">~ {f.effort}</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground mt-1 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <section>
          <div className="rounded-3xl bg-gradient-warm border border-border p-6 shadow-soft">
            <SectionLabel icon={Heart} label="A gentle check-in" />
            <h3 className="font-serif text-2xl mt-2">How are you coping today?</h3>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {["Tired", "Sad", "Managing", "Hopeful", "Overwhelmed", "Numb"].map((m) => {
                const active = todayMood === m;
                return (
                  <button key={m}
                    onClick={() => updateLocal((s) => ({
                      ...s,
                      checkInHistory: [...s.checkInHistory.filter((c) => c.date !== today), { date: today, mood: m }],
                    }))}
                    className={`px-3 py-2.5 rounded-xl text-sm border transition ${
                      active ? "bg-clay-soft border-clay text-foreground" : "bg-card border-border hover:bg-muted"
                    }`}>
                    {m}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel icon={Sparkles} label="A meaningful moment" />
          <Link to="/moments" className="block">
            <div className="rounded-2xl bg-card border border-border p-5 shadow-soft hover:border-clay/40 transition">
              <h3 className="font-serif text-xl">Share a quiet cup of tea with {loveeName}.</h3>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Small, ordinary moments often become the ones we treasure most.
              </p>
            </div>
          </Link>
        </section>

        <section className="space-y-3">
          <SectionLabel icon={Wind} label="Take a moment for yourself" />
          <div className="rounded-2xl bg-sage-soft/60 border border-sage/30 p-5">
            <p className="text-sm leading-relaxed text-foreground/80">
              Remember to drink water, eat something gentle, and rest when you can. Caring for yourself is part of caring for them.
            </p>
            <Button asChild variant="ghost" className="rounded-full mt-3 px-0 hover:bg-transparent text-sage hover:text-sage">
              <Link to="/support">Open the support space →</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel icon={CalendarHeart} label="Upcoming" />
          <div className="rounded-2xl bg-card border border-border border-dashed p-5 text-center">
            <p className="text-sm text-muted-foreground">No appointments noted yet. You can add one anytime.</p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function SectionLabel({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; label: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="h-4 w-4" strokeWidth={1.6} />
      <span className="text-xs uppercase tracking-[0.14em]">{label}</span>
    </div>
  );
}
