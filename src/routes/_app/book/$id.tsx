import { createFileRoute } from "@tanstack/react-router";
import { AppointmentDetailScreen } from "@/features/book/screens";

export const Route = createFileRoute("/_app/book/$id")({
  component: AppointmentDetailScreen,
});
