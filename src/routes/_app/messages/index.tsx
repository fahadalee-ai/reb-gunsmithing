import { createFileRoute } from "@tanstack/react-router";
import { MessagesScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/messages/")({
  component: MessagesScreen,
});
