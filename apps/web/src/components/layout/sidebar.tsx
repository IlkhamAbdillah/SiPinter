import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/logout-button";
import { roleLabels, type CurrentUser } from "@/features/auth/types";

const links = [
  ["/dashboard", "Dashboard"],
  ["/exams", "Ujian"],
  ["/questions", "Pertanyaan"],
  ["/answer-sheets", "Lembar jawaban"],
  ["/results", "Hasil"],
];

export function Sidebar({ user }: { user: CurrentUser }) {
  return (
    <aside className="border-b border-[var(--line)] bg-white px-5 py-5 md:min-h-screen md:border-b-0 md:border-r">
      <Link href="/dashboard" className="text-xl font-bold text-emerald-900">SiPinter</Link>
      <nav className="mt-5 flex gap-2 overflow-x-auto md:flex-col">
        {links.map(([href, label]) => <Link key={href} href={href} className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-900">{label}</Link>)}
      </nav>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--line)] pt-4 md:block">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-xs text-slate-500">{roleLabels[user.role]}</p>
        </div>
        <div className="md:mt-3"><LogoutButton /></div>
      </div>
    </aside>
  );
}
