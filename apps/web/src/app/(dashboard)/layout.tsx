import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { getCurrentUser } from "@/features/auth/server/get-current-user";

// Redirects visitors without a valid session. This only controls navigation:
// every protected API endpoint checks the session and role itself.
export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <Sidebar user={user} />
      <main className="min-w-0 px-5 py-8 md:px-10">{children}</main>
    </div>
  );
}
