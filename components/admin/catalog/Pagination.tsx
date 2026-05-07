"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;                 // 1-indexed
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    pageSizeOptions: number[];
    label: string;                // e.g. "frameworks", "controls"
}

export function Pagination({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions,
    label,
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = Math.min(total, page * pageSize);

    return (
        <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
                <span className="tabular-nums">
                    {start}–{end} of {total} {label}
                </span>
                <span className="text-slate-600">·</span>
                <label className="flex items-center gap-1.5">
                    Per page
                    <select
                        value={pageSize}
                        onChange={e => onPageSizeChange(Number(e.target.value))}
                        className="bg-slate-900 border border-slate-700 rounded-md px-2 py-0.5 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                    >
                        {pageSizeOptions.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </label>
            </div>
            <div className="flex items-center gap-2">
                <span className="tabular-nums">Page {page} of {totalPages}</span>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.max(1, page - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-md border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                    type="button"
                    onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                    disabled={page >= totalPages}
                    className="p-1.5 rounded-md border border-slate-700 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}
