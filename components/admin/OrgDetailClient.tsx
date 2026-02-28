"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ShieldCheck, Mail, X, Plus, Loader2, Check, UserCircle, ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Profile { id: string; full_name: string | null; avatar_url: string | null; role: string; }
interface Member { id: string; user_id: string; role: string; profiles: Profile | null; }
interface Framework { id: string; name: string; version: string; controls_count: number; }
interface OrgFramework { id: string; framework_id: string; status: string; frameworks: Framework | null; }
interface Org { id: string; name: string; slug: string; plan: string; created_at: string; }

export function OrgDetailClient({
    org, members: initialMembers, orgFrameworks: initialOrgFw, allFrameworks,
}: {
    org: Org;
    members: Member[];
    orgFrameworks: OrgFramework[];
    allFrameworks: { id: string; name: string; version: string }[];
}) {
    const supabase = createClient();
    const [members, setMembers] = useState(initialMembers);
    const [orgFw, setOrgFw] = useState(initialOrgFw);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"owner" | "member" | "viewer">("member");
    const [inviting, setInviting] = useState(false);
    const [addingFw, setAddingFw] = useState<string | null>(null);

    async function handleInvite(e: React.FormEvent) {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setInviting(true);

        const res = await fetch("/api/admin/invite", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: inviteEmail.trim(), orgId: org.id, role: inviteRole }),
        });
        const json = await res.json();

        if (!res.ok) {
            toast.error(json.error ?? "Failed to send invite");
        } else {
            toast.success(`Invite sent to ${inviteEmail}`);
            setShowInvite(false);
            setInviteEmail("");
        }
        setInviting(false);
    }

    async function handleAddFramework(fwId: string) {
        if (orgFw.some(f => f.framework_id === fwId)) return;
        setAddingFw(fwId);

        const res = await fetch("/api/org-frameworks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ org_id: org.id, framework_id: fwId }),
        });
        const json = await res.json();

        if (!res.ok) {
            toast.error(json.error ?? "Failed to assign framework");
        } else {
            const data = json.orgFramework;
            toast.success(
                json.already_assigned
                    ? "Framework already assigned"
                    : `Framework assigned — ${json.controls_initialized ?? 0} controls initialized`
            );
            if (data && !json.already_assigned) {
                setOrgFw(prev => [...prev, data]);
            }
        }
        setAddingFw(null);
    }

    async function handleRemoveFramework(fwId: string) {
        const entry = orgFw.find(f => f.framework_id === fwId);
        if (!entry) return;

        const res = await fetch("/api/org-frameworks", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ org_framework_id: entry.id }),
        });
        const json = await res.json();
        const error = !res.ok ? json : null;
        if (error) { toast.error(error.message); return; }

        toast.success("Framework removed");
        setOrgFw(prev => prev.filter(f => f.framework_id !== fwId));
    }

    const assignedFwIds = new Set(orgFw.map(f => f.framework_id));

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/admin/organizations" className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/20 flex items-center justify-center">
                        <span className="text-xl font-bold text-blue-400">{org.name[0].toUpperCase()}</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-100">{org.name}</h1>
                        <p className="text-xs text-slate-500 font-mono">{org.slug} · {org.plan}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Members */}
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <h2 className="text-sm font-semibold text-slate-200">Members ({members.length})</h2>
                        </div>
                        <button
                            onClick={() => setShowInvite(true)}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg transition-colors font-medium"
                        >
                            <Mail className="w-3.5 h-3.5" />
                            Invite
                        </button>
                    </div>
                    <div className="divide-y divide-slate-800/40">
                        {members.length === 0 ? (
                            <div className="px-5 py-10 text-center text-slate-500 text-sm">No members yet. Invite someone.</div>
                        ) : members.map(m => (
                            <div key={m.id} className="px-5 py-3 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                                    {m.profiles?.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={m.profiles.avatar_url} alt="" className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <UserCircle className="w-5 h-5 text-slate-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 truncate">{m.profiles?.full_name ?? "—"}</p>
                                    <p className="text-xs text-slate-500 font-mono">{m.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Frameworks */}
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-slate-800/60 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-semibold text-slate-200">Compliance Frameworks</h2>
                    </div>
                    <div className="p-5 space-y-3">
                        {/* Assigned */}
                        {orgFw.map(f => f.frameworks && (
                            <div key={f.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                <div>
                                    <p className="text-sm font-semibold text-emerald-300">{f.frameworks.name}</p>
                                    <p className="text-xs text-slate-500">{f.frameworks.controls_count} controls · v{f.frameworks.version}</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveFramework(f.framework_id)}
                                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                                    title="Remove framework"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}

                        {/* Available to add */}
                        {allFrameworks.filter(f => !assignedFwIds.has(f.id)).map(fw => (
                            <button
                                key={fw.id}
                                onClick={() => handleAddFramework(fw.id)}
                                disabled={addingFw === fw.id}
                                className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-slate-700/60 bg-slate-950/30 hover:border-slate-600 text-sm text-slate-400 hover:text-slate-200 transition-all"
                            >
                                <span className="font-medium">{fw.name} <span className="text-xs opacity-50">v{fw.version}</span></span>
                                {addingFw === fw.id
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : <Plus className="w-4 h-4 opacity-60" />
                                }
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInvite && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowInvite(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 z-10">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-base font-bold text-slate-100">Invite Member</h2>
                                <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form onSubmit={handleInvite} className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <input
                                        type="email"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        required
                                        placeholder="user@company.com"
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role</label>
                                    <select
                                        value={inviteRole}
                                        onChange={e => setInviteRole(e.target.value as "owner" | "member" | "viewer")}
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                    >
                                        <option value="owner">Owner</option>
                                        <option value="member">Member</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                                <div className="flex gap-3 pt-1">
                                    <button type="button" onClick={() => setShowInvite(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={inviting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors disabled:opacity-70">
                                        {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Send Invite
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
