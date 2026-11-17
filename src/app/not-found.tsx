import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="mt-2 text-sm text-slate-600">
        We couldn&apos;t find that lesson, path or page. It may have moved.
      </p>
      <Link
        href="/paths"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Browse all paths
      </Link>
    </div>
  );
}
