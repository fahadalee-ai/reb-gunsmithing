import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, CalendarClock, Camera, ChevronRight, MapPin, MessageSquare, Phone, Wrench } from "lucide-react";
import { Logo, MButton, StatusChip } from "@/components/m3";
import { BUSINESS, CREDENTIALS } from "@/lib/business";
import { formatWhen } from "@/lib/slots";
import { useStore } from "@/lib/store";
import { asset } from "@/lib/utils";

const actions = [
  { to: "/book/new" as const, label: "Book", hint: "Pick a time", image: asset("media/tools-grid.jpg"), icon: CalendarClock },
  { to: "/inspect/new" as const, label: "Inspect", hint: "Send photos", image: asset("media/services-detail.jpg"), icon: Camera },
  { to: "/request" as const, label: "Request", hint: "Describe the job", image: asset("media/precision-work.jpg"), icon: Wrench },
  { to: "/messages" as const, label: "Message", hint: "Ask the shop", image: asset("media/craftsman-hands.jpg"), icon: MessageSquare },
];

export function HomeScreen() {
  const { db, user } = useStore();
  const navigate = useNavigate();
  if (!user) return null;
  const upcoming = db.appointments
    .filter((item) => item.userId === user.id && !["completed", "cancelled"].includes(item.status))
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))[0];
  const service = db.services.find((item) => item.id === upcoming?.serviceId);
  const unread = db.notices.filter((item) => item.userId === user.id && !item.read).length;
  const projects = db.gallery.filter((item) => item.published).sort((a, b) => a.order - b.order);
  const activity = db.notices.filter((item) => item.userId === user.id).slice(0, 4);
  const hero = upcoming && service ? service.image : asset("media/hero-workshop.jpg");

  return (
    <div className="pb-4">
      <section className="relative h-[18rem] overflow-hidden">
        <img src={hero} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/25 to-[#0e1218]" />
        <div className="relative flex h-full flex-col px-4 pt-3 pb-5">
          <div className="flex items-center justify-between">
            <Logo className="h-12 w-auto" />
            <Link
              to="/notifications"
              aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
              className="relative grid size-12 place-items-center bg-black/35 text-white"
            >
              <Bell className="size-5" />
              {unread > 0 ? <span className="absolute top-1.5 right-1.5 grid size-5 place-items-center bg-secondary text-[11px] text-white">{unread}</span> : null}
            </Link>
          </div>
          <div className="mt-auto">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Welcome back</p>
            <h1 className="mt-1 text-[34px] leading-none font-medium tracking-tight text-white">{user.firstName}</h1>
            {upcoming && service ? (
              <div className="mt-2">
                <StatusChip status={upcoming.status} />
                <p className="mt-2 text-[20px] font-medium text-white">{service.name}</p>
                <p className="text-[14px] text-white/85">
                  {upcoming.make} {upcoming.model} · {formatWhen(upcoming.date, upcoming.time)}
                </p>
                <div className="mt-3 flex gap-2">
                  <MButton className="h-10" onClick={() => navigate({ to: "/book/$id", params: { id: upcoming.id } })}>
                    View visit
                  </MButton>
                  <MButton variant="tonal" className="h-10" onClick={() => navigate({ to: "/book/$id", params: { id: upcoming.id } })}>
                    Reschedule
                  </MButton>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <p className="max-w-xs text-[15px] leading-6 text-white/85">Nothing on the calendar. Book cleaning, repair, inspection, or an appraisal.</p>
                <MButton className="mt-3 h-10" onClick={() => navigate({ to: "/book/new" })}>
                  Book now
                </MButton>
              </div>
            )}
          </div>
        </div>
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
      </section>

      {db.business.announcement ? (
        <p className="mx-4 mt-4 border border-tertiary/70 bg-[var(--surface-low)] px-4 py-3 text-[14px] leading-6">{db.business.announcement}</p>
      ) : null}

      <section className="mt-5 px-4">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button key={action.label} type="button" onClick={() => navigate({ to: action.to })} className="relative h-24 overflow-hidden text-left">
                <img src={action.image} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0e1218]/92 via-[#0e1218]/72 to-[#0e1218]/30" />
                <span className="relative flex h-full flex-col justify-between p-3 text-white">
                  <Icon className="size-5 text-tertiary" aria-hidden />
                  <span>
                    <span className="block text-[15px] font-medium">{action.label}</span>
                    <span className="block text-[12px] text-white/75">{action.hint}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-7">
        <div className="mb-3 flex items-end justify-between px-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">On the bench</p>
            <h2 className="text-[22px] font-medium">Services</h2>
          </div>
          <Link to="/services" className="inline-flex h-11 items-center text-[14px] font-medium text-primary">
            See all
          </Link>
        </div>
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
          {db.services.map((item) => (
            <Link key={item.id} to="/services/$id" params={{ id: item.id }} className="relative h-52 w-[82%] shrink-0 snap-start overflow-hidden">
              <img src={item.image} alt="" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1218] via-[#0e1218]/35 to-black/10" />
              <span className="absolute inset-x-0 top-0 h-[3px] bg-tertiary" />
              <span className="relative flex h-full flex-col justify-end p-4 text-white">
                <span className="text-[20px] font-medium">{item.name}</span>
                <span className="mt-1 line-clamp-2 text-[13px] leading-5 text-white/80">{item.summary}</span>
                <span className="mt-2 text-[12px] font-medium tracking-wide text-tertiary uppercase">{item.turnaround}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7 px-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Latest</p>
        <h2 className="text-[22px] font-medium">Recent activity</h2>
        <div className="mt-3 grid">
          {activity.length === 0 ? <p className="text-[14px] text-[var(--on-surface-variant)]">No updates yet.</p> : null}
          {activity.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate({ to: item.href as never })}
              className="flex min-h-16 items-center gap-3 border-b border-[var(--outline-variant)] py-3 text-left"
            >
              <span className="h-8 w-[3px] shrink-0 bg-tertiary" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{item.title}</span>
                <span className="block truncate text-[13px] text-[var(--on-surface-variant)]">{item.body}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-[var(--on-surface-variant)]" aria-hidden />
            </button>
          ))}
        </div>
      </section>

      {projects.length > 0 ? (
        <section className="mt-7">
          <div className="mb-3 flex items-end justify-between px-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Shop work</p>
              <h2 className="text-[22px] font-medium">Completed projects</h2>
            </div>
            <Link to="/gallery" className="inline-flex h-11 items-center text-[14px] font-medium text-primary">
              Gallery
            </Link>
          </div>
          <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
            {projects.map((project) => (
              <Link key={project.id} to="/gallery/$id" params={{ id: project.id }} className="relative h-44 w-[78%] shrink-0 snap-start overflow-hidden">
                <img src={project.image} alt="" className="absolute inset-0 size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0e1218] via-transparent to-transparent" />
                <span className="absolute inset-x-4 bottom-3 text-[16px] font-medium text-white">{project.title}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-7 px-4">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">The gunsmith</p>
        <h2 className="text-[22px] font-medium">Credentials</h2>
        <ul className="mt-3 grid grid-cols-2 gap-2">
          {CREDENTIALS.map((item) => (
            <li key={item} className="border border-[var(--outline-variant)] bg-[var(--surface-low)] px-3 py-3 text-[13px] leading-5">
              <span className="mb-2 block h-[3px] w-8 bg-tertiary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="relative mt-7 h-56 overflow-hidden">
        <img src={asset("media/contact-hero.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e1218] via-[#0e1218]/88 to-[#0e1218]/25" />
        <div className="relative flex h-full flex-col justify-end px-4 py-4 text-white">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Visit the shop</p>
          <p className="mt-1 text-[18px] font-medium">{BUSINESS.owner}</p>
          <p className="text-[13px] text-white/75">{BUSINESS.ownerTitle}</p>
          <a className="mt-2 flex items-start gap-2 text-[14px] leading-5" href={BUSINESS.maps}>
            <MapPin className="mt-0.5 size-4 shrink-0 text-tertiary" /> {db.business.address}
          </a>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
            <a className="inline-flex items-center gap-1.5" href={BUSINESS.mobileTel}>
              <Phone className="size-4 text-tertiary" /> {db.business.mobile}
            </a>
            <a className="inline-flex items-center gap-1.5" href={BUSINESS.officeTel}>
              <Phone className="size-4 text-tertiary" /> {db.business.office}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
