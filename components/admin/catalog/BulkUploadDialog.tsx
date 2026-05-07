"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Upload, FileSpreadsheet, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const HEADER_ALIASES: Record<string, keyof ParsedRow> = {
    code: "code", "control code": "code", id: "code", ref: "code",
    name: "name", title: "name", "control name": "name",
    description: "description", desc: "description", requirement: "description", text: "description",
    domain: "domain", category: "domain", family: "domain", section: "domain",
    sortorder: "sortOrder", "sort order": "sortOrder", "sort_order": "sortOrder", order: "sortOrder", position: "sortOrder",
};

type ParsedRow = {
    code: string;
    name: string;
    description: string;
    domain: string;
    sortOrder: number;
    classification: "new" | "update" | "duplicate-in-file" | "invalid";
    issue?: string;
};

interface Props {
    open: boolean;
    frameworkId: string;
    existingCodes: Set<string>;
    onClose: () => void;
    onCommitted: () => void;
}

type Phase = "input" | "preview" | "committing" | "done";

function normalizeHeader(h: string): string {
    return h.toLowerCase().replace(/[\s_\-]+/g, " ").trim();
}

function parseSheetData(rows: Record<string, unknown>[], existing: Set<string>): ParsedRow[] {
    if (rows.length === 0) return [];

    // Build alias map from this file's headers
    const headers = Object.keys(rows[0]);
    const headerMap: Record<string, keyof ParsedRow> = {};
    for (const h of headers) {
        const normalized = normalizeHeader(h);
        const compact = normalized.replace(/\s+/g, "");
        const target = HEADER_ALIASES[normalized] ?? HEADER_ALIASES[compact];
        if (target) headerMap[h] = target;
    }

    const seenInFile = new Set<string>();
    const out: ParsedRow[] = [];

    for (const r of rows) {
        const row: ParsedRow = {
            code: "",
            name: "",
            description: "",
            domain: "",
            sortOrder: 0,
            classification: "new",
        };
        for (const [origHeader, target] of Object.entries(headerMap)) {
            const raw = r[origHeader];
            if (raw === null || raw === undefined) continue;
            const str = String(raw).trim();
            if (target === "sortOrder") {
                const n = Number(str);
                row.sortOrder = Number.isFinite(n) ? Math.trunc(n) : 0;
            } else {
                (row as Record<string, unknown>)[target] = str;
            }
        }

        if (!row.code || !row.name) {
            row.classification = "invalid";
            row.issue = !row.code ? "missing code" : "missing name";
        } else if (seenInFile.has(row.code)) {
            row.classification = "duplicate-in-file";
            row.issue = "duplicate code in file";
        } else if (existing.has(row.code)) {
            row.classification = "update";
        } else {
            row.classification = "new";
        }
        seenInFile.add(row.code);
        out.push(row);
    }
    return out;
}

