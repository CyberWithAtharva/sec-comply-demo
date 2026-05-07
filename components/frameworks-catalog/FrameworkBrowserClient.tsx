"use client";

import React, { useMemo, useState } from "react";
import { Search, ListChecks } from "lucide-react";

type Control = {
    id: string;
    code: string;
    name: string;
    description: string | null;
    domain: string | null;
    sort_order: number;
};

interface Props {
    controls: Control[];
}

export function FrameworkBrowserClient({ controls }: Props) {
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return controls;
        return controls.filter(c =>
            c.code.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            (c.domain ?? "").toLowerCase().includes(q) ||
            (c.description ?? "").toLowerCase().includes(q)
        );
    }, [controls, search]);

    return (
        <div className="space-y-4">
            <div className="relative max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search code, name, domain, description…"
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
            </div>

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <ListChecks className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">
                            {controls.length === 0 ? "This framework has no controls yet." : "No controls match your search."}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-slate-800/60">
                            <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                                <th className="px-4 py-3 w-32">Code</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3 w-40">Domain</th>
                                <th className="px-4 py-3 w-20 text-right tabular-nums">Sort</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
