import { useNavigate } from "@tanstack/react-router";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useMemo, useState } from "react";
import { Logo, MButton, MField, StatusChip } from "@/components/m3";
import { asset } from "@/lib/utils";
import { CANNED_REPLIES, TIMEZONE } from "@/lib/business";
import { DEMO_ADMIN } from "@/lib/seed";
import { formatWhen, weekdayName } from "@/lib/slots";
import { staffCan, useStore } from "@/lib/store";
import type { ApptStatus, GalleryProject, RequestStatus, ServiceId } from "@/lib/types";

const NAV = [
  ["overview", "Overview"],
  ["appointments", "Appointments"],
  ["availability", "Availability"],
  ["requests", "Service requests"],
  ["inspections", "Inspections"],
  ["messages", "Messages"],
  ["customers", "Customers"],
  ["documents", "Documents"],
  ["gallery", "Gallery"],
  ["content", "Services & content"],
  ["broadcasts", "Notifications"],
  ["staff", "Staff & roles"],
  ["audit", "Audit log"],
  ["settings", "Settings"],
] as const;

type Section = (typeof NAV)[number][0];

export function AdminLoginScreen() {
  const { beginAdminLogin, finishAdminLogin, db } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"password" | "2fa">("password");
  const [error, setError] = useState("");
  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
      <div className="relative hidden min-h-dvh overflow-hidden lg:block">
        <img src={asset("media/hero-workshop.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1218] via-[#0e1218]/55 to-black/25" />
        <div className="absolute inset-x-0 bottom-0 p-10">
          <p className="text-[12px] font-semibold tracking-[0.18em] text-tertiary uppercase">Shop desk</p>
          <p className="mt-2 max-w-md text-[36px] leading-tight font-medium text-white">The bench, the calendar, and the customers.</p>
        </div>
      </div>
      <form
        className="mx-auto grid w-full max-w-md content-center gap-4 px-6 py-10"
        onSubmit={(e) => {
          e.preventDefault();
          if (step === "password") {
            const result = beginAdminLogin(email, password);
            if (result === "invalid") setError("Those staff credentials do not match.");
            else if (result === "blocked") setError("This staff account is deactivated.");
            else setStep("2fa");
            return;
          }
          if (!finishAdminLogin(code)) setError("That authentication code does not match.");
          else navigate({ to: "/admin" });
        }}
      >
        <Logo className="h-16 w-auto" />
        <span className="h-[3px] w-12 bg-tertiary" />
        <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Staff</p>
        <h1 className="text-[32px] leading-tight font-medium">Staff sign in</h1>
        <p className="text-[14px] text-[var(--on-surface-variant)]">Owner, gunsmith, and staff accounts require a second factor. Sessions are logged.</p>
        {step === "password" ? (
          <>
            <MField label="Work email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <MField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="min-h-12 text-left text-[14px] text-primary" onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password); }}>
              Fill owner sample
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px]">Prototype code: {db.pending?.code}</p>
            <MField label="Authentication code" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value)} />
          </>
        )}
        {error ? <p className="text-[13px] text-secondary">{error}</p> : null}
        <MButton type="submit" full>{step === "password" ? "Continue" : "Enter dashboard"}</MButton>
      </form>
    </div>
  );
}

