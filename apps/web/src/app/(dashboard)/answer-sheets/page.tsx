import { EmptyState } from "@/components/shared/empty-state";

export default function AnswerSheetsPage() {
  return <div className="mx-auto max-w-5xl"><p className="text-sm text-slate-500">Pengumpulan</p><h1 className="mt-1 text-3xl font-semibold">Lembar jawaban</h1><EmptyState title="Belum ada lembar jawaban" description="Lembar jawaban mahasiswa akan muncul setelah diunggah." /></div>;
}