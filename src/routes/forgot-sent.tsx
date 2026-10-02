import { createFileRoute } from "@tanstack/react-router";
import { ForgotSentScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/forgot-sent")({
  component: ForgotSentScreen,
});
