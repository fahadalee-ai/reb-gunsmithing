import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/")({
  component: SplashScreen,
});
