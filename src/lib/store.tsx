import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { encryptSecret, last4 } from "./crypto";
import { createSeed } from "./seed";
import { loadDatabase, saveDatabase } from "./storage";
import type {
  AISettings,
  Appointment,
  ApptStatus,
  Availability,
  BusinessProfile,
  ChatMessage,
  Database,
  FirearmRecord,
  FirearmType,
  GalleryProject,
  GunsmithAssessment,
  Inspection,
  MediaRef,
  NoticeCategory,
  RequestStatus,
  Role,
  ServiceContent,
  ServiceId,
  ServiceRequest,
  ShopDocument,
  User,
} from "./types";

export type ToastAction = { label: string; run: () => void };
export type Toast = { id: number; title: string; body?: string; action?: ToastAction };

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
};

type BookInput = {
  serviceId: ServiceId;
  firearmType: FirearmType;
  make: string;
  model: string;
  caliber: string;
  serial?: string;
  description: string;
  date: string;
  time: string;
  dropoffNotes: string;
  media: MediaRef[];
};

type Store = {
  db: Database;
  user: User | null;
  admin: User | null;
  locked: boolean;
  sensitiveLocked: boolean;
  toasts: Toast[];
  pushToast: (title: string, body?: string, action?: ToastAction) => void;
  dismissToast: (id: number) => void;
  touch: () => void;
  markOnboarded: () => void;
  giveConsent: () => void;
  register: (input: RegisterInput) => { ok: true; code: string } | { ok: false; reason: string };
  verifyCode: (code: string) => { ok: true; purpose: string } | { ok: false };
  resendCode: () => string | null;
  login: (email: string, password: string) => "ok" | "2fa" | "invalid" | "blocked";
  finishLogin: (code: string) => boolean;
  logout: () => void;
  startReset: (email: string) => boolean;
  resetPassword: (code: string, password: string) => boolean;
  setBiometric: (enabled: boolean) => void;
  unlock: () => void;
  armSensitive: () => void;
  clearSensitive: () => void;
  updateProfile: (patch: Partial<Pick<User, "firstName" | "lastName" | "phone" | "avatar">>) => void;
  changePassword: (current: string, next: string) => boolean;
  setLockMinutes: (minutes: number) => void;
  setAppearance: (appearance: User["appearance"]) => void;
  setNotify: (key: keyof User["notify"], value: boolean) => void;
  setTwoFactor: (enabled: boolean) => void;
  deleteAccount: (password: string) => boolean;
  addFirearm: (input: Omit<FirearmRecord, "id" | "userId" | "serialCipher" | "serialLast4"> & { serial?: string }) => Promise<void>;
  removeFirearm: (id: string) => void;
  book: (input: BookInput) => Promise<Appointment>;
  reschedule: (id: string, date: string, time: string) => void;
  cancelAppointment: (id: string) => ApptStatus | null;
  restoreAppointment: (id: string, status: ApptStatus) => void;
  createRequest: (input: Omit<ServiceRequest, "id" | "userId" | "status" | "createdAt">) => ServiceRequest;
  saveInspection: (inspection: Inspection) => void;
  removeMedia: (inspectionId: string, mediaId: string) => void;
  ensureConversation: () => string;
  sendMessage: (conversationId: string, text: string, from: "customer" | "staff") => void;
  markConversationRead: (conversationId: string) => void;
  markNotice: (id: string) => void;
  markAllNotices: () => void;
  beginAdminLogin: (email: string, password: string) => "2fa" | "invalid" | "blocked";
  finishAdminLogin: (code: string) => boolean;
  adminLogout: () => void;
  setAppointmentStatus: (id: string, status: ApptStatus, note: string) => void;
  setAppointmentNotes: (id: string, notes: string, quote?: string) => void;
  updateAvailability: (patch: Partial<Availability>) => void;
  updateService: (id: ServiceId, patch: Partial<ServiceContent>) => void;
  updateBusiness: (patch: Partial<BusinessProfile>) => void;
  saveProject: (project: GalleryProject) => void;
  deleteProject: (id: string) => void;
  saveAssessment: (inspectionId: string, assessment: GunsmithAssessment, send: boolean) => void;
  setRequestStatus: (id: string, status: RequestStatus, quote?: string) => void;
  convertRequest: (id: string, date: string, time: string) => string | null;
  setBlocked: (userId: string, blocked: boolean) => void;
  addStaff: (input: RegisterInput & { role: Role }) => boolean;
  broadcast: (title: string, body: string, category: NoticeCategory) => void;
  addDocument: (doc: Omit<ShopDocument, "id">) => void;
  setFlags: (patch: Partial<Database["flags"]>) => void;
  setAi: (patch: Partial<AISettings>) => void;
  updateFaqs: (faqs: Database["faqs"]) => void;
  logAudit: (action: string, target: string) => void;
  signOutSession: (id: string) => void;
  resetDemo: () => void;
};

