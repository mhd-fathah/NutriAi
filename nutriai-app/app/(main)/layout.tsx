import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Sidebar, BottomNav } from "@/components/shared/Navigation";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar userName={session.user.name || "User"} />
      <main className="lg:ml-60 min-h-screen pb-20 lg:pb-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <BottomNav userName={session.user.name || "User"} userEmail={session.user.email || ""} />
    </div>
  );
}
