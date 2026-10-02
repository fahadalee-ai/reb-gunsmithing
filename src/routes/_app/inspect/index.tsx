import { createFileRoute } from "@tanstack/react-router";
import { InspectListScreen } from "@/features/inspect/screens";

export const Route = createFileRoute("/_app/inspect/")({
  component: InspectListScreen,
});
