"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <main className="container-page py-16">
      <div className="card mx-auto max-w-md p-8">
        <p className="text-center text-xs font-bold tracking-[.2em] text-[#a76f83]">WELCOME BACK</p>
        <h1 className="serif mt-2 text-center text-4xl">Login</h1>
        <form action={formAction} className="mt-7 space-y-4">
          <input className="input" type="email" name="email" placeholder="Email" required />
          <input className="input" type="password" name="password" placeholder="Password" required />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button disabled={pending} className="btn btn-dark w-full disabled:opacity-50">
            {pending ? "Шалгаж байна..." : "НЭВТРЭХ"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="text-zinc-500 hover:text-zinc-900">
            Нууц үгээ мартсан уу?
          </Link>
        </p>
        <p className="mt-3 text-center text-sm text-zinc-500">
          Шинэ хэрэглэгч үү?{" "}
          <Link href="/register" className="font-bold text-[#2b2027]">
            Бүртгүүлэх
          </Link>
        </p>
      </div>
    </main>
  );
}
