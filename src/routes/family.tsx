import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Users, Plus, Mail, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppState, type FamilyMember } from "@/lib/store";

export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family — Alongside" },
      { name: "description", content: "Coordinate care, share updates, and ease the load together." },
    ],
  }),
  component: Family,
});

function Family() {
  const { state, update, hydrated } = useAppState();
  const [name, setName] = useState("");
  const [rel, setRel] = useState("");
  const [email, setEmail] = useState("");

  if (!hydrated) return null;

  const add = () => {
    if (!name.trim()) return;
    const m: FamilyMember = { id: String(Date.now()), name: name.trim(), relationship: rel.trim() || "Family", email: email.trim() || undefined };
    update((s) => ({ ...s, family: [...s.family, m] }));
    setName(""); setRel(""); setEmail("");
  };

  const remove = (id: string) =>
    update((s) => ({ ...s, family: s.family.filter((m) => m.id !== id) }));

  return (
    <AppShell>
      <div className="space-y-6">
        <header>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" strokeWidth={1.6} />
            <span className="text-xs uppercase tracking-[0.14em]">Family</span>
          </div>
          <h1 className="text-4xl font-serif mt-1.5 text-balance">You don't have to carry this alone</h1>
          <p className="text-muted-foreground mt-2 leading-relaxed">
            Invite family who'd like to help. Share one update — instead of repeating it many times.
          </p>
        </header>

        <div className="rounded-2xl bg-card border border-border p-5 space-y-3 shadow-soft">
          <h2 className="font-serif text-xl">Invite someone gently</h2>
          <div className="space-y-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-xl bg-background h-11" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={rel} onChange={(e) => setRel(e.target.value)} placeholder="Relationship" className="rounded-xl bg-background h-11" />
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)" className="rounded-xl bg-background h-11" />
            </div>
            <Button onClick={add} className="w-full rounded-xl bg-foreground text-background hover:bg-foreground/90 h-11">
              <Plus className="h-4 w-4 mr-1" /> Add to circle
            </Button>
          </div>
        </div>

        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">Your circle</h3>
          {state.family.length === 0 ? (
            <div className="rounded-2xl bg-card border border-border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground">No family added yet. Add anyone who would want to help.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {state.family.map((m) => (
                <div key={m.id} className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-dawn flex items-center justify-center text-sm font-medium">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {m.relationship}{m.email ? ` · ${m.email}` : ""}
                    </p>
                  </div>
                  {m.email && (
                    <a href={`mailto:${m.email}?subject=A%20gentle%20update`} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center" aria-label="Email">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                  <button onClick={() => remove(m.id)} className="h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center" aria-label="Remove">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">Suggested ways to share</h3>
          <div className="grid gap-2">
            {[
              { title: "Weekly family update", desc: "One short message every Sunday — saves repeating." },
              { title: "Visit calendar", desc: "Spread visits across the week so everyone gets quiet time." },
              { title: "Task circle", desc: "Groceries, meals, transport — small things, shared." },
            ].map((s) => (
              <div key={s.title} className="rounded-2xl bg-gradient-warm border border-border p-4">
                <p className="font-serif text-lg">{s.title}</p>
                <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
