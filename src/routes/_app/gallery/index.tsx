import { createFileRoute } from "@tanstack/react-router";
import { GalleryScreen } from "@/features/more/screens";

export const Route = createFileRoute("/_app/gallery/")({
  component: GalleryScreen,
});
