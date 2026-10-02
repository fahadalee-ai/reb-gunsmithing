import { createFileRoute } from "@tanstack/react-router";
import { HistoryScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/history/")({
  component: HistoryScreen,
});
