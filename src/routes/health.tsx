import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessagesSquare, ChevronRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/store";
import { useHealthData } from "@/lib/health-store";
import { HealthHubCard } from "@/components/health/HealthHubCard";
import { AppointmentsCard } from "@/components/health/AppointmentsCard";
import { ConsultationsSection } from "@/components/health/ConsultationsSection";
import { RecordsSection } from "@/components/health/RecordsSection";
import { MessageDoctorCard } from "@/components/health/MessageDoctorSheet";
import { MOCK_KEYS, readMockFlag } from "@/lib/mock-health";

export type HealthView = "visits" | "records" | "team";

const VIEWS: { key: HealthView; label: string }[] = [
  { key: "visits", label: "Visits" },
  { key: "records", label: "Records" },
  { key: "team", label: "Care team" },
];

export const Route = createFileRoute("/health")({
  validateSearch: (search: Record<string, unknown>): { view?: HealthView } => {
    const v = search.view;
    return v === "visits" || v === "records" || v === "team" ? { view: v } : {};
  },
  head: () => ({
    meta: [
      { title: "Health - Alongside" },
      { name: "description", content: "Doctor visits, records and appointments — kept together for the family." },
    ],
  }),
  component: Health,
});

function Health() {
  const { hydrated, onboarding } = useAppData();
  const health = useHealthData();
  const { view = "visits" } = Route.useSearch();
  const navigate = Route.useNavigate();
  // Lives at route level: panes unmount on switch, but the mock flag must survive.
  const [hubConnected, setHubConnected] = useState(() => readMockFlag(MOCK_KEYS.healthhub));

  if (!hydrated || !health.hydrated) return null;

  const loveeName = onboarding.loveeName?.trim() || "your loved one";
  const setView = (v: HealthView) =>
    navigate({ search: v === "visits" ? {} : { view: v }, replace: true });

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif italic text-4xl font-light text-foreground/90 leading-tight">
            {loveeName}'s health
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Visits, reports and appointments — in one place the whole family can follow.
          </p>
        </div>

        <div className="relative rounded-full bg-card/60 border border-border p-1 flex">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className="relative flex-1 py-2 text-sm rounded-full"
            >
              {view === v.key && (
                <motion.span
                  layoutId="health-view-pill"
                  className="absolute inset-0 rounded-full bg-background shadow-soft border border-border/60"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              <span className={`relative ${view === v.key ? "font-medium text-accent-active" : "text-muted-foreground"}`}>
                {v.label}
              </span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {view === "visits" && (
              <ConsultationsSection consultations={health.consultations} onboarding={onboarding} />
            )}
            {view === "records" && <RecordsSection records={health.records} />}
            {view === "team" && (
              <div className="space-y-3">
                <HealthHubCard onConnectedChange={setHubConnected} />
                {hubConnected && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <AppointmentsCard />
                  </motion.div>
                )}
                <MessageDoctorCard />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Link
          to="/health/guide"
          className="w-full text-left rounded-2xl bg-gradient-sage border border-sage/30 shadow-soft p-4 paper-grain hover:opacity-95 transition flex items-center gap-3"
        >
          <div className="h-10 w-10 rounded-full bg-background/70 flex items-center justify-center shrink-0">
            <MessagesSquare className="h-5 w-5 text-foreground/70" strokeWidth={1.6} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground/85">Talk it through</p>
            <p className="text-xs text-foreground/60 mt-0.5">
              Gentle, practical guidance — medication battles, TCM, appointment fatigue.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-foreground/50 shrink-0" strokeWidth={1.6} />
        </Link>
      </div>
    </AppShell>
  );
}
