import { createFileRoute } from "@tanstack/react-router";
import { VerifyPhoneScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/verify-phone")({
  component: VerifyPhoneScreen,
});
