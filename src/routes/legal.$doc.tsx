import { createFileRoute } from "@tanstack/react-router";
import { LegalScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/legal/$doc")({
  component: LegalScreen,
});
