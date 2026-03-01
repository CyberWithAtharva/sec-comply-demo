"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    BookOpen,
    GraduationCap,
    CloudCog,
    Building2,
    Key,
    ServerCrash,
    ShieldAlert,
    Shield,
    BadgeCheck,
    ChevronLeft,
    ChevronRight,
    Search,
    UserCircle,
    FileText,
    LogOut,
    AlertTriangle,
    GitBranch,
    BrainCircuit,
    Bot,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth/actions";

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    caption: string;
}

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [hoveredItem, setHoveredItem] = useState<{ item: NavItem; top: number } | null>(null);
    const { profile } = useAuth();

    const previewItems: NavItem[] = [
        { name: "AI Governance", href: "/ai-governance", icon: BrainCircuit, caption: "AI model risk & EU AI Act" },
        { name: "AI Identity",   href: "/ai-identity",   icon: Bot,          caption: "Non-human identity & AI agents" },
    ];

    const navItems: NavItem[] = [
        { name: "Programs", href: "/", icon: LayoutDashboard, caption: "Compliance frameworks overview" },
{ name: "Policies & Procedures", href: "/policies", icon: BookOpen, caption: "Governing documents & SOPs" },
        { name: "Awareness Training", href: "/training", icon: GraduationCap, caption: "Security awareness programs" },
        { name: "CSPM", href: "/cspm", icon: CloudCog, caption: "Cloud posture monitoring" },
        { name: "GitHub Security", href: "/github", icon: GitBranch, caption: "Dependabot, secrets & code scan" },
        { name: "Vendor Management", href: "/vendors", icon: Building2, caption: "Third-party risk assessments" },
        { name: "Access Reviews", href: "/access-reviews", icon: Key, caption: "User access certifications" },
        { name: "Asset Inventory", href: "/assets", icon: ServerCrash, caption: "Hardware & software register" },
        { name: "VAPT Tracker", href: "/vulnerabilities", icon: ShieldAlert, caption: "Pentest findings & remediation" },
        { name: "Risk Register", href: "/risks", icon: Shield, caption: "Organizational risk management" },
        { name: "Gap Assessment", href: "/gap-assessment", icon: AlertTriangle, caption: "Compliance gaps & remediation" },
        { name: "Evidences", href: "/evidences", icon: FileText, caption: "Audit artifacts & proof" },
        { name: "Trust Center", href: "/trust", icon: BadgeCheck, caption: "Public compliance portal" },
    ];

    if (pathname === '/questionnaire') return null;

    return (
        <>
            <motion.div
                initial={false}
                animate={{ width: isCollapsed ? 80 : 280 }}
                className="flex-shrink-0 h-screen sticky top-0 border-r border-slate-800/80 bg-[#020617]/80 backdrop-blur-xl z-40 flex flex-col"
            >
                {/* Header / Logo */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
                    <AnimatePresence mode="popLayout">
                        {isCollapsed ? (
                            <motion.div
                                key="collapsed-logo"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex items-center justify-center w-full"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-glow">
                                    <ShieldAlert className="w-5 h-5 text-white" />
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="expanded-logo"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center space-x-3"
                            >
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-glow">
                                    <ShieldAlert className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                                    OmniGuard
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Toggle Expand button when collapsed */}
                {isCollapsed && (
                    <div className="absolute right-[-12px] top-6 z-50">
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="p-1 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors shadow-lg shadow-black/50"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Navigation Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-6 px-4 flex flex-col space-y-2">
                    {!isCollapsed && (
                        <div className="mb-6 px-2">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Press Cmd+K to search..."
                                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    )}

                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
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
                                        "flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-blue-600/10 text-blue-400"
                                            : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="sidebarActive"
                                            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                                        />
                                    )}
                                    <item.icon className={cn(
                                        "w-5 h-5 flex-shrink-0",
                                        isActive ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"
                                    )} />

                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, width: 0, overflow: "hidden" }}
                                                className="ml-3 text-sm font-medium tracking-wide whitespace-nowrap"
                                            >
                                                {item.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Link>
                        )
                    })}

                    {/* ── Coming Soon Preview Items ── */}
                    {!isCollapsed && (
                        <p className="text-[10px] uppercase tracking-widest text-slate-600 font-semibold px-3 pt-4 pb-1 select-none">
                            Coming Soon
                        </p>
                    )}
                    {isCollapsed && <div className="mx-3 my-2 h-px bg-slate-800/80" />}

                    {previewItems.map((item) => {
                        const isActive = pathname === item.href;
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
                                        "flex items-center px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
                                        isActive
                                            ? "bg-amber-500/10 text-amber-400"
                                            : "text-slate-500 hover:bg-slate-800/50 hover:text-slate-300"
                                    )}
                                >
                                    {/* amber dot indicator when collapsed */}
                                    {isCollapsed && (
                                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400/70" />
                                    )}
                                    <item.icon className={cn(
                                        "w-5 h-5 flex-shrink-0",
                                        isActive ? "text-amber-400" : "text-slate-600 group-hover:text-slate-400"
                                    )} />
                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, width: 0, overflow: "hidden" }}
                                                className="ml-3 text-sm font-medium tracking-wide whitespace-nowrap flex-1 flex items-center"
                                            >
                                                {item.name}
                                                <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                                    PREVIEW
                                                </span>
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer User Profile */}
                <div className="p-4 border-t border-slate-800/80 space-y-1">
                    <div className={cn(
                        "flex items-center p-2 rounded-xl transition-colors",
                        isCollapsed ? "justify-center" : "justify-start space-x-3"
                    )}>
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                            {profile?.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <UserCircle className="w-6 h-6 text-slate-400" />
                            )}
                        </div>

                        {!isCollapsed && (
                            <div className="flex flex-col truncate flex-1 min-w-0">
                                <span className="text-sm font-semibold text-slate-200 truncate">
                                    {profile?.full_name ?? "Loading…"}
                                </span>
                                <span className="text-xs text-slate-500 font-mono flex items-center">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 flex-shrink-0" />
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
                                "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors text-sm",
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
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="fixed z-[100] pointer-events-none"
                        style={{ top: hoveredItem.top, left: 90, transform: 'translateY(-50%)' }}
                    >
                        {/* Glassmorphic tooltip container */}
                        <div className="relative flex items-center">
                            {/* Arrow pointing left */}
                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[7px] border-y-transparent border-r-[8px] border-r-slate-700/80" />
                            <div className="absolute -left-[6px] top-1/2 -translate-y-1/2 w-0 h-0 border-y-[6px] border-y-transparent border-r-[7px] border-r-slate-800/95" />

                            <div className="flex items-start space-x-3 px-4 py-3 bg-slate-800/95 backdrop-blur-xl rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.6)] border border-slate-700/60 min-w-[200px]">
                                {/* Icon */}
                                <div className="p-1.5 rounded-lg bg-slate-700/50 flex-shrink-0 mt-0.5">
                                    <hoveredItem.item.icon className="w-4 h-4 text-blue-400" />
                                </div>
                                {/* Text */}
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
