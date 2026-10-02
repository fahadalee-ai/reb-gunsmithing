import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BottomNav, Fab, MButton, MField, OfflineBanner, SnackHost } from "@/components/m3";
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
  const { user, locked, sensitiveLocked, clearSensitive, db, touch } = useStore();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) navigate({ to: "/login" });
    else if (locked && user.biometricEnabled) navigate({ to: "/lock" });
  }, [user, locked, navigate]);

  if (!user) return null;

  const hideNav = ["/book/new", "/request", "/inspect/new"].some((item) => path.startsWith(item)) || path.startsWith("/book/done") || path.startsWith("/messages/");
  const fab =
    path === "/home" || path === "/book"
      ? { label: "Book Appointment", to: "/book/new" as const }
      : path === "/inspect"
        ? { label: "New Inspection", to: "/inspect/new" as const }
        : null;
  const sensitive = sensitiveLocked && (path.startsWith("/inspect") || path.startsWith("/messages"));

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
        {sensitive ? (
          <div className="absolute inset-0 z-50 grid content-center gap-3 bg-background px-6">
            <h1 className="text-[28px]">Confirm it's you</h1>
            <p className="text-[14px] leading-6 text-[var(--on-surface-variant)]">Inspections and messages lock again after the app is backgrounded.</p>
            <MButton
              full
              onClick={() => {
                clearSensitive();
              }}
            >
              Use biometric
            </MButton>
            <MField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={error} />
            <MButton
              full
              variant="tonal"
              onClick={() => {
                if (password === user.password) clearSensitive();
                else setError("Password does not match.");
              }}
            >
              Continue
            </MButton>
          </div>
        ) : null}
      </div>
    </Phone>
  );
}
