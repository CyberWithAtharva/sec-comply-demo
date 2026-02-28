import { createClient } from "@/lib/supabase/server";
import { Building2, Users, ShieldCheck, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
    const supabase = await createClient();

    const [{ data: orgs }, { count: userCount }, { data: frameworks }] = await Promise.all([
        supabase
            .from("organizations")
            .select("id, name, slug, plan, created_at, organization_members(count)")
            .order("created_at", { ascending: false }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "client"),
        supabase.from("frameworks").select("id, name, controls_count"),
    ]);

    const stats = [
        { label: "Client Organizations", value: orgs?.length ?? 0, icon: Building2, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
        { label: "Total Client Users", value: userCount ?? 0, icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
        { label: "Frameworks Available", value: frameworks?.length ?? 0, icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        { label: "Active This Month", value: orgs?.length ?? 0, icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
    ];

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage all client organizations and users from here.</p>
                </div>
                <Link
                    href="/admin/organizations"
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Organization
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <div key={stat.label} className={`rounded-2xl border p-5 ${stat.bg} backdrop-blur-sm`}>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Organizations table */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-800/60 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-200">Client Organizations</h2>
                    <Link href="/admin/organizations" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                        View all →
                    </Link>
                </div>
                <div className="divide-y divide-slate-800/40">
                    {!orgs || orgs.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <Building2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">No organizations yet.</p>
                            <Link href="/admin/organizations" className="mt-3 inline-block text-xs text-amber-400 hover:text-amber-300">
                                Create your first client →
                            </Link>
                        </div>
                    ) : (
                        orgs.slice(0, 8).map((org) => (
                            <Link key={org.id} href={`/admin/organizations/${org.id}`}>
                                <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-sm font-bold text-blue-400">{org.name[0].toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-200">{org.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{org.slug}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                            org.plan === "enterprise" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                            org.plan === "professional" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                            "bg-slate-700/50 text-slate-400 border border-slate-600/30"
                                        }`}>
                                            {org.plan}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {new Date(org.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
