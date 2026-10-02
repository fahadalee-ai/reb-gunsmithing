import { createFileRoute } from "@tanstack/react-router";
import { RequestScreen } from "@/features/book/screens";

export const Route = createFileRoute("/_app/request/")({
  component: RequestScreen,
});
