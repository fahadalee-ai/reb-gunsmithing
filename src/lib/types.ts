export type Role = "customer" | "owner" | "gunsmith" | "staff";
export type ServiceId = "cleaning" | "repair" | "inspection" | "appraisal";
export type FirearmType = "Handgun" | "Rifle" | "Shotgun" | "Other";
export type ApptStatus = "pending" | "confirmed" | "in_progress" | "ready" | "completed" | "cancelled";
export type RequestStatus = "submitted" | "reviewing" | "quoted" | "scheduled" | "closed";
export type InspectionStatus = "draft" | "submitted" | "under_review" | "assessed";
export type Severity = "good" | "minor" | "attention";
export type Appearance = "dark" | "light" | "system";
export type NoticeCategory = "appointment" | "reminder" | "status" | "message" | "inspection" | "appraisal";

export type NotifyPrefs = {
  appointment: boolean;
  reminder: boolean;
  status: boolean;
  message: boolean;
  inspection: boolean;
  appraisal: boolean;
};

export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  avatar?: string;
  createdAt: string;
  blocked?: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  lockMinutes: number;
  appearance: Appearance;
  notify: NotifyPrefs;
};

export type FirearmRecord = {
  id: string;
  userId: string;
  type: FirearmType;
  make: string;
  model: string;
  caliber: string;
  serialCipher?: string;
  serialLast4?: string;
  nickname?: string;
};

export type MediaRef = {
  id: string;
  ownerId: string;
  kind: "photo" | "video";
  src: string;
  caption: string;
  angle?: string;
  createdAt: string;
  exifStripped: true;
};

export type TimelineEvent = {
  id: string;
  status: ApptStatus;
  at: string;
  note: string;
};

export type Appointment = {
  id: string;
  userId: string;
  serviceId: ServiceId;
  firearmType: FirearmType;
  make: string;
  model: string;
  caliber: string;
  serialCipher?: string;
  serialLast4?: string;
  description: string;
  date: string;
  time: string;
  dropoffNotes: string;
  status: ApptStatus;
  timeline: TimelineEvent[];
  media: MediaRef[];
  gunsmithNotes: string;
  quote?: string;
  createdAt: string;
};

export type ServiceRequest = {
  id: string;
  userId: string;
  serviceId: ServiceId;
  firearmType: FirearmType;
  make: string;
  model: string;
  caliber: string;
  description: string;
  contactMethod: "phone" | "email" | "message";
  urgency: "standard" | "priority";
  media: MediaRef[];
  status: RequestStatus;
  quote?: string;
  createdAt: string;
};

export type Finding = {
  id: string;
  area: string;
  severity: Severity;
  detail: string;
  confidence: number;
  captureId?: string;
};

export type AIReport = {
  summary: string;
  findings: Finding[];
  recommendedServiceId: ServiceId;
  severe: boolean;
  declined?: { reason: string };
  generatedAt: string;
  source: "mock" | "model";
};

export type GunsmithAssessment = {
  condition: string;
  findings: string;
  recommendedServiceId: ServiceId;
  estimate: string;
  time: string;
  notes: string;
  sentAt?: string;
  author: string;
};

export type Inspection = {
  id: string;
  userId: string;
  createdAt: string;
  captures: MediaRef[];
  ai?: AIReport;
  status: InspectionStatus;
  assessment?: GunsmithAssessment;
  appointmentId?: string;
};

export type Conversation = {
  id: string;
  userId: string;
  subject: string;
  appointmentId?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  from: "customer" | "staff";
  staffName?: string;
  text: string;
  at: string;
  status: "sent" | "delivered" | "read";
};

export type Notice = {
  id: string;
  userId: string;
  category: NoticeCategory;
  title: string;
  body: string;
  lockText: string;
  href: string;
  at: string;
  read: boolean;
};

export type GalleryProject = {
  id: string;
  title: string;
  category: ServiceId;
  description: string;
  image: string;
  before?: string;
  after?: string;
  date: string;
  published: boolean;
  order: number;
};

export type ShopDocument = {
  id: string;
  userId: string;
  kind: "invoice" | "appraisal" | "receipt";
  title: string;
  date: string;
  appointmentId?: string;
  lines: string[];
};

export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
};

export type DayHours = { day: number; open: string; close: string; closed: boolean };

export type Availability = {
  slotMinutes: number;
  capacity: number;
  hours: DayHours[];
  blockedDates: string[];
};

export type BusinessProfile = {
  address: string;
  mobile: string;
  office: string;
  owner: string;
  hoursNote: string;
  announcement: string;
};

export type ServiceContent = {
  id: ServiceId;
  name: string;
  summary: string;
  detail: string;
  included: string[];
  turnaround: string;
  tips: string[];
  image: string;
};

export type AISettings = {
  enabled: boolean;
  disclaimer: string;
  confidenceThreshold: number;
};

export type DeviceSession = {
  id: string;
  userId: string;
  device: string;
  ip: string;
  at: string;
  current: boolean;
};

export type PendingAuth = {
  purpose: "register" | "reset" | "login-2fa" | "admin-2fa";
  email: string;
  code: string;
  userId?: string;
  password?: string;
};

export type AppFlags = {
  maintenance: boolean;
  maintenanceMessage: string;
  minVersion: string;
};

export type Database = {
  users: User[];
  firearms: FirearmRecord[];
  appointments: Appointment[];
  requests: ServiceRequest[];
  inspections: Inspection[];
  conversations: Conversation[];
  messages: ChatMessage[];
  notices: Notice[];
  gallery: GalleryProject[];
  documents: ShopDocument[];
  audit: AuditEvent[];
  services: ServiceContent[];
  availability: Availability;
  business: BusinessProfile;
  ai: AISettings;
  sessions: DeviceSession[];
  flags: AppFlags;
  faqs: { q: string; a: string }[];
  onboarded: boolean;
  consentGiven: boolean;
  customerId: string | null;
  adminId: string | null;
  pending: PendingAuth | null;
};
