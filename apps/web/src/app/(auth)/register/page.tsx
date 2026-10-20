import Link from "next/link";

// There is no public self-registration: only lecturers and admins log in, and admins create their accounts.
export default function RegisterPage() {
  return (
    <section className="border border-[var(--line)] bg-white p-7">
      <h1 className="text-2xl font-semibold">Mendapatkan akun</h1>
      <p className="mt-2 text-sm text-slate-600">Akun SiPinter untuk dosen dibuat oleh admin. Hubungi admin program studi Anda untuk mendapatkan akun.</p>
      <Link href="/login" className="mt-6 inline-block rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white">Ke halaman masuk</Link>
    </section>
  );
}
