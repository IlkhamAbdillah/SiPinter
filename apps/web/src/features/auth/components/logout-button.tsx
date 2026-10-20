"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    try {
      await apiClient.post("/api/auth/logout");
    } finally {
      // Even if the request failed, leave the dashboard; the next page load re-checks the session.
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button type="button" onClick={handleLogout} disabled={pending} className="text-sm text-slate-500 hover:text-slate-800 disabled:opacity-50">
      {pending ? "Keluar..." : "Keluar"}
    </button>
  );
}
