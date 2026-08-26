"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "./actions";

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, undefined);

  return (
    <main className="container-page py-16">
      <div className="card mx-auto max-w-md p-8">
        <p className="text-center text-xs font-bold tracking-[.2em] text-[#a76f83]">RESET PASSWORD</p>
        <h1 className="serif mt-2 text-center text-4xl">Нууц үг мартсан</h1>
        <p className="mt-3 text-center text-sm text-zinc-500">
          Бүртгэлтэй имэйлээ бичнэ үү — сэргээх линк илгээнэ.
        </p>

        {state?.message ? (
          <p className="mt-7 rounded-xl bg-[#f2dbe4] px-4 py-3 text-center text-sm font-semibold text-[#7a3352]">
            {state.message}
          </p>
        ) : (
          <form action={formAction} className="mt-7 space-y-4">
            <input className="input" type="email" name="email" placeholder="Email" required />
            {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
            <button disabled={pending} className="btn btn-dark w-full disabled:opacity-50">
              {pending ? "Илгээж байна..." : "ЛИНК ИЛГЭЭХ"}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-sm text-zinc-500">
          <Link href="/login" className="font-bold text-[#2b2027]">
            Нэвтрэх хуудас руу буцах
          </Link>
        </p>
      </div>
    </main>
  );
}
