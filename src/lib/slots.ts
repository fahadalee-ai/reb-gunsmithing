import { addDays, format, parseISO } from "date-fns";
import type { Appointment, Availability } from "./types";

export function isoDate(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function upcomingDates(count = 18) {
  const start = new Date();
  start.setHours(12, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

function minutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}

export function timeSlots(date: string, availability: Availability, appointments: Appointment[]) {
  const day = parseISO(date).getDay();
  const hours = availability.hours.find((h) => h.day === day);
  if (!hours || hours.closed || availability.blockedDates.includes(date)) return [];
  const open = minutes(hours.open);
  const close = minutes(hours.close);
  const slots: { time: string; full: boolean }[] = [];
  for (let cursor = open; cursor + availability.slotMinutes <= close; cursor += availability.slotMinutes) {
    const hh = String(Math.floor(cursor / 60)).padStart(2, "0");
    const mm = String(cursor % 60).padStart(2, "0");
    const time = `${hh}:${mm}`;
    const taken = appointments.filter(
      (a) => a.date === date && a.time === time && a.status !== "cancelled",
    ).length;
    slots.push({ time, full: taken >= availability.capacity });
  }
  return slots;
}

export function formatTime(value: string) {
  const [h, m] = value.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${suffix}`;
}

export function formatWhen(date: string, time?: string) {
  const label = format(parseISO(date), "EEE, MMM d");
  return time ? `${label} · ${formatTime(time)}` : label;
}

export function weekdayName(day: number) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day];
}
