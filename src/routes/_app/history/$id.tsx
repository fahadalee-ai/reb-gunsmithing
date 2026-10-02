import { createFileRoute } from "@tanstack/react-router";
import { HistoryDetailScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/history/$id")({
  component: HistoryDetailScreen,
});
