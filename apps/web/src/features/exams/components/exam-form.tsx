"use client";

export function ExamForm() {
  return <form className="space-y-4"><input required name="exam_name" placeholder="Nama ujian" className="w-full rounded-md border border-slate-300 px-3 py-2" /><input required name="exam_date" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2" /><button type="button" className="rounded-md bg-emerald-800 px-4 py-2 text-sm text-white">Simpan</button></form>;
}