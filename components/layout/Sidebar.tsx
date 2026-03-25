"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    GraduationCap,
    CloudCog,
    Building2,
    ShieldAlert,
    Shield,
    ChevronLeft,
    ChevronRight,
    UserCircle,
    LogOut,
    AlertTriangle,
    GitBranch,
    Flame,
    ListChecks,
    Server,
    BookOpen,
    Database,
    ScanSearch,
    Activity,
    ClipboardList,
    Siren,
    ClipboardCheck,
    Code2,
    Plug,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth/actions";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    caption: string;
    badge?: string;
}

interface NavSection {
    label?: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        items: [
            { name: "Dashboard", href: "/", icon: LayoutDashboard, caption: "Compliance frameworks overview" },
            { name: "Action Items", href: "/action-items", icon: ListChecks, caption: "Prioritized compliance tasks" },
            { name: "Integrations", href: "/integrations", icon: Plug, caption: "Cloud, SCM & identity providers" },
        ],
    },
    {
        label: "COMPLIANCE",
        items: [
            { name: "Compliance Readiness", href: "/gap-assessment", icon: AlertTriangle, caption: "Compliance gaps & remediation" },
            { name: "Control Requirements", href: "/control-requirements", icon: ClipboardList, caption: "Track your compliance posture" },
            { name: "Vendor Management", href: "/vendors", icon: Building2, caption: "Third-party risk assessments" },
            { name: "Document Control", href: "/policies", icon: BookOpen, caption: "Governing documents & SOPs" },
        ],
    },
    {
        label: "PEOPLE",
        items: [
            { name: "Awareness Training", href: "/training", icon: GraduationCap, caption: "Security awareness programs" },
        ],
    },
    {
        label: "SECURITY POSTURE",
        items: [
            { name: "Cloud Security", href: "/cspm", icon: CloudCog, caption: "Cloud posture monitoring" },
            { name: "SCM Security", href: "/github", icon: GitBranch, caption: "Dependabot, secrets & code scan" },
            { name: "Supply Chain Security", href: "/assets", icon: Server, caption: "Hardware & software register" },
            { name: "Vulnerability Assessment", href: "/vulnerabilities", icon: ShieldAlert, caption: "Pentest findings & remediation" },
        ],
    },
    {
        label: "OPERATIONS",
        items: [
            { name: "Incident Management", href: "/incident-management", icon: Siren, caption: "Log, track and resolve incidents" },
        ],
    },
    {
        label: "AUDIT",
        items: [
            { name: "Internal Audit", href: "/internal-audit", icon: ClipboardCheck, caption: "Plan and execute internal audits" },
        ],
    },
];

const comingSoonItems: NavItem[] = [
    { name: "Risk Management",      href: "/risks",                           icon: Shield,      caption: "Organizational risk management",     badge: "soon" },
    { name: "CSPM",                 href: "/cspm-posture",                    icon: Database,    caption: "Cloud security posture mgmt",       badge: "soon" },
    { name: "Code Security",        href: "/code-security",                   icon: Code2,       caption: "SAST & code vulnerability scans",   badge: "soon" },
    { name: "AI System Inventory",  href: "/ai-governance/inventory",         icon: ScanSearch,  caption: "Central AI system registry",        badge: "preview" },
    { name: "AI Output Monitoring", href: "/ai-governance/output-monitoring", icon: Activity,    caption: "Output audit & violation logs",      badge: "preview" },
];

