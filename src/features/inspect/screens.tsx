import { useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { scrollAppToTop } from "@/components/shell";
import { CheckRow, ConfirmDialog, EmptyState, MButton, MCard, PageBanner, Progress, SecureSurface, StatusChip, TopBar } from "@/components/m3";
import { ANGLES, DISCLAIMER, SAFETY_REMINDER } from "@/lib/business";
import { analyzeVisibleCondition } from "@/lib/ai";
import { brightnessFromCanvas } from "@/lib/media";
import { formatWhen } from "@/lib/slots";
import { useStore } from "@/lib/store";
import { asset } from "@/lib/utils";
import type { AIReport, Inspection, MediaRef } from "@/lib/types";

const SAMPLES = [asset("media/precision-work.jpg"), asset("media/services-detail.jpg"), asset("media/tools-grid.jpg"), asset("media/hero-workshop.jpg")];

export function InspectListScreen() {
  const { db, user } = useStore();
  const navigate = useNavigate();
  const list = db.inspections.filter((item) => item.userId === user?.id);
  return (
    <div className="pb-4">
      <PageBanner image={asset("media/services-detail.jpg")} kicker="Visual only" title="Inspect" subtitle="Exterior photos for a preliminary look. Not a safety check." />
      <p className="mx-4 mt-4 border-l-[3px] border-tertiary bg-[var(--surface-low)] px-3 py-3 text-[13px] leading-5">{SAFETY_REMINDER}</p>
      <div className="grid gap-3 px-4 py-4">
        {list.length === 0 ? (
          <EmptyState title="No inspections yet" body="Use New Inspection below to send exterior photos." />
        ) : (
          list.map((item) => (
            <button key={item.id} type="button" className="relative h-32 overflow-hidden text-left" onClick={() => navigate({ to: "/inspect/$id", params: { id: item.id } })}>
              <img src={item.captures[0]?.src || asset("media/precision-work.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
              <span className="absolute inset-0 bg-gradient-to-r from-[#0e1218]/95 via-[#0e1218]/75 to-[#0e1218]/25" />
              <span className="relative flex h-full flex-col justify-between p-3 text-white">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold tracking-[0.14em] text-tertiary uppercase">{item.id}</span>
                  <StatusChip status={item.status} />
                </span>
                <span>
                  <span className="block text-[16px] font-medium">{item.captures[0]?.angle || "Exterior photos"}</span>
                  <span className="block text-[13px] text-white/80">{new Date(item.createdAt).toLocaleDateString()}</span>
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function InspectFlowScreen() {
  const { db, user, giveConsent, saveInspection, pushToast } = useStore();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"consent" | "permission" | "capture" | "review" | "loading" | "result" | "send">(db.consentGiven ? "permission" : "consent");
  const [streamOn, setStreamOn] = useState(false);
  const [angle, setAngle] = useState(0);
  const [captures, setCaptures] = useState<MediaRef[]>([]);
  const [light, setLight] = useState("");
  const [recording, setRecording] = useState(0);
  const recorder = useRef<MediaRecorder | null>(null);
  const [report, setReport] = useState<AIReport | null>(null);
  const [flags, setFlags] = useState({ notFirearm: false, person: false });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const current = ANGLES[angle];

  useLayoutEffect(() => {
    scrollAppToTop();
  }, [phase]);

  useEffect(() => {
    return () => {
      videoRef.current?.srcObject && (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setStreamOn(true);
      setPhase("capture");
    } catch {
      setStreamOn(false);
      setPhase("capture");
      pushToast("Camera unavailable", "You can use a sample bench photo in this preview.");
    }
  };

  useEffect(() => {
    if (phase !== "capture" || !streamOn) return;
    const timer = window.setInterval(() => {
      const video = videoRef.current;
      if (!video) return;
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, 32, 32);
      const level = brightnessFromCanvas(canvas);
      setLight(level < 50 ? "Too dark. Add light from the side." : level > 220 ? "Glare. Tilt slightly away from the light." : "Lighting looks usable.");
    }, 900);
    return () => window.clearInterval(timer);
  }, [phase, streamOn]);

  const addCapture = (src: string, kind: "photo" | "video") => {
    if (!user) return;
    setCaptures((list) => [
      ...list.filter((c) => c.angle !== current.label),
      {
        id: crypto.randomUUID(),
        ownerId: user.id,
        kind,
        src,
        caption: "",
        angle: current.label,
        createdAt: new Date().toISOString(),
        exifStripped: true,
      },
    ]);
  };

  const shoot = () => {
    const video = videoRef.current;
    if (!video || !streamOn) {
      addCapture(SAMPLES[angle % SAMPLES.length], "photo");
      return;
    }
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    addCapture(canvas.toDataURL("image/jpeg", 0.72), "photo");
  };

  const toggleVideo = () => {
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (!stream || recording) {
      recorder.current?.stop();
      return;
    }
    const chunks: BlobPart[] = [];
    const rec = new MediaRecorder(stream);
    recorder.current = rec;
    rec.ondataavailable = (event) => chunks.push(event.data);
    rec.onstop = () => {
      const url = URL.createObjectURL(new Blob(chunks, { type: "video/webm" }));
      addCapture(url, "video");
      setRecording(0);
    };
    rec.start();
    const started = Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      setRecording(elapsed);
      if (elapsed >= 60) rec.stop();
    }, 250);
    rec.addEventListener("stop", () => window.clearInterval(timer), { once: true });
  };

  const analyze = async () => {
    setPhase("loading");
    if (!db.ai.enabled) {
      setReport({
        summary: "AI assessment is turned off by the shop. You can still send the photos.",
        findings: [],
        recommendedServiceId: "inspection",
        severe: false,
        generatedAt: new Date().toISOString(),
        source: "mock",
      });
      setPhase("result");
      return;
    }
    const result = await analyzeVisibleCondition({
      captures: captures.map((c) => ({
        id: c.id,
        angle: c.angle,
        caption: c.caption,
        notFirearm: flags.notFirearm,
        hasPerson: flags.person,
      })),
      apiKey: import.meta.env.VITE_AI_API_KEY as string | undefined,
    });
    setReport(result);
    setPhase("result");
  };

  const persist = (status: Inspection["status"], appointmentId?: string) => {
    if (!user || !report) return;
    const inspection: Inspection = {
      id: savedId ?? `INS-${Math.floor(100 + Math.random() * 900)}`,
      userId: user.id,
      createdAt: new Date().toISOString(),
      captures,
      ai: report,
      status,
      appointmentId,
    };
    saveInspection(inspection);
    setSavedId(inspection.id);
    pushToast(status === "draft" ? "Draft saved" : "Sent to the gunsmith");
    navigate({ to: "/inspect/$id", params: { id: inspection.id } });
  };

  return (
    <SecureSurface>
      <div>
        {phase === "consent" && (
          <div className="grid gap-4 px-5 py-6">
            <h1 className="text-[32px] leading-tight">Before you use the camera</h1>
            <p className="text-[14px] leading-6">Photos and short video stay in this app. Authorized REB Gunsmithing staff can view what you submit. Other customers cannot.</p>
            <MCard className="border border-secondary bg-[var(--secondary-container)] text-[var(--on-secondary-container)]">
              <p className="text-[14px] leading-6 font-medium">{SAFETY_REMINDER}</p>
              <p className="mt-2 text-[14px]">No ammunition may be visible in captures.</p>
            </MCard>
            <MButton full onClick={() => { giveConsent(); setPhase("permission"); }}>I Understand</MButton>
          </div>
        )}
        {phase === "permission" && (
          <div className="grid gap-4 px-5 py-8">
            <TopBar title="Camera" back={() => navigate({ to: "/inspect" })} />
            <h1 className="text-[28px]">Camera access</h1>
            <p className="text-[14px] leading-6">The camera is used only for guided exterior photos and short video. Nothing is written to your gallery.</p>
            <MButton full onClick={startCamera}>Continue</MButton>
          </div>
        )}
        {phase === "capture" && (
          <div className="relative min-h-[70vh] bg-black text-white">
            <video ref={videoRef} className={`h-[62vh] w-full object-cover ${streamOn ? "" : "hidden"}`} playsInline muted />
            {!streamOn ? <img src={SAMPLES[angle % SAMPLES.length]} alt="" className="h-[62vh] w-full object-cover opacity-80" /> : null}
            <div className="pointer-events-none absolute inset-x-8 top-24 h-64 rounded-[28px] border border-white/70" aria-hidden />
            <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 p-4">
              <p className="text-[12px]">Step {angle + 1} of {ANGLES.length}</p>
              <h1 className="text-[28px]">{current.label}</h1>
              <p className="text-[14px]">{current.tip}</p>
              {light ? <p className="mt-1 text-[13px] text-tertiary">{light}</p> : null}
            </div>
            <div className="flex items-center justify-center gap-4 bg-black px-4 py-4">
              <MButton variant="text" className="text-white" onClick={() => setAngle((n) => Math.min(ANGLES.length - 1, n + 1))}>Skip</MButton>
              <button type="button" className="size-16 rounded-full border-4 border-white" aria-label="Take photo" onClick={shoot} />
              <MButton variant="text" className="text-white" onClick={toggleVideo}>{recording ? `${recording}s` : "Video"}</MButton>
            </div>
            <div className="bg-background px-4 py-3 text-foreground">
              <MButton full onClick={() => setPhase("review")} disabled={!captures.length}>Review {captures.length} captures</MButton>
            </div>
          </div>
        )}
        {phase === "review" && (
          <div>
            <TopBar title="Review" back={() => setPhase("capture")} />
            <div className="px-4 pt-1 pb-8">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">
                {captures.length} {captures.length === 1 ? "capture" : "captures"}
              </p>
              <p className="mt-1 text-[16px] leading-6 text-white">Check each photo and leave a note for the shop.</p>
              <div className="mt-4 grid gap-5">
                {captures.map((item, index) => (
                  <article key={item.id} className="overflow-hidden border border-[#3d4a5c] bg-[var(--surface-low)]">
                    <div className="relative">
                      {item.kind === "video" ? (
                        <video src={item.src} className="aspect-[4/3] w-full bg-black object-cover" controls />
                      ) : (
                        <img src={item.src} alt={item.angle} className="aspect-[4/3] w-full object-cover" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/70 to-transparent px-3 pt-8 pb-3">
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-tertiary uppercase">
                          {index + 1} of {captures.length}
                        </p>
                        <p className="text-[18px] font-medium text-white">{item.angle}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 p-3">
                      <label className="grid gap-1.5 text-left text-[13px] font-medium text-[#d7e0ea]">
                        Note for the shop
                        <input
                          className="h-12 w-full border border-[#9eb6d4] bg-[#0e1218] px-3 text-left text-[16px] text-white outline-none placeholder:text-[#9aa8b8] focus:border-2 focus:border-primary"
                          placeholder="Wear, finish, or anything to look at"
                          value={item.caption}
                          onChange={(e) => setCaptures((list) => list.map((c) => (c.id === item.id ? { ...c, caption: e.target.value } : c)))}
                        />
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          className="h-12 border border-[#9eb6d4] text-[14px] font-medium text-white"
                          onClick={() => {
                            setAngle(Math.max(0, ANGLES.findIndex((a) => a.label === item.angle)));
                            setPhase("capture");
                          }}
                        >
                          Retake
                        </button>
                        <button
                          type="button"
                          className="h-12 border border-[#ff8a80] text-[14px] font-medium text-[#ffb4ab]"
                          onClick={() => setDeleteId(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <section className="mt-5 border border-[#3d4a5c] bg-[var(--surface-low)] px-3 py-2">
                <p className="px-1 pt-2 text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Before you continue</p>
                <CheckRow checked={flags.notFirearm} onChange={(notFirearm) => setFlags((f) => ({ ...f, notFirearm }))}>
                  This does not show a firearm
                </CheckRow>
                <CheckRow checked={flags.person} onChange={(person) => setFlags((f) => ({ ...f, person }))}>
                  A person or face is in frame
                </CheckRow>
              </section>
              <div className="mt-5">
                <MButton full onClick={analyze} disabled={!captures.length}>
                  Analyze visible condition
                </MButton>
              </div>
            </div>
            <ConfirmDialog
              open={Boolean(deleteId)}
              title="Delete this capture?"
              body="It will be removed from this inspection."
              confirmLabel="Delete"
              danger
              onClose={() => setDeleteId(null)}
              onConfirm={() => {
                setCaptures((list) => list.filter((c) => c.id !== deleteId));
                setDeleteId(null);
              }}
            />
          </div>
        )}
        {phase === "loading" && (
          <div className="grid min-h-[50vh] content-center gap-4 px-6">
            <Progress />
            <p className="text-center text-[16px]">Analyzing visible condition...</p>
          </div>
        )}
        {phase === "result" && report && <Result report={report} captures={captures} onSend={() => setPhase("send")} disclaimer={db.ai.disclaimer || DISCLAIMER} />}
        {phase === "send" && (
          <div className="pb-6">
            <section className="relative h-48 overflow-hidden">
              <img src={captures[0]?.src || asset("media/precision-work.jpg")} alt="" className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0e1218] via-[#0e1218]/55 to-black/25" />
              <div className="relative flex h-full flex-col justify-end px-5 pb-4">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">
                  {captures.length} {captures.length === 1 ? "capture" : "captures"} ready
                </p>
                <h1 className="mt-1 text-[30px] leading-tight font-medium text-white">Send to the gunsmith</h1>
              </div>
              <span className="absolute inset-x-0 bottom-0 h-[3px] bg-tertiary" />
            </section>
            <div className="grid gap-4 px-4 pt-5">
              <p className="text-[15px] leading-6 text-[#d7e0ea]">Send the photos and the visual note on their own, or attach them to a visit you already booked.</p>
              <MButton full onClick={() => persist("submitted")}>
                Send captures and report
              </MButton>
              {db.appointments.some((a) => a.userId === user?.id && a.status !== "cancelled") ? (
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-tertiary uppercase">Attach to a visit</p>
                  <div className="mt-3 grid gap-2">
                    {db.appointments
                      .filter((a) => a.userId === user?.id && a.status !== "cancelled")
                      .map((appointment) => {
                        const service = db.services.find((item) => item.id === appointment.serviceId);
                        return (
                          <button
                            key={appointment.id}
                            type="button"
                            className="flex items-center gap-3 border border-[#9eb6d4] bg-[var(--surface-low)] p-2 text-left"
                            onClick={() => persist("submitted", appointment.id)}
                          >
                            <img src={service?.image || asset("media/hero-workshop.jpg")} alt="" className="h-16 w-16 shrink-0 object-cover" />
                            <span className="min-w-0">
                              <span className="block text-[11px] font-semibold tracking-[0.12em] text-tertiary uppercase">{appointment.id}</span>
                              <span className="block text-[16px] font-medium text-white">{service?.name ?? "Appointment"}</span>
                              <span className="block text-[13px] text-[#d7e0ea]">{formatWhen(appointment.date, appointment.time)}</span>
                            </span>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ) : null}
              <button
                type="button"
                className="h-12 border border-[#9eb6d4] text-[14px] font-medium text-white"
                onClick={() => {
                  persist("submitted");
                  navigate({ to: "/request" });
                }}
              >
                Create a service request
              </button>
            </div>
          </div>
        )}
      </div>
    </SecureSurface>
  );
}

function Result({ report, captures, onSend, disclaimer }: { report: AIReport; captures: MediaRef[]; onSend: () => void; disclaimer: string }) {
  const navigate = useNavigate();
  if (report.declined) {
    return (
      <div className="grid gap-3 px-4 py-6">
        <h1 className="text-[28px]">Retake needed</h1>
        <p className="text-[14px] leading-6">{report.declined.reason}</p>
        <MButton full onClick={() => navigate({ to: "/inspect/new" })}>Start again</MButton>
      </div>
    );
  }
  return (
    <div className="grid gap-4 px-4 py-4">
      <h1 className="text-[28px]">Preliminary assessment</h1>
      <MCard>
        <h2 className="text-[18px]">Visible condition</h2>
        <p className="mt-2 text-[14px] leading-6">{report.summary}</p>
      </MCard>
      {report.severe ? (
        <div className="rounded-2xl bg-secondary p-4 text-[14px] leading-6 text-[var(--on-secondary)]" role="alert">
          Visible findings should be inspected in person before this firearm is used again.
        </div>
      ) : null}
      <ul className="grid gap-2">
        {report.findings.map((finding) => (
          <li key={finding.id} className="rounded-2xl bg-card p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[14px] font-medium">{finding.area}</p>
              <StatusChip status={finding.severity} />
            </div>
            <p className="mt-1 text-[14px] leading-6">{finding.detail}</p>
            <p className="text-[12px] text-[var(--on-surface-variant)]">Confidence {Math.round(finding.confidence * 100)}%</p>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        {captures.map((capture) => (
          <figure key={capture.id} className="relative">
            <img src={capture.src} alt={capture.angle ?? "Capture"} className="h-32 w-full rounded-xl object-cover" />
            {report.findings.some((f) => f.captureId === capture.id && f.severity === "attention") ? (
              <span className="absolute top-2 left-2 rounded-md bg-secondary px-2 py-1 text-[11px] text-[var(--on-secondary)]">Review area</span>
            ) : null}
          </figure>
        ))}
      </div>
      <MCard>
        <p className="text-[14px]">Suggested next visit</p>
        <MButton className="mt-3" onClick={() => navigate({ to: "/book/new" })}>Book This Service</MButton>
      </MCard>
      <MCard className="border border-outline">
        <h2 className="text-[16px] font-medium">Required disclaimer</h2>
        <p className="mt-2 text-[14px] leading-6">{disclaimer}</p>
      </MCard>
      <MButton full onClick={onSend}>Submit to Gunsmith</MButton>
    </div>
  );
}

export function InspectDetailScreen() {
  const { id } = useParams({ strict: false }) as { id: string };
  const { db, removeMedia, user } = useStore();
  const navigate = useNavigate();
  const item = db.inspections.find((inspection) => inspection.id === id && inspection.userId === user?.id);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  if (!item) return <p className="p-6">Inspection not found.</p>;
  const service = db.services.find((s) => s.id === (item.assessment?.recommendedServiceId ?? item.ai?.recommendedServiceId));
  return (
    <SecureSurface>
      <div>
        <TopBar title={item.id} back={() => navigate({ to: "/inspect" })} />
        <div className="grid gap-4 px-4 pb-6">
          <StatusChip status={item.status} />
          {item.ai ? <Result report={item.ai} captures={item.captures} disclaimer={db.ai.disclaimer} onSend={() => navigate({ to: "/messages" })} /> : null}
          {item.assessment ? (
            <MCard>
              <h2 className="text-[22px]">Gunsmith assessment</h2>
              <p className="mt-2 text-[14px] leading-6">{item.assessment.condition}</p>
              <p className="mt-2 text-[14px] leading-6">{item.assessment.findings}</p>
              <p className="mt-2 text-[14px]">Suggested service: {service?.name}</p>
              <p className="text-[14px]">Estimate: {item.assessment.estimate}</p>
              <p className="text-[14px]">Time: {item.assessment.time}</p>
              <p className="mt-2 text-[14px]">{item.assessment.notes}</p>
              <p className="mt-2 text-[12px] text-[var(--on-surface-variant)]">{item.assessment.author}</p>
            </MCard>
          ) : (
            <p className="text-[14px] text-[var(--on-surface-variant)]">Waiting for the gunsmith's professional assessment.</p>
          )}
          <ConfirmDialog open={Boolean(deleteId)} title="Delete this photo?" body="Authorized staff will no longer be able to view it." confirmLabel="Delete" danger onClose={() => setDeleteId(null)} onConfirm={() => { if (deleteId) removeMedia(item.id, deleteId); setDeleteId(null); }} />
          <div className="flex flex-wrap gap-2">
            {item.captures.map((capture) => (
              <button key={capture.id} type="button" className="text-[12px] text-secondary underline" onClick={() => setDeleteId(capture.id)}>
                Delete {capture.angle}
              </button>
            ))}
          </div>
        </div>
      </div>
    </SecureSurface>
  );
}