export function AdminHome() {
  const { admin, adminLogout, db } = useStore();
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [query, setQuery] = useState("");
  useEffect(() => {
    if (!admin) navigate({ to: "/admin/login" });
  }, [admin, navigate]);
  if (!admin) return null;
  const visible = NAV.filter(([id]) => {
    if (id === "settings" && !staffCan(admin.role, "settings")) return false;
    if (id === "staff" && !staffCan(admin.role, "staff")) return false;
    return true;
  });
  return (
    <div className="min-h-dvh bg-background text-foreground md:grid md:grid-cols-[240px_1fr]">
      <aside className="border-b border-[var(--outline-variant)] bg-surface-low p-4 md:min-h-dvh md:border-r md:border-b-0">
        <Logo className="h-12 w-auto" />
        <p className="mt-3 text-[13px] text-[var(--on-surface-variant)]">{admin.firstName} {admin.lastName} · {admin.role}</p>
        <nav className="mt-4 grid gap-1" aria-label="Dashboard">
          {visible.map(([id, label]) => (
            <button key={id} type="button" onClick={() => setSection(id)} className={`min-h-12 rounded-full px-4 text-left text-[14px] ${section === id ? "bg-primary-container text-on-primary-container" : ""}`}>
              {label}
            </button>
          ))}
        </nav>
        <MButton className="mt-4" variant="text" onClick={() => { adminLogout(); navigate({ to: "/admin/login" }); }}>Sign out</MButton>
      </aside>
      <div className="min-w-0">
        <header className="flex h-16 items-center gap-3 border-b border-[var(--outline-variant)] px-4">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search customers, appointments, requests" className="h-12 flex-1 rounded-full border border-outline bg-transparent px-4" aria-label="Search" />
          <span className="text-[12px] text-[var(--on-surface-variant)]">{db.notices.filter((n) => !n.read).length} notices</span>
        </header>
        <main className="p-4 md:p-6">
          {section === "overview" && <Overview />}
          {section === "appointments" && <Appointments query={query} />}
          {section === "availability" && <AvailabilityEditor />}
          {section === "requests" && <Requests query={query} />}
          {section === "inspections" && <Inspections />}
          {section === "messages" && <Inbox />}
          {section === "customers" && <Customers query={query} />}
          {section === "documents" && <Documents />}
          {section === "gallery" && <GalleryCms />}
          {section === "content" && <ContentCms />}
          {section === "broadcasts" && <Broadcasts />}
          {section === "staff" && <Staff />}
          {section === "audit" && <Audit />}
          {section === "settings" && <ShopSettings />}
        </main>
      </div>
    </div>
  );
}

