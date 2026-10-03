import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { BottomNav, Fab, OfflineBanner, SnackHost } from "@/components/m3";
import { Phone, Scroll } from "@/components/shell";
import { MaintenanceScreen, UpdateScreen } from "@/features/more/screens";
import { APP_VERSION } from "@/lib/business";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: CustomerLayout,
});

function versionBehind(current: string, minimum: string) {
  const a = current.split(".").map(Number);
  const b = minimum.split(".").map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((a[i] ?? 0) < (b[i] ?? 0)) return true;
    if ((a[i] ?? 0) > (b[i] ?? 0)) return false;
  }
  return false;
}

function CustomerLayout() {
  const { user, db, touch } = useStore();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const hideNav = ["/book/new", "/request", "/inspect/new"].some((item) => path.startsWith(item)) || path.startsWith("/book/done") || path.startsWith("/messages/");
  const fab =
    path === "/book"
      ? { label: "Book Appointment", to: "/book/new" as const }
      : path === "/inspect"
        ? { label: "New Inspection", to: "/inspect/new" as const }
        : null;

  return (
    <Phone>
      <div className="relative h-full" onPointerDown={touch}>
        <OfflineBanner />
        {db.flags.maintenance ? (
          <MaintenanceScreen />
        ) : versionBehind(APP_VERSION, db.flags.minVersion) ? (
          <UpdateScreen />
        ) : (
          <Scroll pad={!hideNav}>
            <Outlet />
          </Scroll>
        )}
        {fab && !hideNav ? <Fab label={fab.label} onClick={() => navigate({ to: fab.to })} /> : null}
        {!hideNav && !db.flags.maintenance ? <BottomNav /> : null}
        <SnackHost />
      </div>
    </Phone>
  );
}
