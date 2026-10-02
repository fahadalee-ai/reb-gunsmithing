import { createFileRoute } from "@tanstack/react-router";
import { AppointmentsScreen } from "@/features/book/screens";

export const Route = createFileRoute("/_app/book/")({
  component: AppointmentsScreen,
});
