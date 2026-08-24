import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
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

export const Route = createFileRoute("/health")({
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
  const [hubConnected, setHubConnected] = useState(() => readMockFlag(MOCK_KEYS.healthhub));

  if (!hydrated || !health.hydrated) return null;

  const loveeName = onboarding.loveeName?.trim() || "your loved one";

  return (
    <AppShell>
      <div className="space-y-7">
        <div>
          <h1 className="font-serif italic text-4xl font-light text-foreground/90 leading-tight">
            {loveeName}'s health
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            Visits, reports and appointments — in one place the whole family can follow.
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">
            Connected care
          </h3>
          <HealthHubCard onConnectedChange={setHubConnected} />
          {hubConnected && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <AppointmentsCard />
            </motion.div>
          )}
        </section>

        <ConsultationsSection consultations={health.consultations} onboarding={onboarding} />

        <RecordsSection records={health.records} />

        <section className="space-y-3">
          <h3 className="text-xs uppercase tracking-[0.14em] text-muted-foreground px-1">
            Reach out
          </h3>
          <MessageDoctorCard />
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
        </section>
      </div>
    </AppShell>
  );
}
