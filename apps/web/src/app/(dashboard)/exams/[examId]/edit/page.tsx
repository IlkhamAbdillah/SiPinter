import Link from "next/link";

export default async function EditExamPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  return <div className="mx-auto max-w-2xl"><Link href={`/exams/${examId}`} className="text-sm text-emerald-800">Kembali ke detail</Link><h1 className="mt-4 text-3xl font-semibold">Edit ujian</h1><p className="mt-2 text-sm text-slate-600">Formulir ujian {examId} akan ditampilkan di sini.</p></div>;
}