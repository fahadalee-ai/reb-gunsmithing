import { createFileRoute } from "@tanstack/react-router";
import { RegisterScreen } from "@/features/auth/screens";

export const Route = createFileRoute("/register")({
  component: RegisterScreen,
});
