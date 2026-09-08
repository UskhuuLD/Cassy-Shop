import { ChevronDown } from "lucide-react";
import { getFaqs } from "@/lib/faq";

export const dynamic = "force-dynamic";

export default async function Faq() {
  const faqs = await getFaqs();

  return (
    <main className="container-page py-14">
      <p className="eyebrow">ТУСЛАМЖ</p>
      <h1 className="serif mt-2 text-4xl md:text-5xl">Түгээмэл асуултууд</h1>

      {faqs.length === 0 ? (
        <div className="card mt-8 p-12 text-center text-zinc-500">Одоогоор асуулт нэмэгдээгүй байна.</div>
      ) : (
        <div className="mt-8 max-w-2xl space-y-3">
          {faqs.map((f) => (
            <details key={f.id} className="group card overflow-hidden p-0">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-bold">
                {f.question}
                <ChevronDown size={18} className="flex-none text-zinc-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="whitespace-pre-line px-5 pb-5 text-sm leading-6 text-zinc-600">{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </main>
  );
}
