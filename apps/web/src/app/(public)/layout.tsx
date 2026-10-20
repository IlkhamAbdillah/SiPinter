import Link from "next/link";

export default function PublicLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="border-b border-[var(--line)] bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-emerald-900">SiPinter</Link>
          <div className="flex items-center gap-5 text-sm">
            <Link href="/login" className="text-slate-700">Masuk</Link>
            <Link href="/register" className="rounded-md bg-emerald-800 px-4 py-2 font-medium text-white">Daftar</Link>
          </div>
        </nav>
      </header>
      {children}
    </>
  );
}