import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarClock,
  Camera,
  ChevronDown,
  ChevronLeft,
  Home,
  MessageSquare,
  Plus,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { Children, isValidElement, useEffect, useId, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import logo from "@/img/logo.png";

export function Logo({ className = "h-16 w-auto" }: { className?: string }) {
  return <img src={logo} alt="REB Gunsmithing" className={cn("object-contain", className)} />;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "filled" | "tonal" | "outlined" | "text" | "danger";
  full?: boolean;
};

export function MButton({ variant = "filled", full, className, type = "button", ...props }: BtnProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex h-12 min-w-12 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-medium tracking-wide transition active:scale-[0.98] disabled:opacity-40",
        full && "w-full",
        variant === "filled" && "bg-primary text-primary-foreground",
        variant === "tonal" && "border border-[#9eb6d4] bg-[#24344a] text-white",
        variant === "outlined" && "border border-outline bg-transparent text-primary",
        variant === "text" && "bg-transparent px-3 text-primary",
        variant === "danger" && "bg-secondary text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function MIconButton({ label, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn("inline-flex size-12 items-center justify-center rounded-full text-foreground", className)}
      {...props}
    />
  );
}

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; hint?: string; trailing?: ReactNode };

export function MField({ label, error, hint, id, className, trailing, ...props }: FieldProps) {
  const auto = useId();
  const fieldId = id ?? auto;
  return (
    <div className={className}>
      <div className="relative">
        <input
          id={fieldId}
          placeholder=" "
          className={cn(
            "peer h-14 w-full rounded-xl border bg-[var(--surface-low)] px-4 pt-4 text-[16px] text-foreground outline-none",
            trailing && "pr-14",
            error ? "border-2 border-error" : "border-outline focus:border-2 focus:border-primary",
          )}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          {...props}
        />
        <label
          htmlFor={fieldId}
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 bg-background px-1 text-[16px] transition-all peer-focus:top-0 peer-focus:text-[12px] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[12px]",
            error ? "text-error peer-focus:text-error" : "text-[var(--on-surface-variant)] peer-focus:text-primary",
          )}
        >
          {label}
        </label>
        {trailing ? <div className="absolute top-1/2 right-1 -translate-y-1/2">{trailing}</div> : null}
      </div>
      {error ? (
        <p id={`${fieldId}-error`} className="mt-1 px-4 text-[12px] font-medium text-error">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 px-4 text-[12px] text-[var(--on-surface-variant)]">{hint}</p>
      ) : null}
    </div>
  );
}

function readOptions(children: ReactNode) {
  const options: { value: string; label: string }[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as { value?: string | number; children?: ReactNode };
    const text = typeof props.children === "string" || typeof props.children === "number" ? String(props.children) : "";
    const value = props.value === undefined ? text : String(props.value);
    options.push({ value, label: text || value });
  });
  return options;
}

