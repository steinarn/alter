import { AppSidebar, MobileNav } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <MobileNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
