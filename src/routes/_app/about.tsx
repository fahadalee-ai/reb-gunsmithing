import { createFileRoute } from "@tanstack/react-router";
import { AboutScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/about")({
  component: AboutScreen,
});
