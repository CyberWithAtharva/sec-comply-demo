"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Plus, X, Check, Loader2, Users, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Org {
    id: string;
    name: string;
    slug: string;
    plan: string;
    created_at: string;
    organization_members: { count: number }[];
}

interface Framework {
    id: string;
    name: string;
    version: string;
}

export function OrganizationsClient({ orgs: initialOrgs, frameworks }: { orgs: Org[]; frameworks: Framework[] }) {
    const [orgs, setOrgs] = useState(initialOrgs);
    const [showModal, setShowModal] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({ name: "", slug: "", plan: "starter", selectedFrameworks: [] as string[] });

    const supabase = createClient();

    function toSlug(name: string) {
        return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!form.name.trim() || !form.slug.trim()) return;
        setCreating(true);

        const { data: org, error } = await supabase
            .from("organizations")
            .insert({ name: form.name.trim(), slug: form.slug.trim(), plan: form.plan })
            .select()
            .single();

        if (error || !org) {
            toast.error(error?.message ?? "Failed to create organization");
            setCreating(false);
            return;
        }

        // Assign selected frameworks
        if (form.selectedFrameworks.length > 0) {
            await supabase.from("org_frameworks").insert(
                form.selectedFrameworks.map(fid => ({ org_id: org.id, framework_id: fid }))
            );
        }

        toast.success(`Organization "${org.name}" created`);
        setOrgs(prev => [{ ...org, organization_members: [] }, ...prev]);
        setShowModal(false);
        setForm({ name: "", slug: "", plan: "starter", selectedFrameworks: [] });
        setCreating(false);
    }

    function toggleFramework(id: string) {
        setForm(f => ({
            ...f,
            selectedFrameworks: f.selectedFrameworks.includes(id)
                ? f.selectedFrameworks.filter(x => x !== id)
                : [...f.selectedFrameworks, id]
        }));
    }

    const planBadge = (plan: string) => {
        const styles: Record<string, string> = {
            enterprise: "bg-amber-500/10 text-amber-400 border-amber-500/20",
            professional: "bg-blue-500/10 text-blue-400 border-blue-500/20",
            starter: "bg-secondary/50 text-muted-foreground border-slate-600/30",
        };
        return `text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[plan] ?? styles.starter}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
                    <p className="text-sm text-muted-foreground mt-1">{orgs.length} client organization{orgs.length !== 1 ? "s" : ""}</p>
                </div>
                <Button variant="plain"
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition-colors h-auto"
                >
                    <Plus className="w-4 h-4" />
                    New Organization
                </Button>
            </div>

            {/* Orgs grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {orgs.length === 0 ? (
                    <div className="col-span-3 py-20 text-center">
                        <Building2 className="w-12 h-12 text-muted-foreground/70 mx-auto mb-4" />
                        <p className="text-muted-foreground">No organizations yet. Create your first client.</p>
                    </div>
                ) : orgs.map((org) => (
                    <Link key={org.id} href={`/admin/organizations/${org.id}`}>
                        <div className="group p-5 rounded-2xl border border-border/60 bg-card/30 hover:bg-secondary/40 hover:border-border/60 transition-all cursor-pointer backdrop-blur-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-400/10 border border-blue-500/20 flex items-center justify-center">
                                    <span className="text-base font-bold text-blue-400">{org.name[0].toUpperCase()}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-muted-foreground/70 group-hover:text-muted-foreground transition-colors" />
                            </div>
                            <h3 className="text-sm font-semibold text-foreground mb-1">{org.name}</h3>
                            <p className="text-xs text-muted-foreground font-mono mb-3">{org.slug}</p>
                            <div className="flex items-center justify-between">
                                <span className={planBadge(org.plan)}>{org.plan}</span>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="w-3 h-3" />
                                    {org.organization_members?.[0]?.count ?? 0}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl p-6 z-10"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-foreground">New Organization</h2>
                                <Button variant="plain" onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors h-auto">
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Organization Name</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: toSlug(e.target.value) }))}
                                        required
                                        placeholder="Acme Corporation"
                                        className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Slug</label>
                                    <input
                                        value={form.slug}
                                        onChange={e => setForm(f => ({ ...f, slug: toSlug(e.target.value) }))}
                                        required
                                        placeholder="acme-corporation"
                                        className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 font-mono"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</label>
                                    <select
                                        value={form.plan}
                                        onChange={e => setForm(f => ({ ...f, plan: e.target.value }))}
                                        className="mt-1.5 w-full bg-background/50 border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                                    >
                                        <option value="starter">Starter</option>
                                        <option value="professional">Professional</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Assign Frameworks</label>
                                    <div className="space-y-2">
                                        {frameworks.map(fw => (
                                            <Button variant="plain"
                                                key={fw.id}
                                                type="button"
                                                onClick={() => toggleFramework(fw.id)}
                                                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm transition-all ${
                                                    form.selectedFrameworks.includes(fw.id)
                                                        ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                                                        : "bg-background/30 border-border/60 text-muted-foreground hover:border-slate-600"
                                                }`}
                                            >
                                                <span className="font-medium">{fw.name} <span className="text-xs opacity-60">v{fw.version}</span></span>
                                                {form.selectedFrameworks.includes(fw.id) && <Check className="w-4 h-4" />}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button variant="plain" type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm text-muted-foreground hover:bg-secondary transition-colors h-auto">
                                        Cancel
                                    </Button>
                                    <Button variant="plain" type="submit" disabled={creating}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors disabled:opacity-70 h-auto">
                                        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                        Create
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
