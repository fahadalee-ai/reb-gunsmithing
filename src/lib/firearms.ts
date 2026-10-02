import type { FirearmType } from "./types";

export type CatalogModel = { model: string; calibers: string[] };
export type CatalogMake = { make: string; models: CatalogModel[] };

/** Factory listings used by the booking and saved-firearm forms. */
const CATALOG: Record<FirearmType, CatalogMake[]> = {
  Handgun: [
    { make: "Glock", models: [
      { model: "17", calibers: ["9mm"] },
      { model: "19", calibers: ["9mm"] },
      { model: "20", calibers: ["10mm Auto"] },
      { model: "21", calibers: [".45 ACP"] },
      { model: "22", calibers: [".40 S&W"] },
      { model: "23", calibers: [".40 S&W"] },
      { model: "26", calibers: ["9mm"] },
      { model: "43", calibers: ["9mm"] },
      { model: "43X", calibers: ["9mm"] },
      { model: "48", calibers: ["9mm"] },
    ]},
    { make: "Smith & Wesson", models: [
      { model: "M&P9 M2.0", calibers: ["9mm"] },
      { model: "M&P Shield Plus", calibers: ["9mm"] },
      { model: "Model 686", calibers: [".357 Magnum"] },
      { model: "Model 642", calibers: [".38 Special"] },
    ]},
    { make: "SIG Sauer", models: [
      { model: "P320", calibers: ["9mm", ".40 S&W", ".45 ACP"] },
      { model: "P365", calibers: ["9mm"] },
      { model: "P365-XMACRO", calibers: ["9mm"] },
      { model: "P226", calibers: ["9mm", ".40 S&W"] },
    ]},
    { make: "Springfield Armory", models: [
      { model: "Hellcat", calibers: ["9mm"] },
      { model: "1911 Ronin", calibers: ["9mm", ".45 ACP"] },
      { model: "XD-M Elite", calibers: ["9mm", "10mm Auto", ".45 ACP"] },
    ]},
    { make: "Ruger", models: [
      { model: "LCP Max", calibers: [".380 ACP"] },
      { model: "Security-9", calibers: ["9mm"] },
      { model: "GP100", calibers: [".357 Magnum"] },
      { model: "Mark IV", calibers: [".22 LR"] },
    ]},
    { make: "Colt", models: [
      { model: "1911 Government", calibers: [".45 ACP"] },
      { model: "Python", calibers: [".357 Magnum"] },
    ]},
    { make: "Beretta", models: [
      { model: "92FS", calibers: ["9mm"] },
      { model: "APX A1", calibers: ["9mm"] },
    ]},
    { make: "CZ", models: [
      { model: "P-10 C", calibers: ["9mm"] },
      { model: "Shadow 2", calibers: ["9mm"] },
    ]},
    { make: "Heckler & Koch", models: [
      { model: "VP9", calibers: ["9mm"] },
      { model: "USP", calibers: ["9mm", ".40 S&W", ".45 ACP"] },
    ]},
    { make: "Walther", models: [
      { model: "PDP", calibers: ["9mm"] },
      { model: "PPQ", calibers: ["9mm"] },
    ]},
  ],
  Rifle: [
    { make: "Winchester", models: [
      { model: "Model 70", calibers: [".30-06 Springfield", ".270 Winchester", ".308 Winchester", "6.5 Creedmoor", ".300 Winchester Magnum"] },
      { model: "Model 94", calibers: [".30-30 Winchester"] },
    ]},
    { make: "Remington", models: [
      { model: "700", calibers: [".30-06 Springfield", ".308 Winchester", ".270 Winchester", "6.5 Creedmoor", ".300 Winchester Magnum"] },
      { model: "783", calibers: [".308 Winchester", ".30-06 Springfield", "6.5 Creedmoor"] },
    ]},
    { make: "Ruger", models: [
      { model: "American", calibers: [".308 Winchester", "6.5 Creedmoor", ".30-06 Springfield", ".243 Winchester"] },
      { model: "10/22", calibers: [".22 LR"] },
    ]},
    { make: "Savage", models: [
      { model: "Axis", calibers: [".308 Winchester", "6.5 Creedmoor", ".30-06 Springfield", ".243 Winchester"] },
      { model: "110", calibers: [".308 Winchester", ".30-06 Springfield", "6.5 Creedmoor", ".300 Winchester Magnum"] },
    ]},
    { make: "Browning", models: [
      { model: "X-Bolt", calibers: [".30-06 Springfield", ".270 Winchester", ".308 Winchester", "6.5 Creedmoor"] },
      { model: "BAR", calibers: [".30-06 Springfield", ".308 Winchester", ".270 Winchester"] },
    ]},
    { make: "Tikka", models: [
      { model: "T3x", calibers: [".308 Winchester", "6.5 Creedmoor", ".30-06 Springfield", ".270 Winchester"] },
    ]},
    { make: "Mossberg", models: [
      { model: "MVP Patrol", calibers: ["5.56 NATO"] },
      { model: "MVP LR", calibers: [".308 Winchester"] },
    ]},
    { make: "Henry", models: [
      { model: "Golden Boy", calibers: [".22 LR"] },
      { model: "Big Boy", calibers: [".357 Magnum", ".44 Magnum", ".45 Colt"] },
    ]},
    { make: "Marlin", models: [
      { model: "336", calibers: [".30-30 Winchester"] },
      { model: "1895", calibers: [".45-70 Government"] },
    ]},
    { make: "Smith & Wesson", models: [
      { model: "M&P15 Sport", calibers: ["5.56 NATO"] },
    ]},
  ],
  Shotgun: [
    { make: "Remington", models: [{ model: "870", calibers: ["12 gauge", "20 gauge"] }] },
    { make: "Mossberg", models: [
      { model: "500", calibers: ["12 gauge", "20 gauge"] },
      { model: "590", calibers: ["12 gauge"] },
    ]},
    { make: "Benelli", models: [
      { model: "M2", calibers: ["12 gauge"] },
      { model: "Super Black Eagle 3", calibers: ["12 gauge"] },
    ]},
    { make: "Beretta", models: [
      { model: "A300 Ultima", calibers: ["12 gauge", "20 gauge"] },
      { model: "686 Silver Pigeon", calibers: ["12 gauge", "20 gauge", "28 gauge"] },
    ]},
    { make: "Browning", models: [
      { model: "Citori", calibers: ["12 gauge", "20 gauge"] },
      { model: "BPS", calibers: ["12 gauge"] },
    ]},
    { make: "Winchester", models: [{ model: "SXP", calibers: ["12 gauge", "20 gauge"] }] },
    { make: "Stoeger", models: [{ model: "M3000", calibers: ["12 gauge"] }] },
  ],
  Other: [
    { make: "Traditions", models: [{ model: "Pursuit", calibers: [".50 caliber"] }] },
    { make: "CVA", models: [{ model: "Accura MR", calibers: [".50 caliber"] }] },
    { make: "Thompson/Center", models: [{ model: "Encore", calibers: [".30-06 Springfield", ".270 Winchester", ".45-70 Government"] }] },
  ],
};

