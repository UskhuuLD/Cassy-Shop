"use client";

import { useRef, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { createProductAction, updateProductAction, uploadImageAction } from "./actions";
import type { PublicProduct } from "@/lib/products";

type CategoryOption = { id: string; name: string };

export default function ProductForm({
  product,
  categories,
  onDone,
  onCancel,
}: {
  product?: PublicProduct;
  categories: CategoryOption[];
  onDone: (message: string) => void;
  onCancel: () => void;
}) {
  type ImageEntry = { url: string; color: string };
  const [images, setImages] = useState<ImageEntry[]>(
    product?.images.map((i) => ({ url: i.url, color: i.color ?? "" })) ?? []
  );
  const [colorsText, setColorsText] = useState(product?.colors.join(", ") ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const colorOptions = colorsText
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return;
    setUploading(true);
    setError("");
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      const dataUrl: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadImageAction(dataUrl);
      if ("error" in result) {
        setError(result.error);
      } else {
        setImages((v) => [...v, { url: result.url, color: "" }]);
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function setImageColor(index: number, color: string) {
    setImages((v) => v.map((img, i) => (i === index ? { ...img, color } : img)));
  }

  async function submit(formData: FormData) {
    setPending(true);
    setError("");
    formData.set("images", JSON.stringify(images));
    const result = product ? await updateProductAction(product.id, formData) : await createProductAction(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onDone(result.message);
  }

  return (
    <div className="card mt-6 p-6 md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">{product ? "Бараа засах" : "Шинэ бараа нэмэх"}</h2>
        <button onClick={onCancel} className="rounded-full p-2 hover:bg-[#f9edf2]">
          <X size={18} />
        </button>
      </div>

      <form action={submit} className="grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-bold">Барааны нэр *</span>
          <input name="name" defaultValue={product?.name} required className="input" placeholder="жнь: Ягаан Даашинз" />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block text-sm font-bold">Тайлбар</span>
          <textarea name="description" defaultValue={product?.description} className="input min-h-24" placeholder="Бүтээгдэхүүний тайлбар..." />
        </label>

        <label>
          <span className="mb-1 block text-sm font-bold">Ангилал *</span>
          <select name="categoryId" defaultValue={product?.categoryId} required className="input">
            <option value="" disabled>
              Сонгоно уу
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-sm font-bold">Нөөц (ширхэг) *</span>
          <input name="stock" type="number" min={0} defaultValue={product?.stock ?? 0} required className="input" />
        </label>

        <label>
          <span className="mb-1 block text-sm font-bold">Үнэ (₮) *</span>
          <input name="price" type="number" min={1} defaultValue={product?.price} required className="input" />
        </label>

        <label>
          <span className="mb-1 block text-sm font-bold">Хямдралтай үнэ (заавал биш)</span>
          <input name="salePrice" type="number" min={1} defaultValue={product?.salePrice ?? undefined} className="input" placeholder="Хоосон = хямдралгүй" />
        </label>

        <label>
          <span className="mb-1 block text-sm font-bold">Хэмжээнүүд (таслалаар)</span>
          <input name="sizes" defaultValue={product?.sizes.join(", ")} className="input" placeholder="S, M, L" />
        </label>

        <label>
          <span className="mb-1 block text-sm font-bold">Өнгөнүүд (таслалаар)</span>
          <input
            name="colors"
            value={colorsText}
            onChange={(e) => setColorsText(e.target.value)}
            className="input"
            placeholder="Pink, Black"
          />
        </label>

        <div className="md:col-span-2">
          <span className="mb-1 block text-sm font-bold">Зураг</span>
          <p className="mb-2 text-xs text-zinc-500">
            Зураг бүрт өнгө сонговол, хэрэглэгч тэр өнгийг сонгоход яг тэр зураг харагдана.
          </p>
          <div className="flex flex-wrap gap-3">
            {images.map((img, i) => (
              <div key={img.url + i} className="w-20">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-[#eadde3]">
                  <img src={img.url} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages((v) => v.filter((_, idx) => idx !== i))}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
                {colorOptions.length > 0 && (
                  <select
                    value={img.color}
                    onChange={(e) => setImageColor(i, e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#eadde3] bg-white px-1 py-1 text-[10px]"
                  >
                    <option value="">— Бүх өнгө —</option>
                    {colorOptions.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#cfaabc] text-zinc-400 hover:bg-[#faf5f7]">
              {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              <span className="mt-1 text-[10px]">Зураг</span>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-5 md:col-span-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="isActive" defaultChecked={product?.isActive ?? true} /> Идэвхтэй (дэлгүүрт харагдана)
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="isNew" defaultChecked={product?.isNew} /> NEW badge
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="isBestSeller" defaultChecked={product?.isBestSeller} /> BEST SELLER badge
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="isComingSoon" defaultChecked={product?.isComingSoon} /> Тун удахгүй badge
          </label>
        </div>

        {error && <p className="text-sm font-semibold text-red-600 md:col-span-2">{error}</p>}

        <div className="flex gap-3 md:col-span-2">
          <button type="submit" disabled={pending || uploading} className="btn btn-dark flex-1 disabled:opacity-50">
            {pending ? "Хадгалж байна..." : product ? "ХАДГАЛАХ" : "НЭМЭХ"}
          </button>
          <button type="button" onClick={onCancel} className="btn btn-soft">
            Цуцлах
          </button>
        </div>
      </form>
    </div>
  );
}