function Overview() {
  const { db } = useStore();
  const today = new Date().toISOString().slice(0, 10);
  const kpis = [
    ["Today", db.appointments.filter((a) => a.date === today && a.status !== "cancelled").length],
    ["Pending requests", db.requests.filter((r) => r.status === "submitted" || r.status === "reviewing").length],
    ["Inspections to review", db.inspections.filter((i) => i.status === "submitted" || i.status === "under_review").length],
    ["Customer messages", db.messages.filter((m) => m.from === "customer" && m.status !== "read").length],
    ["Ready for pickup", db.appointments.filter((a) => a.status === "ready").length],
  ];
  const data = ["cleaning", "repair", "inspection", "appraisal"].map((id) => ({
    name: id,
    count: db.appointments.filter((a) => a.serviceId === id).length,
  }));
  const todayList = db.appointments.filter((a) => a.date === today);
  return (
    <div className="grid gap-4">
      <h1 className="text-[32px]">Overview</h1>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map(([label, value]) => (
          <article key={String(label)} className="rounded-2xl bg-card p-4">
            <p className="text-[13px] text-[var(--on-surface-variant)]">{label}</p>
            <p className="text-[32px]">{value}</p>
          </article>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="h-72 rounded-2xl bg-card p-4">
          <h2 className="mb-2 text-[18px]">Appointments by service</h2>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={data}>
              <XAxis dataKey="name" stroke="#c5d0de" />
              <YAxis allowDecimals={false} stroke="#c5d0de" />
              <Tooltip />
              <Bar dataKey="count" fill="#4C77AE" radius={6} />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="rounded-2xl bg-card p-4">
          <h2 className="text-[18px]">Today</h2>
          {todayList.length === 0 ? <p className="mt-3 text-[14px] text-[var(--on-surface-variant)]">No appointments today.</p> : null}
          {todayList.map((appt) => (
            <p key={appt.id} className="mt-3 text-[14px]">{appt.time} · {appt.id} · {appt.serviceId}</p>
          ))}
          <h2 className="mt-6 text-[18px]">Recent activity</h2>
          {db.audit.slice(0, 4).map((event) => (
            <p key={event.id} className="mt-2 text-[13px] text-[var(--on-surface-variant)]">{event.action} · {event.target}</p>
          ))}
        </article>
      </div>
    </div>
  );
}

function Appointments({ query }: { query: string }) {
  const { db, setAppointmentStatus, setAppointmentNotes } = useStore();
  const [status, setStatus] = useState("all");
  const [service, setService] = useState("all");
  const [view, setView] = useState<"list" | "day" | "week" | "month">("list");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const rows = db.appointments.filter((a) => {
    const person = db.users.find((u) => u.id === a.userId);
    const hay = `${a.id} ${person?.lastName ?? ""} ${a.make} ${a.model}`.toLowerCase();
    return (status === "all" || a.status === status) && (service === "all" || a.serviceId === service) && hay.includes(query.toLowerCase());
  });
  return (
    <div className="grid gap-3">
      <h1 className="text-[32px]">Appointments</h1>
      <div className="flex flex-wrap gap-2">
        {(["list", "day", "week", "month"] as const).map((item) => (
          <button key={item} type="button" className="h-10 rounded-lg border border-outline px-3 capitalize" onClick={() => setView(item)}>{item}</button>
        ))}
        <select aria-label="Status filter" className="h-10 rounded-lg border border-outline bg-transparent px-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          {["all", "pending", "confirmed", "in_progress", "ready", "completed", "cancelled"].map((item) => <option key={item}>{item}</option>)}
        </select>
        <select aria-label="Service filter" className="h-10 rounded-lg border border-outline bg-transparent px-2" value={service} onChange={(e) => setService(e.target.value)}>
          {["all", "cleaning", "repair", "inspection", "appraisal"].map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      {view !== "list" ? <CalendarView mode={view} /> : null}
      {rows.map((appt) => {
        const person = db.users.find((u) => u.id === appt.userId);
        return (
          <article key={appt.id} className="rounded-2xl bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-[16px] font-medium">{appt.id} · {person?.firstName} {person?.lastName}</p>
                <p className="text-[14px]">{appt.serviceId} · {formatWhen(appt.date, appt.time)} · {TIMEZONE}</p>
                <p className="text-[14px]">{appt.firearmType} {appt.make} {appt.model}</p>
              </div>
              <StatusChip status={appt.status} />
            </div>
            <label className="mt-3 block text-[13px]">
              Status
              <select className="mt-1 h-12 w-full rounded-xl border border-outline bg-transparent px-3" value={appt.status} onChange={(e) => setAppointmentStatus(appt.id, e.target.value as ApptStatus, "Updated by staff")}>
                {["pending", "confirmed", "in_progress", "ready", "completed", "cancelled"].map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </label>
            <label className="mt-2 block text-[13px]">
              Internal note to the customer
              <textarea className="mt-1 min-h-20 w-full rounded-xl border border-outline bg-transparent p-3" value={notes[appt.id] ?? appt.gunsmithNotes} onChange={(e) => setNotes((n) => ({ ...n, [appt.id]: e.target.value }))} />
            </label>
            <MButton className="mt-2" onClick={() => setAppointmentNotes(appt.id, notes[appt.id] ?? appt.gunsmithNotes)}>Send note</MButton>
          </article>
        );
      })}
    </div>
  );
}

function CalendarView({ mode }: { mode: "day" | "week" | "month" }) {
  const { db } = useStore();
  const days = useMemo(() => {
    const start = new Date();
    const count = mode === "day" ? 1 : mode === "week" ? 7 : 30;
    return Array.from({ length: count }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const iso = date.toISOString().slice(0, 10);
      return { iso, count: db.appointments.filter((a) => a.date === iso && a.status !== "cancelled").length };
    });
  }, [db.appointments, mode]);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-7">
      {days.map((day) => (
        <div key={day.iso} className="rounded-2xl bg-card p-3 text-[13px]">
          <p>{day.iso.slice(5)}</p>
          <p className="text-[20px]">{day.count}</p>
        </div>
      ))}
    </div>
  );
}

function AvailabilityEditor() {
  const { db, updateAvailability } = useStore();
  const { availability } = db;
  const [blocked, setBlocked] = useState("");
  return (
    <div className="grid max-w-2xl gap-3">
      <h1 className="text-[32px]">Availability</h1>
      <p className="text-[14px] text-[var(--on-surface-variant)]">{TIMEZONE}</p>
      <label className="text-[14px]">Slot length (minutes)
        <input type="number" className="mt-1 h-12 w-full rounded-xl border border-outline bg-transparent px-3" value={availability.slotMinutes} onChange={(e) => updateAvailability({ slotMinutes: Number(e.target.value) })} />
      </label>
      <label className="text-[14px]">Capacity per slot
        <input type="number" className="mt-1 h-12 w-full rounded-xl border border-outline bg-transparent px-3" value={availability.capacity} onChange={(e) => updateAvailability({ capacity: Number(e.target.value) })} />
      </label>
      {availability.hours.map((hours) => (
        <div key={hours.day} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 text-[14px]">
          <span>{weekdayName(hours.day)}</span>
          <input aria-label={`${weekdayName(hours.day)} open`} type="time" value={hours.open} className="h-12 rounded-xl border border-outline bg-transparent px-2" onChange={(e) => updateAvailability({ hours: availability.hours.map((h) => h.day === hours.day ? { ...h, open: e.target.value } : h) })} />
          <input aria-label={`${weekdayName(hours.day)} close`} type="time" value={hours.close} className="h-12 rounded-xl border border-outline bg-transparent px-2" onChange={(e) => updateAvailability({ hours: availability.hours.map((h) => h.day === hours.day ? { ...h, close: e.target.value } : h) })} />
          <label className="flex items-center gap-1"><input type="checkbox" checked={hours.closed} onChange={(e) => updateAvailability({ hours: availability.hours.map((h) => h.day === hours.day ? { ...h, closed: e.target.checked } : h) })} /> Closed</label>
        </div>
      ))}
      <div className="flex gap-2">
        <input type="date" value={blocked} onChange={(e) => setBlocked(e.target.value)} className="h-12 rounded-xl border border-outline bg-transparent px-3" aria-label="Blocked date" />
        <MButton onClick={() => blocked && updateAvailability({ blockedDates: [...availability.blockedDates, blocked] })}>Block date</MButton>
      </div>
      <ul className="text-[14px]">{availability.blockedDates.map((date) => <li key={date}>{date}</li>)}</ul>
    </div>
  );
}

function Requests({ query }: { query: string }) {
  const { db, setRequestStatus, convertRequest } = useStore();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const rows = db.requests.filter((r) => `${r.id} ${r.make} ${r.model}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="grid gap-3">
      <h1 className="text-[32px]">Service requests</h1>
      {rows.map((request) => (
        <article key={request.id} className="rounded-2xl bg-card p-4">
          <div className="flex items-center justify-between"><h2 className="text-[18px]">{request.id}</h2><StatusChip status={request.status} /></div>
          <p className="mt-2 text-[14px]">{request.serviceId} · {request.firearmType} {request.make} {request.model}</p>
          <p className="text-[14px] leading-6">{request.description}</p>
          <p className="text-[13px] text-[var(--on-surface-variant)]">Contact by {request.contactMethod} · {request.urgency}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <MButton onClick={() => setRequestStatus(request.id, "quoted", "Quote prepared in the shop.")}>Send quote</MButton>
            <select aria-label="Request status" className="h-12 rounded-xl border border-outline bg-transparent px-3" value={request.status} onChange={(e) => setRequestStatus(request.id, e.target.value as RequestStatus)}>
              {["submitted", "reviewing", "quoted", "scheduled", "closed"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-12 rounded-xl border border-outline bg-transparent px-3" aria-label="Convert date" />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="h-12 rounded-xl border border-outline bg-transparent px-3" aria-label="Convert time" />
            <MButton variant="tonal" onClick={() => date && convertRequest(request.id, date, time)}>Convert to appointment</MButton>
          </div>
        </article>
      ))}
    </div>
  );
}

function Inspections() {
  const { db, admin, saveAssessment, logAudit } = useStore();
  const [active, setActive] = useState(db.inspections[0]?.id ?? "");
  const item = db.inspections.find((i) => i.id === active);
  const [form, setForm] = useState({ condition: "", findings: "", recommendedServiceId: "inspection" as ServiceId, estimate: "", time: "", notes: "" });
  useEffect(() => {
    if (item) logAudit("Viewed inspection media", item.id);
    // Log once per opened inspection.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="grid content-start gap-2">
        <h1 className="text-[28px]">Inspections</h1>
        {db.inspections.map((inspection) => (
          <button key={inspection.id} type="button" className="rounded-2xl bg-card px-3 py-3 text-left" onClick={() => setActive(inspection.id)}>
            <span className="block text-[14px]">{inspection.id}</span>
            <StatusChip status={inspection.status} />
          </button>
        ))}
      </div>
      {item ? (
        <div className="relative grid gap-3 overflow-hidden rounded-2xl bg-card p-4">
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-[28px] font-medium text-white/15 rotate-[-20deg]">
            {admin?.firstName} {admin?.lastName}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid grid-cols-2 gap-2">
              {item.captures.map((capture) => (
                <img key={capture.id} src={capture.src} alt={capture.angle ?? "Submission"} className="h-36 w-full rounded-xl object-cover" />
              ))}
            </div>
            <div>
              <h2 className="text-[18px]">AI report</h2>
              <p className="mt-2 text-[14px] leading-6">{item.ai?.summary}</p>
              {item.ai?.findings.map((finding) => (
                <p key={finding.id} className="mt-2 text-[13px]">{finding.area}: {finding.detail} ({Math.round(finding.confidence * 100)}%)</p>
              ))}
            </div>
          </div>
          <h2 className="text-[18px]">Professional assessment</h2>
          {(["condition", "findings", "estimate", "time", "notes"] as const).map((key) => (
            <label key={key} className="text-[13px] capitalize">{key}
              <textarea className="mt-1 min-h-16 w-full rounded-xl border border-outline bg-transparent p-3" value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </label>
          ))}
          <label className="text-[13px]">Recommended service
            <select className="mt-1 h-12 w-full rounded-xl border border-outline bg-transparent px-3" value={form.recommendedServiceId} onChange={(e) => setForm((f) => ({ ...f, recommendedServiceId: e.target.value as ServiceId }))}>
              {db.services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <MButton onClick={() => saveAssessment(item.id, { ...form, author: `${admin?.firstName} ${admin?.lastName}`, sentAt: new Date().toISOString() }, true)}>Send assessment to customer</MButton>
        </div>
      ) : null}
    </div>
  );
}

function Inbox() {
  const { db, sendMessage, ensureConversation } = useStore();
  const [active, setActive] = useState(db.conversations[0]?.id ?? "");
  const [text, setText] = useState("");
  const convo = db.conversations.find((c) => c.id === active);
  const customer = db.users.find((u) => u.id === convo?.userId);
  const messages = db.messages.filter((m) => m.conversationId === active);
  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr_240px]">
      <div>
        <h1 className="text-[28px]">Messages</h1>
        {db.conversations.map((item) => (
          <button key={item.id} type="button" className="mt-2 block min-h-12 w-full rounded-2xl bg-card px-3 text-left" onClick={() => setActive(item.id)}>{item.subject}</button>
        ))}
      </div>
      <div>
        <div className="grid gap-2">
          {messages.map((message) => (
            <p key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-[14px] ${message.from === "staff" ? "ml-auto bg-primary text-primary-foreground" : "bg-card"}`}>{message.text}</p>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {CANNED_REPLIES.map((reply) => (
            <button key={reply} type="button" className="rounded-lg border border-outline px-3 py-2 text-left text-[12px]" onClick={() => setText(reply)}>{reply}</button>
          ))}
        </div>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; sendMessage(active || ensureConversation(), text.trim(), "staff"); setText(""); }}>
          <input value={text} onChange={(e) => setText(e.target.value)} className="h-12 flex-1 rounded-full border border-outline bg-transparent px-4" aria-label="Reply" />
          <MButton type="submit">Send</MButton>
        </form>
      </div>
      <aside className="rounded-2xl bg-card p-4 text-[14px]">
        <h2 className="text-[18px]">Customer</h2>
        <p className="mt-2">{customer?.firstName} {customer?.lastName}</p>
        <p>{customer?.phone}</p>
        <p className="mt-3 text-[13px] text-[var(--on-surface-variant)]">{db.appointments.filter((a) => a.userId === customer?.id).length} appointments</p>
      </aside>
    </div>
  );
}

