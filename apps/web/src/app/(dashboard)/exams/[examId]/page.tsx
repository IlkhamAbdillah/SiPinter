import Link from "next/link";

export default async function ExamDetailPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  return <div className="mx-auto max-w-5xl"><Link href="/exams" className="text-sm text-emerald-800">Kembali ke ujian</Link><h1 className="mt-4 text-3xl font-semibold">Detail ujian</h1><p className="mt-2 text-sm text-slate-600">ID ujian: {examId}</p><Link href={`/exams/${examId}/edit`} className="mt-6 inline-block rounded-md border border-slate-300 px-4 py-2 text-sm">Edit ujian</Link></div>;
}