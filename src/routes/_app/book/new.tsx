import { createFileRoute } from "@tanstack/react-router";
import { BookFlowScreen } from "@/features/book/screens";

export const Route = createFileRoute("/_app/book/new")({
  component: BookFlowScreen,
});
