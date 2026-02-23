import { Sidebar } from "@/components/layout/Sidebar";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="relative z-10 w-full min-h-screen flex">
            <Sidebar />
            <div className="flex-1 w-full flex flex-col items-center">
                <div className="w-full max-w-[1600px] flex-1 h-full mx-auto px-4 md:px-8 py-6">
                    {children}
                </div>
            </div>
        </main>
    );
}
