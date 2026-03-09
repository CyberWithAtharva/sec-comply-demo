"use client";

import { usePathname } from "next/navigation";
import { Search, HelpCircle } from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
    "/": "Dashboard",
    "/action-items": "Action Items",
    "/gap-assessment": "Compliance Readiness",
    "/vendors": "Vendor Management",
    "/risks": "Risk Management",
    "/policies": "Document Control",
    "/training": "Awareness Training",
    "/cspm": "Cloud Security",
    "/github": "SCM Security",
    "/assets": "Supply Chain Security",
    "/vulnerabilities": "Vulnerability Assessment",
    "/evidences": "Evidence Vault",
    "/access-reviews": "Access Reviews",
    "/trust": "Trust Center",
    "/ai-governance": "AI Governance",
    "/ai-identity": "AI Identity",
    "/admin": "Admin Portal",
    "/pitch": "Product Deck",
};

function getPageTitle(pathname: string): string {
    // Exact match first
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    // Prefix match for nested routes
    const segments = pathname.split("/").filter(Boolean);
    for (let i = segments.length; i > 0; i--) {
        const candidate = "/" + segments.slice(0, i).join("/");
        if (PAGE_TITLES[candidate]) return PAGE_TITLES[candidate];
    }
    return "SecComply";
}

export function TopBar() {
    const pathname = usePathname();
    const title = getPageTitle(pathname);

    return (
        <div className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-800/70 bg-[#020617]">
            {/* Page title */}
            <h1 className="text-base font-semibold text-slate-200 tracking-wide">{title}</h1>

            {/* Right side: search + help */}
            <div className="flex items-center gap-3">
                {/* Search box */}
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search…"
                        className="w-48 bg-slate-900/60 border border-slate-800 rounded-lg py-1.5 pl-8 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                        readOnly
                        onFocus={(e) => e.currentTarget.blur()}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-mono bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700/60 pointer-events-none select-none">
                        ⌘K
                    </span>
                </div>

                {/* Help */}
                <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors" title="Help">
                    <HelpCircle className="w-4.5 h-4.5" />
                </button>
            </div>
        </div>
    );
}
