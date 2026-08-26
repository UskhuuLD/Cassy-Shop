"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { uploadImageAction } from "@/app/admin/products/actions";
import { updateSiteContentAction } from "./actions";

type Slot = "heroImage" | "styleEditImage1" | "styleEditImage2";

const slots: { key: Slot; label: string; hint: string }[] = [
  { key: "heroImage", label: "Нүүр хуудасны том зураг (Hero)", hint: "Нүүр хуудасны хамгийн дээд том зураг" },
  { key: "styleEditImage1", label: "Cassy Style Edit — 1-р зураг", hint: '"Cute, clean and confident" хэсгийн зүүн зураг' },
  { key: "styleEditImage2", label: "Cassy Style Edit — 2-р зураг", hint: '"Cute, clean and confident" хэсгийн баруун зураг' },
];

export default function HomepageEditor({ initial }: { initial: Record<Slot, string> }) {
  const [images, setImages] = useState<Record<Slot, string>>(initial);
  const [uploading, setUploading] = useState<Slot | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRefs = useRef<Partial<Record<Slot, HTMLInputElement | null>>>({});

  async function handleFile(slot: Slot, file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(slot);
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const result = await uploadImageAction(dataUrl);
    setUploading(null);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    setImages((v) => ({ ...v, [slot]: result.url }));
  }

  async function save() {
    setSaving(true);
    setError("");
    const result = await updateSiteContentAction(images);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="card mt-8 p-6 md:p-8">
      <p className="text-sm text-zinc-500">
        Эдгээр зургууд нүүр хуудсанд шууд харагдана. Шинэ зураг сонгомогцоо upload хийгдэнэ — доор "ХАДГАЛАХ" дарж
        баталгаажуулна уу.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {slots.map((s) => (
          <div key={s.key}>
            <p className="mb-2 text-sm font-bold">{s.label}</p>
            <p className="mb-3 text-xs text-zinc-500">{s.hint}</p>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-[#eadde3] bg-[#f5eeee]">
              <img src={images[s.key]} className="h-full w-full object-cover" />
              <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 text-transparent transition hover:bg-black/40 hover:text-white">
                {uploading === s.key ? <Loader2 size={22} className="animate-spin" /> : <Upload size={22} />}
                <input
                  ref={(el) => {
                    fileRefs.current[s.key] = el;
                  }}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleFile(s.key, e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        ))}
      </div>

      {error && <p className="mt-5 text-sm font-semibold text-red-600">{error}</p>}

      <button onClick={save} disabled={saving || !!uploading} className="btn btn-dark mt-7 disabled:opacity-50">
        {saving ? "Хадгалж байна..." : saved ? "ХАДГАЛАГДЛАА ✓" : "ХАДГАЛАХ"}
      </button>
    </div>
  );
}
