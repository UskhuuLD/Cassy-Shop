import { Loader2 } from "lucide-react";

// Next.js shows this automatically (via a Suspense boundary it inserts
// around each page) while a page's Server Component is still awaiting data —
// most usefully during client-side navigation, where nothing else would
// otherwise indicate the click registered. Doesn't cover the very first
// request to the site (before the root layout itself has rendered) since
// that happens above where this boundary lives; on a cold Neon compute the
// browser's own tab-loading indicator is the only feedback for that specific
// case.
export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <Loader2 size={28} className="animate-spin text-[#a76f83]" />
    </div>
  );
}
