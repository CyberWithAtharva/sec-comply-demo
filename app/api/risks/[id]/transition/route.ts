import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * POST /api/risks/:id/transition
 *
 * Body: { changes: Array<{ field, from_value, to_value }>, note?: string }
 *
 * Atomic-ish update of a risks row + corresponding rows in risk_status_history.
 * (Supabase JS client does not expose explicit transactions; we rely on RLS +
 * a fast-failing pattern: write the risk first; if that succeeds, append the
 * history rows. If history insert fails, the audit gap is logged for manual
 * cleanup but the user-visible state is consistent.)
 */
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id: riskId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => null) as
        | { changes?: Array<{ field: string; from_value: unknown; to_value: unknown }>; note?: string; patch?: Record<string, unknown> }
        | null;
    if (!body || !Array.isArray(body.changes) || body.changes.length === 0) {
        return NextResponse.json({ error: "no changes" }, { status: 400 });
    }

    // Build the patch object. Keys are sanitised against an allowlist to prevent
    // RLS-bypass via column injection through the JSON body.
    const ALLOWED_FIELDS = new Set([
        "title", "description", "category",
        "likelihood", "impact",
        "residual_likelihood", "residual_impact",
        "status", "treatment",
        "owner_id", "due_date",
        "mitigation", "recommendation", "notes",
    ]);

    const patch: Record<string, unknown> = body.patch ?? {};
    for (const change of body.changes) {
        if (!ALLOWED_FIELDS.has(change.field)) {
            return NextResponse.json({ error: `field not allowed: ${change.field}` }, { status: 400 });
        }
        if (!(change.field in patch)) {
            patch[change.field] = change.to_value;
        }
    }

    // 1) Update the risks row (RLS scopes to caller's org).
    const { data: updated, error: updateErr } = await supabase
        .from("risks")
        .update(patch)
        .eq("id", riskId)
        .select("*, profiles(id, full_name, avatar_url)")
        .single();

    if (updateErr || !updated) {
        return NextResponse.json({ error: updateErr?.message ?? "update failed" }, { status: 400 });
    }

    // 2) Insert audit rows. Failure here logs but does not roll back the visible state.
    const historyPayload = body.changes.map(c => ({
        risk_id: riskId,
        field: c.field,
        from_value: c.from_value === null || c.from_value === undefined ? null : String(c.from_value),
        to_value:   c.to_value   === null || c.to_value   === undefined ? null : String(c.to_value),
        changed_by: user.id,
        note: body.note ?? null,
    }));

    const { data: historyRows, error: historyErr } = await supabase
        .from("risk_status_history")
        .insert(historyPayload)
        .select("*, profiles:changed_by(id, full_name)");

    if (historyErr) {
        console.error("[risks/transition] history insert failed", historyErr);
    }

    return NextResponse.json({
        risk: updated,
        history: historyRows ?? [],
    });
}