function Customers({ query }: { query: string }) {
  const { db, setBlocked, admin } = useStore();
  const people = db.users.filter((u) => u.role === "customer" && `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="grid gap-3">
      <h1 className="text-[32px]">Customers</h1>
      {people.map((person) => (
        <article key={person.id} className="rounded-2xl bg-card p-4">
          <h2 className="text-[18px]">{person.firstName} {person.lastName}</h2>
          <p className="text-[14px]">{person.email} · {person.phone}</p>
          <p className="mt-2 text-[13px] text-[var(--on-surface-variant)]">
            {db.appointments.filter((a) => a.userId === person.id).length} appointments · {db.inspections.filter((i) => i.userId === person.id).length} inspections · {db.messages.filter((m) => db.conversations.some((c) => c.id === m.conversationId && c.userId === person.id)).length} messages
          </p>
          {staffCan(admin?.role, "write") ? (
            <MButton className="mt-3" variant={person.blocked ? "tonal" : "danger"} onClick={() => setBlocked(person.id, !person.blocked)}>
              {person.blocked ? "Restore account" : "Deactivate account"}
            </MButton>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function Documents() {
  const { db, addDocument } = useStore();
  const [userId, setUserId] = useState(db.users.find((u) => u.role === "customer")?.id ?? "");
  const [title, setTitle] = useState("Appraisal report");
  const [kind, setKind] = useState<"appraisal" | "invoice" | "receipt">("appraisal");
  const [body, setBody] = useState("Prepared for the account holder. No serial number is included.");
  return (
    <div className="grid max-w-xl gap-3">
      <h1 className="text-[32px]">Appraisals and documents</h1>
      <select aria-label="Customer" className="h-12 rounded-xl border border-outline bg-transparent px-3" value={userId} onChange={(e) => setUserId(e.target.value)}>
        {db.users.filter((u) => u.role === "customer").map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
      </select>
      <MField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <select aria-label="Document type" className="h-12 rounded-xl border border-outline bg-transparent px-3" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
        <option value="appraisal">Appraisal</option>
        <option value="invoice">Invoice</option>
        <option value="receipt">Receipt</option>
      </select>
      <textarea className="min-h-28 rounded-xl border border-outline bg-transparent p-3" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Document text" />
      <MButton onClick={() => addDocument({ userId, kind, title, date: new Date().toISOString().slice(0, 10), lines: body.split("\n") })}>Upload to customer history</MButton>
      <ul className="text-[14px]">{db.documents.map((doc) => <li key={doc.id}>{doc.id} · {doc.title}</li>)}</ul>
    </div>
  );
}

function GalleryCms() {
  const { db, saveProject, deleteProject } = useStore();
  const blank: GalleryProject = { id: `g-${Date.now()}`, title: "", category: "cleaning", description: "", image: db.gallery[0]?.image ?? "", date: new Date().toISOString().slice(0, 10), published: false, order: db.gallery.length + 1 };
  const [draft, setDraft] = useState<GalleryProject>(blank);
  return (
    <div className="grid gap-3">
      <h1 className="text-[32px]">Completed projects</h1>
      <div className="grid max-w-xl gap-2 rounded-2xl bg-card p-4">
        <MField label="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
        <textarea className="min-h-24 rounded-xl border border-outline bg-transparent p-3" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} aria-label="Description" />
        <label className="flex min-h-12 items-center gap-2 text-[14px]"><input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} /> Published</label>
        <MButton onClick={() => draft.title && saveProject(draft)}>Save project</MButton>
      </div>
      {db.gallery.map((project) => (
        <article key={project.id} className="flex items-center justify-between rounded-2xl bg-card p-3">
          <div>
            <p className="text-[15px]">{project.title}</p>
            <p className="text-[12px]">{project.published ? "Published" : "Hidden"} · {project.category}</p>
          </div>
          <div className="flex gap-2">
            <MButton variant="text" onClick={() => saveProject({ ...project, published: !project.published })}>{project.published ? "Unpublish" : "Publish"}</MButton>
            <MButton variant="text" className="text-secondary" onClick={() => deleteProject(project.id)}>Delete</MButton>
          </div>
        </article>
      ))}
    </div>
  );
}

function ContentCms() {
  const { db, updateService, updateFaqs } = useStore();
  return (
    <div className="grid gap-4">
      <h1 className="text-[32px]">Services and content</h1>
      {db.services.map((service) => (
        <article key={service.id} className="grid gap-2 rounded-2xl bg-card p-4">
          <h2 className="text-[18px]">{service.name}</h2>
          <textarea className="min-h-20 rounded-xl border border-outline bg-transparent p-3" defaultValue={service.summary} aria-label={`${service.name} summary`} onBlur={(e) => updateService(service.id, { summary: e.target.value })} />
          <MField label="Turnaround" defaultValue={service.turnaround} onBlur={(e) => updateService(service.id, { turnaround: e.target.value })} />
        </article>
      ))}
      <article className="rounded-2xl bg-card p-4">
        <h2 className="text-[18px]">FAQs</h2>
        {db.faqs.map((faq, index) => (
          <label key={faq.q} className="mt-3 block text-[13px]">{faq.q}
            <textarea className="mt-1 min-h-16 w-full rounded-xl border border-outline bg-transparent p-3" defaultValue={faq.a} onBlur={(e) => updateFaqs(db.faqs.map((item, i) => i === index ? { ...item, a: e.target.value } : item))} />
          </label>
        ))}
      </article>
    </div>
  );
}

function Broadcasts() {
  const { broadcast, pushToast } = useStore();
  const [title, setTitle] = useState("Shop update");
  const [body, setBody] = useState("");
  return (
    <form className="grid max-w-xl gap-3" onSubmit={(e) => { e.preventDefault(); broadcast(title, body, "appointment"); pushToast("Notification queued", "Lock-screen text omits private details."); }}>
      <h1 className="text-[32px]">Notifications</h1>
      <MField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea required className="min-h-28 rounded-xl border border-outline bg-transparent p-3" value={body} onChange={(e) => setBody(e.target.value)} aria-label="Message" />
      <MButton type="submit">Send to customers</MButton>
    </form>
  );
}

function Staff() {
  const { db, addStaff, pushToast } = useStore();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"gunsmith" | "staff">("staff");
  return (
    <div className="grid max-w-xl gap-3">
      <h1 className="text-[32px]">Staff and roles</h1>
      {db.users.filter((u) => u.role !== "customer").map((person) => (
        <p key={person.id} className="text-[14px]">{person.firstName} {person.lastName} · {person.role} · {person.email}</p>
      ))}
      <MField label="First name" value={first} onChange={(e) => setFirst(e.target.value)} />
      <MField label="Last name" value={last} onChange={(e) => setLast(e.target.value)} />
      <MField label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <select aria-label="Role" className="h-12 rounded-xl border border-outline bg-transparent px-3" value={role} onChange={(e) => setRole(e.target.value as "gunsmith" | "staff")}>
        <option value="staff">Staff</option>
        <option value="gunsmith">Gunsmith</option>
      </select>
      <MButton onClick={() => pushToast(addStaff({ firstName: first, lastName: last, email, phone: "", password: "ChangeMe1", role }) ? "Staff account added" : "That email is already used")}>Add staff</MButton>
    </div>
  );
}

function Audit() {
  const { db } = useStore();
  return (
    <div>
      <h1 className="text-[32px]">Security and audit</h1>
      <ul className="mt-4 grid gap-2">
        {db.audit.map((event) => (
          <li key={event.id} className="rounded-2xl bg-card px-4 py-3 text-[14px]">
            <span className="font-medium">{event.action}</span>
            <span className="block text-[12px] text-[var(--on-surface-variant)]">{event.actor} · {event.target} · {new Date(event.at).toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ShopSettings() {
  const { db, updateBusiness, setAi, setFlags, setAppearance, admin, resetDemo, pushToast } = useStore();
  return (
    <div className="grid max-w-xl gap-3">
      <h1 className="text-[32px]">Settings</h1>
      <MField label="Address" defaultValue={db.business.address} onBlur={(e) => updateBusiness({ address: e.target.value })} />
      <MField label="Mobile" defaultValue={db.business.mobile} onBlur={(e) => updateBusiness({ mobile: e.target.value })} />
      <MField label="Office" defaultValue={db.business.office} onBlur={(e) => updateBusiness({ office: e.target.value })} />
      <MField label="Hours note" defaultValue={db.business.hoursNote} onBlur={(e) => updateBusiness({ hoursNote: e.target.value })} />
      <MField label="Announcement" defaultValue={db.business.announcement} onBlur={(e) => updateBusiness({ announcement: e.target.value })} />
      <label className="flex min-h-12 items-center justify-between text-[14px]">AI assessments
        <input type="checkbox" checked={db.ai.enabled} onChange={(e) => setAi({ enabled: e.target.checked })} />
      </label>
      <label className="text-[13px]">Disclaimer
        <textarea className="mt-1 min-h-28 w-full rounded-xl border border-outline bg-transparent p-3" defaultValue={db.ai.disclaimer} onBlur={(e) => setAi({ disclaimer: e.target.value })} />
      </label>
      <label className="text-[13px]">Confidence threshold
        <input type="number" step="0.05" min="0" max="1" className="mt-1 h-12 w-full rounded-xl border border-outline bg-transparent px-3" defaultValue={db.ai.confidenceThreshold} onBlur={(e) => setAi({ confidenceThreshold: Number(e.target.value) })} />
      </label>
      <label className="flex min-h-12 items-center justify-between text-[14px]">Maintenance mode
        <input type="checkbox" checked={db.flags.maintenance} onChange={(e) => setFlags({ maintenance: e.target.checked })} />
      </label>
      <MField label="Minimum app version" defaultValue={db.flags.minVersion} onBlur={(e) => setFlags({ minVersion: e.target.value })} />
      <div className="flex gap-2">
        {(["dark", "light", "system"] as const).map((item) => (
          <button key={item} type="button" className="h-10 rounded-lg border border-outline px-3" onClick={() => admin && setAppearance(item)}>{item}</button>
        ))}
      </div>
      <MButton variant="outlined" onClick={() => { resetDemo(); pushToast("Sample data reset"); }}>Reset sample data</MButton>
    </div>
  );
}
