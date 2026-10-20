import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center">
      <div>
        <p className="text-sm font-semibold text-emerald-800">404</p>
        <h1 className="mt-2 text-2xl font-semibold">Halaman tidak ditemukan</h1>
        <Link href="/" className="mt-5 inline-block text-sm text-emerald-800 underline">Kembali ke beranda</Link>
      </div>
    </main>
  );
}