"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Building2,
    Users,
    ShieldCheck,
    LogOut,
    ChevronLeft,
    ChevronRight,
    UserCircle,
    Settings,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { signOut } from "@/lib/auth/actions";

interface AdminShellProps {
    profile: { role: string; full_name: string | null; avatar_url: string | null };
    children: React.ReactNode;
}

const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard, caption: "Overview of all clients" },
    { name: "Organizations", href: "/admin/organizations", icon: Building2, caption: "Manage client organizations" },
    { name: "Users", href: "/admin/users", icon: Users, caption: "All users across orgs" },
    { name: "Settings", href: "/admin/settings", icon: Settings, caption: "Platform configuration" },
];

export function AdminShell({ profile, children }: AdminShellProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <main className="relative z-10 w-full min-h-screen flex">
            {/* Admin Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 80 : 260 }}
                className="flex-shrink-0 h-screen sticky top-0 border-r border-amber-900/30 bg-[#020617]/90 backdrop-blur-xl z-40 flex flex-col"
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-5 border-b border-amber-900/30">
                    {!isCollapsed && (
                        <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center shadow-lg flex-shrink-0">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-slate-100 truncate">SecComply</p>
                                <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">Admin Console</p>
                            </div>
                        </div>
                    )}
                    {isCollapsed && (
                        <div className="w-full flex justify-center">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setIsCollapsed(c => !c)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors flex-shrink-0"
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-6 px-3 flex flex-col space-y-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                        return (
                            <Link key={item.href} href={item.href} title={isCollapsed ? item.name : undefined}>
                                <div className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-amber-500/10 text-amber-400"
                                        : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                                )}>
                                    {isActive && (
                                        <motion.div
                                            layoutId="adminActive"
                                            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(251,191,36,0.8)]"
                                        />
                                    )}
                                    <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300")} />
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-amber-900/30 space-y-1">
                    <div className={cn("flex items-center p-2 rounded-xl", isCollapsed ? "justify-center" : "gap-3")}>
                        <div className="w-8 h-8 rounded-full bg-amber-900/30 border border-amber-800/40 flex items-center justify-center flex-shrink-0">
                            {profile.avatar_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                                <UserCircle className="w-5 h-5 text-amber-400" />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-semibold text-slate-200 truncate">{profile.full_name ?? "Admin"}</span>
                                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">SecComply Admin</span>
                            </div>
                        )}
                    </div>
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
            </motion.aside>

            {/* Main content */}
            <div className="flex-1 w-full flex flex-col min-h-screen overflow-auto">
                {/* Top bar */}
                <div className="h-16 border-b border-slate-800/60 flex items-center px-8 bg-[#020617]/60 backdrop-blur-sm sticky top-0 z-30">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Admin Console
                    </div>
                    <div className="ml-auto">
                        <Link
                            href="/"
                            className="text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-700/50 hover:border-slate-600 px-3 py-1.5 rounded-lg"
                        >
                            ← View as Client
                        </Link>
                    </div>
                </div>
                <div className="flex-1 p-8 max-w-[1400px] w-full mx-auto">
                    {children}
                </div>
            </div>
        </main>
    );
}
