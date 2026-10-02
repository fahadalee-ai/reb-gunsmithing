import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginScreen } from "@/features/admin/AdminApp";

export const Route = createFileRoute("/admin/login")({
  component: AdminLoginScreen,
});
