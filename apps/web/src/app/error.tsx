"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-semibold">Terjadi kendala</h1>
        <p className="mt-2 text-sm text-slate-600">Silakan coba muat ulang halaman ini.</p>
        <button onClick={reset} className="mt-5 rounded-md bg-emerald-800 px-4 py-2 text-sm text-white">Coba lagi</button>
      </div>
    </main>
  );
}