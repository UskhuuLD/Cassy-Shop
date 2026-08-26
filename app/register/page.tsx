"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction } from "./actions";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(registerAction, undefined);

  return (
    <main className="container-page py-16">
      <div className="card mx-auto max-w-md p-8">
        <p className="text-center text-xs font-bold tracking-[.2em] text-[#a76f83]">WELCOME</p>
        <h1 className="serif mt-2 text-center text-4xl">Бүртгүүлэх</h1>
        <form action={formAction} className="mt-7 space-y-4">
          <input className="input" name="name" placeholder="Нэр (заавал биш)" />
          <input className="input" type="email" name="email" placeholder="Email" required />
          <input className="input" type="password" name="password" placeholder="Нууц үг" required minLength={6} />
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <button disabled={pending} className="btn btn-dark w-full disabled:opacity-50">
            {pending ? "Бүртгэж байна..." : "БҮРТГҮҮЛЭХ"}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-zinc-500">
          Бүртгэлтэй юу?{" "}
          <Link href="/login" className="font-bold text-[#2b2027]">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </main>
  );
}
