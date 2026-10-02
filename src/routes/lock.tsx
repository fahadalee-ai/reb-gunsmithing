import { createFileRoute } from "@tanstack/react-router";
import { LockScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/lock")({
  component: LockScreen,
});
