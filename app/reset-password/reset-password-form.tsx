"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPasswordAction } from "./actions";

export default function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);

  if (!token) {
    return (
      <p className="mt-6 text-center text-sm text-red-600">
        Линк буруу байна.{" "}
        <Link href="/forgot-password" className="font-bold underline">
          Дахин хүсэлт илгээх
        </Link>
      </p>
    );
  }

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <input type="hidden" name="token" value={token} />
      <input className="input" type="password" name="password" placeholder="Шинэ нууц үг" required minLength={6} />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button disabled={pending} className="btn btn-dark w-full disabled:opacity-50">
        {pending ? "Хадгалж байна..." : "НУУЦ ҮГ ШИНЭЧЛЭХ"}
      </button>
    </form>
  );
}
