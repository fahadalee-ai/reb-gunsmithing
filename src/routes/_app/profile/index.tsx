import { createFileRoute } from "@tanstack/react-router";
import { ProfileScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/profile/")({
  component: ProfileScreen,
});
