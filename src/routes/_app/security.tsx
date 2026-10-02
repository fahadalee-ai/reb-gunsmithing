import { createFileRoute } from "@tanstack/react-router";
import { SecurityScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/security")({
  component: SecurityScreen,
});
