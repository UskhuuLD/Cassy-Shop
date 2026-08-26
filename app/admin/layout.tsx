// Route protection for everything under /admin (except /admin/login) is
// enforced server-side in middleware.ts, which verifies the signed admin
// session cookie before the request ever reaches these pages.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
