"use client";
import { useState } from "react";
import { updateShopSettingsAction } from "./actions";
import type { ShopInfo } from "@/lib/shop-settings";

const editableKeys = ["name", "phone", "address", "delivery", "instagram", "facebook", "hours"] as const;

export default function SettingsForm({ initial }: { initial: ShopInfo }) {
  const [data, setData] = useState<ShopInfo>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save() {
    setSaving(true);
    setError("");
    const result = await updateShopSettingsAction(data);
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <div className="card mt-8 grid gap-4 p-6 md:grid-cols-2">
      {editableKeys.map((k) => (
        <label key={k} className={k === "address" ? "md:col-span-2" : ""}>
          <span className="mb-2 block text-sm font-bold">{k}</span>
          <input className="input" value={data[k]} onChange={(e) => setData({ ...data, [k]: e.target.value })} />
        </label>
      ))}
      {error && <p className="text-sm font-semibold text-red-600 md:col-span-2">{error}</p>}
      <button onClick={save} disabled={saving} className="btn btn-dark md:col-span-2 disabled:opacity-50">
        {saving ? "Хадгалж байна..." : saved ? "ХАДГАЛАГДЛАА ✓" : "ХАДГАЛАХ"}
      </button>
      <p className="text-sm text-zinc-500 md:col-span-2">
        Эдгээр утгууд дэлгүүрийн бүх хуудсанд (нүүр, header, footer) шууд харагдана. Хүргэлтийн тооцооны дүн (₮) зэрэг
        тоон утгыг өөрчлөхийн тулд <code className="rounded bg-[#f9edf2] px-1.5 py-0.5">lib/shop-info.ts</code>{" "}
        файлыг код дээр засна уу.
      </p>
    </div>
  );
}
