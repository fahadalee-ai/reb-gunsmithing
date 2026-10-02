import { useNavigate, useParams } from "@tanstack/react-router";
import { format } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { useMemo, useState } from "react";
import { FirearmFields } from "@/components/FirearmFields";
import { CheckRow, ConfirmDialog, EmptyState, MArea, MButton, MCard, MChip, MField, MSelect, PageBanner, Progress, Sheet, StatusChip, TopBar } from "@/components/m3";
import { validateFirearm, validateSerial } from "@/lib/firearms";
import { POLICY_ACK, STATUS_LABEL, TIMEZONE } from "@/lib/business";
import { fileToPrivateJpeg } from "@/lib/media";
import { formatTime, formatWhen, timeSlots, upcomingDates, weekdayName } from "@/lib/slots";
import { useStore } from "@/lib/store";
import { asset } from "@/lib/utils";
import type { FirearmType, MediaRef, ServiceId } from "@/lib/types";

export function AppointmentsScreen() {
  const { db, user } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");
  const mine = db.appointments.filter((a) => a.userId === user?.id);
  const list = mine.filter((a) =>
    tab === "upcoming" ? !["completed", "cancelled"].includes(a.status) : tab === "completed" ? a.status === "completed" : a.status === "cancelled",
  );
  return (
    <div className="pb-4">
      <PageBanner image={asset("media/tools-grid.jpg")} kicker="Your visits" title="Book" subtitle="Upcoming work, finished jobs, and anything you cancelled." />
      <div className="flex gap-2 overflow-x-auto px-4 pt-4 no-scrollbar">
        {(["upcoming", "completed", "cancelled"] as const).map((item) => (
          <MChip key={item} selected={tab === item} onClick={() => setTab(item)}>
            {item[0].toUpperCase() + item.slice(1)}
          </MChip>
        ))}
      </div>
      <div className="grid gap-3 px-4 py-4">
        {list.length === 0 ? (
          <EmptyState title="Nothing in this tab" body="Book a visit and it will show up here." action={<MButton onClick={() => navigate({ to: "/book/new" })}>Book Appointment</MButton>} />
        ) : (
          list.map((appt) => {
            const service = db.services.find((s) => s.id === appt.serviceId);
            return (
              <button key={appt.id} type="button" className="relative h-32 overflow-hidden text-left" onClick={() => navigate({ to: "/book/$id", params: { id: appt.id } })}>
                <img src={service?.image || asset("media/hero-workshop.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-r from-[#0e1218]/95 via-[#0e1218]/78 to-[#0e1218]/30" />
                <span className="relative flex h-full flex-col justify-between p-3 text-white">
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold tracking-[0.14em] text-tertiary uppercase">{appt.id}</span>
                    <StatusChip status={appt.status} />
                  </span>
                  <span>
                    <span className="block text-[18px] font-medium">{service?.name}</span>
                    <span className="block text-[13px] text-white/80">
                      {appt.make} {appt.model} · {formatWhen(appt.date, appt.time)}
                    </span>
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export function AppointmentDetailScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { db, cancelAppointment, restoreAppointment, reschedule, pushToast } = useStore();
  const navigate = useNavigate();
  const appt = db.appointments.find((a) => a.id === id);
  const [sheet, setSheet] = useState(false);
  const [cancel, setCancel] = useState(false);
  const [date, setDate] = useState(appt?.date ?? "");
  const [time, setTime] = useState(appt?.time ?? "");
  if (!appt) return <p className="p-6">Appointment not found.</p>;
  const service = db.services.find((s) => s.id === appt.serviceId);
  const slots = timeSlots(date, db.availability, db.appointments.filter((a) => a.id !== appt.id));
  const closed = appt.status === "cancelled" || appt.status === "completed";
  return (
    <div className="pb-4">
      <section className="relative h-52 overflow-hidden">
        <img src={service?.image || asset("media/hero-workshop.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-[#0e1218]" />
        <div className="relative flex h-full flex-col px-2 pt-2 pb-4">
          <button type="button" className="inline-flex h-11 w-fit items-center gap-0.5 px-2 text-[14px] font-medium text-white" onClick={() => navigate({ to: "/book" })}>
            <ChevronLeft className="size-5" aria-hidden /> Back
          </button>
          <div className="mt-auto px-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">{appt.id}</p>
              <StatusChip status={appt.status} />
            </div>
            <h1 className="mt-1 text-[28px] leading-tight font-medium text-white">{service?.name}</h1>
            <p className="mt-1 text-[14px] text-white/85">{formatWhen(appt.date, appt.time)}</p>
            <p className="text-[12px] text-white/70">{TIMEZONE}</p>
          </div>
        </div>
        <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
      </section>
      <div className="grid gap-5 px-4 pt-5">
        <section>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Firearm</p>
          <p className="mt-2 text-[20px] font-medium">
            {appt.make} {appt.model}
          </p>
          <p className="text-[14px] text-[var(--on-surface-variant)]">
            {appt.firearmType} · {appt.caliber}
          </p>
          {appt.serialLast4 ? <p className="mt-1 text-[13px] text-[var(--on-surface-variant)]">Serial ending {appt.serialLast4}, stored encrypted</p> : null}
          {appt.description ? <p className="mt-3 text-[15px] leading-6">{appt.description}</p> : null}
        </section>
        {appt.gunsmithNotes ? (
          <section className="border-l-[3px] border-tertiary bg-[var(--surface-low)] px-3 py-3">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">From the gunsmith</p>
            <p className="mt-2 text-[15px] leading-6">{appt.gunsmithNotes}</p>
            {appt.quote ? <p className="mt-2 text-[14px] font-medium">Quote {appt.quote}</p> : null}
          </section>
        ) : null}
        <section>
          <p className="text-[11px] font-semibold tracking-[0.18em] text-tertiary uppercase">Status</p>
          <ol className="mt-3 grid gap-4">
            {appt.timeline.map((event) => (
              <li key={event.id} className="flex gap-3">
                <span className="mt-1 h-8 w-[3px] shrink-0 bg-tertiary" aria-hidden />
                <span>
                  <span className="block text-[15px] font-medium">{STATUS_LABEL[event.status]}</span>
                  <span className="block text-[13px] leading-5 text-[var(--on-surface-variant)]">{event.note}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
        {appt.media.length ? (
          <div className="grid grid-cols-3 gap-2">
            {appt.media.map((media) => (
              <img key={media.id} src={media.src} alt={media.caption || "Appointment photo"} className="h-24 w-full object-cover" />
            ))}
          </div>
        ) : null}
        <div className="grid gap-2">
          <MButton full onClick={() => setSheet(true)} disabled={closed}>
            Reschedule
          </MButton>
          <MButton full variant="outlined" onClick={() => navigate({ to: "/messages" })}>
            Message
          </MButton>
          <MButton full variant="text" className="text-secondary" onClick={() => setCancel(true)} disabled={appt.status === "cancelled"}>
            Cancel appointment
          </MButton>
        </div>
      </div>
      <Sheet open={sheet} title="Reschedule" onClose={() => setSheet(false)}>
        <label className="text-[12px]" htmlFor="resched-date">Date</label>
        <input id="resched-date" type="date" className="mt-1 h-14 w-full rounded-xl border border-outline bg-transparent px-3" value={date} onChange={(e) => setDate(e.target.value)} />
        <div className="mt-3 flex flex-wrap gap-2">
          {slots.map((slot) => (
            <MChip key={slot.time} disabled={slot.full} selected={time === slot.time} onClick={() => setTime(slot.time)}>
              {formatTime(slot.time)}
            </MChip>
          ))}
        </div>
        <MButton
          full
          className="mt-4"
          disabled={!time}
          onClick={() => {
            reschedule(appt.id, date, time);
            setSheet(false);
            pushToast("Reschedule requested", "The shop will confirm the new time.");
          }}
        >
          Request new time
        </MButton>
      </Sheet>
      <ConfirmDialog
        open={cancel}
        title="Cancel this appointment?"
        body="The shop will be notified. You can undo from the message that appears."
        confirmLabel="Cancel appointment"
        danger
        onClose={() => setCancel(false)}
        onConfirm={() => {
          const previous = cancelAppointment(appt.id);
          setCancel(false);
          if (previous) {
            pushToast("Appointment cancelled", undefined, {
              label: "Undo",
              run: () => restoreAppointment(appt.id, previous),
            });
          }
        }}
      />
    </div>
  );
}

export function BookFlowScreen() {
  const { db, user, book, pushToast } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [serviceId, setServiceId] = useState<ServiceId>(() => {
    if (typeof sessionStorage === "undefined") return "cleaning";
    return (sessionStorage.getItem("reb.service") as ServiceId) || "cleaning";
  });
  const [firearmType, setFirearmType] = useState<FirearmType>("Rifle");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [caliber, setCaliber] = useState("");
  const [serial, setSerial] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [media, setMedia] = useState<MediaRef[]>([]);
  const [ack, setAck] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dates = useMemo(() => upcomingDates(16), []);
  const slots = date ? timeSlots(date, db.availability, db.appointments) : [];
  const service = db.services.find((s) => s.id === serviceId);

  const next = () => {
    const nextErrors: Record<string, string> = {};
    if (step === 1) {
      Object.assign(nextErrors, validateFirearm({ type: firearmType, make, model, caliber }));
      const serialError = validateSerial(serial);
      if (serialError) nextErrors.serial = serialError;
      if (description.trim().length < 10) nextErrors.description = "Describe the request in at least 10 characters.";
    }
    if (step === 2 && (!date || !time)) nextErrors.when = "Choose a date and an open time.";
    if (step === 5 && !ack) nextErrors.ack = "Acknowledge the shop policy to continue.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStep((n) => n + 1);
  };

  const titles = ["Select a service", "Firearm details", "Date and time", "Drop-off", "Photos", "Review"];
  return (
    <div>
      <TopBar title={titles[step]} back={() => (step === 0 ? navigate({ to: "/book" }) : setStep((n) => n - 1))} />
      <div className="px-4">
        <Progress value={((step + 1) / 6) * 100} />
        <p className="mt-2 mb-4 text-[12px] text-[var(--on-surface-variant)]">Step {step + 1} of 6</p>
        {step === 0 && (
          <div className="grid gap-3">
            {db.services.map((item) => (
              <button key={item.id} type="button" onClick={() => setServiceId(item.id)} className={`rounded-2xl border p-4 text-left ${serviceId === item.id ? "border-primary bg-primary-container" : "border-transparent bg-card"}`}>
                <p className="text-[18px]">{item.name}</p>
                <p className="text-[14px] text-[var(--on-surface-variant)]">{item.summary}</p>
              </button>
            ))}
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-3">
            {user && db.firearms.filter((f) => f.userId === user.id).length > 0 ? (
              <MSelect
                label="Saved firearm"
                value=""
                onChange={(id) => {
                  const saved = db.firearms.find((f) => f.id === id);
                  if (!saved) return;
                  setFirearmType(saved.type);
                  setMake(saved.make);
                  setModel(saved.model);
                  setCaliber(saved.caliber);
                }}
              >
                <option value="">Choose a saved firearm</option>
                {db.firearms.filter((f) => f.userId === user.id).map((f) => (
                  <option key={f.id} value={f.id}>{f.nickname || `${f.make} ${f.model}`}</option>
                ))}
              </MSelect>
            ) : null}
            <FirearmFields
              type={firearmType}
              make={make}
              model={model}
              caliber={caliber}
              errors={errors}
              onChange={(next) => {
                setFirearmType(next.type);
                setMake(next.make);
                setModel(next.model);
                setCaliber(next.caliber);
              }}
            />
            <MField label="Serial number (optional)" value={serial} onChange={(e) => setSerial(e.target.value)} error={errors.serial} hint="Stored encrypted. Only the last four digits are shown later." />
            <MArea label="What do you need?" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} />
          </div>
        )}
        {step === 2 && (
          <div>
            <p className="mb-2 text-[12px] text-[var(--on-surface-variant)]">{TIMEZONE}. Closed days are disabled.</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3">
              {dates.map((item) => {
                const iso = format(item, "yyyy-MM-dd");
                const closed = db.availability.hours.find((h) => h.day === item.getDay())?.closed || db.availability.blockedDates.includes(iso);
                return (
                  <button key={iso} type="button" disabled={closed} onClick={() => { setDate(iso); setTime(""); }} className={`h-16 min-w-16 rounded-2xl px-2 text-[12px] disabled:opacity-30 ${date === iso ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                    {format(item, "EEE")}<br />{format(item, "d")}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {slots.map((slot) => (
                <MChip key={slot.time} disabled={slot.full} selected={time === slot.time} onClick={() => setTime(slot.time)}>
                  {formatTime(slot.time)}{slot.full ? " · Full" : ""}
                </MChip>
              ))}
            </div>
            {errors.when ? <p className="mt-2 text-[12px] text-secondary">{errors.when}</p> : null}
            {date && db.availability.hours.find((h) => h.day === new Date(date + "T12:00:00").getDay())?.closed ? (
              <p className="mt-2 text-[14px]">The shop is closed on {weekdayName(new Date(date + "T12:00:00").getDay())}.</p>
            ) : null}
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3">
            <MCard className="border border-primary">
              <h2 className="text-[18px]">In-person drop-off</h2>
              <p className="mt-1 text-[14px] leading-6 text-[var(--on-surface-variant)]">{db.business.address}</p>
            </MCard>
            <MArea label="Notes for the shop (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        )}
        {step === 4 && (
          <div className="grid gap-3">
            <p className="text-[14px] leading-6">Optional. Photos stay in the app and are not saved to your camera roll.</p>
            <MButton variant="tonal" onClick={() => navigate({ to: "/inspect/new" })}>Open secure camera</MButton>
            <label className="grid min-h-12 place-items-center rounded-full border border-outline text-[14px]">
              Add a photo
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;
                  const src = await fileToPrivateJpeg(file);
                  setMedia((list) => [...list, { id: crypto.randomUUID(), ownerId: user.id, kind: "photo", src, caption: "", createdAt: new Date().toISOString(), exifStripped: true }]);
                }}
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {media.map((item) => (
                <img key={item.id} src={item.src} alt="" className="h-24 w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
        )}
        {step === 5 && service && (
          <div className="grid gap-3">
            <MCard>
              <p className="text-[14px]">{service.name}</p>
              <p className="text-[14px]">{firearmType} · {make} {model} · {caliber}</p>
              <p className="text-[14px]">{date && time ? formatWhen(date, time) : ""}</p>
              <p className="text-[14px] text-[var(--on-surface-variant)]">{description}</p>
              <button type="button" className="mt-2 min-h-12 text-[14px] text-primary" onClick={() => setStep(0)}>Edit service</button>
              <button type="button" className="min-h-12 text-[14px] text-primary" onClick={() => setStep(1)}>Edit firearm</button>
              <button type="button" className="min-h-12 text-[14px] text-primary" onClick={() => setStep(2)}>Edit time</button>
            </MCard>
            <CheckRow checked={ack} onChange={setAck}>{POLICY_ACK}</CheckRow>
            {errors.ack ? <p className="text-[12px] text-secondary">{errors.ack}</p> : null}
          </div>
        )}
        <div className="mt-6">
          {step < 5 ? (
            <MButton full onClick={next}>Continue</MButton>
          ) : (
            <MButton
              full
              onClick={async () => {
                if (!ack) {
                  setErrors({ ack: "Acknowledge the shop policy to continue." });
                  return;
                }
                const appointment = await book({ serviceId, firearmType, make, model, caliber, serial, description, date, time, dropoffNotes: notes, media });
                pushToast("Appointment requested", "A confirmation notice was added.");
                navigate({ to: "/book/done/$id", params: { id: appointment.id } });
              }}
            >
              Confirm appointment
            </MButton>
          )}
        </div>
      </div>
    </div>
  );
}

export function BookDoneScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { db } = useStore();
  const navigate = useNavigate();
  const appt = db.appointments.find((a) => a.id === id);
  const service = db.services.find((s) => s.id === appt?.serviceId);
  if (!appt) return null;
  return (
    <div className="grid gap-4 px-5 py-10 text-center">
      <div className="mx-auto grid size-20 place-items-center rounded-full bg-primary text-3xl text-primary-foreground" aria-hidden>✓</div>
      <h1 className="text-[32px]">You're booked</h1>
      <p className="text-[16px]">{service?.name}</p>
      <p className="text-[14px] text-[var(--on-surface-variant)]">{appt.id}<br />{formatWhen(appt.date, appt.time)}</p>
      <MButton
        full
        variant="tonal"
        onClick={() => {
          const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:REB ${service?.name}\nDESCRIPTION:${appt.id}\nDTSTART:${appt.date.replaceAll("-", "")}T${appt.time.replace(":", "")}00\nEND:VEVENT\nEND:VCALENDAR`;
          const blob = new Blob([ics], { type: "text/calendar" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${appt.id}.ics`;
          link.click();
          URL.revokeObjectURL(url);
        }}
      >
        Add to Calendar
      </MButton>
      <MButton full onClick={() => navigate({ to: "/book/$id", params: { id: appt.id } })}>View Appointment</MButton>
      <MButton full variant="text" onClick={() => navigate({ to: "/messages" })}>Message Gunsmith</MButton>
    </div>
  );
}

export function RequestScreen() {
  const { db, user, createRequest, pushToast } = useStore();
  const navigate = useNavigate();
  const [serviceId, setServiceId] = useState<ServiceId>("repair");
  const [firearmType, setFirearmType] = useState<FirearmType>("Handgun");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [caliber, setCaliber] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState<"phone" | "email" | "message">("phone");
  const [urgency, setUrgency] = useState<"standard" | "priority">("standard");
  const [errors, setErrors] = useState<Record<string, string>>({});
  return (
    <div>
      <TopBar title="Service request" back={() => navigate({ to: "/home" })} />
      <form
        className="grid gap-3 px-4"
        onSubmit={(e) => {
          e.preventDefault();
          const nextErrors: Record<string, string> = { ...validateFirearm({ type: firearmType, make, model, caliber }) };
          if (description.trim().length < 10) nextErrors.description = "Describe the request in at least 10 characters.";
          setErrors(nextErrors);
          if (Object.keys(nextErrors).length) return;
          const request = createRequest({ serviceId, firearmType, make, model, caliber, description, contactMethod: contact, urgency, media: [] });
          pushToast("Request submitted", request.id);
          navigate({ to: "/request/done/$id", params: { id: request.id } });
        }}
      >
        <div className="flex flex-wrap gap-2">
          {db.services.map((s) => (
            <MChip key={s.id} selected={serviceId === s.id} onClick={() => setServiceId(s.id)}>{s.name}</MChip>
          ))}
        </div>
        <FirearmFields
          type={firearmType}
          make={make}
          model={model}
          caliber={caliber}
          errors={errors}
          onChange={(next) => {
            setFirearmType(next.type);
            setMake(next.make);
            setModel(next.model);
            setCaliber(next.caliber);
          }}
        />
        <MArea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} error={errors.description} />
        <p className="text-[12px]">Preferred contact</p>
        <div className="flex gap-2">
          {(["phone", "email", "message"] as const).map((item) => (
            <MChip key={item} selected={contact === item} onClick={() => setContact(item)}>{item}</MChip>
          ))}
        </div>
        <div className="flex gap-2">
          <MChip selected={urgency === "standard"} onClick={() => setUrgency("standard")}>Standard</MChip>
          <MChip selected={urgency === "priority"} onClick={() => setUrgency("priority")}>Priority</MChip>
        </div>
        <p className="text-[12px] text-[var(--on-surface-variant)]">Signed in as {user?.email}. This request is not tied to a time slot.</p>
        <MButton type="submit" full>Submit request</MButton>
      </form>
    </div>
  );
}

export function RequestDoneScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const navigate = useNavigate();
  return (
    <div className="grid gap-4 px-5 py-12 text-center">
      <h1 className="text-[32px]">Request submitted</h1>
      <p className="text-[16px]">{id}</p>
      <p className="text-[14px] text-[var(--on-surface-variant)]">It appears in Service History as Request Submitted.</p>
      <MButton full onClick={() => navigate({ to: "/history/$id", params: { id } })}>View request</MButton>
    </div>
  );
}
