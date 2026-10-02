import { createFileRoute } from "@tanstack/react-router";
import { SettingsScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsScreen,
});