export function MSelect({
  label,
  value,
  error,
  hint,
  disabled,
  className,
  onChange,
  children,
}: {
  label: string;
  value: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  className?: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const options = readOptions(children);
  const selected = options.find((option) => option.value === value);
  return (
    <div className={className}>
      <p className={cn("mb-1 block px-1 text-[12px]", error ? "font-medium text-error" : "text-[var(--on-surface-variant)]")}>{label}</p>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-invalid={Boolean(error)}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-14 w-full items-center justify-between gap-3 border bg-surface-high px-3 text-left text-[16px] text-foreground disabled:opacity-40",
          error ? "border-2 border-error" : "border-outline",
        )}
      >
        <span className="truncate">{selected?.label || "Select"}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-[#d7e0ea] transition", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div role="listbox" aria-label={label} className="mt-1 max-h-64 overflow-y-auto overscroll-contain border border-[#3d4a5c] bg-[#1c2430]">
          {options.map((option) => (
            <button
              key={`${option.value}:${option.label}`}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={cn(
                "flex min-h-14 w-full items-center px-4 text-left text-[16px]",
                option.value === value ? "bg-primary text-white" : "text-white active:bg-[#2c3a4e]",
              )}
              onPointerUp={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
      {error ? <p className="mt-1 px-1 text-[12px] font-medium text-error">{error}</p> : hint ? <p className="mt-1 px-1 text-[12px] text-[var(--on-surface-variant)]">{hint}</p> : null}
    </div>
  );
}

export function MArea({ label, error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className={cn("mb-1 block px-1 text-[12px]", error ? "font-medium text-error" : "text-[var(--on-surface-variant)]")}>
        {label}
      </label>
      <textarea
        id={id}
        className={cn(
          "min-h-28 w-full rounded-xl border bg-transparent px-4 py-3 text-[16px] outline-none",
          error ? "border-2 border-error" : "border-outline focus:border-2 focus:border-primary",
        )}
        {...props}
      />
      {error ? <p className="mt-1 px-1 text-[12px] font-medium text-error">{error}</p> : null}
    </div>
  );
}

export function MChip({
  selected,
  children,
  disabled,
  onClick,
}: {
  selected?: boolean;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 items-center border px-4 text-[14px] font-medium disabled:opacity-35",
        selected ? "border-transparent bg-primary text-primary-foreground" : "border-[#9eb6d4] text-white",
      )}
    >
      {children}
    </button>
  );
}

export function StatusChip({ status }: { status: string }) {
  const label = status.replaceAll("_", " ");
  const tone =
    status === "cancelled" || status === "attention"
      ? "bg-secondary text-[var(--on-secondary)]"
      : status === "completed" || status === "assessed" || status === "good" || status === "ready"
        ? "bg-primary-container text-[var(--on-primary-container)]"
        : status === "minor" || status === "priority"
          ? "bg-tertiary text-on-tertiary"
          : "bg-surface-high text-foreground";
  return (
    <span className={cn("inline-flex h-8 items-center gap-1 rounded-lg px-3 text-[12px] font-medium capitalize", tone)}>
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function MCard({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={cn("w-full rounded-2xl bg-card p-4 text-left text-card-foreground", className)}
    >
      {children}
    </Comp>
  );
}

export function TopBar({
  title,
  large,
  center,
  back,
  action,
}: {
  title?: string;
  large?: boolean;
  center?: boolean;
  back?: () => void;
  action?: ReactNode;
}) {
  return (
    <header className={cn("sticky top-0 z-50 bg-background px-1", large ? "pb-2 pt-2" : "h-16")}>
      <div className="flex h-12 items-center gap-1">
        {back ? (
          <MIconButton label="Back" className="relative z-10 shrink-0" onClick={back}>
            <ChevronLeft className="pointer-events-none size-6" />
          </MIconButton>
        ) : (
          <span className="w-2 shrink-0" />
        )}
        {!large && title ? (
          <h1 className={cn("min-w-0 flex-1 truncate text-[22px] font-normal", center && "text-center")}>{title}</h1>
        ) : (
          <span className="min-w-0 flex-1" />
        )}
        {action ? <div className="relative z-10 shrink-0">{action}</div> : null}
      </div>
      {large && title ? <h1 className="px-4 text-[32px] leading-tight font-normal">{title}</h1> : null}
    </header>
  );
}

const NAV: { to: "/home" | "/book" | "/inspect" | "/messages" | "/profile"; label: string; icon: LucideIcon }[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/book", label: "Book", icon: CalendarClock },
  { to: "/inspect", label: "Inspect", icon: Camera },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/profile", label: "Profile", icon: UserRound },
];

export function BottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { db, user } = useStore();
  const unread = db.messages.filter(
    (m) => m.from === "staff" && m.status !== "read" && db.conversations.some((c) => c.id === m.conversationId && c.userId === user?.id),
  ).length;
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 border-t border-[#3d4a5c] bg-[#151b24] pb-[env(safe-area-inset-bottom)]" aria-label="Primary">
      <ul className="grid h-20 grid-cols-5">
        {NAV.map((item) => {
          const active = path === item.to || path.startsWith(`${item.to}/`);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-current={active ? "page" : undefined}
                className="flex h-full flex-col items-center justify-center gap-1 font-medium"
              >
                <span className={cn("relative flex h-8 w-16 items-center justify-center", active && "bg-primary text-primary-foreground")}>
                  <Icon className="size-5" aria-hidden />
                  {item.to === "/messages" && unread > 0 ? (
                    <span className="absolute top-0.5 right-3 grid size-4 place-items-center bg-tertiary text-[10px] font-semibold text-[var(--on-tertiary)]">{unread > 9 ? "9+" : unread}</span>
                  ) : null}
                </span>
                <span className={active ? "text-white" : "text-[#d7e0ea]"} style={{ fontSize: 12, lineHeight: "16px" }}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 bottom-24 z-40 inline-flex h-14 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-medium text-primary-foreground shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
    >
      <Plus className="size-5" aria-hidden />
      {label}
    </button>
  );
}

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/55" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal
        aria-label={title}
        className="max-h-[85%] overflow-auto rounded-t-[28px] bg-surface-high px-5 pt-3 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-outline" />
        <h2 className="mb-4 text-[22px]">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-6" role="presentation">
      <div role="dialog" aria-modal aria-labelledby="dlg-title" className="w-full max-w-sm rounded-[28px] bg-surface-high p-6">
        <h2 id="dlg-title" className="text-[24px]">
          {title}
        </h2>
        <p className="mt-3 text-[14px] leading-6 text-[var(--on-surface-variant)]">{body}</p>
        <div className="mt-6 flex justify-end gap-2">
          <MButton variant="text" onClick={onClose}>
            Cancel
          </MButton>
          <MButton variant={danger ? "danger" : "filled"} onClick={onConfirm}>
            {confirmLabel}
          </MButton>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="grid place-items-center px-6 py-16 text-center">
      <div className="mb-4 grid size-20 place-items-center rounded-full bg-surface-high text-primary" aria-hidden>
        <CalendarClock />
      </div>
      <h2 className="text-[22px]">{title}</h2>
      <p className="mt-2 max-w-xs text-[14px] leading-6 text-[var(--on-surface-variant)]">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-surface-high", className)} />;
}

export function SnackHost() {
  const { toasts, dismissToast } = useStore();
  if (!toasts.length) return null;
  const toast = toasts[toasts.length - 1];
  return (
    <div className="absolute inset-x-4 bottom-24 z-[60]">
      <div className="flex items-center gap-3 border border-[#3d4a5c] bg-[#252e3c] px-4 py-3 text-[14px] text-white shadow-lg" role="status">
        <div className="flex-1 text-left">
          <p className="font-medium text-white">{toast.title}</p>
          {toast.body ? <p className="text-[13px] text-[#d7e0ea]">{toast.body}</p> : null}
        </div>
        {toast.action ? (
          <button
            type="button"
            className="min-h-12 px-2 font-medium text-tertiary"
            onClick={() => {
              toast.action?.run();
              dismissToast(toast.id);
            }}
          >
            {toast.action.label}
          </button>
        ) : (
          <button type="button" className="min-h-12 px-2 font-medium text-tertiary" onClick={() => dismissToast(toast.id)}>
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
}

export function Progress({ value }: { value?: number }) {
  return (
    <div className="h-1 overflow-hidden rounded-full bg-surface-high" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      {value == null ? (
        <div className="splash-bar h-full w-2/5">
          <span className="block h-full w-full bg-primary" />
        </div>
      ) : (
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
      )}
    </div>
  );
}

export function PageBanner({
  image,
  kicker,
  title,
  subtitle,
  action,
}: {
  image: string;
  kicker: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <section className="relative h-36 overflow-hidden">
      <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/45 to-[#0e1218]" />
      <div className="relative flex h-full items-end justify-between gap-3 px-4 pb-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">{kicker}</p>
          <h1 className="mt-1 text-[30px] leading-none font-medium tracking-tight text-white">{title}</h1>
          {subtitle ? <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-white/80">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
    </section>
  );
}

export function HeroImage({ src, alt, className, children }: { src: string; alt: string; className?: string; children?: ReactNode }) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img src={src} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      <div className="scrim absolute inset-0" />
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}

export function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);
  if (online) return null;
  return (
    <div className="bg-secondary px-4 py-2 text-center text-[13px] text-secondary-foreground" role="status">
      No connection. Some actions will wait until you are back online.
    </div>
  );
}

/**
 * Browser stand-in for Android FLAG_SECURE.
 * The native app must set WindowManager.LayoutParams.FLAG_SECURE on capture,
 * assessment, message, and appointment-media screens, and should use a
 * privacy-screen plugin (Capacitor Privacy Screen) so recents and recordings
 * are blacked out. This preview blanks the surface when the page is hidden
 * and warns on PrintScreen.
 */
export function SecureSurface({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const [warn, setWarn] = useState(false);
  useEffect(() => {
    const onVis = () => setHidden(document.visibilityState !== "visible");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "PrintScreen") setWarn(true);
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("keyup", onKey);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("keyup", onKey);
    };
  }, []);
  return (
    <div className="relative" onContextMenu={(e) => e.preventDefault()}>
      {children}
      {hidden ? <div className="absolute inset-0 z-20 bg-background" aria-hidden /> : null}
      {warn ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/65 px-5">
          <div role="alert" className="w-full max-w-[420px] border border-[#3d4a5c] bg-[#1c2430] px-5 py-5">
            <span className="mb-4 block h-[3px] w-12 bg-tertiary" />
            <h2 className="text-[22px] leading-tight font-medium text-white">Screenshots stay off</h2>
            <p className="mt-3 text-[16px] leading-6 text-[#d7e0ea]">
              Photos and messages on this screen are private. This preview cannot block every recorder. The installed app blocks screenshots.
            </p>
            <button type="button" className="mt-5 h-12 w-full bg-primary text-[16px] font-medium text-primary-foreground" onClick={() => setWarn(false)}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function PasswordStrength({ value }: { value: string }) {
  const score = [value.length >= 8, /[A-Z]/.test(value), /[a-z]/.test(value), /\d/.test(value)].filter(Boolean).length;
  const label = ["Too short", "Weak", "Okay", "Good", "Strong"][score];
  return (
    <div className="px-4">
      <div className="mt-2 flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("h-1 flex-1 rounded-full", i < score ? "bg-primary" : "bg-surface-high")} />
        ))}
      </div>
      <p className="mt-1 text-[12px] text-[var(--on-surface-variant)]">Password strength: {label}</p>
    </div>
  );
}

export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode }) {
  return (
    <label className="flex min-h-12 items-start gap-3 text-[14px] leading-6">
      <input type="checkbox" className="mt-1 size-5 accent-[var(--primary)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{children}</span>
    </label>
  );
}
