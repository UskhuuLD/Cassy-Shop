// Plain image helpers usable from both server and client components — no
// "server-only" here (lib/cloudinary.ts keeps the server-only SDK upload).

type CldOpts = { w?: number; q?: "auto" | "auto:eco" };

/**
 * Adds on-the-fly format/quality/width transforms to a Cloudinary secure_url so
 * the browser gets a right-sized WebP/AVIF instead of the full original. Any
 * non-Cloudinary URL (a data: URL, a local /products/*.jpg seed image) is
 * returned untouched.
 */
export function cldUrl(url: string | null | undefined, opts: CldOpts = {}): string {
  if (!url) return "";
  const marker = "/image/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const rest = url.slice(i + marker.length);
  if (rest.startsWith("f_auto")) return url; // already transformed
  const t = ["f_auto", `q_${opts.q ?? "auto"}`, "c_limit"];
  if (opts.w) t.push(`w_${opts.w}`);
  return url.slice(0, i + marker.length) + t.join(",") + "/" + rest;
}

// Shrinks a photo to at most `maxDim` px on its long side and re-encodes it as
// JPEG before it ever leaves the browser — phone camera photos are routinely
// several MB, which made uploads slow, occasionally too big for the server
// action's body limit, and (once on Cloudinary) wasteful of delivery
// bandwidth. A few hundred KB uploads fast and still looks fine.
export function resizeImage(file: File, maxDim = 1600, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas дэмжигдэхгүй байна."));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Зургийг уншиж чадсангүй."));
    };
    img.src = objectUrl;
  });
}
