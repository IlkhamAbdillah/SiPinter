import Link from "next/link";
import { EmptyState } from "@/components/shared/empty-state";

export default function ExamsPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-sm text-slate-500">Penilaian</p><h1 className="mt-1 text-3xl font-semibold">Ujian</h1></div>
        <Link href="/exams/create" className="rounded-md bg-emerald-800 px-4 py-2 text-sm font-medium text-white">Buat ujian</Link>
      </div>
      <EmptyState title="Belum ada ujian" description="Ujian yang Anda buat akan tercatat di halaman ini." />
    </div>
  );
}