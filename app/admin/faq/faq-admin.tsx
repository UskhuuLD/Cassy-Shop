"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { createFaqAction, updateFaqAction, deleteFaqAction } from "./actions";

type FaqRow = { id: string; question: string; answer: string };

export default function FaqAdmin({ initial }: { initial: FaqRow[] }) {
  const [faqs, setFaqs] = useState(initial);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function refresh() {
    location.reload();
  }

  async function handleCreate(formData: FormData) {
    setError("");
    const result = await createFaqAction(formData);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setAdding(false);
    refresh();
  }

  async function handleUpdate(id: string, formData: FormData) {
    setError("");
    const result = await updateFaqAction(id, formData);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setEditingId(null);
    refresh();
  }

  function handleDelete(id: string) {
    const faq = faqs.find((f) => f.id === id);
    if (!faq) return;
    if (!window.confirm(`"${faq.question}" асуултыг устгах уу?`)) return;
    startTransition(async () => {
      const result = await deleteFaqAction(id);
      if (!result.ok) {
        alert(result.message);
        return;
      }
      setFaqs((v) => v.filter((f) => f.id !== id));
    });
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="serif text-3xl sm:text-4xl md:text-5xl">FAQ — Түгээмэл асуултууд</h1>
        <button onClick={() => setAdding(true)} className="btn btn-dark self-start !px-4 !py-2 text-sm sm:self-auto">
          <Plus size={16} /> Асуулт нэмэх
        </button>
      </div>
      <p className="mt-2 text-sm text-zinc-500">Эндээс нэмсэн асуулт, хариулт /faq хуудас болон footer-т харагдана.</p>

      {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

      {adding && (
        <form action={handleCreate} className="card mt-6 grid gap-3 p-5">
          <label>
            <span className="mb-1 block text-sm font-bold">Асуулт</span>
            <input name="question" required autoFocus className="input" placeholder="жнь: Хүргэлт хэдэн хоног үргэлжлэх вэ?" />
          </label>
          <label>
            <span className="mb-1 block text-sm font-bold">Хариулт</span>
            <textarea name="answer" required className="input min-h-24" placeholder="Хариултаа энд бичнэ үү..." />
          </label>
          <div className="flex gap-3">
            <button className="btn btn-dark">НЭМЭХ</button>
            <button type="button" onClick={() => setAdding(false)} className="btn btn-soft">
              Цуцлах
            </button>
          </div>
        </form>
      )}

      <div className="mt-7 space-y-3">
        {faqs.length === 0 && !adding && (
          <div className="card p-8 text-center text-zinc-500">Одоогоор асуулт алга. Дээрх товчоор эхнийхээ нэмнэ үү.</div>
        )}
        {faqs.map((f) =>
          editingId === f.id ? (
            <form key={f.id} action={(fd) => handleUpdate(f.id, fd)} className="card grid gap-3 p-5">
              <label>
                <span className="mb-1 block text-sm font-bold">Асуулт</span>
                <input name="question" defaultValue={f.question} required autoFocus className="input" />
              </label>
              <label>
                <span className="mb-1 block text-sm font-bold">Хариулт</span>
                <textarea name="answer" defaultValue={f.answer} required className="input min-h-24" />
              </label>
              <div className="flex gap-3">
                <button className="btn btn-dark">ХАДГАЛАХ</button>
                <button type="button" onClick={() => setEditingId(null)} className="btn btn-soft">
                  Цуцлах
                </button>
              </div>
            </form>
          ) : (
            <div key={f.id} className="card flex items-start justify-between gap-4 p-5">
              <div>
                <p className="font-bold">{f.question}</p>
                <p className="mt-1 whitespace-pre-line text-sm text-zinc-600">{f.answer}</p>
              </div>
              <div className="flex flex-none gap-2">
                <button onClick={() => setEditingId(f.id)} className="rounded-full border border-[#eadde3] p-2 hover:bg-[#f9edf2]">
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(f.id)}
                  disabled={isPending}
                  className="rounded-full border border-[#eadde3] p-2 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}
