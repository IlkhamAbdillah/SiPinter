import { EmptyState } from "@/components/shared/empty-state";

export default function QuestionsPage() {
  return <div className="mx-auto max-w-5xl"><p className="text-sm text-slate-500">Bank soal</p><h1 className="mt-1 text-3xl font-semibold">Pertanyaan</h1><EmptyState title="Belum ada pertanyaan" description="Pertanyaan ujian yang dibuat akan tercatat di sini." /></div>;
}