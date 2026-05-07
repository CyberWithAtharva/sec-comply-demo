"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, ShieldCheck, ListChecks, Archive } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";
import { FrameworkFormDialog, type FrameworkRecord } from "./FrameworkFormDialog";

type FrameworkRow = FrameworkRecord & {
    controls_count: number;
    status: "active" | "archived";
};

const PAGE_SIZE_OPTIONS = [12, 24, 48];

export function FrameworkCatalogClient({ frameworks }: { frameworks: FrameworkRow[] }) {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [editing, setEditing] = useState<FrameworkRecord | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const total = frameworks.length;
    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return frameworks.slice(start, start + pageSize);
    }, [frameworks, page, pageSize]);

    async function handleDelete(fw: FrameworkRow) {
        const ok = confirm(
            `Delete "${fw.name}" and its ${fw.controls_count} control${fw.controls_count === 1 ? "" : "s"}? This cannot be undone.`
        );
        if (!ok) return;
        setDeletingId(fw.id);
        try {
            const res = await fetch(`/api/admin/catalog/frameworks/${fw.id}`, { method: "DELETE" });
            if (!res.ok && res.status !== 204) {
                const err = await res.json().catch(() => ({ error: "Delete failed" }));
                throw new Error(err.error ?? "Delete failed");
            }
            toast.success(`Deleted "${fw.name}"`);
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Delete failed");
        } finally {
            setDeletingId(null);
        }
    }

    function openCreate() {
        setEditing(null);
        setShowDialog(true);
    }

    function openEdit(fw: FrameworkRow) {
        setEditing(fw);
        setShowDialog(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Framework Catalog</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {total} framework{total === 1 ? "" : "s"} available across all client organizations.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Framework
                </button>
            </div>

            {total === 0 ? (
                <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 p-16 text-center">
                    <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 font-medium">No frameworks yet</p>
                    <p className="text-sm text-slate-500 mt-1">Create your first compliance framework to get started.</p>
                    <button
                        onClick={openCreate}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm rounded-xl transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Create framework
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paged.map(fw => {
                            const accent = fw.color ?? "#64748b";
                            return (
                                <div
                                    key={fw.id}
                                    className="group relative rounded-2xl border border-slate-800/60 bg-slate-900/30 hover:bg-slate-800/40 hover:border-slate-700/60 transition-all backdrop-blur-sm overflow-hidden"
                                    style={{ borderLeft: `3px solid ${accent}` }}
                                >
                                    <Link href={`/admin/frameworks/${fw.id}`} className="block p-5">
                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: accent + "20", border: `1px solid ${accent}40` }}
                                            >
                                                <ShieldCheck className="w-5 h-5" style={{ color: accent }} />
                                            </div>
                                            {fw.status === "archived" && (
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                                    <Archive className="w-3 h-3" />
                                                    Archived
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-200 mb-0.5">
                                            {fw.name}
                                            {fw.version && <span className="ml-2 text-xs text-slate-500">v{fw.version}</span>}
                                        </h3>
                                        <p className="text-xs text-slate-500 font-mono mb-3 truncate">{fw.slug}</p>
                                        <div className="flex items-center justify-between">
                                            {fw.category ? (
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800/60 text-slate-400 border border-slate-700/60 uppercase tracking-wider truncate max-w-[60%]">
                                                    {fw.category.replace(/_/g, " ")}
                                                </span>
                                            ) : <span />}
                                            <span className="flex items-center gap-1 text-xs text-slate-400 tabular-nums">
                                                <ListChecks className="w-3 h-3" />
                                                {fw.controls_count}
                                            </span>
                                        </div>
                                    </Link>
                                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); openEdit(fw); }}
                                            className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                                            title="Edit framework"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => { e.preventDefault(); handleDelete(fw); }}
                                            disabled={deletingId === fw.id}
                                            className="p-1.5 rounded-md bg-red-950/80 hover:bg-red-900 text-red-400 transition-colors disabled:opacity-50"
                                            title="Delete framework"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Pagination
                        page={page}
                        pageSize={pageSize}
                        total={total}
                        onPageChange={setPage}
                        onPageSizeChange={s => { setPageSize(s); setPage(1); }}
                        pageSizeOptions={PAGE_SIZE_OPTIONS}
                        label="frameworks"
                    />
                </>
            )}

            <FrameworkFormDialog
                open={showDialog}
                initial={editing}
                onClose={() => setShowDialog(false)}
                onSaved={() => router.refresh()}
            />
        </div>
    );
}
