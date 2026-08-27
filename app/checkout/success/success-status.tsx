"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrderPaymentStatusAction } from "./actions";

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 15; // ~30s

export default function SuccessStatus({ orderCode }: { orderCode: string }) {
  const [state, setState] = useState<"checking" | "paid" | "pending" | "not_found">("checking");

  useEffect(() => {
    let cancelled = false;
    let polls = 0;

    async function check() {
      const result = await getOrderPaymentStatusAction(orderCode);
      if (cancelled) return;
      if (!result.found) {
        setState("not_found");
        return;
      }
      if (result.paid) {
        setState("paid");
        return;
      }
      polls++;
      if (polls >= MAX_POLLS) {
        setState("pending");
        return;
      }
      setTimeout(check, POLL_INTERVAL_MS);
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [orderCode]);

  if (state === "not_found") {
    return (
      <>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-50 text-2xl">✕</div>
        <h1 className="serif mt-5 text-4xl">Захиалга олдсонгүй</h1>
        <p className="mt-3 text-zinc-600">
          Энэ захиалгын дугаар олдсонгүй.{" "}
          <Link href="/" className="font-bold underline">
            Нүүр хуудас руу буцах
          </Link>
        </p>
      </>
    );
  }

  if (state === "paid") {
    return (
      <>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f2dbe4] text-2xl">✓</div>
        <h1 className="serif mt-5 text-4xl">Төлбөр амжилттай</h1>
        <p className="mt-3 text-zinc-600">Таны захиалга баталгаажлаа. Тантай удахгүй холбогдоно.</p>
      </>
    );
  }

  if (state === "pending") {
    return (
      <>
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f9edf2] text-2xl">…</div>
        <h1 className="serif mt-5 text-4xl">Төлбөрийг хүлээж байна</h1>
        <p className="mt-3 text-zinc-600">
          Төлбөр удаашрах тохиолдол байдаг. Хэрэв QPay-ээр төлсөн бол хэдэн минутын дараа энэ хуудсыг дахин ачаална уу,
          эсвэл бидэнтэй холбогдоно уу.
        </p>
      </>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="mx-auto h-16 w-16 rounded-full bg-[#f9edf2]" />
      <p className="mt-5 text-zinc-500">Төлбөрийг шалгаж байна...</p>
    </div>
  );
}
