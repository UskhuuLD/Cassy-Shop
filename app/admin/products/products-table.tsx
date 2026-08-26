"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import ProductForm from "./product-form";
import { deactivateProductAction, deleteProductAction, toggleProductActiveAction } from "./actions";
import type { PublicProduct } from "@/lib/products";

const m = (n: number) => new Intl.NumberFormat("mn-MN").format(n) + "₮";

type CategoryOption = { id: string; name: string };

export default function ProductsAdmin({
  initialProducts,
  categories,
}: {
  initialProducts: PublicProduct[];
  categories: CategoryOption[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PublicProduct | undefined>(undefined);
  const [toast, setToast] = useState("");
  const [isPending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState<{ product: PublicProduct; orderCount: number } | null>(null);

  function openAdd() {
    setEditing(undefined);
    setFormOpen(true);
  }
  function openEdit(p: PublicProduct) {
    setEditing(p);
    setFormOpen(true);
  }

  function handleDone(message: string) {
    setFormOpen(false);
    setEditing(undefined);
    setToast(message);
    setTimeout(() => setToast(""), 2500);
    // Server data is refetched by Next router revalidation; a soft refresh keeps
    // the list in sync immediately without a full reload.
    location.reload();
  }

  function onToggle(p: PublicProduct) {
    setProducts((v) => v.map((x) => (x.id === p.id ? { ...x, isActive: !x.isActive } : x)));
    startTransition(async () => {
      await toggleProductActiveAction(p.id);
    });
  }

  function onDelete(p: PublicProduct) {
    if (!window.confirm(`"${p.name}" барааг устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) return;
    startTransition(async () => {
      const result = await deleteProductAction(p.id);
      if (result.ok) {
        setProducts((v) => v.filter((x) => x.id !== p.id));
        setToast(result.message);
        setTimeout(() => setToast(""), 2500);
        return;
      }
      if (result.requiresConfirmation) {
        setConfirmDelete({ product: p, orderCount: result.orderCount ?? 0 });
        return;
      }
      alert(result.message);
    });
  }

  function onDeactivateInstead() {
    if (!confirmDelete) return;
    const p = confirmDelete.product;
    setConfirmDelete(null);
    startTransition(async () => {
      const result = await deactivateProductAction(p.id);
      setProducts((v) => v.map((x) => (x.id === p.id ? { ...x, isActive: false } : x)));
      setToast(result.message);
      setTimeout(() => setToast(""), 2500);
    });
  }

  function onForceDelete() {
    if (!confirmDelete) return;
    const p = confirmDelete.product;
    if (!window.confirm(`Сүүлчийн баталгаажуулалт: "${p.name}" барааг захиалгын түүхтэй нь хамт бүрмөсөн устгах уу? Энэ үйлдлийг буцаах боломжгүй.`)) {
      return;
    }
    setConfirmDelete(null);
    startTransition(async () => {
      const result = await deleteProductAction(p.id, true);
      if (result.ok) {
        setProducts((v) => v.filter((x) => x.id !== p.id));
        setToast(result.message);
      } else {
        alert(result.message);
      }
      setTimeout(() => setToast(""), 2500);
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="serif text-5xl">Бараанууд</h1>
        <button onClick={openAdd} className="btn btn-dark">
          <Plus size={18} /> Бараа нэмэх
        </button>
      </div>

      {toast && <div className="mt-4 rounded-xl bg-[#f2dbe4] px-4 py-3 text-sm font-semibold text-[#7a3352]">{toast}</div>}

      {formOpen && (
        <ProductForm product={editing} categories={categories} onDone={handleDone} onCancel={() => setFormOpen(false)} />
      )}

      {products.length === 0 ? (
        <div className="card mt-7 p-12 text-center">
          <p className="text-lg font-bold">Бараа алга байна</p>
          <p className="mt-2 text-sm text-zinc-500">"Бараа нэмэх" товч дарж эхний бараагаа нэмнэ үү.</p>
        </div>
      ) : (
        <div className="card mt-7 overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-[#f9edf2]">
              <tr>
                {["Бараа", "Зураг", "Үнэ", "Нөөц", "Ангилал", "Төлөв", ""].map((h) => (
                  <th key={h} className="p-4 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-[#eadde3]">
                  <td className="p-4 font-semibold">{p.name}</td>
                  <td className="p-4">
                    <img src={p.images[0]?.url || "/products/product-1.jpg"} className="h-14 w-11 rounded-lg object-cover" />
                  </td>
                  <td className="p-4">
                    {p.salePrice ? (
                      <>
                        <div className="font-bold text-[#c9536f]">{m(p.salePrice)}</div>
                        <div className="text-xs text-zinc-400 line-through">{m(p.price)}</div>
                      </>
                    ) : (
                      <b>{m(p.price)}</b>
                    )}
                  </td>
                  <td className="p-4">
                    {p.stock <= 0 ? <span className="font-bold text-red-600">0 (SOLD OUT)</span> : p.stock}
                  </td>
                  <td className="p-4">{p.category.name}</td>
                  <td className="p-4">
                    <button
                      onClick={() => onToggle(p)}
                      disabled={isPending}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${p.isActive ? "bg-[#e8f5e9] text-[#2e7d32]" : "bg-zinc-200 text-zinc-500"}`}
                    >
                      {p.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="rounded-full border border-[#eadde3] p-2 hover:bg-[#f9edf2]">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => onDelete(p)} className="rounded-full border border-[#eadde3] p-2 hover:bg-red-50">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/40 p-4">
          <div className="card w-full max-w-md p-6">
            <p className="text-sm font-semibold text-amber-700">
              ⚠️ Энэ бараа {confirmDelete.orderCount} захиалгад орсон байна. Устгавал захиалгын түүхэн мэдээлэл алдагдаж
              болзошгүй. Үүний оронд идэвхгүй болгохыг зөвлөж байна.
            </p>
            <p className="mt-3 text-sm text-zinc-500">"{confirmDelete.product.name}"</p>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={onDeactivateInstead} disabled={isPending} className="btn btn-dark w-full disabled:opacity-50">
                Идэвхгүй болгох (зөвлөж байна)
              </button>
              <button
                onClick={onForceDelete}
                disabled={isPending}
                className="w-full rounded-full border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Бодитоор устгах (буцаах боломжгүй)
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={isPending}
                className="w-full rounded-full px-4 py-2.5 text-sm font-semibold text-zinc-500 hover:bg-[#f9edf2]"
              >
                Цуцлах
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
