import { createFileRoute } from "@tanstack/react-router";
import { LockSetupScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/lock-setup")({
  component: LockSetupScreen,
});
