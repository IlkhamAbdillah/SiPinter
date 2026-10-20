"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ApiError, apiClient } from "@/lib/api-client";
import type { Credentials } from "../schemas/auth";

function errorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Terjadi kesalahan. Silakan coba lagi.";
  switch (error.code) {
    case "INVALID_CREDENTIALS":
      return "Email atau kata sandi tidak sesuai.";
    case "TOO_MANY_REQUESTS":
      return "Terlalu banyak percobaan masuk. Coba lagi dalam beberapa menit.";
    case "VALIDATION_ERROR":
      return "Periksa kembali format email dan kata sandi.";
    case "NETWORK_ERROR":
      return error.message;
    default:
      return "Terjadi kesalahan pada server. Silakan coba lagi.";
  }
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const credentials: Credentials = { email: String(form.get("email")), password: String(form.get("password")) };

    setPending(true);
    setError(null);
    try {
      await apiClient.post("/api/auth/login", credentials);
      router.replace("/dashboard");
      router.refresh();
    } catch (caught) {
      setError(errorMessage(caught));
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block text-sm font-medium">Email<input name="email" type="email" autoComplete="email" required className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2" placeholder="nama@kampus.ac.id" /></label>
      <label className="block text-sm font-medium">Kata sandi<input name="password" type="password" autoComplete="current-password" required maxLength={128} className="mt-2 block w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Kata sandi" /></label>
      <Button type="submit" disabled={pending} className="w-full">{pending ? "Memeriksa..." : "Masuk"}</Button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
