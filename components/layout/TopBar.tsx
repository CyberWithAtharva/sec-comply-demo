"use client";

import { usePathname } from "next/navigation";
import { Search, HelpCircle, ChevronRight } from "lucide-react";

interface BreadcrumbConfig {
    section?: string;
    page: string;
}

const PAGE_BREADCRUMBS: Record<string, BreadcrumbConfig> = {
    "/": { page: "Dashboard" },
    "/action-items": { page: "Action Items" },
    "/integrations": { page: "Integrations" },
    "/gap-assessment": { section: "Compliance", page: "Compliance Readiness" },
    "/control-requirements": { section: "Compliance", page: "Control Requirements" },
    "/vendors": { section: "Compliance", page: "Vendor Management" },
    "/risks": { section: "Risk Management", page: "Risk Register" },
    "/policies": { section: "Compliance", page: "Document Control" },
    "/training": { section: "People", page: "Awareness Training" },
    "/cspm": { section: "Security Posture", page: "Cloud Security" },
    "/github": { section: "Security Posture", page: "SCM Security" },
    "/assets": { section: "Security Posture", page: "Supply Chain Security" },
    "/vulnerabilities": { section: "Security Posture", page: "Vulnerability Assessment" },
    "/evidences": { section: "Security Posture", page: "Evidence Vault" },
    "/access-reviews": { section: "Security Posture", page: "Access Reviews" },
    "/trust": { page: "Trust Center" },
    "/incident-management": { section: "Operations", page: "Incident Management" },
    "/internal-audit": { section: "Audit", page: "Internal Audit" },
    "/ai-governance": { section: "AI Governance", page: "AI Governance" },
    "/ai-identity": { section: "AI Governance", page: "AI Identity" },
    "/admin": { page: "Admin Portal" },
    "/pitch": { page: "Product Deck" },
};

function getBreadcrumb(pathname: string): BreadcrumbConfig {
    if (PAGE_BREADCRUMBS[pathname]) return PAGE_BREADCRUMBS[pathname];
    const segments = pathname.split("/").filter(Boolean);
    for (let i = segments.length; i > 0; i--) {
        const candidate = "/" + segments.slice(0, i).join("/");
        if (PAGE_BREADCRUMBS[candidate]) return PAGE_BREADCRUMBS[candidate];
    }
    return { page: "Overwatch" };
}

export function TopBar() {
    const pathname = usePathname();
    const breadcrumb = getBreadcrumb(pathname);

    return (
        <div className="h-14 flex-shrink-0 flex items-center justify-between px-6 border-b border-slate-800/70 bg-[#020617]">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm">
                {breadcrumb.section ? (
                    <>
                        <span className="text-slate-500 font-medium">{breadcrumb.section}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                        <span className="text-slate-200 font-semibold">{breadcrumb.page}</span>
                    </>
                ) : (
                    <span className="text-slate-200 font-semibold">{breadcrumb.page}</span>
                )}
            </div>

            {/* Center: Search */}
            <div className="absolute left-1/2 -translate-x-1/2">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 group-focus-within:text-orange-400 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search…"
                        className="w-52 bg-slate-900/60 border border-slate-800 rounded-lg py-1.5 pl-8 pr-10 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
                        readOnly
                        onFocus={(e) => e.currentTarget.blur()}
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-600 font-mono bg-slate-800/80 px-1 py-0.5 rounded border border-slate-700/60 pointer-events-none select-none">
                        ⌘K
                    </span>
                </div>
            </div>

            {/* Right: Help */}
            <button className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors" title="Help">
                <HelpCircle className="w-4.5 h-4.5" />
            </button>
        </div>
    );
}
