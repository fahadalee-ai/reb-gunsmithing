import { createFileRoute } from "@tanstack/react-router";
import { ContactScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/contact")({
  component: ContactScreen,
});
