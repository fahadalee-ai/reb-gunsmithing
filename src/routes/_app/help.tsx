import { createFileRoute } from "@tanstack/react-router";
import { HelpScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/help")({
  component: HelpScreen,
});
