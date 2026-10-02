import { createFileRoute } from "@tanstack/react-router";
import { OnboardingScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingScreen,
});
