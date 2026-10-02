import { createFileRoute } from "@tanstack/react-router";
import { AdminHome } from "@/features/admin/AdminApp";

export const Route = createFileRoute("/admin/")({
  component: AdminHome,
});
