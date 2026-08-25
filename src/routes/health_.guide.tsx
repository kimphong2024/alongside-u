import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAppData } from "@/lib/store";
import { GuideChat } from "@/components/health/GuideChat";

export const Route = createFileRoute("/health_/guide")({
  head: () => ({
    meta: [
      { title: "Talk it through - Alongside" },
      {
        name: "description",
        content: "Gentle, practical guidance on caring for an older loved one.",
      },
    ],
  }),
  component: Guide,
});

function Guide() {
  const { hydrated, onboarding } = useAppData();
  if (!hydrated) return null;

  return (
    <AppShell>
      <Link
        to="/health"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-3"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.6} /> Health
      </Link>
      <GuideChat onboarding={onboarding} />
    </AppShell>
  );
}
