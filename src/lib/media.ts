/**
 * Captures stay in app state. They are not written to the camera roll.
 * Drawing through a canvas and re-encoding as JPEG drops EXIF, including location.
 * Production uploads go to a private bucket over TLS, served with short-lived signed URLs.
 */
export async function fileToPrivateJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const max = 1280;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const src = canvas.toDataURL("image/jpeg", 0.72);
  bitmap.close();
  return src;
}

export function brightnessFromCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return 128;
  const sample = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let total = 0;
  const pixels = sample.length / 4;
  for (let i = 0; i < sample.length; i += 16) {
    total += 0.2126 * sample[i] + 0.7152 * sample[i + 1] + 0.0722 * sample[i + 2];
  }
  return total / Math.max(1, pixels / 4);
}
