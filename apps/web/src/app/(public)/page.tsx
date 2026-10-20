import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto grid min-h-[78vh] max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1.2fr_0.8fr]">
      <section>
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Penilaian lebih teratur</p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight md:text-5xl">Bantu dosen menilai ujian dengan lebih mudah.</h1>
        <p className="mt-5 max-w-xl leading-7 text-[var(--muted)]">Kelola ujian, lembar jawaban, dan hasil penilaian mahasiswa dari satu tempat.</p>
        <Link href="/login" className="mt-8 inline-block rounded-md bg-emerald-800 px-5 py-3 text-sm font-semibold text-white">Mulai menggunakan SiPinter</Link>
      </section>
      <section className="border-l-4 border-emerald-700 bg-white p-7 shadow-sm">
        <p className="text-sm font-semibold text-emerald-900">Ringkasan penilaian</p>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="border border-[var(--line)] p-4"><p className="text-2xl font-semibold">12</p><p className="mt-1 text-sm text-slate-600">Ujian aktif</p></div>
          <div className="border border-[var(--line)] p-4"><p className="text-2xl font-semibold">86%</p><p className="mt-1 text-sm text-slate-600">Lembar diperiksa</p></div>
        </div>
        <p className="mt-5 text-sm leading-6 text-slate-600">Satu alur untuk mengatur soal, memeriksa jawaban, dan melihat hasil.</p>
      </section>
    </main>
  );
}