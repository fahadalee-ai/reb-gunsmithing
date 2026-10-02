import { createSeed } from "./seed";
import type { Database } from "./types";

const KEY = "reb.gunsmithing.v1";

export function loadDatabase(): Database {
  if (typeof localStorage === "undefined") return createSeed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return createSeed();
    const parsed = JSON.parse(raw) as Database;
    if (!parsed.users || !parsed.services) return createSeed();
    return parsed;
  } catch {
    return createSeed();
  }
}

export function saveDatabase(db: Database) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db));
}

export function clearDatabase() {
  localStorage.removeItem(KEY);
}
