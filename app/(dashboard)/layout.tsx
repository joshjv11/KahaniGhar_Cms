import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarMain } from "@/components/layout/SidebarMain";
import { CommandPaletteTrigger } from "@/components/layout/CommandPaletteTrigger";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 dark:bg-[#020617] transition-colors duration-300 relative overflow-hidden">
      <Navbar />
      <CommandPaletteTrigger />
      <div className="flex relative z-10">
        <Sidebar />
        <SidebarMain>{children}</SidebarMain>
      </div>
      <Toaster />
    </div>
  );
}