export function makesFor(type: FirearmType) {
  return CATALOG[type].map((item) => item.make);
}

export function modelsFor(type: FirearmType, make: string) {
  return CATALOG[type].find((item) => item.make === make)?.models.map((item) => item.model) ?? [];
}

export function calibersFor(type: FirearmType, make: string, model: string) {
  return CATALOG[type].find((item) => item.make === make)?.models.find((item) => item.model === model)?.calibers ?? [];
}

export function validateFirearm(input: { type: FirearmType; make: string; model: string; caliber: string }) {
  const errors: { make?: string; model?: string; caliber?: string } = {};
  const makes = makesFor(input.type);
  const models = modelsFor(input.type, input.make);
  const calibers = calibersFor(input.type, input.make, input.model);

  if (!input.make) errors.make = "Select a make.";
  else if (!makes.includes(input.make)) errors.make = "Select a make from the list.";

  if (!errors.make && !input.model) errors.model = "Select a model.";
  else if (!errors.make && input.model && !models.includes(input.model)) errors.model = "That model is not listed for this make.";

  if (!errors.make && !errors.model && !input.caliber) errors.caliber = "Select a caliber or gauge.";
  else if (!errors.make && !errors.model && input.caliber && !calibers.includes(input.caliber)) {
    errors.caliber = "That caliber is not a factory chambering for this model.";
  }
  return errors;
}

export function validateSerial(serial: string) {
  const value = serial.trim();
  if (!value) return "";
  if (!/^[A-Za-z0-9-]{3,20}$/.test(value)) return "Use 3–20 letters, numbers, or hyphens.";
  return "";
}
