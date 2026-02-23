import type { Metadata } from "next";
import "./globals.css";

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

        {children}
      </body>
    </html>
  );
}
