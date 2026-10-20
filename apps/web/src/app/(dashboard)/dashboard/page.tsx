import { EmptyState } from "@/components/shared/empty-state";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm text-slate-500">Ringkasan</p>
      <h1 className="mt-1 text-3xl font-semibold">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[["0", "Ujian"], ["0", "Lembar jawaban"], ["0", "Hasil dinilai"]].map(([value, label]) => (
          <section key={label} className="border border-[var(--line)] bg-white p-5"><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-sm text-slate-600">{label}</p></section>
        ))}
      </div>
      <section className="mt-9"><h2 className="text-lg font-semibold">Aktivitas terbaru</h2><EmptyState title="Belum ada aktivitas" description="Ujian dan penilaian terbaru akan muncul di sini." /></section>
    </div>
  );
}