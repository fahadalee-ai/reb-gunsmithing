import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FirearmFields } from "@/components/FirearmFields";
import { ConfirmDialog, EmptyState, MButton, MCard, MChip, MField, MSelect, PageBanner, SecureSurface, Sheet, StatusChip, TopBar } from "@/components/m3";
import { validateFirearm, validateSerial } from "@/lib/firearms";
import { BUSINESS, CREDENTIALS, MORE_CREDENTIALS, STATUS_LABEL } from "@/lib/business";
import { decryptSecret } from "@/lib/crypto";
import { buildPdf, downloadBlob } from "@/lib/pdf";
import { APP_VERSION } from "@/lib/business";
import { useStore } from "@/lib/store";
import { asset } from "@/lib/utils";
import type { FirearmType } from "@/lib/types";

export function MessagesScreen() {
  const { db, user, ensureConversation } = useStore();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(false);
  const list = db.conversations.filter((c) => c.userId === user?.id);
  return (
    <div className="pb-4">
      <PageBanner
        image={asset("media/craftsman-hands.jpg")}
        kicker="Private thread"
        title="Messages"
        subtitle="Only you and the shop can read these."
        action={
          <button type="button" className="h-10 shrink-0 bg-black/45 px-3 text-[13px] font-medium text-white" onClick={() => setSheet(true)}>
            Call
          </button>
        }
      />
      <div className="grid px-4 pt-2">
        {list.length === 0 ? (
          <EmptyState title="No messages yet" body="Start a private thread with the shop." action={<MButton onClick={() => navigate({ to: "/messages/$id", params: { id: ensureConversation() } })}>Message gunsmith</MButton>} />
        ) : (
          list.map((convo) => {
            const last = db.messages.filter((m) => m.conversationId === convo.id).at(-1);
            const unread = db.messages.filter((m) => m.conversationId === convo.id && m.from === "staff" && m.status !== "read").length;
            return (
              <button key={convo.id} type="button" className="flex min-h-[4.5rem] items-center gap-3 border-b border-[var(--outline-variant)] py-3 text-left" onClick={() => navigate({ to: "/messages/$id", params: { id: convo.id } })}>
                <span className={`h-10 w-[3px] shrink-0 ${unread > 0 ? "bg-tertiary" : "bg-[var(--outline-variant)]"}`} aria-hidden />
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px] font-medium">{convo.subject}</span>
                  <span className="block truncate text-[13px] text-[var(--on-surface-variant)]">{last?.text ?? "No messages"}</span>
                </span>
                {unread > 0 ? <span className="grid size-6 place-items-center bg-secondary text-[12px] text-[var(--on-secondary)]">{unread}</span> : <ChevronRight className="size-4 text-[var(--on-surface-variant)]" aria-hidden />}
              </button>
            );
          })
        )}
      </div>
      <Sheet open={sheet} title="Call the shop" onClose={() => setSheet(false)}>
        <a className="flex min-h-12 items-center text-primary" href={BUSINESS.officeTel}>Call office {BUSINESS.office}</a>
        <a className="flex min-h-12 items-center text-primary" href={BUSINESS.mobileTel}>Call mobile {BUSINESS.mobile}</a>
        <a className="flex min-h-12 items-center text-primary" href={BUSINESS.maps}>Open in Maps</a>
      </Sheet>
    </div>
  );
}

