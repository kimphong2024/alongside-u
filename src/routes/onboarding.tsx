import { createFileRoute } from "@tanstack/react-router";
import { OnboardingFlow } from "@/components/OnboardingFlow";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Welcome — Alongside" }] }),
  component: OnboardingFlow,
});
