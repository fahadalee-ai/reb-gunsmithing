import { createFileRoute } from "@tanstack/react-router";
import { WelcomeScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/welcome")({
  component: WelcomeScreen,
});
