import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative z-10 w-full min-h-screen flex">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <TopBar />
                <div className="flex-1 overflow-y-auto">
                    <div className="w-full max-w-[1600px] mx-auto px-6 py-6">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
