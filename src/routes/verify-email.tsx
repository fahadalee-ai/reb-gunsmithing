import { createFileRoute } from "@tanstack/react-router";
import { VerifyEmailScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailScreen,
});
