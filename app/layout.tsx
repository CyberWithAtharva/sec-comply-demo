import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemedToaster } from "@/components/themed-toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen relative text-foreground bg-background font-sans selection:bg-primary/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="seccomply-theme-v2"
          disableTransitionOnChange
        >
          {/* Ambient Background Orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-300/20 dark:bg-blue-900/20 blur-[120px] mix-blend-screen" />
            <div className="absolute top-[30%] -right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-300/10 dark:bg-emerald-900/10 blur-[120px] mix-blend-screen" />
            <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-blue-200/10 dark:bg-blue-800/10 blur-[100px] mix-blend-screen" />
          </div>

          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              {children}
            </TooltipProvider>
            <ThemedToaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