export function BulkUploadDialog({ open, frameworkId, existingCodes, onClose, onCommitted }: Props) {
    const [phase, setPhase] = useState<Phase>("input");
    const [pasted, setPasted] = useState("");
    const [parsed, setParsed] = useState<ParsedRow[]>([]);
    const [mode, setMode] = useState<"skip" | "upsert">("skip");
    const [result, setResult] = useState<{ created: number; updated: number; skipped: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stats = useMemo(() => {
        const out = { new: 0, update: 0, duplicate: 0, invalid: 0 };
        for (const r of parsed) {
            if (r.classification === "new") out.new++;
            else if (r.classification === "update") out.update++;
            else if (r.classification === "duplicate-in-file") out.duplicate++;
            else out.invalid++;
        }
        return out;
    }, [parsed]);

    function reset() {
        setPhase("input");
        setPasted("");
        setParsed([]);
        setMode("skip");
        setResult(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    function handleClose() {
        if (phase === "committing") return;
        reset();
        onClose();
    }

    function downloadTemplate() {
        const ws = XLSX.utils.json_to_sheet([
            { code: "A.5.1", name: "Policies for information security", description: "Policies that direct the organization's approach to information security.", domain: "Organizational", sort_order: 1 },
            { code: "A.5.2", name: "Information security roles and responsibilities", description: "Defining and allocating responsibilities.", domain: "Organizational", sort_order: 2 },
            { code: "A.5.3", name: "Segregation of duties", description: "Conflicting duties separated.", domain: "Organizational", sort_order: 3 },
        ]);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "controls");
        XLSX.writeFile(wb, "controls-template.xlsx");
    }

    async function handleFile(file: File) {
        try {
            const buf = await file.arrayBuffer();
            const wb = XLSX.read(buf, { type: "array" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
            const result = parseSheetData(rows, existingCodes);
            if (result.length === 0) { toast.error("No rows found in file"); return; }
            setParsed(result);
            setPhase("preview");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to parse file");
        }
    }

    function parsePastedText() {
        const text = pasted.trim();
        if (!text) { toast.error("Paste some CSV or TSV first"); return; }
        try {
            const wb = XLSX.read(text, { type: "string" });
            const ws = wb.Sheets[wb.SheetNames[0]];
            const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
            const result = parseSheetData(rows, existingCodes);
            if (result.length === 0) { toast.error("No rows parsed from pasted text"); return; }
            setParsed(result);
            setPhase("preview");
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed to parse pasted text");
        }
    }

    async function commit() {
        const valid = parsed.filter(r => r.classification === "new" || r.classification === "update");
        if (valid.length === 0) { toast.error("Nothing to upload"); return; }

        setPhase("committing");
        try {
            const res = await fetch(`/api/admin/catalog/frameworks/${frameworkId}/controls/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode,
                    controls: valid.map(r => ({
                        code: r.code,
                        name: r.name,
                        description: r.description || null,
                        domain: r.domain || null,
                        sort_order: r.sortOrder,
                    })),
                }),
            });
            const json = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(json.error ?? "Upload failed");
            setResult(json.data ?? { created: 0, updated: 0, skipped: 0 });
            setPhase("done");
            onCommitted();
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Upload failed");
            setPhase("preview");
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/60 rounded-2xl shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                                Bulk Upload Controls
                            </h2>
                            <button
                                onClick={handleClose}
                                disabled={phase === "committing"}
                                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors disabled:opacity-40"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {phase === "input" && (
                            <div className="space-y-5">
                                <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                                    <div className="text-sm">
                                        <p className="font-semibold text-slate-200">Need a starting point?</p>
                                        <p className="text-xs text-slate-500 mt-0.5">Download our XLSX template with example rows.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={downloadTemplate}
                                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-sm text-slate-300 transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Template
                                    </button>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Upload file</label>
                                    <label className="mt-2 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 hover:border-amber-500/40 bg-slate-950/30 p-8 cursor-pointer transition-colors">
                                        <Upload className="w-8 h-8 text-slate-500 mb-2" />
                                        <span className="text-sm text-slate-300 font-medium">Click to select a file</span>
                                        <span className="text-xs text-slate-500 mt-1">CSV, XLSX, or XLS</span>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv,.xlsx,.xls"
                                            className="hidden"
                                            onChange={e => {
                                                const f = e.target.files?.[0];
                                                if (f) handleFile(f);
                                            }}
                                        />
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="flex-1 h-px bg-slate-800" />
                                    OR PASTE
                                    <span className="flex-1 h-px bg-slate-800" />
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Paste CSV / TSV</label>
                                    <textarea
                                        value={pasted}
                                        onChange={e => setPasted(e.target.value)}
                                        rows={6}
                                        placeholder={"code,name,domain\nA.5.1,Policies,Organizational"}
                                        className="mt-1.5 w-full bg-slate-950/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                                    />
                                    <button
                                        type="button"
                                        onClick={parsePastedText}
                                        className="mt-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-200 transition-colors"
                                    >
                                        Parse
                                    </button>
                                </div>
                            </div>
                        )}

                        {phase === "preview" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-4 gap-3">
                                    <StatChip label="New" value={stats.new} accent="emerald" />
                                    <StatChip label="Updates" value={stats.update} accent="blue" />
                                    <StatChip label="Duplicates" value={stats.duplicate} accent="amber" />
                                    <StatChip label="Invalid" value={stats.invalid} accent="red" />
                                </div>

                                {stats.update > 0 && (
                                    <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                                        <p className="text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                                            How should existing codes be handled?
                                        </p>
                                        <div className="flex gap-3">
                                            <label className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${mode === "skip" ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-slate-700 text-slate-400 hover:bg-slate-800/40"}`}>
                                                <input type="radio" className="hidden" checked={mode === "skip"} onChange={() => setMode("skip")} />
                                                <span className="font-semibold">Skip existing</span>
                                                <span className="block text-xs opacity-70 mt-0.5">Only insert new codes</span>
                                            </label>
                                            <label className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${mode === "upsert" ? "border-amber-500/50 bg-amber-500/10 text-amber-300" : "border-slate-700 text-slate-400 hover:bg-slate-800/40"}`}>
                                                <input type="radio" className="hidden" checked={mode === "upsert"} onChange={() => setMode("upsert")} />
                                                <span className="font-semibold">Overwrite existing</span>
                                                <span className="block text-xs opacity-70 mt-0.5">Replace fields on matching codes</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-xl border border-slate-800 bg-slate-950/40 max-h-[40vh] overflow-y-auto">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0 bg-slate-900 border-b border-slate-800">
                                            <tr className="text-left text-slate-400 font-medium uppercase tracking-wider">
                                                <th className="px-3 py-2 w-20">Status</th>
                                                <th className="px-3 py-2 w-28">Code</th>
                                                <th className="px-3 py-2">Name</th>
                                                <th className="px-3 py-2 w-32">Domain</th>
                                                <th className="px-3 py-2 w-16 text-right">Sort</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800/60">
                                            {parsed.slice(0, 500).map((r, i) => (
                                                <tr
                                                    key={i}
                                                    className={
                                                        r.classification === "invalid" ? "bg-red-500/5" :
                                                        r.classification === "duplicate-in-file" ? "bg-amber-500/5" : ""
                                                    }
                                                >
                                                    <td className="px-3 py-1.5"><ClassChip kind={r.classification} /></td>
                                                    <td className="px-3 py-1.5 font-mono text-slate-200">{r.code || "—"}</td>
                                                    <td className="px-3 py-1.5 text-slate-300 truncate max-w-md" title={r.name}>{r.name || "—"}</td>
                                                    <td className="px-3 py-1.5 text-slate-400">{r.domain || "—"}</td>
                                                    <td className="px-3 py-1.5 text-right tabular-nums text-slate-400">{r.sortOrder}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {parsed.length > 500 && (
                                        <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-800 bg-slate-900/40">
                                            Showing first 500 of {parsed.length} rows.
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={reset}
                                        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-700 text-sm text-slate-400 hover:bg-slate-800 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={commit}
                                        disabled={stats.new + stats.update === 0}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors disabled:opacity-50"
                                    >
                                        <Upload className="w-4 h-4" />
                                        Upload {stats.new + stats.update} row{stats.new + stats.update === 1 ? "" : "s"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {phase === "committing" && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-10 h-10 text-amber-400 animate-spin mb-4" />
                                <p className="text-sm text-slate-300 font-medium">Uploading controls…</p>
                                <p className="text-xs text-slate-500 mt-1">This usually takes a few seconds.</p>
                            </div>
                        )}

                        {phase === "done" && result && (
                            <div className="space-y-5">
                                <div className="flex flex-col items-center py-6">
                                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3" />
                                    <h3 className="text-lg font-bold text-slate-100">Upload complete</h3>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <ResultTile label="Created" value={result.created} accent="emerald" />
                                    <ResultTile label="Updated" value={result.updated} accent="blue" />
                                    <ResultTile label="Skipped" value={result.skipped} accent="amber" />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-sm transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function StatChip({ label, value, accent }: { label: string; value: number; accent: "emerald" | "blue" | "amber" | "red" }) {
    const palette = {
        emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
        blue: "bg-blue-500/10 border-blue-500/30 text-blue-300",
        amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
        red: "bg-red-500/10 border-red-500/30 text-red-300",
    }[accent];
    return (
        <div className={`rounded-xl border px-3 py-2 ${palette}`}>
            <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{label}</p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
        </div>
    );
}

function ResultTile({ label, value, accent }: { label: string; value: number; accent: "emerald" | "blue" | "amber" }) {
    const palette = {
        emerald: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
        blue: "bg-blue-500/10 border-blue-500/30 text-blue-300",
        amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    }[accent];
    return (
        <div className={`rounded-xl border px-4 py-3 text-center ${palette}`}>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80">{label}</p>
            <p className="text-3xl font-bold tabular-nums mt-1">{value}</p>
        </div>
    );
}

function ClassChip({ kind }: { kind: ParsedRow["classification"] }) {
    const map = {
        new: { label: "New", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
        update: { label: "Update", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
        "duplicate-in-file": { label: "Dup", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
        invalid: { label: "Invalid", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
    } as const;
    const { label, cls } = map[kind];
    return (
        <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>
            {kind === "invalid" && <AlertTriangle className="w-3 h-3" />}
            {label}
        </span>
    );
}
