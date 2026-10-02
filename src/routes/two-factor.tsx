import { createFileRoute } from "@tanstack/react-router";
import { TwoFactorScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/two-factor")({
  component: TwoFactorScreen,
});