const Ctx = createContext<Store | null>(null);

function uid(prefix: string) {
  return `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
}

function code6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function now() {
  return new Date().toISOString();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database>(createSeed);
  const [locked, setLocked] = useState(false);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);
  useEffect(() => {
    const loaded = loadDatabase();
    setDb(loaded);
    const person = loaded.users.find((u) => u.id === loaded.customerId);
    setLocked(Boolean(person?.biometricEnabled));
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) hydrated.current = true;
  }, [ready]);
  const [sensitiveLocked, setSensitiveLocked] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastActive = useRef(Date.now());
  const toastId = useRef(1);

  const update = (recipe: (current: Database) => Database) => {
    setDb((current) => {
      const next = recipe(current);
      if (hydrated.current) saveDatabase(next);
      return next;
    });
  };

  const user = db.users.find((u) => u.id === db.customerId) ?? null;
  const admin = db.users.find((u) => u.id === db.adminId) ?? null;

  const pushToast = (title: string, body?: string, action?: ToastAction) => {
    const id = toastId.current++;
    setToasts((list) => [...list, { id, title, body, action }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4200);
  };

  const dismissToast = (id: number) => setToasts((list) => list.filter((t) => t.id !== id));

  useEffect(() => {
    document.documentElement.dataset.theme = (user ?? admin)?.appearance ?? "dark";
  }, [user, admin]);

  useEffect(() => {
    const tick = window.setInterval(() => {
      const person = user;
      if (!person) return;
      if (Date.now() - lastActive.current > person.lockMinutes * 60 * 1000) {
        update((current) => ({ ...current, customerId: null, pending: null }));
        pushToast("Signed out", "You were signed out after a period of inactivity.");
      }
    }, 15000);
    return () => window.clearInterval(tick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.lockMinutes]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "hidden" && user) setSensitiveLocked(true);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [user]);

  const notify = (userId: string, category: NoticeCategory, title: string, body: string, href: string, lockText: string) => {
    const person = db.users.find((u) => u.id === userId);
    if (person && !person.notify[category]) return;
    update((current) => ({
      ...current,
      notices: [
        {
          id: uid("n"),
          userId,
          category,
          title,
          body,
          lockText,
          href,
          at: now(),
          read: false,
        },
        ...current.notices,
      ],
    }));
  };

  const value = useMemo<Store>(() => {
    const touch = () => {
      lastActive.current = Date.now();
    };

    return {
      db,
      user,
      admin,
      locked,
      sensitiveLocked,
      toasts,
      pushToast,
      dismissToast,
      touch,
      markOnboarded: () => update((d) => ({ ...d, onboarded: true })),
      giveConsent: () => update((d) => ({ ...d, consentGiven: true })),
      register: (input) => {
        const email = input.email.trim().toLowerCase();
        if (db.users.some((u) => u.email.toLowerCase() === email)) return { ok: false, reason: "An account with that email already exists." };
        const code = code6();
        const person: User = {
          id: uid("u"),
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email,
          phone: input.phone.trim(),
          password: input.password,
          role: "customer",
          createdAt: now(),
          emailVerified: false,
          phoneVerified: false,
          biometricEnabled: false,
          twoFactorEnabled: false,
          lockMinutes: 10,
          appearance: "dark",
          notify: { appointment: true, reminder: true, status: true, message: true, inspection: true, appraisal: true },
        };
        update((d) => ({
          ...d,
          users: [...d.users, person],
          pending: { purpose: "register", email, code, userId: person.id },
        }));
        return { ok: true, code };
      },
      verifyCode: (_code) => {
        const purpose = db.pending?.purpose ?? "register";
        if (purpose === "register" && db.pending?.userId) {
          update((d) => ({
            ...d,
            users: d.users.map((u) => (u.id === db.pending?.userId ? { ...u, emailVerified: true } : u)),
            customerId: db.pending?.userId ?? null,
            pending: null,
          }));
        }
        return { ok: true, purpose };
      },
      resendCode: () => {
        if (!db.pending) return null;
        const code = code6();
        update((d) => ({ ...d, pending: d.pending ? { ...d.pending, code } : null }));
        return code;
      },
      login: (email, password) => {
        const person = db.users.find(
          (u) => u.role === "customer" && u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
        );
        if (!person) return "invalid";
        if (person.blocked) return "blocked";
        if (person.twoFactorEnabled) {
          const code = code6();
          update((d) => ({ ...d, pending: { purpose: "login-2fa", email: person.email, code, userId: person.id } }));
          return "2fa";
        }
        update((d) => ({
          ...d,
          customerId: person.id,
          sessions: [
            { id: uid("s"), userId: person.id, device: navigator.userAgent.slice(0, 48), ip: "Local session", at: now(), current: true },
            ...d.sessions.map((s) => ({ ...s, current: false })),
          ],
        }));
        setLocked(person.biometricEnabled);
        setSensitiveLocked(false);
        touch();
        return "ok";
      },
      finishLogin: (code) => {
        if (!db.pending || db.pending.purpose !== "login-2fa" || db.pending.code !== code.trim()) return false;
        update((d) => ({ ...d, customerId: db.pending?.userId ?? null, pending: null }));
        setLocked(false);
        return true;
      },
      logout: () => {
        update((d) => ({ ...d, customerId: null }));
        setLocked(false);
        setSensitiveLocked(false);
      },
      startReset: (email) => {
        const person = db.users.find((u) => u.role === "customer" && u.email.toLowerCase() === email.trim().toLowerCase());
        if (!person) return false;
        update((d) => ({
          ...d,
          pending: { purpose: "reset", email: person.email, code: code6(), userId: person.id },
        }));
        return true;
      },
      resetPassword: (code, password) => {
        if (!db.pending || db.pending.purpose !== "reset" || db.pending.code !== code.trim()) return false;
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === db.pending?.userId ? { ...u, password } : u)),
          pending: null,
        }));
        return true;
      },
      setBiometric: (enabled) => {
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === d.customerId ? { ...u, biometricEnabled: enabled } : u)),
        }));
        if (!enabled) setLocked(false);
      },
      unlock: () => setLocked(false),
      armSensitive: () => setSensitiveLocked(true),
      clearSensitive: () => setSensitiveLocked(false),
      updateProfile: (patch) =>
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === d.customerId ? { ...u, ...patch } : u)),
        })),
      changePassword: (current, next) => {
        if (!user || user.password !== current) return false;
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === d.customerId ? { ...u, password: next } : u)),
        }));
        return true;
      },
      setLockMinutes: (minutes) =>
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === d.customerId ? { ...u, lockMinutes: minutes } : u)),
        })),
      setAppearance: (appearance) =>
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === (d.customerId ?? d.adminId) ? { ...u, appearance } : u)),
        })),
      setNotify: (key, value) =>
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === d.customerId ? { ...u, notify: { ...u.notify, [key]: value } } : u)),
        })),
      setTwoFactor: (enabled) =>
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === d.customerId ? { ...u, twoFactorEnabled: enabled } : u)),
        })),
      deleteAccount: (password) => {
        if (!user || user.password !== password) return false;
        const id = user.id;
        update((d) => ({
          ...d,
          customerId: null,
          users: d.users.filter((u) => u.id !== id),
          firearms: d.firearms.filter((f) => f.userId !== id),
          appointments: d.appointments.filter((a) => a.userId !== id),
          requests: d.requests.filter((r) => r.userId !== id),
          inspections: d.inspections.filter((i) => i.userId !== id),
          conversations: d.conversations.filter((c) => c.userId !== id),
          messages: d.messages.filter((m) => d.conversations.some((c) => c.id === m.conversationId && c.userId !== id)),
          notices: d.notices.filter((n) => n.userId !== id),
          documents: d.documents.filter((doc) => doc.userId !== id),
          sessions: d.sessions.filter((s) => s.userId !== id),
          audit: [{ id: uid("a"), at: now(), actor: user.email, action: "Deleted account and data", target: id }, ...d.audit],
        }));
        return true;
      },
      addFirearm: async (input) => {
        if (!user) return;
        const serialCipher = input.serial ? await encryptSecret(input.serial) : undefined;
        const record: FirearmRecord = {
          id: uid("f"),
          userId: user.id,
          type: input.type,
          make: input.make,
          model: input.model,
          caliber: input.caliber,
          nickname: input.nickname,
          serialCipher,
          serialLast4: input.serial ? last4(input.serial) : undefined,
        };
        update((d) => ({ ...d, firearms: [record, ...d.firearms] }));
      },
      removeFirearm: (id) => update((d) => ({ ...d, firearms: d.firearms.filter((f) => f.id !== id) })),
      book: async (input) => {
        if (!user) throw new Error("Sign in required");
        const serialCipher = input.serial ? await encryptSecret(input.serial) : undefined;
        const appointment: Appointment = {
          id: uid("REB"),
          userId: user.id,
          serviceId: input.serviceId,
          firearmType: input.firearmType,
          make: input.make,
          model: input.model,
          caliber: input.caliber,
          serialCipher,
          serialLast4: input.serial ? last4(input.serial) : undefined,
          description: input.description,
          date: input.date,
          time: input.time,
          dropoffNotes: input.dropoffNotes,
          status: "pending",
          timeline: [{ id: uid("t"), status: "pending", at: now(), note: "Appointment requested." }],
          media: input.media,
          gunsmithNotes: "",
          createdAt: now(),
        };
        update((d) => ({ ...d, appointments: [appointment, ...d.appointments] }));
        notify(user.id, "appointment", "Appointment requested", `${appointment.id} is pending confirmation.`, `/book/${appointment.id}`, "Appointment update from REB Gunsmithing");
        return appointment;
      },
      reschedule: (id, date, time) => {
        update((d) => ({
          ...d,
          appointments: d.appointments.map((a) =>
            a.id === id
              ? {
                  ...a,
                  date,
                  time,
                  status: "pending",
                  timeline: [...a.timeline, { id: uid("t"), status: "pending", at: now(), note: "Reschedule requested." }],
                }
              : a,
          ),
        }));
        if (user) notify(user.id, "appointment", "Reschedule requested", `${id} is pending a new time.`, `/book/${id}`, "Appointment update from REB Gunsmithing");
      },
      cancelAppointment: (id) => {
        const current = db.appointments.find((a) => a.id === id);
        if (!current) return null;
        update((d) => ({
          ...d,
          appointments: d.appointments.map((a) =>
            a.id === id
              ? { ...a, status: "cancelled", timeline: [...a.timeline, { id: uid("t"), status: "cancelled", at: now(), note: "Cancelled." }] }
              : a,
          ),
        }));
        return current.status;
      },
      restoreAppointment: (id, status) =>
        update((d) => ({
          ...d,
          appointments: d.appointments.map((a) =>
            a.id === id
              ? { ...a, status, timeline: [...a.timeline, { id: uid("t"), status, at: now(), note: "Cancellation undone." }] }
              : a,
          ),
        })),
      createRequest: (input) => {
        if (!user) throw new Error("Sign in required");
        const request: ServiceRequest = { ...input, id: uid("REQ"), userId: user.id, status: "submitted", createdAt: now() };
        update((d) => ({ ...d, requests: [request, ...d.requests] }));
        notify(user.id, "status", "Request submitted", `${request.id} was sent to the shop.`, `/history/${request.id}`, "Service update from REB Gunsmithing");
        return request;
      },
      saveInspection: (inspection) =>
        update((d) => ({
          ...d,
          inspections: d.inspections.some((i) => i.id === inspection.id)
            ? d.inspections.map((i) => (i.id === inspection.id ? inspection : i))
            : [inspection, ...d.inspections],
        })),
      removeMedia: (inspectionId, mediaId) =>
        update((d) => ({
          ...d,
          inspections: d.inspections.map((i) =>
            i.id === inspectionId ? { ...i, captures: i.captures.filter((c) => c.id !== mediaId) } : i,
          ),
          audit: [{ id: uid("a"), at: now(), actor: user?.email ?? "customer", action: "Deleted media", target: mediaId }, ...d.audit],
        })),
      ensureConversation: () => {
        if (!user) return "";
        const existing = db.conversations.find((c) => c.userId === user.id);
        if (existing) return existing.id;
        const id = uid("c");
        update((d) => ({ ...d, conversations: [...d.conversations, { id, userId: user.id, subject: "REB Gunsmithing" }] }));
        return id;
      },
      sendMessage: (conversationId, text, from) => {
        const message: ChatMessage = {
          id: uid("m"),
          conversationId,
          from,
          staffName: from === "staff" ? admin?.firstName + " " + admin?.lastName : undefined,
          text,
          at: now(),
          status: "sent",
        };
        const convo = db.conversations.find((c) => c.id === conversationId);
        update((d) => ({ ...d, messages: [...d.messages, message] }));
        if (from === "staff" && convo) {
          notify(convo.userId, "message", "New message from REB Gunsmithing", "Open the app to read it.", `/messages/${conversationId}`, "New message from REB Gunsmithing");
        }
      },
      markConversationRead: (conversationId) =>
        update((d) => {
          if (!d.messages.some((m) => m.conversationId === conversationId && m.status !== "read")) return d;
          return {
            ...d,
            messages: d.messages.map((m) => (m.conversationId === conversationId ? { ...m, status: "read" } : m)),
          };
        }),
      markNotice: (id) => update((d) => ({ ...d, notices: d.notices.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotices: () =>
        update((d) => ({
          ...d,
          notices: d.notices.map((n) => (n.userId === d.customerId ? { ...n, read: true } : n)),
        })),
      beginAdminLogin: (email, password) => {
        const person = db.users.find(
          (u) => u.role !== "customer" && u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
        );
        if (!person) return "invalid";
        if (person.blocked) return "blocked";
        const code = code6();
        update((d) => ({
          ...d,
          pending: { purpose: "admin-2fa", email: person.email, code, userId: person.id },
          audit: [
            { id: uid("a"), at: now(), actor: person.email, action: "Admin password accepted", target: navigator.userAgent.slice(0, 64) },
            ...d.audit,
          ],
        }));
        return "2fa";
      },
      finishAdminLogin: (code) => {
        if (!db.pending || db.pending.purpose !== "admin-2fa" || db.pending.code !== code.trim()) return false;
        update((d) => ({ ...d, adminId: db.pending?.userId ?? null, pending: null }));
        return true;
      },
      adminLogout: () => update((d) => ({ ...d, adminId: null })),
      setAppointmentStatus: (id, status, note) => {
        const appt = db.appointments.find((a) => a.id === id);
        update((d) => ({
          ...d,
          appointments: d.appointments.map((a) =>
            a.id === id ? { ...a, status, timeline: [...a.timeline, { id: uid("t"), status, at: now(), note }] } : a,
          ),
        }));
        if (appt) {
          notify(appt.userId, "status", "Appointment updated", `${id} is now ${status.replaceAll("_", " ")}.`, `/book/${id}`, "Appointment update from REB Gunsmithing");
        }
      },
      setAppointmentNotes: (id, notes, quote) =>
        update((d) => ({
          ...d,
          appointments: d.appointments.map((a) => (a.id === id ? { ...a, gunsmithNotes: notes, quote: quote ?? a.quote } : a)),
        })),
      updateAvailability: (patch) => update((d) => ({ ...d, availability: { ...d.availability, ...patch } })),
      updateService: (id, patch) =>
        update((d) => ({ ...d, services: d.services.map((s) => (s.id === id ? { ...s, ...patch } : s)) })),
      updateBusiness: (patch) => update((d) => ({ ...d, business: { ...d.business, ...patch } })),
      saveProject: (project) =>
        update((d) => ({
          ...d,
          gallery: d.gallery.some((g) => g.id === project.id)
            ? d.gallery.map((g) => (g.id === project.id ? project : g))
            : [...d.gallery, project],
        })),
      deleteProject: (id) => update((d) => ({ ...d, gallery: d.gallery.filter((g) => g.id !== id) })),
      saveAssessment: (inspectionId, assessment, send) => {
        const inspection = db.inspections.find((i) => i.id === inspectionId);
        update((d) => ({
          ...d,
          inspections: d.inspections.map((i) =>
            i.id === inspectionId ? { ...i, assessment, status: send ? "assessed" : i.status } : i,
          ),
          audit: [{ id: uid("a"), at: now(), actor: admin ? `${admin.firstName} ${admin.lastName}` : "staff", action: "Saved gunsmith assessment", target: inspectionId }, ...d.audit],
        }));
        if (send && inspection) {
          notify(inspection.userId, "inspection", "Inspection reviewed", "A gunsmith assessment is ready in the app.", `/inspect/${inspectionId}`, "Inspection update from REB Gunsmithing");
        }
      },
      setRequestStatus: (id, status, quote) => {
        const request = db.requests.find((r) => r.id === id);
        update((d) => ({
          ...d,
          requests: d.requests.map((r) => (r.id === id ? { ...r, status, quote: quote ?? r.quote } : r)),
        }));
        if (request) notify(request.userId, "status", "Request updated", `${id} is now ${status}.`, `/history/${id}`, "Service update from REB Gunsmithing");
      },
      convertRequest: (id, date, time) => {
        const request = db.requests.find((r) => r.id === id);
        if (!request) return null;
        const appointment: Appointment = {
          id: uid("REB"),
          userId: request.userId,
          serviceId: request.serviceId,
          firearmType: request.firearmType,
          make: request.make,
          model: request.model,
          caliber: request.caliber,
          description: request.description,
          date,
          time,
          dropoffNotes: "Converted from service request.",
          status: "confirmed",
          timeline: [{ id: uid("t"), status: "confirmed", at: now(), note: `Converted from ${id}.` }],
          media: request.media,
          gunsmithNotes: "",
          createdAt: now(),
        };
        update((d) => ({
          ...d,
          appointments: [appointment, ...d.appointments],
          requests: d.requests.map((r) => (r.id === id ? { ...r, status: "scheduled" } : r)),
        }));
        notify(request.userId, "appointment", "Request scheduled", `${appointment.id} was created from your request.`, `/book/${appointment.id}`, "Appointment update from REB Gunsmithing");
        return appointment.id;
      },
      setBlocked: (userId, blocked) =>
        update((d) => ({
          ...d,
          users: d.users.map((u) => (u.id === userId ? { ...u, blocked } : u)),
          customerId: blocked && d.customerId === userId ? null : d.customerId,
          audit: [{ id: uid("a"), at: now(), actor: admin?.email ?? "staff", action: blocked ? "Blocked account" : "Restored account", target: userId }, ...d.audit],
        })),
      addStaff: (input) => {
        if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) return false;
        const person: User = {
          id: uid("u"),
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email.toLowerCase(),
          phone: input.phone,
          password: input.password,
          role: input.role,
          createdAt: now(),
          emailVerified: true,
          phoneVerified: true,
          biometricEnabled: false,
          twoFactorEnabled: true,
          lockMinutes: 15,
          appearance: "dark",
          notify: { appointment: true, reminder: true, status: true, message: true, inspection: true, appraisal: true },
        };
        update((d) => ({ ...d, users: [...d.users, person] }));
        return true;
      },
      broadcast: (title, body, category) => {
        update((d) => ({
          ...d,
          notices: [
            ...d.users
              .filter((u) => u.role === "customer" && !u.blocked)
              .map((u) => ({
                id: uid("n"),
                userId: u.id,
                category,
                title,
                body,
                lockText: "Update from REB Gunsmithing",
                href: "/notifications",
                at: now(),
                read: false,
              })),
            ...d.notices,
          ],
        }));
      },
      addDocument: (doc) => {
        const record = { ...doc, id: uid("DOC") };
        update((d) => ({ ...d, documents: [record, ...d.documents] }));
        notify(doc.userId, doc.kind === "appraisal" ? "appraisal" : "status", "Document ready", record.title, `/history/${record.id}`, "Document update from REB Gunsmithing");
      },
      setFlags: (patch) => update((d) => ({ ...d, flags: { ...d.flags, ...patch } })),
      setAi: (patch) => update((d) => ({ ...d, ai: { ...d.ai, ...patch } })),
      updateFaqs: (faqs) => update((d) => ({ ...d, faqs })),
      logAudit: (action, target) =>
        update((d) => ({
          ...d,
          audit: [{ id: uid("a"), at: now(), actor: admin ? `${admin.firstName} ${admin.lastName}` : "staff", action, target }, ...d.audit],
        })),
      signOutSession: (id) => update((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) })),
      resetDemo: () => {
        localStorage.removeItem("reb.gunsmithing.v1");
        const fresh = loadDatabase();
        setDb(fresh);
        saveDatabase(fresh);
      },
    };
    // pushToast is stable enough for this prototype; db identity covers persisted actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db, user, admin, locked, sensitiveLocked, toasts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore must be used inside AppProvider");
  return ctx;
}

export function staffCan(role: Role | undefined, action: "settings" | "staff" | "write") {
  if (!role) return false;
  if (role === "owner") return true;
  if (role === "gunsmith") return action !== "staff";
  return action === "write";
}
