import { createFileRoute } from "@tanstack/react-router";
import { ResetScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/reset")({
  component: ResetScreen,
});
