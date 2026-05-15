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
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search code, name, domain, description…"
                    className="w-full bg-background/50 border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-orange-500/40"
                />
            </div>

            <div className="rounded-2xl border border-border/60 bg-card/30 backdrop-blur-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <ListChecks className="w-12 h-12 text-muted-foreground/70 mx-auto mb-4" />
                        <p className="text-muted-foreground font-medium">
                            {controls.length === 0 ? "This framework has no controls yet." : "No controls match your search."}
                        </p>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-border/60">
                            <tr className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                <th className="px-4 py-3 w-32">Code</th>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3 w-40">Domain</th>
                                <th className="px-4 py-3 w-20 text-right tabular-nums">Sort</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filtered.map(c => (
                                <tr key={c.id} className="hover:bg-secondary/20 transition-colors">
                                    <td className="px-4 py-2.5">
                                        <span className="inline-block px-2 py-0.5 rounded-md bg-secondary/80 border border-border/60 font-mono text-xs text-foreground">
                                            {c.code}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <p className="text-foreground font-medium leading-tight">{c.name}</p>
                                        {c.description && (
                                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{c.description}</p>
                                        )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        {c.domain ? (
                                            <span className="text-[10px] font-semibold text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/60 border border-border/60 uppercase tracking-wider">
                                                {c.domain}
                                            </span>
                                        ) : <span className="text-muted-foreground/70">—</span>}
                                    </td>
                                    <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">
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
