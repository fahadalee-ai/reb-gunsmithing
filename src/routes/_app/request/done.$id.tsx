import { createFileRoute } from "@tanstack/react-router";
import { RequestDoneScreen } from "@/features/book/screens";

export const Route = createFileRoute("/_app/request/done/$id")({
  component: RequestDoneScreen,
});
