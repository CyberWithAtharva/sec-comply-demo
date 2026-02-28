import { createClient } from "@/lib/supabase/server";
import { UserCircle, Building2 } from "lucide-react";

export default async function UsersPage() {
    const supabase = await createClient();

    const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, created_at, organizations(name, slug)")
        .order("created_at", { ascending: false });

    const clients = profiles?.filter(p => p.role === "client") ?? [];
    const admins = profiles?.filter(p => p.role === "admin") ?? [];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-100">Users</h1>
                <p className="text-sm text-slate-500 mt-1">{profiles?.length ?? 0} total users across all organizations</p>
            </div>

            {/* Admins */}
            <section>
                <h2 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">SecComply Admins ({admins.length})</h2>
                <div className="rounded-2xl border border-amber-900/30 bg-amber-950/10 backdrop-blur-sm overflow-hidden">
                    {admins.length === 0 ? (
                        <p className="px-6 py-8 text-sm text-slate-500 text-center">No admin users.</p>
                    ) : (
                        <div className="divide-y divide-slate-800/40">
                            {admins.map(u => (
                                <div key={u.id} className="px-6 py-3.5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-amber-900/20 border border-amber-800/30 flex items-center justify-center flex-shrink-0">
                                        <UserCircle className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200">{u.full_name ?? "—"}</p>
                                        <p className="text-xs text-slate-500">Admin</p>
                                    </div>
                                    <span className="text-xs text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">admin</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Clients */}
            <section>
                <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Client Users ({clients.length})</h2>
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
                    {clients.length === 0 ? (
                        <p className="px-6 py-8 text-sm text-slate-500 text-center">No client users yet. Invite them from an organization page.</p>
                    ) : (
                        <div className="divide-y divide-slate-800/40">
                            {clients.map(u => (
                                <div key={u.id} className="px-6 py-3.5 flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                                        <UserCircle className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-200">{u.full_name ?? "—"}</p>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <Building2 className="w-3 h-3 text-slate-500" />
                                            <p className="text-xs text-slate-500">
                                                {(u.organizations as { name: string; slug: string } | null)?.name ?? "No org"}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-blue-400 font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">client</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
