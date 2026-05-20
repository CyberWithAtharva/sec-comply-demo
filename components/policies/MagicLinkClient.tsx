"use client";

import React, { useRef, useState } from "react";
import { CircleCheck, MailCheck, ArrowDownCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/Card";
import { substituteVariables } from "./policy-shared";

interface Props {
    token: string;
    policyTitle: string;
    version: string;
    orgName: string;
    content: string;
    variables: Record<string, string>;
    alreadyAcked: boolean;
}

export function MagicLinkClient({ token, policyTitle, version, orgName, content, variables, alreadyAcked }: Props) {
    const [name, setName] = useState("");
    const [scrolled, setScrolled] = useState(false);
    const [submitted, setSubmitted] = useState(alreadyAcked);
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const substituted = substituteVariables(content, variables);
    const docRef = useRef<HTMLDivElement>(null);

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setScrolled(true);
    };

    const submit = async () => {
        if (!name.trim() || !scrolled) return;
        setBusy(true);
        setErr(null);
        const res = await fetch(`/api/policies/ack/${token}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
        });
        if (res.ok) setSubmitted(true);
        else {
            const j = await res.json().catch(() => ({}));
            setErr(j.error ?? "Submit failed");
        }
        setBusy(false);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center p-4">
                <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-10 text-center shadow-2xl">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-5">
                        <CircleCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">Acknowledgement recorded</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        {name && <>Thanks, <strong className="text-foreground">{name}</strong>. </>}
                        Your acknowledgement of <strong className="text-foreground">{policyTitle} {version}</strong> was captured on {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}. You can close this window.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-10 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-400 text-white flex items-center justify-center font-bold">
                        {orgName.slice(0, 1).toUpperCase()}
                    </div>
                    <div>
                        <div className="text-xs font-semibold tracking-widest uppercase text-foreground">OVERWATCH</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Acknowledgement portal · {orgName}</div>
                    </div>
                    <div className="flex-1" />
                    <span className="text-xs text-muted-foreground">Secure session · {new Date().toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </div>

                <div className="bg-card border border-border rounded-2xl shadow-xl p-6 lg:p-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-primary/40 bg-primary/10 text-primary text-[11px] font-semibold uppercase tracking-wider">
                            <MailCheck className="w-3 h-3" /> Magic link · single use
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-border bg-secondary/40 text-muted-foreground text-[11px] font-semibold uppercase tracking-wider">
                            {version} · CONFIDENTIAL
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{orgName} requires your acknowledgement</h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Please read the <strong className="text-foreground">{policyTitle} {version}</strong> in full and confirm your acknowledgement below.
                        Your name, IP, and timestamp will be stored as audit evidence.
                    </p>

                    <div
                        ref={docRef}
                        onScroll={onScroll}
                        className="mt-5 max-h-[420px] overflow-y-auto bg-white text-slate-900 rounded-xl p-6 lg:p-8 border border-slate-200"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5 text-[11px]">
                            <span className="font-semibold text-slate-700">{orgName}</span>
                            <span className="font-mono text-slate-500">{policyTitle} · {version}</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mb-1">{policyTitle}</h2>
                        <div className="font-mono text-[10px] text-slate-500 mb-5 tracking-wider">CONFIDENTIAL · {version}</div>
                        {renderMarkdown(substituted)}
                    </div>

                    <div className="mt-4 p-3 rounded-lg bg-secondary/40 border border-border flex items-center gap-3">
                        {scrolled
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            : <ArrowDownCircle className="w-4 h-4 text-muted-foreground shrink-0" />}
                        <span className="text-xs text-muted-foreground">
                            {scrolled ? "You've read the full policy. Confirm below." : "Scroll to the end of the policy to enable acknowledgement."}
                        </span>
                    </div>

                    <div className="mt-5">
                        <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Type your full name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="As it appears on official records"
                            className="w-full bg-secondary/40 border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/50"
                        />
                        <p className="text-[11px] text-muted-foreground mt-2">
                            Your name is cross-checked against your employer&apos;s roster. A typo creates an &ldquo;Unverified&rdquo; entry that an admin will need to confirm.
                        </p>
                    </div>

                    {err && <div className="mt-4 text-xs text-red-400">{err}</div>}

                    <div className="mt-5 flex justify-end gap-3">
                        <Button variant="default" disabled={!name.trim() || !scrolled || busy} onClick={submit} className="gap-2">
                            <CircleCheck className="w-4 h-4" />
                            {busy ? "Recording…" : "I have read and understood this policy"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function renderMarkdown(text: string) {
    const blocks = text.split(/\n{2,}/);
    return (
        <div className="space-y-4">
            {blocks.map((raw, i) => {
                const b = raw.trim();
                if (!b) return null;
                if (b.startsWith("## ")) return <h2 key={i} className="text-base font-bold text-slate-900 mt-5 first:mt-0">{b.slice(3)}</h2>;
                if (b.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-slate-800 mt-3">{b.slice(4)}</h3>;
                if (b.split("\n").every(l => l.startsWith("- "))) {
                    return (
                        <ul key={i} className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                            {b.split("\n").map((l, j) => <li key={j}>{l.slice(2)}</li>)}
                        </ul>
                    );
                }
                return <p key={i} className={cn("text-sm leading-relaxed text-slate-700")}>{b}</p>;
            })}
        </div>
    );
}
