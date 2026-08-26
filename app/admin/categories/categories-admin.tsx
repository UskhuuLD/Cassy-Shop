"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "./actions";

type CategoryRow = { id: string; name: string; slug: string; _count: { products: number } };

export default function CategoriesAdmin({ initial }: { initial: CategoryRow[] }) {
  const [categories, setCategories] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function refresh() {
    location.reload();
  }

  async function handleCreate(formData: FormData) {
    setError("");
    const result = await createCategoryAction(formData);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setAdding(false);
    refresh();
  }

  async function handleUpdate(id: string, formData: FormData) {
    setError("");
    const result = await updateCategoryAction(id, formData);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setEditingId(null);
    refresh();
  }

  function handleDelete(id: string) {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    if (!window.confirm(`"${cat.name}" ангиллыг устгах уу?`)) return;
    startTransition(async () => {
      const result = await deleteCategoryAction(id);
      if (!result.ok) {
        alert(result.message);
        return;
      }
      setCategories((v) => v.filter((c) => c.id !== id));
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="serif text-5xl">Ангилалууд</h1>
        <button onClick={() => setAdding(true)} className="btn btn-dark">
          <Plus size={18} /> Ангилал нэмэх
        </button>
      </div>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      {adding && (
        <form action={handleCreate} className="card mt-6 flex items-end gap-3 p-5">
          <label className="flex-1">
            <span className="mb-1 block text-sm font-bold">Ангиллын нэр</span>
            <input name="name" required autoFocus className="input" placeholder="жнь: Dresses" />
          </label>
          <button className="btn btn-dark">НЭМЭХ</button>
          <button type="button" onClick={() => setAdding(false)} className="rounded-full p-3 hover:bg-[#f9edf2]">
            <X size={18} />
          </button>
        </form>
      )}

      <div className="card mt-7 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-[#f9edf2]">
            <tr>
              <th className="p-4 font-semibold">Нэр</th>
              <th className="p-4 font-semibold">Slug</th>
              <th className="p-4 font-semibold">Бараа</th>
              <th className="p-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) =>
              editingId === c.id ? (
                <tr key={c.id} className="border-t border-[#eadde3]">
                  <td className="p-4" colSpan={4}>
                    <form action={(fd) => handleUpdate(c.id, fd)} className="flex items-center gap-3">
                      <input name="name" defaultValue={c.name} required autoFocus className="input flex-1" />
                      <button className="btn btn-dark">ХАДГАЛАХ</button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-full p-3 hover:bg-[#f9edf2]">
                        <X size={18} />
                      </button>
                    </form>
                  </td>
                </tr>
              ) : (
                <tr key={c.id} className="border-t border-[#eadde3]">
                  <td className="p-4 font-semibold">{c.name}</td>
                  <td className="p-4 text-zinc-500">{c.slug}</td>
                  <td className="p-4">{c._count.products}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => setEditingId(c.id)} className="rounded-full border border-[#eadde3] p-2 hover:bg-[#f9edf2]">
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={isPending}
                        className="rounded-full border border-[#eadde3] p-2 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
