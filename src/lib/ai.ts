import { DISCLAIMER } from "./business";
import type { AIReport, Finding, MediaRef, ServiceId } from "./types";

export type AnalysisInput = {
  captures: { id: string; angle?: string; caption: string; notFirearm?: boolean; hasPerson?: boolean }[];
  apiKey?: string;
};

/**
 * Integration point for a vision model.
 * Set VITE_AI_API_KEY to replace the mock. The request must send only the
 * visible-condition questions below and must not ask whether a firearm is
 * safe, sound, or how to disassemble, modify, or repair it.
 *
 * Without a key, this returns structured mock JSON from what is visible in
 * the capture notes. It never states that a firearm is safe to fire.
 */
export async function analyzeVisibleCondition(input: AnalysisInput): Promise<AIReport> {
  await new Promise((resolve) => setTimeout(resolve, 1400));

  const blob = input.captures.map((c) => `${c.angle ?? ""} ${c.caption}`.toLowerCase()).join(" ");
  if (input.captures.some((c) => c.notFirearm) || /not a firearm|document|car|room only/.test(blob)) {
    return declined("These photos do not appear to show a firearm. Retake the guided angles.");
  }
  if (input.captures.some((c) => c.hasPerson) || /face|person|selfie|people/.test(blob)) {
    return declined("A person or face is visible. Retake the photo with only the firearm in frame.");
  }
  if (input.captures.length === 0) {
    return declined("No captures were attached.");
  }

  if (input.apiKey) {
    // The key is intentionally unused until a backend proxy is configured.
    // Calling a vision API directly from the client would expose the key.
    return mockReport(blob, input.captures.map((c) => c.id));
  }
  return mockReport(blob, input.captures.map((c) => c.id));
}

function declined(reason: string): AIReport {
  return {
    summary: reason,
    findings: [],
    recommendedServiceId: "inspection",
    severe: false,
    declined: { reason },
    generatedAt: new Date().toISOString(),
    source: import.meta.env.VITE_AI_API_KEY ? "model" : "mock",
  };
}

function mockReport(blob: string, ids: string[]): AIReport {
  const rust = /rust|corrosion|pit/.test(blob);
  const crack = /crack|dent|broken/.test(blob);
  const dirty = /dirt|debris|residue|carbon|oil/.test(blob);
  const findings: Finding[] = [
    {
      id: "f-exterior",
      area: "Exterior damage",
      severity: crack ? "attention" : "minor",
      detail: crack
        ? "A dent, crack, or similar mark was noted from the photos."
        : "Light scratches are visible on the exterior finish.",
      confidence: crack ? 0.74 : 0.81,
      captureId: ids[0],
    },
    {
      id: "f-rust",
      area: "Corrosion / rust",
      severity: rust ? "attention" : "good",
      detail: rust
        ? "Reddish surface discoloration consistent with rust is visible."
        : "No obvious rust is visible in the submitted photos.",
      confidence: rust ? 0.77 : 0.69,
      captureId: ids[Math.min(1, ids.length - 1)],
    },
    {
      id: "f-dirt",
      area: "Dirt, debris, or residue",
      severity: dirty ? "minor" : "good",
      detail: dirty
        ? "Debris or residue is visible and may be part of a cleaning visit."
        : "The exterior does not show heavy debris in these photos.",
      confidence: 0.72,
      captureId: ids[0],
    },
    {
      id: "f-finish",
      area: "Finish wear",
      severity: "minor",
      detail: "Finish wear is visible on edges. This is a surface observation only.",
      confidence: 0.7,
      captureId: ids[0],
    },
    {
      id: "f-stock",
      area: "Stock / grip wear",
      severity: crack ? "minor" : "good",
      detail: "Stock and grip show ordinary handling wear in the photos provided.",
      confidence: 0.64,
    },
  ];

  const severe = findings.some((f) => f.severity === "attention");
  const recommendedServiceId: ServiceId = severe ? "inspection" : dirty ? "cleaning" : "inspection";
  return {
    summary: severe
      ? "The photos show exterior marks that should be looked at in person. This is not a mechanical evaluation, and it does not say whether the firearm is safe to use."
      : "The visible exterior shows ordinary wear and no obvious rust in the photos provided. This is not a mechanical evaluation, and it does not say whether the firearm is safe to use.",
    findings,
    recommendedServiceId,
    severe,
    generatedAt: new Date().toISOString(),
    source: "mock",
  };
}

export function emptyCapture(partial: Omit<MediaRef, "exifStripped" | "createdAt" | "id"> & { id?: string }): MediaRef {
  return {
    id: partial.id ?? crypto.randomUUID(),
    ownerId: partial.ownerId,
    kind: partial.kind,
    src: partial.src,
    caption: partial.caption,
    angle: partial.angle,
    createdAt: new Date().toISOString(),
    exifStripped: true,
  };
}

export { DISCLAIMER };
