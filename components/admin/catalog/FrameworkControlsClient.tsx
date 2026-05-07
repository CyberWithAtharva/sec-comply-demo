"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Edit2, Trash2, Upload, Search, ListChecks, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { Pagination } from "./Pagination";
import { ControlFormDialog, type ControlRecord } from "./ControlFormDialog";
import { BulkUploadDialog } from "./BulkUploadDialog";
import { FrameworkFormDialog, type FrameworkRecord } from "./FrameworkFormDialog";

type ControlRow = {
    id: string;
    framework_id: string;
    code: string;
    name: string;
    description: string | null;
    domain: string | null;
    sort_order: number;
};

interface Props {
    framework: FrameworkRecord & { controls_count: number };
    controls: ControlRow[];
}

const PAGE_SIZE_OPTIONS = [20, 50, 100];

export function FrameworkControlsClient({ framework, controls: initialControls }: Props) {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [search, setSearch] = useState("");
    const [editingControl, setEditingControl] = useState<ControlRecord | null>(null);
    const [showControlDialog, setShowControlDialog] = useState(false);
    const [showBulkDialog, setShowBulkDialog] = useState(false);
    const [showFrameworkDialog, setShowFrameworkDialog] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const allCodes = useMemo(() => new Set(initialControls.map(c => c.code)), [initialControls]);

    // Sort once: by sort_order then code, ascending
    const sorted = useMemo(() => {
        return [...initialControls].sort((a, b) => {
            if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
            return a.code.localeCompare(b.code, undefined, { numeric: true });
        });
    }, [initialControls]);

    // Page-local search per the spec
    const total = sorted.length;
    const paged = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, page, pageSize]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return paged;
        return paged.filter(c =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            (c.domain ?? "").toLowerCase().includes(q) ||
            (c.description ?? "").toLowerCase().includes(q)
        );
    }, [paged, search]);

    async function handleDelete(c: ControlRow) {
        const ok = confirm(`Delete control ${c.code} — "${c.name}"?`);
        if (!ok) return;
        setDeletingId(c.id);
        try {
            const res = await fetch(
                `/api/admin/catalog/frameworks/${framework.id}/controls/${c.id}`,
                { method: "DELETE" }
            );
            if (!res.ok && res.status !== 204) {
                const err = await res.json().catch(() => ({ error: "Delete failed" }));
                throw new Error(err.error ?? "Delete failed");
            }
            toast.success(`Deleted ${c.code}`);
            router.refresh();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Delete failed");
        } finally {
            setDeletingId(null);
        }
    }

    function openCreate() {
        setEditingControl(null);
        setShowControlDialog(true);
    }
    function openEdit(c: ControlRow) {
        setEditingControl({
            id: c.id,
            framework_id: c.framework_id,
            code: c.code,
            name: c.name,
            description: c.description,
            domain: c.domain,
            sort_order: c.sort_order,
        });
        setShowControlDialog(true);
    }

    const accent = framework.color ?? "#64748b";

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/admin/frameworks"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-3"
                >
                    <ArrowLeft className="w-3 h-3" />
                    All frameworks
                </Link>

                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span
                                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                style={{ backgroundColor: accent }}
                            />
                            <h1 className="text-2xl font-bold text-slate-100 truncate">{framework.name}</h1>
                            {framework.version && (
                                <span className="text-sm text-slate-500">v{framework.version}</span>
                            )}
                        </div>
                        {framework.description && (
                            <p className="text-sm text-slate-400 max-w-3xl">{framework.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-[10px] font-mono text-slate-500 px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60">
                                {framework.slug}
                            </span>
                            {framework.category && (
                                <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60 uppercase tracking-wider">
                                    {framework.category.replace(/_/g, " ")}
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-xs text-slate-400 tabular-nums">
                                <ListChecks className="w-3 h-3" />
                                {total} control{total === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                            type="button"
                            onClick={() => setShowFrameworkDialog(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs text-slate-300 transition-colors"
                        >
                            <Settings2 className="w-3.5 h-3.5" />
                            Edit framework
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search code, name, domain, description (in current page)…"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => setShowBulkDialog(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm text-slate-300 transition-colors"
                >
                    <Upload className="w-4 h-4" />
                    Bulk upload
                </button>
                <button
                    type="button"
                    onClick={openCreate}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add control
                </button>
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
                {total === 0 ? (
                    <div className="p-16 text-center">
                        <ListChecks className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">No controls in this framework yet</p>
                        <p className="text-sm text-slate-500 mt-1">Add controls one by one or upload a CSV/XLSX in bulk.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-800/60">
                            <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="px-4 py-3 w-32">Code</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3 w-40">Domain</th>
                                <th className="px-4 py-3 w-20 text-right tabular-nums">Sort</th>
                                <th className="px-4 py-3 w-24" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {visible.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">
                                        No matches on this page. Try clearing search or paging through.
                                    </td>
                                </tr>
                            ) : visible.map(c => (
                                <tr key={c.id} className="group hover:bg-slate-800/20 transition-colors">
                                    <td className="px-4 py-2.5">
                                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 font-mono text-xs text-slate-200">
                                            {c.code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <p className="text-slate-200 font-medium leading-tight">{c.name}</p>
                                        {c.description && (
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {c.domain ? (
                                            <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800/60 border border-slate-700/60 uppercase tracking-wider">
                                                {c.domain}
                                            </span>
                                        ) : <span className="text-slate-600">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-400">
                                        {c.sort_order}
                                    </td>
                                    <td className="px-4 py-2.5 text-right">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(c)}
                                                className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                                                title="Edit"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(c)}
                                                disabled={deletingId === c.id}
                                                className="p-1.5 rounded-md hover:bg-red-950/60 text-slate-400 hover:text-red-400 transition-colors disabled:opacity-40"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {total > 0 && (
                    <div className="px-4 pb-4">
                        <Pagination
                            page={page}
                            pageSize={pageSize}
                            total={total}
                            onPageChange={setPage}
                            onPageSizeChange={s => { setPageSize(s); setPage(1); }}
                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                            label="controls"
                        />
                    </div>
                )}
            </div>

            <ControlFormDialog
                open={showControlDialog}
                frameworkId={framework.id}
                initial={editingControl}
                onClose={() => setShowControlDialog(false)}
                onSaved={() => router.refresh()}
            />
            <BulkUploadDialog
                open={showBulkDialog}
                frameworkId={framework.id}
                existingCodes={allCodes}
                onClose={() => setShowBulkDialog(false)}
                onCommitted={() => router.refresh()}
            />
            <FrameworkFormDialog
                open={showFrameworkDialog}
                initial={framework}
                onClose={() => setShowFrameworkDialog(false)}
                onSaved={() => router.refresh()}
            />
        </div>
    );
}
