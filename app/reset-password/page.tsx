import ResetPasswordForm from "./reset-password-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <main className="container-page py-16">
      <div className="card mx-auto max-w-md p-8">
        <p className="text-center text-xs font-bold tracking-[.2em] text-[#a76f83]">RESET PASSWORD</p>
        <h1 className="serif mt-2 text-center text-4xl">Шинэ нууц үг</h1>
        <ResetPasswordForm token={token || ""} />
      </div>
    </main>
  );
}
