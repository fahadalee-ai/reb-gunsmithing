import { createFileRoute } from "@tanstack/react-router";
import { ThreadScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/messages/$id")({
  component: ThreadScreen,
});
