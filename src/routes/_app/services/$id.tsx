import { createFileRoute } from "@tanstack/react-router";
import { ServiceDetailScreen } from "@/features/services/screens";

export const Route = createFileRoute("/_app/services/$id")({
  component: ServiceDetailScreen,
});
