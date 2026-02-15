import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth removed - will add later
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-900 to-black dark:from-black dark:via-blue-950 dark:to-navy transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] relative overflow-hidden">
      {/* Animated gold accent pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,176,0,0.08),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(255,176,0,0.12),transparent_50%)] pointer-events-none animate-pulse" />
      
      {/* Edge decorations - Top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-60 dark:opacity-80" />
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold-500 via-blue-primary to-transparent opacity-40 dark:opacity-60" />
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-gold-500 via-blue-primary to-transparent opacity-40 dark:opacity-60" />
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-500 to-transparent opacity-60 dark:opacity-80" />
      
      {/* Corner accent circles */}
      <div className="absolute top-4 left-4 w-32 h-32 bg-gold-500/10 dark:bg-gold-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute top-4 right-4 w-32 h-32 bg-blue-primary/20 dark:bg-blue-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-4 left-4 w-32 h-32 bg-gold-500/10 dark:bg-gold-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-4 right-4 w-32 h-32 bg-blue-primary/20 dark:bg-blue-primary/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      
      <Navbar />
      <div className="flex relative z-10">
        <Sidebar />
        <main className="flex-1 ml-64 min-h-[calc(100vh-73px)] relative">
          {/* Content wrapper with subtle border glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-500/50 to-transparent" />
          </div>
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
