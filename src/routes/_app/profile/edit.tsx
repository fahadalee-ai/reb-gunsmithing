import { createFileRoute } from "@tanstack/react-router";
import { EditProfileScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/profile/edit")({
  component: EditProfileScreen,
});
