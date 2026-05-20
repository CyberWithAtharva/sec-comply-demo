"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    ChevronDown, ChevronUp, CircleCheckBig, Info, Sparkles,
    Building2, Users, Wrench, SlidersHorizontal, LifeBuoy, Link2,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, cn } from "@/components/ui/Card";

interface VarDef {
    id: string;
    group_id: "org" | "people" | "tools" | "thresholds" | "recovery";
    group_label: string;
    question: string;
    input_type: "text" | "number" | "dropdown" | "date";
    default_value: string | null;
    required: boolean;
    sort_order: number;
}

interface Props {
    definitions: VarDef[];
    values: Record<string, string>;
    orgName: string;
}

const GROUP_ICONS: Record<VarDef["group_id"], LucideIcon> = {
    org: Building2,
    people: Users,
    tools: Wrench,
    thresholds: SlidersHorizontal,
    recovery: LifeBuoy,
};

const GROUP_ORDER: VarDef["group_id"][] = ["org", "people", "tools", "thresholds", "recovery"];

export function VariablesClient({ definitions, values: initialValues, orgName }: Props) {
    const router = useRouter();
    const [values, setValues] = useState<Record<string, string>>(initialValues);
    const [open, setOpen] = useState<Record<string, boolean>>({ org: true, people: true });
    const [saving, setSaving] = useState(false);

    const grouped = useMemo(() => {
        const m = new Map<VarDef["group_id"], VarDef[]>();
        for (const d of definitions) {
            const arr = m.get(d.group_id) ?? [];
            arr.push(d);
            m.set(d.group_id, arr);
        }
        for (const arr of m.values()) arr.sort((a, b) => a.sort_order - b.sort_order);
        return GROUP_ORDER.map(g => ({ id: g, items: m.get(g) ?? [] })).filter(g => g.items.length > 0);
    }, [definitions]);

    const reqTotal = definitions.filter(d => d.required).length;
    const reqFilled = definitions.filter(d => d.required && (values[d.id] ?? "").trim()).length;

    const save = async () => {
        setSaving(true);
        const res = await fetch("/api/policies/variables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ values }),
        });
        if (res.ok) {
            toast.success("Variables saved — all draft policies updated");
            router.refresh();
        } else {
            const j = await res.json().catch(() => ({}));
            toast.error(j.error ?? "Save failed");
        }
        setSaving(false);
    };

    return (
        <div className="w-full flex flex-col gap-5 animate-in fade-in duration-500 pb-28">
            <Card variant="solid" className="p-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" /> Policy variables
                    </span>
                    <span className="text-xs text-muted-foreground">{orgName} · Settings</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Configure your policy variables</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
                    Variables appear as chips in every policy template — change them once and all Draft policies auto-update.
                    Active versions remain locked at their approval-time values.
                </p>
            </Card>

            {grouped.map(group => {
                const Icon = GROUP_ICONS[group.id];
                const isOpen = open[group.id] ?? false;
                const filled = group.items.filter(f => (values[f.id] ?? "").trim()).length;
                const done = filled === group.items.length;
                return (
                    <Card key={group.id} variant="solid" className="overflow-hidden p-0">
                        <button
                            onClick={() => setOpen(s => ({ ...s, [group.id]: !s[group.id] }))}
                            className="w-full flex items-center gap-4 p-5 border-b border-border/50 hover:bg-secondary/30 transition-colors text-left"
                        >
                            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-semibold text-foreground">{group.items[0].group_label}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">
                                    {group.items.length} fields · {done ? "all filled" : `${filled} of ${group.items.length} filled`}
                                </div>
                            </div>
                            {done && <CircleCheckBig className="w-5 h-5 text-emerald-400" />}
                            <span className="text-xs text-muted-foreground font-mono">{group.items.length}</span>
                            {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                        </button>
                        {isOpen && (
                            <div className="divide-y divide-border/50">
                                {group.items.map(f => (
                                    <div key={f.id} className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_auto] gap-4 p-5">
                                        <div>
                                            <div className="text-sm text-foreground">
                                                {f.question}
                                                {f.required && <span className="text-red-400 ml-1">*</span>}
                                            </div>
                                            <code className="text-[10px] font-mono text-muted-foreground bg-secondary/40 px-1.5 py-0.5 rounded mt-1 inline-block">{f.id}</code>
                                        </div>
                                        <div>
                                            <input
                                                type={f.input_type === "number" ? "number" : "text"}
                                                value={values[f.id] ?? ""}
                                                onChange={e => setValues(v => ({ ...v, [f.id]: e.target.value }))}
                                                placeholder={f.default_value ?? ""}
                                                className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50"
                                            />
                                            <div className="text-[11px] text-muted-foreground mt-1.5 inline-flex items-center gap-1">
                                                <Link2 className="w-3 h-3" /> Default: <span className="font-mono">{f.default_value ?? "—"}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end text-xs text-muted-foreground">
                                            {f.required ? "Required" : ""}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                );
            })}

            <div className="fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-w,260px)] bg-card/95 backdrop-blur border-t border-border z-40">
                <div className="max-w-6xl mx-auto p-4 flex items-center gap-4">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">
                        <strong className="text-foreground">{reqFilled}/{reqTotal}</strong> required fields complete
                    </span>
                    <div className="flex-1" />
                    <Button variant="ghost" onClick={() => router.push("/policies")}>Cancel</Button>
                    <Button variant="default" disabled={saving || reqFilled < reqTotal} onClick={save} className="gap-2">
                        <Sparkles className="w-4 h-4" />
                        {saving ? "Saving…" : "Save variables"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
