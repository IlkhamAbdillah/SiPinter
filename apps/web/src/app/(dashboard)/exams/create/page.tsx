import Link from "next/link";

export default function CreateExamPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/exams" className="text-sm text-emerald-800">Kembali ke ujian</Link>
      <h1 className="mt-4 text-3xl font-semibold">Buat ujian</h1>
      <form className="mt-7 space-y-5 border border-[var(--line)] bg-white p-6">
        <label className="block text-sm font-medium">Nama ujian<input className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Contoh: Ujian Basis Data" /></label>
        <label className="block text-sm font-medium">Tanggal ujian<input type="date" className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2" /></label>
        <button type="button" className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white">Simpan ujian</button>
      </form>
    </div>
  );
}