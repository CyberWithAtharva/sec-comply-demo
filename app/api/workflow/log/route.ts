import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

/**
 * POST /api/workflow/log
 *
 * Body: { process_id: string, payload: Record<string, unknown>, result?: string, occurred_at?: string }
 *
 * The QMS "logging is auto-collection" write-through:
 *   1) insert a qms_log_entries row (the structured record), then
 *   2) insert an evidence_artifacts row (source='workflow_log') against the
 *      process's mapped clause control, and
 *   3) advance that control's status toward in_progress + bump evidence_count.
 *
 * Supabase JS has no explicit transactions; we write in order and tolerate a
 * downstream failure (the log entry is the source of truth — evidence/status
 * are derived and can be reconciled).
 */
export async function POST(req: NextRequest) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();

    if (!membership) return NextResponse.json({ error: "no org" }, { status: 403 });
    const orgId = membership.org_id;

    const body = await req.json().catch(() => null) as
        | { process_id?: string; payload?: Record<string, unknown>; result?: string | null; occurred_at?: string }
        | null;

    if (!body?.process_id || typeof body.payload !== "object" || body.payload === null) {
        return NextResponse.json({ error: "process_id and payload are required" }, { status: 400 });
    }

    // Resolve the process to get its mapped control + display info.
    const { data: process, error: procErr } = await supabase
        .from("qms_processes")
        .select("id, key, name, clause, control_id")
        .eq("id", body.process_id)
        .single();

    if (procErr || !process) {
        return NextResponse.json({ error: "unknown process" }, { status: 400 });
    }

    // 1) Insert the structured log entry.
    const { data: entry, error: entryErr } = await supabase
        .from("qms_log_entries")
        .insert({
            org_id: orgId,
            process_id: process.id,
            logged_by: user.id,
            payload: body.payload as Json,
            result: body.result ?? null,
            occurred_at: body.occurred_at || new Date().toISOString(),
        })
        .select("*, profiles:logged_by(id, full_name, avatar_url)")
        .single();

    if (entryErr || !entry) {
        return NextResponse.json({ error: entryErr?.message ?? "log failed" }, { status: 400 });
    }

    // 2) Write-through evidence (only when the process maps to a control).
    let evidence = null;
    if (process.control_id) {
        const summary = summarize(body.payload);
        const { data: ev, error: evErr } = await supabase
            .from("evidence_artifacts")
            .insert({
                org_id: orgId,
                control_id: process.control_id,
                name: `${process.name} — ${summary.title}`,
                description: summary.body,
                uploaded_by: user.id,
                status: "active",
                source: "workflow_log",
            })
            .select("id")
            .single();
        if (evErr) console.error("[workflow/log] evidence insert failed", evErr);
        else evidence = ev;

        // 3) Advance the control status + evidence count for this org/control.
        await advanceControlStatus(supabase, orgId, process.control_id, user.id);
    }

    return NextResponse.json({ entry, evidence });
}

/** Build a short title + body from a free-form structured payload. */
function summarize(payload: Record<string, unknown>): { title: string; body: string } {
    const parts = Object.entries(payload)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
    const first = parts[0] ?? "record";
    return { title: first.length > 60 ? first.slice(0, 57) + "…" : first, body: parts.join("\n") };
}

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * Move a control toward in_progress and increment its evidence count, without
 * downgrading an already-verified/N-A control. control_status is unique on
 * (org_id, control_id).
 */
async function advanceControlStatus(
    supabase: SupabaseServer,
    orgId: string,
    controlId: string,
    userId: string,
) {
    const { data: existing } = await supabase
        .from("control_status")
        .select("id, status, evidence_count")
        .eq("org_id", orgId)
        .eq("control_id", controlId)
        .maybeSingle();

    if (existing) {
        const keep = existing.status === "verified" || existing.status === "not_applicable";
        const { error } = await supabase
            .from("control_status")
            .update({
                status: keep ? existing.status : "in_progress",
                evidence_count: (existing.evidence_count ?? 0) + 1,
            })
            .eq("id", existing.id);
        if (error) console.error("[workflow/log] control_status update failed", error);
    } else {
        const { error } = await supabase
            .from("control_status")
            .insert({
                org_id: orgId,
                control_id: controlId,
                status: "in_progress",
                evidence_count: 1,
                updated_by: userId,
            });
        if (error) console.error("[workflow/log] control_status insert failed", error);
    }
}
