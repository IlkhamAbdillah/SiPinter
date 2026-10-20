import Link from "next/link";

export default async function AnswerSheetPage({ params }: { params: Promise<{ sheetId: string }> }) {
  const { sheetId } = await params;
  return <div className="mx-auto max-w-5xl"><Link href="/answer-sheets" className="text-sm text-emerald-800">Kembali ke lembar jawaban</Link><h1 className="mt-4 text-3xl font-semibold">Detail lembar jawaban</h1><p className="mt-2 text-sm text-slate-600">ID lembar: {sheetId}</p></div>;
}