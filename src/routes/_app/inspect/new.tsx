import { createFileRoute } from "@tanstack/react-router";
import { InspectFlowScreen } from "@/features/inspect/screens";

export const Route = createFileRoute("/_app/inspect/new")({
  component: InspectFlowScreen,
});
