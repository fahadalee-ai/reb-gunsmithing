import { createFileRoute } from "@tanstack/react-router";
import { ForgotScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/forgot")({
  component: ForgotScreen,
});