function isItemActive(pathname: string, href: string): boolean {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hoveredItem, setHoveredItem] = useState<{ item: NavItem; top: number } | null>(null);
    const { profile } = useAuth();

    if (pathname === "/questionnaire") return null;

    const allNavItems = navSections.flatMap(s => s.items);

    return (
        <>
            <motion.div
                initial={false}
                animate={{ width: isCollapsed ? 64 : 260 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="flex-shrink-0 h-screen sticky top-0 bg-[#0c1015] z-40 flex flex-col overflow-hidden border-r border-slate-800/50"
            >
                {/* Header / Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/50 flex-shrink-0">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {isCollapsed ? (
                            <motion.div
                                key="collapsed-logo"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center justify-center w-full"
                            >
                                <div className="w-8 h-8 flex items-center justify-center">
                                    <Flame className="w-6 h-6 text-orange-500" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded-logo"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2.5 min-w-0"
                            >
                                <Flame className="w-6 h-6 text-orange-500 flex-shrink-0" />
                                <div className="flex flex-col leading-tight">
                                    <span className="text-sm font-bold tracking-wider text-white">OVERWATCH</span>
                                    <span className="text-[9px] tracking-widest text-slate-500 font-medium">BY SECCOMPLY</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Toggle Expand button when collapsed */}
                {isCollapsed && (
                    <div className="absolute right-[-10px] top-5 z-50">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-1 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors shadow-lg shadow-black/50"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}

                {/* Navigation Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-4 flex flex-col">
                    {navSections.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="mb-1">
                            {/* Section label */}
                            {section.label && !isCollapsed && (
                                <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-4 pt-3 pb-1.5 select-none">
                                    {section.label}
                                </p>
                            )}
                            {section.label && isCollapsed && (
                                <div className="mx-3 my-2 h-px bg-slate-800/80" />
                            )}

                            {/* Items */}
                            <div className={cn("space-y-0.5", isCollapsed ? "px-2" : "px-3")}>
                                {section.items.map((item) => {
                                    const isActive = isItemActive(pathname, item.href);
                                    return (
                                        <Link key={item.name} href={item.href}>
                                            <div
                                                onMouseEnter={(e) => {
                                                    router.prefetch(item.href);
                                                    if (isCollapsed) {
                                                        const rect = e.currentTarget.getBoundingClientRect();
                                                        setHoveredItem({ item, top: Math.round(rect.top + rect.height / 2) });
                                                    }
                                                }}
                                                onMouseLeave={() => setHoveredItem(null)}
                                                className={cn(
                                                    "flex items-center rounded-lg cursor-pointer transition-all duration-150 group relative",
                                                    isCollapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5",
                                                    isActive
                                                        ? "bg-orange-600 text-white"
                                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                                )}
                                            >
                                                <item.icon className={cn(
                                                    "flex-shrink-0",
                                                    isCollapsed ? "w-5 h-5" : "w-4 h-4",
                                                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                                                )} />

                                                <AnimatePresence initial={false}>
                                                    {!isCollapsed && (
                                                        <motion.span
                                                            initial={{ opacity: 0, width: 0 }}
                                                            animate={{ opacity: 1, width: "auto" }}
                                                            exit={{ opacity: 0, width: 0 }}
                                                            transition={{ duration: 0.2 }}
                                                            className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden flex-1 flex items-center gap-2"
                                                        >
                                                            {item.name}
                                                            {item.badge && item.badge !== "preview" && (
                                                                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-400 border border-slate-600/50">
                                                                    {item.badge.toUpperCase()}
                                                                </span>
                                                            )}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Coming Soon Section */}
                    {!isCollapsed ? (
                        <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-4 pt-3 pb-1.5 select-none">
                            COMING SOON
                        </p>
                    ) : (
                        <div className="mx-3 my-2 h-px bg-slate-800/80" />
                    )}

                    <div className={cn("space-y-0.5", isCollapsed ? "px-2" : "px-3")}>
                        {comingSoonItems.map((item) => {
                            const isActive = isItemActive(pathname, item.href);
                            return (
                                <Link key={item.name} href={item.href}>
                                    <div
                                        onMouseEnter={(e) => {
                                            if (isCollapsed) {
                                                const rect = e.currentTarget.getBoundingClientRect();
                                                setHoveredItem({ item, top: Math.round(rect.top + rect.height / 2) });
                                            }
                                        }}
                                        onMouseLeave={() => setHoveredItem(null)}
                                        className={cn(
                                            "flex items-center rounded-lg cursor-pointer transition-all duration-150 group relative",
                                            isCollapsed ? "px-2 py-2.5 justify-center" : "px-3 py-2.5",
                                            isActive
                                                ? "bg-orange-600/20 text-orange-400"
                                                : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                                        )}
                                    >
                                        {isCollapsed && (
                                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                                        )}
                                        <item.icon className={cn(
                                            "flex-shrink-0",
                                            isCollapsed ? "w-5 h-5" : "w-4 h-4",
                                            isActive ? "text-orange-400" : "text-slate-600 group-hover:text-slate-400"
                                        )} />
                                        <AnimatePresence initial={false}>
                                            {!isCollapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-3 text-sm font-medium whitespace-nowrap overflow-hidden flex-1 flex items-center"
                                                >
                                                    {item.name}
                                                    <span className={cn(
                                                        "ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded border",
                                                        item.badge === "soon"
                                                            ? "bg-slate-700/50 text-slate-400 border-slate-600/50"
                                                            : "bg-amber-500/15 text-amber-400 border-amber-500/20"
                                                    )}>
                                                        {item.badge === "soon" ? "SOON" : "PREVIEW"}
                                                    </span>
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer User Profile */}
                <div className="flex-shrink-0 p-3 border-t border-slate-800/50 space-y-1">
                    <div className={cn(
                        "flex items-center p-2 rounded-lg transition-colors",
                        isCollapsed ? "justify-center" : "justify-start gap-3"
                    )}>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                            {profile?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <UserCircle className="w-5 h-5 text-slate-400" />
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col truncate flex-1 min-w-0">
                                <span className="text-sm font-semibold text-slate-200 truncate">
                                    {profile?.full_name ?? "Loading…"}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                                    {profile?.role === "admin" ? "Admin" : "Member"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Sign out */}
                    <form action={signOut}>
                        <button
                            type="submit"
                            className={cn(
                                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors text-sm",
                                isCollapsed ? "justify-center" : "justify-start"
                            )}
                            title="Sign out"
                        >
                            <LogOut className="w-4 h-4 flex-shrink-0" />
                            {!isCollapsed && <span className="font-medium">Sign out</span>}
                        </button>
                    </form>
                </div>
            </motion.div>

            {/* Rich Tooltip for Collapsed Sidebar */}
            <AnimatePresence>
                {isCollapsed && hoveredItem && (
                    <motion.div
                        initial={{ opacity: 0, x: -8, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -8, scale: 0.95 }}
                        transition={{ duration: 0.12, ease: "easeOut" }}
                        className="fixed z-[100] pointer-events-none"
                        style={{ top: hoveredItem.top, left: 74, transform: "translateY(-50%)" }}
                    >
                        <div className="relative flex items-center">
                            {/* Arrow */}
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[8px] border-r-slate-700/80" />
                            <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-slate-800/95" />

                            <div className="flex items-start gap-3 px-4 py-3 bg-[#0c1015] border border-slate-700/60 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] min-w-[200px]">
                                <div className="p-1.5 rounded-lg bg-slate-800/80 flex-shrink-0 mt-0.5">
                                    <hoveredItem.item.icon className="w-4 h-4 text-orange-400" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-semibold text-slate-100 leading-tight">
                                        {hoveredItem.item.name}
                                    </span>
                                    <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                        {hoveredItem.item.caption}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
