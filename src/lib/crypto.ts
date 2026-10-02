/**
 * Prototype encryption for serial numbers.
 * Uses AES-GCM via Web Crypto so serials are not stored as plaintext in app state.
 * Production stores the ciphertext in backend storage with AES-256 and a KMS-held key.
 * The key below lives on the device only so the owner can reveal their own serial.
 */

const KEY_NAME = "reb.aes.jwk";

async function getKey() {
  const existing = localStorage.getItem(KEY_NAME);
  if (existing) {
    return crypto.subtle.importKey("jwk", JSON.parse(existing), { name: "AES-GCM" }, true, [
      "encrypt",
      "decrypt",
    ]);
  }
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, [
    "encrypt",
    "decrypt",
  ]);
  localStorage.setItem(KEY_NAME, JSON.stringify(await crypto.subtle.exportKey("jwk", key)));
  return key;
}

function bytesToB64(bytes: Uint8Array) {
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

function b64ToBytes(value: string) {
  const bin = atob(value);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptSecret(plain: string) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plain)),
  );
  return `${bytesToB64(iv)}.${bytesToB64(cipher)}`;
}

export async function decryptSecret(payload: string) {
  const [ivPart, dataPart] = payload.split(".");
  if (!ivPart || !dataPart) return "";
  const key = await getKey();
  const clear = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64ToBytes(ivPart) },
    key,
    b64ToBytes(dataPart),
  );
  return new TextDecoder().decode(clear);
}

export function last4(serial: string) {
  const trimmed = serial.replace(/\s/g, "");
  return trimmed.slice(-4);
}
