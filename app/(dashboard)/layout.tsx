import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidenav from "@/components/layout/Sidenav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin");

  return (
    <div className="flex min-h-screen bg-dream-bg">
      <Sidenav session={session} />
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
}
