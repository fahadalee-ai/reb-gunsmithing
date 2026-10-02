import { createFileRoute } from "@tanstack/react-router";
import { InspectDetailScreen } from "@/features/inspect/screens";

export const Route = createFileRoute("/_app/inspect/$id")({
  component: InspectDetailScreen,
});
