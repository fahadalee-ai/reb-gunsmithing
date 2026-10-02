import { createFileRoute } from "@tanstack/react-router";
import { NotificationsScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/notifications")({
  component: NotificationsScreen,
});
