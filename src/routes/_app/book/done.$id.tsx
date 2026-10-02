import { createFileRoute } from "@tanstack/react-router";
import { BookDoneScreen } from "@/features/book/screens";

export const Route = createFileRoute("/_app/book/done/$id")({
  component: BookDoneScreen,
});
