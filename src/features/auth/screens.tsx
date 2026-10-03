import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { CheckRow, Logo, MButton, MField, PasswordStrength, Progress, SnackHost } from "@/components/m3";
import { Phone, Scroll } from "@/components/shell";
import { BUSINESS } from "@/lib/business";
import { DEMO_CUSTOMER } from "@/lib/seed";
import { useStore } from "@/lib/store";
import { asset } from "@/lib/utils";

const slides = [
  {
    image: asset("media/tools-grid.jpg"),
    kicker: "Book the bench",
    title: "Expert gunsmithing, booked in minutes.",
    body: "Schedule cleaning, repair, inspection, or appraisal with a certified gunsmith.",
  },
  {
    image: asset("media/services-detail.jpg"),
    kicker: "Before you visit",
    title: "A clearer look, from your photos.",
    body: "Send photos of the firearm and get a preliminary visual note. It is not a safety check.",
  },
  {
    image: asset("media/about-hero.jpg"),
    kicker: "Your records",
    title: "Private to you and the shop.",
    body: "Photos, messages, and service history stay with you and authorized REB staff.",
  },
];

function AuthForm({
  image,
  kicker,
  title,
  subtitle,
  backTo,
  onSubmit,
  children,
  footer,
}: {
  image: string;
  kicker: string;
  title: string;
  subtitle?: string;
  backTo?: "/login" | "/welcome" | "/forgot";
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Phone>
      <form noValidate className="flex h-full flex-col" onSubmit={onSubmit}>
        <header className="relative h-40 shrink-0 overflow-hidden">
          <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-[#0e1218]/62 to-[var(--surface)]" />
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between px-1 pt-2">
            {backTo ? (
              <Link to={backTo} className="relative z-10 inline-flex h-11 items-center gap-0.5 px-2 text-[14px] font-medium text-white">
                <ChevronLeft className="size-5" aria-hidden /> Back
              </Link>
            ) : (
              <span className="size-11" />
            )}
            <Logo className="mt-1 mr-3 h-11 w-auto" />
          </div>
          <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="auth-rise grid gap-5 px-5 pt-5 pb-6">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">{kicker}</p>
              <h1 className="mt-1 text-[30px] leading-[1.15] font-medium tracking-tight">{title}</h1>
              {subtitle ? <p className="mt-2 text-[15px] leading-6 text-[var(--on-surface-variant)]">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </div>
        {footer ? <div className="shrink-0 border-t border-[var(--outline-variant)] bg-[var(--surface)] px-5 pt-3 pb-4">{footer}</div> : null}
      </form>
    </Phone>
  );
}

function PasswordToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="grid size-11 place-items-center text-[var(--on-surface-variant)]" aria-label={show ? "Hide password" : "Show password"} onClick={onToggle}>
      {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
    </button>
  );
}

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const write = (next: string) => onChange(next.slice(0, 6).padEnd(0, ""));
  return (
    <div
      className="flex gap-2"
      role="group"
      aria-label="6 digit code"
      onPaste={(event) => {
        const text = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!text) return;
        event.preventDefault();
        const chars = Array.from({ length: 6 }, (_, index) => text[index] ?? "");
        onChange(chars.join(""));
        refs.current[Math.min(text.length, 5)]?.focus();
      }}
    >
      {Array.from({ length: 6 }, (_, index) => (
        <input
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Digit ${index + 1}`}
          className="h-14 w-full border border-outline bg-[var(--surface-low)] text-center text-[22px] text-foreground outline-none focus:border-2 focus:border-primary"
          value={value[index] ?? ""}
          onChange={(event) => {
            const digit = event.target.value.replace(/\D/g, "").slice(-1);
            const chars = Array.from({ length: 6 }, (_, n) => value[n] ?? "");
            chars[index] = digit;
            write(chars.join(""));
            if (digit) refs.current[index + 1]?.focus();
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !value[index] && index > 0) {
              const chars = Array.from({ length: 6 }, (_, n) => value[n] ?? "");
              chars[index - 1] = "";
              write(chars.join(""));
              refs.current[index - 1]?.focus();
            }
          }}
        />
      ))}
    </div>
  );
}

export function SplashScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      navigate({ to: "/onboarding", replace: true });
    }, reduce ? 500 : 2500);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <Phone>
      <div className="metal flex h-full flex-col items-center justify-center px-8">
        <div className="relative grid place-items-center">
          <div className="splash-glow absolute size-56 rounded-full bg-primary/50 blur-3xl" />
          <svg className="absolute size-64" viewBox="0 0 120 120" aria-hidden>
            <circle className="splash-ring" cx="60" cy="60" r="54" fill="none" stroke="#4C77AE" strokeWidth="0.6" />
            <path d="M60 8 V18 M60 102 V112 M8 60 H18 M102 60 H112" stroke="#4C77AE" strokeWidth="0.6" />
          </svg>
          <Logo className="splash-logo relative z-10 h-36 w-auto" />
        </div>
        <p className="splash-tag mt-10 text-center text-[14px] tracking-[0.18em] text-[var(--on-surface-variant)] uppercase">{BUSINESS.tagline}</p>
        <div className="absolute inset-x-10 bottom-12">
          <Progress />
        </div>
      </div>
    </Phone>
  );
}

export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const { markOnboarded } = useStore();
  const navigate = useNavigate();
  const slide = slides[index];
  const last = index === slides.length - 1;
  const finish = (to: "/login" | "/register") => {
    markOnboarded();
    navigate({ to });
  };
  return (
    <Phone>
      <div className="relative h-full">
        <img src={slide.image} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-transparent" />
        <div className="relative flex h-full flex-col">
          <div className="flex items-center justify-between px-3 pt-3">
            <Logo className="h-20 w-auto" />
            <button type="button" className="h-11 px-3 text-[14px] font-medium text-white" onClick={() => finish("/login")}>
              Skip
            </button>
          </div>
          <div className="mt-auto bg-[var(--surface)] px-5 pt-5 pb-6">
            <span className="-mt-5 mb-4 block h-[3px] w-12 bg-tertiary" />
            <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">{slide.kicker}</p>
            <h1 className="mt-2 text-[30px] leading-[1.15] font-medium tracking-tight">{slide.title}</h1>
            <p className="mt-3 text-[15px] leading-6 text-[var(--on-surface-variant)]">{slide.body}</p>
            <div className="mt-5 flex gap-2" aria-label="Slide">
              {slides.map((item, i) => (
                <span key={item.title} className={`h-1 ${i === index ? "w-8 bg-tertiary" : "w-4 bg-[var(--outline-variant)]"}`} />
              ))}
            </div>
            {last ? (
              <div className="mt-6 grid gap-2">
                <MButton full onClick={() => finish("/login")}>
                  Log in
                </MButton>
                <MButton full variant="outlined" onClick={() => finish("/register")}>
                  Create account
                </MButton>
              </div>
            ) : (
              <MButton full className="mt-6" onClick={() => setIndex((n) => n + 1)}>
                Next
              </MButton>
            )}
          </div>
        </div>
      </div>
    </Phone>
  );
}

export function WelcomeScreen() {
  const { markOnboarded } = useStore();
  return (
    <Phone>
      <div className="relative flex h-full flex-col">
        <img src={asset("media/hero-workshop.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-[#0e1218]" />
        <div className="relative flex h-full flex-col px-5 pt-6 pb-6">
          <Logo className="h-16 w-auto" />
          <div className="mt-auto">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">{BUSINESS.owner} · Newport, TN</p>
            <h1 className="mt-2 max-w-sm text-[34px] leading-[1.1] font-medium tracking-tight text-white">Precision work. Dependable service.</h1>
            <p className="mt-3 max-w-sm text-[15px] leading-6 text-white/85">Cleaning, repair, inspection, and appraisal — booked with the shop, not sold from a shelf.</p>
            <div className="mt-6 grid gap-2">
              <Link to="/login" onClick={() => markOnboarded()} className="inline-flex h-12 w-full items-center justify-center bg-primary text-[14px] font-medium text-primary-foreground">
                Log in
              </Link>
              <Link to="/register" onClick={() => markOnboarded()} className="inline-flex h-12 w-full items-center justify-center border border-white/40 text-[14px] font-medium text-white">
                Create account
              </Link>
            </div>
            <p className="mt-4 text-center text-[12px] text-white/70">
              <Link to="/legal/$doc" params={{ doc: "terms" }} className="underline">
                Terms
              </Link>
              {" · "}
              <Link to="/legal/$doc" params={{ doc: "privacy" }} className="underline">
                Privacy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Phone>
  );
}

export function LoginScreen() {
  const { login } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const enter = () => {
    const result = login(email, password);
    if (result === "2fa") navigate({ to: "/two-factor" });
    else if (result === "ok") navigate({ to: "/home" });
    else {
      login(DEMO_CUSTOMER.email, DEMO_CUSTOMER.password);
      navigate({ to: "/home" });
    }
  };
  return (
    <AuthForm
      image={asset("media/hero-workshop.jpg")}
      kicker="Customer sign in"
      title="Welcome back"
      subtitle="Pick up a booking, a message, or an inspection."
      onSubmit={(event) => {
        event.preventDefault();
        enter();
      }}
      footer={
        <>
          <MButton type="submit" full>
            Log in
          </MButton>
          <p className="mt-3 text-center text-[14px] text-[var(--on-surface-variant)]">
            New here?{" "}
            <Link to="/register" className="font-medium text-primary">
              Create account
            </Link>
          </p>
        </>
      }
    >
      <div className="grid gap-3">
        <MField label="Email" type="text" autoComplete="username" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
        <MField
          label="Password"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          trailing={<PasswordToggle show={show} onToggle={() => setShow((v) => !v)} />}
        />
        <div className="flex items-center justify-between gap-3">
          <Link to="/forgot" className="inline-flex h-11 items-center text-[14px] font-medium text-primary">
            Forgot password?
          </Link>
        </div>
        <button
          type="button"
          className="flex min-h-14 items-center justify-between gap-3 border border-[var(--outline-variant)] bg-[var(--surface-low)] px-4 text-left"
          onClick={() => {
            setEmail(DEMO_CUSTOMER.email);
            setPassword(DEMO_CUSTOMER.password);
          }}
        >
          <span>
            <span className="block text-[14px]">Use the sample account</span>
            <span className="block text-[12px] text-[var(--on-surface-variant)]">{DEMO_CUSTOMER.email}</span>
          </span>
          <span className="text-[12px] font-medium tracking-wide text-tertiary uppercase">Fill</span>
        </button>
      </div>
    </AuthForm>
  );
}

export function RegisterScreen() {
  const { register, markOnboarded } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", password: "", confirm: "", age: false, terms: false });
  const [show, setShow] = useState(false);
  const set = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <AuthForm
      image={asset("media/precision-work.jpg")}
      kicker="New customer"
      title="Create your account"
      subtitle="A few details, then you can book the bench."
      backTo="/login"
      onSubmit={(event) => {
        event.preventDefault();
        const result = register({
          firstName: form.first,
          lastName: form.last,
          email: form.email,
          phone: form.phone,
          password: form.password,
        });
        markOnboarded();
        navigate({ to: result.ok ? "/verify-email" : "/login" });
      }}
      footer={
        <>
          <MButton type="submit" full>
            Create account
          </MButton>
          <p className="mt-3 text-center text-[14px] text-[var(--on-surface-variant)]">
            Already registered?{" "}
            <Link to="/login" className="font-medium text-primary">
              Log in
            </Link>
          </p>
        </>
      }
    >
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <MField label="First name" autoComplete="given-name" autoFocus value={form.first} onChange={(e) => set("first", e.target.value)} />
          <MField label="Last name" autoComplete="family-name" value={form.last} onChange={(e) => set("last", e.target.value)} />
        </div>
        <MField label="Email" type="text" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <MField label="Mobile number" inputMode="tel" autoComplete="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <MField
          label="Password"
          type={show ? "text" : "password"}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => set("password", e.target.value)}
          trailing={<PasswordToggle show={show} onToggle={() => setShow((v) => !v)} />}
        />
        {form.password ? <PasswordStrength value={form.password} /> : null}
        <MField label="Confirm password" type={show ? "text" : "password"} autoComplete="new-password" value={form.confirm} onChange={(e) => set("confirm", e.target.value)} />
        <div className="mt-1 grid gap-1 border border-[var(--outline-variant)] bg-[var(--surface-low)] px-3 py-2">
          <CheckRow checked={form.age} onChange={(value) => set("age", value)}>
            I confirm I am 18 years or older.
          </CheckRow>
          <CheckRow checked={form.terms} onChange={(value) => set("terms", value)}>
            I agree to the{" "}
            <Link to="/legal/$doc" params={{ doc: "terms" }} className="text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/legal/$doc" params={{ doc: "privacy" }} className="text-primary">
              Privacy Policy
            </Link>
            .
          </CheckRow>
        </div>
      </div>
    </AuthForm>
  );
}

export function VerifyEmailScreen() {
  const { db, verifyCode, resendCode, pushToast } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(30);
  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((n) => n - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);
  const email = db.pending?.email || "your email";
  return (
    <AuthForm
      image={asset("media/about-story.jpg")}
      kicker="One more step"
      title="Check your email"
      subtitle={`Enter the 6-digit code sent to ${email}. You can paste it.`}
      onSubmit={(event) => {
        event.preventDefault();
        verifyCode(code);
        navigate({ to: "/home" });
      }}
      footer={
        <>
          <MButton type="submit" full>
            Verify email
          </MButton>
          <button
            type="button"
            className="mt-2 h-11 w-full text-[14px] font-medium text-primary disabled:opacity-40"
            disabled={wait > 0}
            onClick={() => {
              resendCode();
              setWait(30);
              pushToast("Code sent", "A new code is ready.");
            }}
          >
            {wait > 0 ? `Resend in ${wait}s` : "Resend code"}
          </button>
          <SnackHost />
        </>
      }
    >
      <OtpBoxes value={code} onChange={setCode} />
      {db.pending?.code ? (
        <p className="text-[13px] text-[var(--on-surface-variant)]">
          Demo code <span className="font-medium text-foreground">{db.pending.code}</span>
        </p>
      ) : null}
    </AuthForm>
  );
}

export function VerifyPhoneScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/home", replace: true });
  }, [navigate]);
  return null;
}

export function ForgotScreen() {
  const { startReset } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthForm
      image={asset("media/contact-hero.jpg")}
      kicker="Account help"
      title="Forgot password"
      subtitle="We’ll send a reset code to the email on the account."
      backTo="/login"
      onSubmit={(event) => {
        event.preventDefault();
        if (!startReset(email)) setError("No account uses that email.");
        else navigate({ to: "/forgot-sent" });
      }}
      footer={
        <MButton type="submit" full>
          Send code
        </MButton>
      }
    >
      <MField label="Email" type="email" autoComplete="email" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
    </AuthForm>
  );
}

export function ForgotSentScreen() {
  const navigate = useNavigate();
  return (
    <AuthForm
      image={asset("media/contact-hero.jpg")}
      kicker="Account help"
      title="Check your email"
      subtitle="If that account exists, the reset code is ready on the next screen."
      backTo="/forgot"
      footer={
        <MButton full onClick={() => navigate({ to: "/reset" })}>
          Enter code
        </MButton>
      }
    >
      <p className="text-[15px] leading-6 text-[var(--on-surface-variant)]">Open the message, then come back here and enter the 6 digits. You can paste the code.</p>
    </AuthForm>
  );
}

export function ResetScreen() {
  const { db, resetPassword, pushToast } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  return (
    <AuthForm
      image={asset("media/contact-hero.jpg")}
      kicker="Account help"
      title="Choose a new password"
      subtitle="Enter the code from your email, then a password you have not used here before."
      backTo="/forgot"
      onSubmit={(event) => {
        event.preventDefault();
        if (password.length < 8 || password !== confirm) {
          setError("Use 8 or more characters and make the passwords match.");
          return;
        }
        if (!resetPassword(code, password)) setError("That code does not match.");
        else {
          pushToast("Password updated", "Sign in with the new password.");
          navigate({ to: "/login" });
        }
      }}
      footer={
        <MButton type="submit" full>
          Update password
        </MButton>
      }
    >
      <OtpBoxes value={code} onChange={setCode} />
      {db.pending?.code ? (
        <p className="text-[13px] text-[var(--on-surface-variant)]">
          Demo code <span className="font-medium text-foreground">{db.pending.code}</span>
        </p>
      ) : null}
      <MField
        label="New password"
        type={show ? "text" : "password"}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        trailing={<PasswordToggle show={show} onToggle={() => setShow((v) => !v)} />}
      />
      {password ? <PasswordStrength value={password} /> : null}
      <MField label="Confirm password" type={show ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={error} />
    </AuthForm>
  );
}

export function LockSetupScreen() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/home", replace: true });
  }, [navigate]);
  return null;
}

export function LockScreen() {
  const { user, unlock, logout } = useStore();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  return (
    <AuthForm
      image={asset("media/hero-workshop.jpg")}
      kicker="Locked"
      title={user?.firstName ? `Welcome back, ${user.firstName}` : "Welcome back"}
      subtitle="Enter your password to open the app."
      onSubmit={(event) => {
        event.preventDefault();
        if (password === user?.password) {
          unlock();
          navigate({ to: "/home" });
        } else setError("Password does not match.");
      }}
      footer={
        <>
          <MButton type="submit" full>
            Unlock
          </MButton>
          <button
            type="button"
            className="mt-2 h-11 w-full text-[14px] font-medium text-primary"
            onClick={() => {
              logout();
              navigate({ to: "/login" });
            }}
          >
            Sign out
          </button>
        </>
      }
    >
      <MField
        label="Password"
        type={show ? "text" : "password"}
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={error}
        trailing={<PasswordToggle show={show} onToggle={() => setShow((v) => !v)} />}
      />
    </AuthForm>
  );
}

export function TwoFactorScreen() {
  const { db, finishLogin, pushToast } = useStore();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  return (
    <AuthForm
      image={asset("media/services-hero.jpg")}
      kicker="Extra check"
      title="Two-factor code"
      subtitle="Enter the 6-digit code for this sign-in. You can paste it."
      backTo="/login"
      onSubmit={(event) => {
        event.preventDefault();
        if (!finishLogin(code)) setError("That code does not match.");
        else {
          pushToast("Signed in");
          navigate({ to: "/home" });
        }
      }}
      footer={
        <MButton type="submit" full>
          Continue
        </MButton>
      }
    >
      <OtpBoxes value={code} onChange={setCode} />
      {error ? <p className="text-[13px] font-medium text-error">{error}</p> : null}
      {db.pending?.code ? (
        <p className="text-[13px] text-[var(--on-surface-variant)]">
          Demo code <span className="font-medium text-foreground">{db.pending.code}</span>
        </p>
      ) : null}
    </AuthForm>
  );
}

export function LegalScreen() {
  const { doc } = useParams({ strict: false }) as { doc: string };
  const { db } = useStore();
  const navigate = useNavigate();
  const title = doc === "privacy" ? "Privacy Policy" : doc === "retention" ? "Data Retention" : "Terms of Service";
  const body =
    doc === "privacy"
      ? "Photos, messages, and service history are visible only to you and authorized REB Gunsmithing staff. Media is stored in private app storage, stripped of location metadata, and encrypted in transit and at rest. The Android app blocks screenshots on those screens with FLAG_SECURE."
      : doc === "retention"
        ? "Appointment records are kept for the life of the account. You can delete individual photos, export your data, or delete the account and its service history. Audit logs of staff access are kept for shop security."
        : "REB Gunsmithing provides service booking, messaging, and a preliminary visual inspection. The app does not sell firearms, ammunition, or accessories. You are responsible for transporting firearms unloaded and in accordance with the law. AI results are not a safety determination.";
  return (
    <Phone>
      <Scroll pad={false}>
        <div className="px-5 py-4">
          <button type="button" className="inline-flex h-11 items-center gap-0.5 text-[14px] font-medium text-primary" onClick={() => navigate({ to: db.customerId ? "/profile" : "/welcome" })}>
            <ChevronLeft className="size-5" aria-hidden /> Back
          </button>
          <p className="mt-4 text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">REB Gunsmithing</p>
          <h1 className="mt-1 text-[30px] leading-tight font-medium tracking-tight">{title}</h1>
          <p className="mt-4 text-[16px] leading-7">{body}</p>
          {doc === "privacy" ? (
            <div className="mt-6">
              <h2 className="text-[22px]">Questions</h2>
              {db.faqs.map((item) => (
                <details key={item.q} className="border-b border-[var(--outline-variant)] py-3">
                  <summary className="min-h-12 cursor-pointer text-[16px]">{item.q}</summary>
                  <p className="pb-3 text-[14px] leading-6 text-[var(--on-surface-variant)]">{item.a}</p>
                </details>
              ))}
            </div>
          ) : null}
        </div>
      </Scroll>
    </Phone>
  );
}