export function ThreadScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { db, sendMessage, markConversationRead, user } = useStore();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const convo = db.conversations.find((c) => c.id === id && c.userId === user?.id);
  const messages = db.messages.filter((m) => m.conversationId === id);
  useEffect(() => {
    if (convo) markConversationRead(id);
  }, [convo, id, messages.length, markConversationRead]);
  if (!convo) return <p className="p-6">Conversation not found.</p>;
  return (
    <SecureSurface>
      <div className="flex h-[calc(100%-0px)] min-h-[70vh] flex-col">
        <TopBar title="REB Gunsmithing" back={() => navigate({ to: "/messages" })} />
        <div className="flex flex-1 flex-col gap-2 px-4">
          {messages.map((message) => (
            <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-[14px] leading-6 ${message.from === "customer" ? "ml-auto bg-primary text-primary-foreground" : "bg-card"}`}>
              <p>{message.text}</p>
              <p className="mt-1 text-[11px] opacity-75">{new Date(message.at).toLocaleString()} · {message.status}</p>
            </div>
          ))}
        </div>
        <form
          className="flex items-center gap-2 px-3 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!text.trim()) return;
            sendMessage(id, text.trim(), "customer");
            setText("");
          }}
        >
          <label className="sr-only" htmlFor="chat">Message</label>
          <input id="chat" value={text} onChange={(e) => setText(e.target.value)} placeholder="Message" className="h-12 flex-1 rounded-full border border-outline bg-transparent px-4" />
          <MButton type="submit">Send</MButton>
        </form>
      </div>
    </SecureSurface>
  );
}

export function GalleryScreen() {
  const { db } = useStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>("all");
  const items = db.gallery.filter((g) => g.published && (filter === "all" || g.category === filter));
  return (
    <div>
      <TopBar title="Projects" back={() => navigate({ to: "/home" })} />
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 no-scrollbar">
        {["all", "cleaning", "repair", "inspection", "appraisal"].map((item) => (
          <MChip key={item} selected={filter === item} onClick={() => setFilter(item)}>{item === "inspection" ? "Inspection & Maintenance" : item[0].toUpperCase() + item.slice(1)}</MChip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 px-4">
        {items.length === 0 ? <EmptyState title="No projects" body="Published work will appear here." /> : null}
        {items.map((item) => (
          <button key={item.id} type="button" className="text-left" onClick={() => navigate({ to: "/gallery/$id", params: { id: item.id } })}>
            <img src={item.image} alt="" className="h-36 w-full rounded-2xl object-cover" />
            <p className="mt-2 text-[14px] font-medium">{item.title}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProjectScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { db } = useStore();
  const navigate = useNavigate();
  const project = db.gallery.find((g) => g.id === id);
  const [pos, setPos] = useState(50);
  if (!project) return null;
  return (
    <div>
      <TopBar title="Project" back={() => navigate({ to: "/gallery" })} />
      <div className="px-4">
        {project.before && project.after ? (
          <div className="relative h-64 overflow-hidden rounded-2xl">
            <img src={project.before} alt="Before" className="absolute inset-0 h-full w-full object-cover" />
            <img src={project.after} alt="After" className="absolute inset-0 h-full w-full object-cover" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />
            <input aria-label="Before and after" type="range" min={0} max={100} value={pos} onChange={(e) => setPos(Number(e.target.value))} className="absolute inset-x-4 bottom-3" />
          </div>
        ) : (
          <img src={project.image} alt="" className="h-64 w-full rounded-2xl object-cover" />
        )}
        <StatusChip status={project.category} />
        <h1 className="mt-3 text-[28px]">{project.title}</h1>
        <p className="mt-2 text-[14px] leading-6">{project.description}</p>
        <p className="mt-2 text-[12px] text-[var(--on-surface-variant)]">{project.date}</p>
      </div>
    </div>
  );
}

export function HistoryScreen() {
  const { db, user } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [offline, setOffline] = useState(typeof navigator !== "undefined" ? !navigator.onLine : false);
  const rows = useMemo(() => {
    if (!user) return [];
    const items = [
      ...db.appointments.filter((a) => a.userId === user.id).map((a) => ({ id: a.id, title: db.services.find((s) => s.id === a.serviceId)?.name ?? "Appointment", meta: a.date, kind: a.serviceId, status: a.status })),
      ...db.requests.filter((r) => r.userId === user.id).map((r) => ({ id: r.id, title: "Service request", meta: r.createdAt.slice(0, 10), kind: r.serviceId, status: r.status })),
      ...db.inspections.filter((i) => i.userId === user.id).map((i) => ({ id: i.id, title: "Inspection", meta: i.createdAt.slice(0, 10), kind: "inspection", status: i.status })),
      ...db.documents.filter((d) => d.userId === user.id).map((d) => ({ id: d.id, title: d.title, meta: d.date, kind: d.kind, status: d.kind })),
    ];
    return items
      .filter((item) => filter === "all" || item.kind === filter || item.status === filter)
      .filter((item) => `${item.title} ${item.id}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => b.meta.localeCompare(a.meta));
  }, [db, filter, q, user]);
  if (offline) {
    return (
      <div className="grid gap-3 px-5 py-10">
        <h1 className="text-[28px]">No connection</h1>
        <p className="text-[14px]">Service history needs a connection in this preview.</p>
        <MButton onClick={() => setOffline(!navigator.onLine)}>Retry</MButton>
      </div>
    );
  }
  return (
    <div>
      <TopBar title="Service history" back={() => navigate({ to: "/profile" })} />
      <div className="px-4">
        <MField label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
          {["all", "cleaning", "repair", "inspection", "appraisal"].map((item) => (
            <MChip key={item} selected={filter === item} onClick={() => setFilter(item)}>{item}</MChip>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          {rows.length === 0 ? <EmptyState title="No history" body="Appointments, requests, inspections, and documents will collect here." /> : null}
          {rows.map((row) => (
            <button key={row.id} type="button" className="flex min-h-[4.5rem] flex-col justify-center border-b border-[#3d4a5c] py-3 text-left" onClick={() => navigate({ to: "/history/$id", params: { id: row.id } })}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-[16px] font-medium text-white">{row.title}</span>
                <StatusChip status={row.status} />
              </span>
              <span className="mt-1 text-[14px] text-[#d7e0ea]">{row.id} · {row.meta}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HistoryDetailScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { db, user } = useStore();
  const navigate = useNavigate();
  const [share, setShare] = useState(false);
  const appt = db.appointments.find((a) => a.id === id && a.userId === user?.id);
  const request = db.requests.find((r) => r.id === id && r.userId === user?.id);
  const inspection = db.inspections.find((i) => i.id === id && i.userId === user?.id);
  const doc = db.documents.find((d) => d.id === id && d.userId === user?.id);
  const download = () => {
    if (!doc) return;
    downloadBlob(buildPdf(doc.title, doc.lines), `${doc.id}.pdf`);
  };
  return (
    <SecureSurface>
      <div>
        <TopBar title="Record" back={() => navigate({ to: "/history" })} />
        <div className="grid gap-4 px-4 pb-8">
          {request ? (
            <>
              <section className="relative -mx-4 h-44 overflow-hidden">
                <img src={db.services.find((s) => s.id === request.serviceId)?.image || asset("media/precision-work.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1218] via-[#0e1218]/55 to-black/25" />
                <div className="relative flex h-full flex-col justify-end px-4 pb-4">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Service request</p>
                  <h1 className="text-[28px] leading-tight font-medium text-white">{db.services.find((s) => s.id === request.serviceId)?.name ?? "Request"}</h1>
                  <p className="mt-1 text-[15px] text-white">{request.id}</p>
                </div>
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
              </section>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[16px] text-white">Status</p>
                <StatusChip status={request.status} />
              </div>
              <section className="border border-[#3d4a5c] bg-[var(--surface-low)] px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">What you asked</p>
                <p className="mt-2 text-[16px] leading-6 text-white">{request.description}</p>
              </section>
              <section className="grid gap-3 border border-[#3d4a5c] bg-[var(--surface-low)] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Firearm</p>
                  <p className="mt-1 text-[16px] text-white">{request.make} {request.model}</p>
                  <p className="text-[15px] text-[#d7e0ea]">{request.firearmType} · {request.caliber}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Contact</p>
                  <p className="mt-1 text-[16px] text-white capitalize">{request.contactMethod} · {request.urgency}</p>
                </div>
                {request.quote ? (
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Quote</p>
                    <p className="mt-1 text-[16px] text-white">{request.quote}</p>
                  </div>
                ) : null}
              </section>
            </>
          ) : null}
          {appt ? (
            <>
              <section className="relative -mx-4 h-44 overflow-hidden">
                <img src={db.services.find((s) => s.id === appt.serviceId)?.image || asset("media/hero-workshop.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1218] via-[#0e1218]/55 to-black/25" />
                <div className="relative flex h-full flex-col justify-end px-4 pb-4">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Appointment</p>
                  <h1 className="text-[28px] leading-tight font-medium text-white">{db.services.find((s) => s.id === appt.serviceId)?.name}</h1>
                  <p className="mt-1 text-[15px] text-white">{appt.id}</p>
                </div>
                <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
              </section>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[16px] text-white">{STATUS_LABEL[appt.status] ?? appt.status}</p>
                <StatusChip status={appt.status} />
              </div>
              <section className="border border-[#3d4a5c] bg-[var(--surface-low)] px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Firearm</p>
                <p className="mt-1 text-[16px] text-white">{appt.make} {appt.model}</p>
                <p className="text-[15px] text-[#d7e0ea]">{appt.firearmType} · {appt.caliber}</p>
              </section>
              <section className="border border-[#3d4a5c] bg-[var(--surface-low)] px-4 py-3">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">From the gunsmith</p>
                <p className="mt-2 text-[16px] leading-6 text-white">{appt.gunsmithNotes || "No gunsmith notes yet."}</p>
                {appt.quote ? <p className="mt-2 text-[16px] text-white">Quote {appt.quote}</p> : null}
              </section>
            </>
          ) : null}
          {inspection ? (
            <section className="border border-[#3d4a5c] bg-[var(--surface-low)] px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Inspection</p>
              <h1 className="mt-1 text-[24px] font-medium text-white">{inspection.id}</h1>
              <div className="mt-2"><StatusChip status={inspection.status} /></div>
              <p className="mt-3 text-[16px] leading-6 text-white">{inspection.assessment?.notes || inspection.ai?.summary || "No notes yet."}</p>
            </section>
          ) : null}
          {doc ? (
            <section className="border border-[#3d4a5c] bg-[var(--surface-low)] px-4 py-3">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">{doc.kind}</p>
              <h1 className="mt-1 text-[24px] font-medium text-white">{doc.title}</h1>
              <div className="mt-3 grid gap-2">
                {doc.lines.map((line) => (
                  <p key={line} className="text-[16px] leading-6 text-white">{line}</p>
                ))}
              </div>
              <MButton full className="mt-4" onClick={() => setShare(true)}>Share or download</MButton>
            </section>
          ) : null}
          {!appt && !request && !inspection && !doc ? <p className="text-[16px] text-white">This record is not on your account.</p> : null}
        </div>
        <Sheet open={share} title="Document" onClose={() => setShare(false)}>
          <MButton full onClick={download}>Download PDF</MButton>
          <MButton
            full
            className="mt-2"
            variant="tonal"
            onClick={async () => {
              if (!doc) return;
              if (navigator.share) await navigator.share({ title: doc.title, text: doc.lines.join("\n") });
              else download();
            }}
          >
            Share
          </MButton>
        </Sheet>
      </div>
    </SecureSurface>
  );
}

export function NotificationsScreen() {
  const { db, user, markNotice, markAllNotices } = useStore();
  const navigate = useNavigate();
  const list = db.notices.filter((n) => n.userId === user?.id);
  return (
    <div>
      <TopBar title="Notifications" back={() => navigate({ to: "/home" })} action={<button type="button" className="min-h-12 px-3 text-[14px] text-primary" onClick={markAllNotices}>Read all</button>} />
      <div className="grid px-4">
        {list.length === 0 ? <EmptyState title="You're caught up" body="Appointment, message, and inspection alerts show up here." /> : null}
        {list.map((notice) => (
          <button
            key={notice.id}
            type="button"
            className="flex min-h-[4.5rem] items-start gap-3 border-b border-[#3d4a5c] py-3 text-left"
            onClick={() => {
              markNotice(notice.id);
              navigate({ to: notice.href as never });
            }}
          >
            <span className={`mt-2 h-10 w-[3px] shrink-0 ${notice.read ? "bg-[#3d4a5c]" : "bg-tertiary"}`} aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-[16px] font-medium text-white">{notice.title}</span>
                {!notice.read ? <span className="text-[13px] font-medium text-tertiary">New</span> : null}
              </span>
              <span className="mt-1 block text-[15px] leading-5 text-[#d7e0ea]">{notice.body}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProfileScreen() {
  const { user, logout, pushToast } = useStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  if (!user) return null;
  const groups: { title: string; rows: { label: string; to: "/profile/edit" | "/firearms" | "/security" | "/settings" | "/about" | "/contact" | "/help" | "/history" | "/gallery" }[] }[] = [
    {
      title: "Account",
      rows: [
        { label: "Edit profile", to: "/profile/edit" },
        { label: "Saved firearms", to: "/firearms" },
        { label: "Security", to: "/security" },
        { label: "Notification preferences", to: "/settings" },
      ],
    },
    {
      title: "Records",
      rows: [
        { label: "Service history", to: "/history" },
        { label: "Completed projects", to: "/gallery" },
      ],
    },
    {
      title: "The shop",
      rows: [
        { label: "About the shop", to: "/about" },
        { label: "Contact us", to: "/contact" },
        { label: "Help and FAQ", to: "/help" },
      ],
    },
  ];
  return (
    <div className="pb-6">
      <section className="relative h-44 overflow-hidden">
        <img src={asset("media/about-hero.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-[#0e1218]" />
        <div className="relative flex h-full items-end gap-3 px-4 pb-4">
          <span className="grid size-14 shrink-0 place-items-center bg-primary text-[18px] font-medium text-primary-foreground">
            {user.firstName[0]}
            {user.lastName[0]}
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Your account</span>
            <span className="block truncate text-[26px] leading-tight font-medium text-white">
              {user.firstName} {user.lastName}
            </span>
            <span className="block truncate text-[13px] text-white/75">{user.email}</span>
          </span>
        </div>
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
      </section>
      <div className="px-4 pt-5">
        {groups.map((group) => (
          <section key={group.title} className="mb-5">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">{group.title}</p>
            <div className="mt-1">
              {group.rows.map((row) => (
                <Link key={row.label} to={row.to} className="flex min-h-14 items-center justify-between border-b border-[var(--outline-variant)] text-[15px]">
                  {row.label}
                  <ChevronRight className="size-4 text-[var(--on-surface-variant)]" aria-hidden />
                </Link>
              ))}
            </div>
          </section>
        ))}
        <section>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Legal</p>
          <Link to="/legal/$doc" params={{ doc: "terms" }} className="flex min-h-14 items-center justify-between border-b border-[var(--outline-variant)] text-[15px]">
            Terms
            <ChevronRight className="size-4 text-[var(--on-surface-variant)]" aria-hidden />
          </Link>
          <Link to="/legal/$doc" params={{ doc: "privacy" }} className="flex min-h-14 items-center justify-between border-b border-[var(--outline-variant)] text-[15px]">
            Privacy Policy
            <ChevronRight className="size-4 text-[var(--on-surface-variant)]" aria-hidden />
          </Link>
        </section>
        <p className="pt-4 text-[12px] text-[var(--on-surface-variant)]">Version {APP_VERSION}</p>
        <MButton className="mt-3" variant="outlined" onClick={() => setOpen(true)}>
          Log out
        </MButton>
      </div>
      <ConfirmDialog open={open} title="Log out?" body="You will need to sign in again." confirmLabel="Log out" onClose={() => setOpen(false)} onConfirm={() => { logout(); pushToast("Signed out"); navigate({ to: "/login" }); }} />
    </div>
  );
}

export function EditProfileScreen() {
  const { user, updateProfile } = useStore();
  const navigate = useNavigate();
  const [first, setFirst] = useState(user?.firstName ?? "");
  const [last, setLast] = useState(user?.lastName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  return (
    <div>
      <TopBar title="Edit profile" back={() => navigate({ to: "/profile" })} />
      <form className="grid gap-3 px-4" onSubmit={(e) => { e.preventDefault(); updateProfile({ firstName: first, lastName: last, phone }); navigate({ to: "/profile" }); }}>
        <MField label="First name" value={first} onChange={(e) => setFirst(e.target.value)} />
        <MField label="Last name" value={last} onChange={(e) => setLast(e.target.value)} />
        <MField label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <MButton type="submit" full>Save</MButton>
      </form>
    </div>
  );
}

export function FirearmsScreen() {
  const { db, user, addFirearm, removeFirearm } = useStore();
  const navigate = useNavigate();
  const [type, setType] = useState<FirearmType>("Rifle");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [caliber, setCaliber] = useState("");
  const [serial, setSerial] = useState("");
  const [revealed, setRevealed] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const mine = db.firearms.filter((f) => f.userId === user?.id);
  return (
    <div>
      <TopBar title="Saved firearms" back={() => navigate({ to: "/profile" })} />
      <div className="grid gap-3 px-4">
        {mine.map((item) => (
          <MCard key={item.id}>
            <p className="text-[16px] font-medium">{item.nickname || `${item.make} ${item.model}`}</p>
            <p className="text-[14px]">{item.type} · {item.caliber}</p>
            <p className="text-[14px]">Serial {revealed || (item.serialLast4 ? `••••${item.serialLast4}` : "not stored")}</p>
            {item.serialCipher ? (
              <button type="button" className="min-h-12 text-[14px] text-primary" onClick={async () => setRevealed(await decryptSecret(item.serialCipher!))}>Reveal on this device</button>
            ) : null}
            <button type="button" className="min-h-12 text-[14px] text-secondary" onClick={() => removeFirearm(item.id)}>Remove</button>
          </MCard>
        ))}
        <FirearmFields
          type={type}
          make={make}
          model={model}
          caliber={caliber}
          errors={errors}
          onChange={(next) => {
            setType(next.type);
            setMake(next.make);
            setModel(next.model);
            setCaliber(next.caliber);
          }}
        />
        <MField label="Serial (optional, encrypted)" value={serial} onChange={(e) => setSerial(e.target.value)} error={errors.serial} />
        <MButton
          full
          onClick={() => {
            const next = { ...validateFirearm({ type, make, model, caliber }) } as Record<string, string>;
            const serialError = validateSerial(serial);
            if (serialError) next.serial = serialError;
            setErrors(next);
            if (Object.keys(next).length) return;
            void addFirearm({ type, make, model, caliber, serial });
            setMake("");
            setModel("");
            setCaliber("");
            setSerial("");
          }}
        >
          Save firearm
        </MButton>
      </div>
    </div>
  );
}

export function SecurityScreen() {
  const { user, changePassword, setLockMinutes, setTwoFactor, deleteAccount, db, signOutSession, pushToast } = useStore();
  const navigate = useNavigate();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [remove, setRemove] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  if (!user) return null;
  return (
    <div>
      <TopBar title="Security" back={() => navigate({ to: "/profile" })} />
      <div className="grid gap-3 px-4">
        <MField label="Current password" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <MField label="New password" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
        <MButton onClick={() => pushToast(changePassword(current, next) ? "Password updated" : "Current password is wrong")}>Change password</MButton>
        <MSelect label="Auto-lock" value={String(user.lockMinutes)} onChange={(next) => setLockMinutes(Number(next))}>
          {[5, 10, 15, 30].map((n) => <option key={n} value={n}>{n} minutes</option>)}
        </MSelect>
        <label className="flex min-h-12 items-center justify-between text-[14px]">
          Two-factor authentication
          <input type="checkbox" checked={user.twoFactorEnabled} onChange={(e) => setTwoFactor(e.target.checked)} />
        </label>
        <h2 className="text-[22px]">Sessions</h2>
        {db.sessions.filter((s) => s.userId === user.id).map((session) => (
          <div key={session.id} className="flex items-center justify-between text-[14px]">
            <span>{session.device}<br />{session.ip}</span>
            {!session.current ? <button type="button" className="min-h-12 text-primary" onClick={() => signOutSession(session.id)}>Sign out</button> : <span>This device</span>}
          </div>
        ))}
        <MField label="Password to delete the account" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={error} />
        <MButton variant="danger" onClick={() => setRemove(true)}>Delete account</MButton>
      </div>
      <ConfirmDialog
        open={remove}
        title="Delete account and data?"
        body="Appointments, photos, messages, and documents on this account will be removed."
        confirmLabel="Delete"
        danger
        onClose={() => setRemove(false)}
        onConfirm={() => {
          if (!deleteAccount(password)) setError("Re-enter your password in the field below, then confirm.");
          else navigate({ to: "/welcome" });
        }}
      />
    </div>
  );
}

export function SettingsScreen() {
  const { user, setNotify, setAppearance } = useStore();
  const navigate = useNavigate();
  if (!user) return null;
  const labels: Record<keyof typeof user.notify, string> = {
    appointment: "Appointment confirmed or changed",
    reminder: "Reminders (24h and 2h)",
    status: "Status updates",
    message: "New message",
    inspection: "Inspection reviewed",
    appraisal: "Appraisal ready",
  };
  return (
    <div>
      <TopBar title="Settings" back={() => navigate({ to: "/profile" })} />
      <div className="grid gap-4 px-4">
        <section>
          <h2 className="text-[22px]">Notifications</h2>
          {(Object.keys(labels) as (keyof typeof labels)[]).map((key) => (
            <label key={key} className="flex min-h-12 items-center justify-between gap-3 text-[14px]">
              {labels[key]}
              <input type="checkbox" checked={user.notify[key]} onChange={(e) => setNotify(key, e.target.checked)} />
            </label>
          ))}
        </section>
        <section>
          <h2 className="text-[22px]">Appearance</h2>
          <div className="mt-2 flex gap-2">
            {(["dark", "light", "system"] as const).map((item) => (
              <MChip key={item} selected={user.appearance === item} onClick={() => setAppearance(item)}>{item}</MChip>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-[22px]">Language</h2>
          <p className="text-[14px] text-[var(--on-surface-variant)]">English. Service records are kept in English.</p>
        </section>
        <MButton
          variant="tonal"
          onClick={() => {
            const blob = new Blob([JSON.stringify({ profile: { name: user.firstName, email: user.email }, note: "Media references stay private to this device export." }, null, 2)], { type: "application/json" });
            downloadBlob(blob, "reb-export.json");
          }}
        >
          Export my data
        </MButton>
        <Link to="/legal/$doc" params={{ doc: "retention" }} className="min-h-12 text-primary">Data retention</Link>
      </div>
    </div>
  );
}

export function AboutScreen() {
  const { db } = useStore();
  const navigate = useNavigate();
  return (
    <div>
      <TopBar title="About" back={() => navigate({ to: "/profile" })} />
      <div className="grid gap-3 px-4 text-[14px] leading-6">
        <img src={assetSafe()} alt="" className="h-40 w-full rounded-2xl object-cover" />
        <p>REB Gunsmithing is a licensed gunsmithing business in Newport, Tennessee, owned by Rich Bryant.</p>
        <ul className="grid gap-2">
          {[...CREDENTIALS, ...MORE_CREDENTIALS].map((item) => <li key={item}>{item}</li>)}
        </ul>
        <p>{db.business.address}</p>
        <p>{db.business.hoursNote}</p>
        <a className="text-primary" href={BUSINESS.maps}>Open map</a>
      </div>
    </div>
  );
}

function assetSafe() {
  return `${import.meta.env.BASE_URL}media/about-hero.jpg`.replace(/\/{2,}/, "/");
}

export function ContactScreen() {
  const { db } = useStore();
  const navigate = useNavigate();
  return (
    <div>
      <TopBar title="Contact" back={() => navigate({ to: "/profile" })} />
      <div className="grid gap-2 px-4">
        <p className="text-[16px]">{db.business.owner}</p>
        <a className="flex min-h-12 items-center text-primary" href={BUSINESS.mobileTel}>Call mobile {db.business.mobile}</a>
        <a className="flex min-h-12 items-center text-primary" href={BUSINESS.officeTel}>Call office {db.business.office}</a>
        <a className="flex min-h-12 items-center text-primary" href={BUSINESS.maps}>{db.business.address}</a>
      </div>
    </div>
  );
}

export function HelpScreen() {
  const { db } = useStore();
  const navigate = useNavigate();
  return (
    <div>
      <TopBar title="Help" back={() => navigate({ to: "/profile" })} />
      <div className="px-4">
        {db.faqs.map((item) => (
          <details key={item.q} className="border-b border-[var(--outline-variant)] py-3">
            <summary className="min-h-12 cursor-pointer text-[16px]">{item.q}</summary>
            <p className="pb-3 text-[14px] leading-6 text-[var(--on-surface-variant)]">{item.a}</p>
          </details>
        ))}
        <p className="mt-4 text-[14px]">Office {BUSINESS.office} · Mobile {BUSINESS.mobile}</p>
      </div>
    </div>
  );
}

export function MaintenanceScreen() {
  const { db } = useStore();
  return (
    <div className="grid h-full content-center gap-3 px-6 text-center">
      <h1 className="text-[32px]">We'll be right back</h1>
      <p className="text-[14px] leading-6">{db.flags.maintenanceMessage}</p>
    </div>
  );
}

export function UpdateScreen() {
  return (
    <div className="grid h-full content-center gap-3 px-6 text-center">
      <h1 className="text-[32px]">Update required</h1>
      <p className="text-[14px] leading-6">Install the latest REB Gunsmithing app to book appointments and view private photos.</p>
      <MButton>Go to the store</MButton>
    </div>
  );
}
