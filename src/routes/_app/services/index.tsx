import { createFileRoute } from "@tanstack/react-router";
import { ServicesScreen } from "@/features/services/screens";

export const Route = createFileRoute("/_app/services/")({
  component: ServicesScreen,
});
