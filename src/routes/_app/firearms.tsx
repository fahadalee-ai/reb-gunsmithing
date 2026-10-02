import { createFileRoute } from "@tanstack/react-router";
import { FirearmsScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/firearms")({
  component: FirearmsScreen,
});
