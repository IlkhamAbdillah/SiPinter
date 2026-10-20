import { EmptyState } from "@/components/shared/empty-state";

export default function ResultsPage() {
  return <div className="mx-auto max-w-5xl"><p className="text-sm text-slate-500">Rekap nilai</p><h1 className="mt-1 text-3xl font-semibold">Hasil</h1><EmptyState title="Belum ada hasil" description="Hasil penilaian akan tersedia setelah lembar jawaban dinilai." /></div>;
}