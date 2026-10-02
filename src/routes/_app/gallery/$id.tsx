import { createFileRoute } from "@tanstack/react-router";
import { ProjectScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/gallery/$id")({
  component: ProjectScreen,
});
