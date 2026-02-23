import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "SecComply | AI-Driven Security Compliance",
  description: "World's best security compliance estimation and tracking tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen relative text-slate-100 bg-[#020617] font-sans selection:bg-blue-500/30">
        {/* Ambient Background Orbs for Glassmorphism Context - Avoiding Banned Colors */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen" />
          <div className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-900/10 blur-[120px] mix-blend-screen" />
          <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-800/10 blur-[100px] mix-blend-screen" />
        </div>

        {/* Main Application Container */}
        <main className="relative z-10 w-full min-h-screen flex">
          <Sidebar />
          <div className="flex-1 w-full flex flex-col items-center">
            <div className="w-full max-w-[1600px] flex-1 h-full mx-auto px-4 md:px-8 py-6">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
