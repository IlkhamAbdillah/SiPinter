import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCurrentUser } from "@/features/auth/server/get-current-user";

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/dashboard");

  return (
    <section className="border border-[var(--line)] bg-white p-7">
      <h1 className="text-2xl font-semibold">Masuk</h1>
      <p className="mt-2 text-sm text-slate-600">Masuk untuk mengelola ujian dan penilaian.</p>
      <LoginForm />
      <p className="mt-5 text-center text-sm text-slate-600">Belum punya akun? <Link className="font-medium text-emerald-800" href="/register">Lihat cara mendapatkan akun</Link></p>
    </section>
  );
}
