import { useRouterState } from "@tanstack/react-router";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function scrollAppToTop() {
  document.querySelectorAll("[data-app-scroll]").forEach((node) => {
    if (node instanceof HTMLElement) node.scrollTop = 0;
  });
  window.scrollTo(0, 0);
}

export function Phone({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="min-h-dvh bg-[#07090c] md:grid md:min-h-dvh md:place-items-center md:py-3">
      <div
        className={cn(
          "relative mx-auto h-dvh w-full max-w-[480px] overflow-hidden bg-background md:h-[min(940px,calc(100dvh-1.5rem))] md:rounded-[28px] md:border md:border-white/10",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function Scroll({ children, pad = true }: { children: ReactNode; pad?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const path = useRouterState({ select: (state) => state.location.pathname });
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [path]);
  return (
    <div ref={ref} data-app-scroll className={cn("h-full overflow-y-auto", pad && "pb-28")}>
      {children}
    </div>
  );
}
