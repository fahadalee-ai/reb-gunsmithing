import { addDays, format, subDays } from "date-fns";
import { BUSINESS, CREDENTIALS, DISCLAIMER } from "./business";
import { asset } from "./utils";
import type {
  Appointment,
  Availability,
  ChatMessage,
  Conversation,
  Database,
  GalleryProject,
  Inspection,
  Notice,
  ServiceContent,
  ServiceRequest,
  ShopDocument,
  User,
} from "./types";

const img = (file: string) => asset(`media/${file}`);

const notify = {
  appointment: true,
  reminder: true,
  status: true,
  message: true,
  inspection: true,
  appraisal: true,
};

function iso(date: Date) {
  return date.toISOString();
}

function day(offset: number) {
  return format(addDays(new Date(), offset), "yyyy-MM-dd");
}

export function createSeed(): Database {
  const nextThursday = (() => {
    const now = new Date();
    const delta = (4 - now.getDay() + 7) % 7 || 7;
    return format(addDays(now, delta), "yyyy-MM-dd");
  })();

  const users: User[] = [
    {
      id: "u-james",
      firstName: "James",
      lastName: "Harper",
      email: "james@harpermail.com",
      phone: "865-555-0148",
      password: "Visit1947",
      role: "customer",
      createdAt: iso(subDays(new Date(), 40)),
      emailVerified: true,
      phoneVerified: true,
      biometricEnabled: false,
      twoFactorEnabled: false,
      lockMinutes: 10,
      appearance: "dark",
      notify: { ...notify },
    },
    {
      id: "u-rich",
      firstName: "Rich",
      lastName: "Bryant",
      email: "owner@rebgunsmithing.local",
      phone: BUSINESS.mobile,
      password: "ShopDesk1",
      role: "owner",
      createdAt: iso(subDays(new Date(), 400)),
      emailVerified: true,
      phoneVerified: true,
      biometricEnabled: false,
      twoFactorEnabled: true,
      lockMinutes: 15,
      appearance: "dark",
      notify: { ...notify },
    },
    {
      id: "u-staff",
      firstName: "Elena",
      lastName: "Ward",
      email: "staff@rebgunsmithing.local",
      phone: BUSINESS.office,
      password: "FrontDesk1",
      role: "staff",
      createdAt: iso(subDays(new Date(), 80)),
      emailVerified: true,
      phoneVerified: true,
      biometricEnabled: false,
      twoFactorEnabled: true,
      lockMinutes: 15,
      appearance: "dark",
      notify: { ...notify },
    },
  ];

  const services: ServiceContent[] = [
    {
      id: "cleaning",
      name: "Firearm Cleaning",
      summary: "Detailed ultrasonic cleaning and lubrication to keep a firearm dependable.",
      detail:
        "Routine and deep cleaning for handguns, rifles, and shotguns. The shop cleans the firearm, looks for visible wear, and lubricates it before pickup.",
      included: [
        "Routine or deep cleaning",
        "Ultrasonic cleaning where it is appropriate",
        "Lubrication",
        "A visual check for obvious exterior wear",
      ],
      turnaround: "3–5 business days",
      tips: [
        "Bring the firearm unloaded.",
        "Do not bring ammunition to the shop.",
        "A short note about how it has been stored is enough.",
      ],
      image: img("hero-workshop.jpg"),
    },
    {
      id: "repair",
      name: "Firearm Repair",
      summary: "Diagnosis and repair of function issues for handguns, rifles, and shotguns.",
      detail:
        "The gunsmith evaluates the concern in the shop and completes the approved repair. Describe what the firearm is doing. The shop does not need disassembly instructions from you.",
      included: [
        "In-person diagnosis",
        "Repair of the reported function issue",
        "A shop function check before pickup",
        "Notes on what was found",
      ],
      turnaround: "Quoted after evaluation",
      tips: [
        "Describe the issue in plain language.",
        "Bring the firearm unloaded.",
        "Leave further disassembly to the gunsmith.",
      ],
      image: img("craftsman-hands.jpg"),
    },
    {
      id: "inspection",
      name: "Inspection & Maintenance",
      summary: "In-person safety and function check, plus scheduled maintenance.",
      detail:
        "A certified gunsmith reviews condition and function in the shop and carries out the maintenance you request. Photos in the app are only a preliminary look at the exterior.",
      included: [
        "In-person safety and function check",
        "Maintenance of the items you request",
        "Written notes",
        "A recommendation for the next service, if one is needed",
      ],
      turnaround: "2–4 business days",
      tips: [
        "Bring the firearm unloaded.",
        "Mention any recent malfunction in the appointment notes.",
        "Do not rely on app photos in place of this visit.",
      ],
      image: img("services-hero.jpg"),
    },
    {
      id: "appraisal",
      name: "Firearm Appraisals",
      summary: "Certified valuation for insurance, estate, or sale, with AGI certification.",
      detail:
        "Rich Bryant provides documented appraisals of condition and market value for insurance, estate, or sale. Appraisal documents stay on your account.",
      included: [
        "Condition review",
        "Written valuation",
        "A document for your records",
        "AGI Certified Firearms Appraiser credentials",
      ],
      turnaround: "5–10 business days",
      tips: [
        "Bring prior paperwork if you have it.",
        "Serial numbers are stored encrypted and are never published.",
        "Photos used for an appraisal are visible only to you and authorized staff.",
      ],
      image: img("services-detail.jpg"),
    },
  ];

  const appointments: Appointment[] = [
    {
      id: "REB-24081",
      userId: "u-james",
      serviceId: "cleaning",
      firearmType: "Rifle",
      make: "Winchester",
      model: "Model 70",
      caliber: ".30-06 Springfield",
      serialLast4: "4412",
      description: "Seasonal deep cleaning before hunting season.",
      date: nextThursday,
      time: "10:00",
      dropoffNotes: "In-person drop-off.",
      status: "confirmed",
      timeline: [
        { id: "t1", status: "pending", at: iso(subDays(new Date(), 3)), note: "Request received." },
        { id: "t2", status: "confirmed", at: iso(subDays(new Date(), 2)), note: "Rich confirmed the drop-off time." },
      ],
      media: [],
      gunsmithNotes: "Bring it unloaded. A chamber flag is welcome if you already use one.",
      createdAt: iso(subDays(new Date(), 3)),
    },
    {
      id: "REB-23810",
      userId: "u-james",
      serviceId: "inspection",
      firearmType: "Shotgun",
      make: "Remington",
      model: "870",
      caliber: "12 gauge",
      description: "Annual function check.",
      date: day(-21),
      time: "13:30",
      dropoffNotes: "",
      status: "completed",
      timeline: [
        { id: "t3", status: "confirmed", at: iso(subDays(new Date(), 28)), note: "Appointment confirmed." },
        { id: "t4", status: "in_progress", at: iso(subDays(new Date(), 21)), note: "In the shop." },
        { id: "t5", status: "ready", at: iso(subDays(new Date(), 19)), note: "Ready for pickup." },
        { id: "t6", status: "completed", at: iso(subDays(new Date(), 18)), note: "Picked up." },
      ],
      media: [],
      gunsmithNotes: "Function check completed in the shop. No further shop work was requested.",
      quote: "$75",
      createdAt: iso(subDays(new Date(), 30)),
    },
    {
      id: "REB-23702",
      userId: "u-james",
      serviceId: "repair",
      firearmType: "Handgun",
      make: "Glock",
      model: "19",
      caliber: "9mm",
      description: "Slide does not lock back.",
      date: day(-45),
      time: "09:00",
      dropoffNotes: "",
      status: "cancelled",
      timeline: [
        { id: "t7", status: "pending", at: iso(subDays(new Date(), 50)), note: "Request received." },
        { id: "t8", status: "cancelled", at: iso(subDays(new Date(), 46)), note: "Cancelled by customer." },
      ],
      media: [],
      gunsmithNotes: "",
      createdAt: iso(subDays(new Date(), 50)),
    },
  ];

  const requests: ServiceRequest[] = [
    {
      id: "REQ-1104",
      userId: "u-james",
      serviceId: "appraisal",
      firearmType: "Rifle",
      make: "Winchester",
      model: "Model 70",
      caliber: ".30-06 Springfield",
      description: "Insurance appraisal for a single hunting rifle.",
      contactMethod: "message",
      urgency: "standard",
      media: [],
      status: "submitted",
      createdAt: iso(subDays(new Date(), 1)),
    },
  ];

  const inspections: Inspection[] = [
    {
      id: "INS-501",
      userId: "u-james",
      createdAt: iso(subDays(new Date(), 6)),
      status: "assessed",
      captures: [
        {
          id: "cap-1",
          ownerId: "u-james",
          kind: "photo",
          src: img("precision-work.jpg"),
          caption: "Rust discoloration near the muzzle exterior.",
          angle: "Muzzle / barrel exterior",
          createdAt: iso(subDays(new Date(), 6)),
          exifStripped: true,
        },
        {
          id: "cap-2",
          ownerId: "u-james",
          kind: "photo",
          src: img("services-detail.jpg"),
          caption: "Right side on the bench.",
          angle: "Right side",
          createdAt: iso(subDays(new Date(), 6)),
          exifStripped: true,
        },
      ],
      ai: {
        summary:
          "The photos show exterior rust-colored discoloration. This is not a mechanical evaluation, and it does not say whether the firearm is safe to use.",
        findings: [
          {
            id: "f1",
            area: "Exterior damage",
            severity: "minor",
            detail: "Light handling marks are visible on the exterior.",
            confidence: 0.8,
            captureId: "cap-2",
          },
          {
            id: "f2",
            area: "Corrosion / rust",
            severity: "attention",
            detail: "Reddish surface discoloration is visible near the muzzle exterior.",
            confidence: 0.78,
            captureId: "cap-1",
          },
          {
            id: "f3",
            area: "Dirt, debris, or residue",
            severity: "minor",
            detail: "Some residue is visible around the action exterior.",
            confidence: 0.66,
          },
          {
            id: "f4",
            area: "Finish wear",
            severity: "minor",
            detail: "Edge wear is visible in the finish.",
            confidence: 0.71,
          },
          {
            id: "f5",
            area: "Stock / grip wear",
            severity: "good",
            detail: "The stock shows ordinary handling wear.",
            confidence: 0.63,
          },
        ],
        recommendedServiceId: "inspection",
        severe: true,
        generatedAt: iso(subDays(new Date(), 6)),
        source: "mock",
      },
      assessment: {
        condition: "Exterior corrosion is visible in the photos. Internal condition was not determined.",
        findings: "Surface discoloration shows near the muzzle exterior. I need the firearm in the shop before commenting on function.",
        recommendedServiceId: "inspection",
        estimate: "$85–$140, confirmed after the in-person visit",
        time: "2–4 business days after drop-off",
        notes: "Bring it unloaded. Do not use these photos to decide whether it is safe to fire.",
        sentAt: iso(subDays(new Date(), 5)),
        author: "Rich Bryant",
      },
    },
    {
      id: "INS-488",
      userId: "u-james",
      createdAt: iso(subDays(new Date(), 1)),
      status: "under_review",
      captures: [
        {
          id: "cap-3",
          ownerId: "u-james",
          kind: "photo",
          src: img("tools-grid.jpg"),
          caption: "Left side, bench lighting.",
          angle: "Left side",
          createdAt: iso(subDays(new Date(), 1)),
          exifStripped: true,
        },
      ],
      ai: {
        summary:
          "The visible exterior shows ordinary wear. This is not a mechanical evaluation, and it does not say whether the firearm is safe to use.",
        findings: [
          {
            id: "f6",
            area: "Exterior damage",
            severity: "good",
            detail: "No obvious cracks or dents in this photo.",
            confidence: 0.67,
            captureId: "cap-3",
          },
          {
            id: "f7",
            area: "Corrosion / rust",
            severity: "good",
            detail: "No obvious rust in this photo.",
            confidence: 0.62,
          },
          {
            id: "f8",
            area: "Dirt, debris, or residue",
            severity: "minor",
            detail: "Light residue may be present. A cleaning visit can address what is visible.",
            confidence: 0.6,
          },
          {
            id: "f9",
            area: "Finish wear",
            severity: "minor",
            detail: "Ordinary finish wear.",
            confidence: 0.64,
          },
          {
            id: "f10",
            area: "Stock / grip wear",
            severity: "good",
            detail: "No obvious stock damage in this photo.",
            confidence: 0.58,
          },
        ],
        recommendedServiceId: "cleaning",
        severe: false,
        generatedAt: iso(subDays(new Date(), 1)),
        source: "mock",
      },
    },
  ];

  const conversations: Conversation[] = [
    { id: "c-james", userId: "u-james", subject: "REB Gunsmithing", appointmentId: "REB-24081" },
  ];

  const messages: ChatMessage[] = [
    {
      id: "m1",
      conversationId: "c-james",
      from: "staff",
      staffName: "Rich Bryant",
      text: "James, your cleaning appointment is confirmed. Bring the rifle unloaded.",
      at: iso(subDays(new Date(), 2)),
      status: "read",
    },
    {
      id: "m2",
      conversationId: "c-james",
      from: "customer",
      text: "Thank you. I will be there at 10.",
      at: iso(subDays(new Date(), 2)),
      status: "read",
    },
    {
      id: "m3",
      conversationId: "c-james",
      from: "staff",
      staffName: "Rich Bryant",
      text: "I also sent notes on the photo inspection. Those photos are not a function check.",
      at: iso(subDays(new Date(), 1)),
      status: "delivered",
    },
  ];

  const notices: Notice[] = [
    {
      id: "n1",
      userId: "u-james",
      category: "appointment",
      title: "Appointment confirmed",
      body: `Firearm Cleaning is confirmed for ${nextThursday} at 10:00 AM.`,
      lockText: "Appointment update from REB Gunsmithing",
      href: "/book/REB-24081",
      at: iso(subDays(new Date(), 2)),
      read: false,
    },
    {
      id: "n2",
      userId: "u-james",
      category: "message",
      title: "New message from REB Gunsmithing",
      body: "Rich sent a message about your cleaning appointment.",
      lockText: "New message from REB Gunsmithing",
      href: "/messages/c-james",
      at: iso(subDays(new Date(), 1)),
      read: false,
    },
    {
      id: "n3",
      userId: "u-james",
      category: "inspection",
      title: "Inspection reviewed",
      body: "Rich added a professional assessment to INS-501.",
      lockText: "Inspection update from REB Gunsmithing",
      href: "/inspect/INS-501",
      at: iso(subDays(new Date(), 5)),
      read: true,
    },
  ];

  const gallery: GalleryProject[] = [
    {
      id: "g1",
      title: "Bench cleaning and protection",
      category: "cleaning",
      description:
        "A bolt-action rifle received a deep cleaning and lubrication in the shop. Customer details are not shown.",
      image: img("hero-workshop.jpg"),
      before: img("precision-work.jpg"),
      after: img("hero-workshop.jpg"),
      date: day(-12),
      published: true,
      order: 1,
    },
    {
      id: "g2",
      title: "Function service, returned to the owner",
      category: "repair",
      description:
        "The shop diagnosed a function issue and completed the approved repair before pickup. No customer identifiers are published.",
      image: img("craftsman-hands.jpg"),
      date: day(-30),
      published: true,
      order: 2,
    },
    {
      id: "g3",
      title: "In-person inspection",
      category: "inspection",
      description: "A scheduled safety and function check completed on the bench. The written notes stayed with the customer.",
      image: img("services-hero.jpg"),
      date: day(-18),
      published: true,
      order: 3,
    },
    {
      id: "g4",
      title: "Documented appraisal",
      category: "appraisal",
      description:
        "An AGI certified appraisal prepared for insurance records. The report itself is not public.",
      image: img("about-story.jpg"),
      before: img("services-detail.jpg"),
      after: img("about-story.jpg"),
      date: day(-40),
      published: true,
      order: 4,
    },
  ];

  const documents: ShopDocument[] = [
    {
      id: "DOC-880",
      userId: "u-james",
      kind: "receipt",
      title: "Inspection receipt",
      date: day(-18),
      appointmentId: "REB-23810",
      lines: [
        "REB Gunsmithing",
        BUSINESS.address,
        "Receipt DOC-880",
        "Service: Inspection & Maintenance",
        "Amount: $75",
        "Paid at pickup.",
      ],
    },
    {
      id: "DOC-881",
      userId: "u-james",
      kind: "appraisal",
      title: "Sample appraisal cover",
      date: day(-40),
      lines: [
        "REB Gunsmithing",
        "AGI Certified Firearms Appraiser",
        "Prepared for the account holder only.",
        "This sample describes a documented valuation kept on the private account.",
        "It is not a public listing and it does not include a serial number.",
      ],
    },
  ];

  const availability: Availability = {
    slotMinutes: 60,
    capacity: 1,
    hours: [0, 1, 2, 3, 4, 5, 6].map((dayNum) => ({
      day: dayNum,
      open: dayNum === 6 ? "09:00" : "09:00",
      close: dayNum === 6 ? "13:00" : "17:00",
      closed: dayNum === 0 || dayNum === 1,
    })),
    blockedDates: [`${new Date().getFullYear()}-12-25`, `${new Date().getFullYear()}-01-01`],
  };

  return {
    users,
    firearms: [
      {
        id: "f-1",
        userId: "u-james",
        type: "Rifle",
        make: "Winchester",
        model: "Model 70",
        caliber: ".30-06 Springfield",
        nickname: "Hunting rifle",
        serialLast4: "4412",
      },
    ],
    appointments,
    requests,
    inspections,
    conversations,
    messages,
    notices,
    gallery,
    documents,
    audit: [
      {
        id: "a1",
        at: iso(subDays(new Date(), 5)),
        actor: "Rich Bryant",
        action: "Viewed inspection media",
        target: "INS-501",
      },
    ],
    services,
    availability,
    business: {
      address: BUSINESS.address,
      mobile: BUSINESS.mobile,
      office: BUSINESS.office,
      owner: `${BUSINESS.owner}, ${BUSINESS.ownerTitle}`,
      hoursNote: "By appointment, Tuesday–Saturday.",
      announcement: "",
    },
    ai: { enabled: true, disclaimer: DISCLAIMER, confidenceThreshold: 0.55 },
    sessions: [
      {
        id: "s-current",
        userId: "u-james",
        device: "This device",
        ip: "Local session",
        at: iso(new Date()),
        current: true,
      },
    ],
    flags: {
      maintenance: false,
      maintenanceMessage: "The shop app is briefly unavailable while we update appointment times.",
      minVersion: "1.0.0",
    },
    faqs: [
      {
        q: "What services does REB Gunsmithing provide?",
        a: "REB Gunsmithing provides firearm cleaning, inspection, repair, maintenance, and appraisal services.",
      },
      {
        q: "Where is REB Gunsmithing located?",
        a: "1424 Lower English Creek Rd., Newport, TN 37821.",
      },
      {
        q: "How do I request service?",
        a: "Book an appointment in the app, send a service request, or call Rich Bryant.",
      },
      {
        q: "Do you provide firearm appraisals?",
        a: "Yes. REB Gunsmithing provides firearm appraisal services.",
      },
      {
        q: "What information should I provide when contacting you?",
        a: "Provide your contact details, the general type of firearm, and a brief description of the service or issue you would like evaluated.",
      },
      {
        q: "Policies involving transfers, shipping, or legal matters?",
        a: "Please contact REB Gunsmithing directly to discuss requirements and applicable regulations.",
      },
    ],
    onboarded: false,
    consentGiven: false,
    customerId: null,
    adminId: null,
    pending: null,
  };
}

export const DEMO_CUSTOMER = { email: "james@harpermail.com", password: "Visit1947" };
export const DEMO_ADMIN = { email: "owner@rebgunsmithing.local", password: "ShopDesk1" };
export const CREDENTIAL_NOTE = CREDENTIALS;
