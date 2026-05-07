import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/guard";
import { BULK_LIMIT, dedupeByCode, type BulkControlMode } from "@/lib/admin/catalog";

type IncomingRow = {
    code?: unknown;
    name?: unknown;
    description?: unknown;
    domain?: unknown;
    sort_order?: unknown;
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    const guard = await requireAdmin();
    if (!guard.ok) return guard.response;
    const { supabase } = guard;

    const { id: frameworkId } = await ctx.params;

    let body: { controls?: IncomingRow[]; mode?: BulkControlMode };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const rows = body.controls;
    const mode: BulkControlMode = body.mode === "upsert" ? "upsert" : "skip";
    if (!Array.isArray(rows)) {
        return NextResponse.json({ error: "controls must be an array" }, { status: 400 });
    }
    if (rows.length === 0) {
        return NextResponse.json({ data: { created: 0, updated: 0, skipped: 0 } }, { status: 201 });
    }
    if (rows.length > BULK_LIMIT) {
        return NextResponse.json({ error: `Bulk upload is capped at ${BULK_LIMIT} rows` }, { status: 400 });
    }

    const { data: fw } = await supabase.from("frameworks").select("id, slug").eq("id", frameworkId).maybeSingle();
    if (!fw) return NextResponse.json({ error: "Framework not found" }, { status: 404 });

    // Validate every row
    const cleaned: Array<{
        code: string;
        title: string;
        description: string | null;
        domain: string | null;
        sort_order: number;
    }> = [];
    for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const code = typeof r.code === "string" ? r.code.trim() : "";
        const name = typeof r.name === "string" ? r.name.trim() : "";
        if (!code) return NextResponse.json({ error: `Row ${i + 1}: code is required` }, { status: 400 });
        if (!name) return NextResponse.json({ error: `Row ${i + 1}: name is required` }, { status: 400 });
        const sortNum =
            typeof r.sort_order === "number" && Number.isFinite(r.sort_order)
                ? Math.trunc(r.sort_order)
                : typeof r.sort_order === "string" && r.sort_order.trim() !== "" && Number.isFinite(Number(r.sort_order))
                  ? Math.trunc(Number(r.sort_order))
                  : 0;
        cleaned.push({
            code,
            title: name,
            description: typeof r.description === "string" && r.description.trim() ? r.description.trim() : null,
            domain: typeof r.domain === "string" && r.domain.trim() ? r.domain.trim() : null,
            sort_order: sortNum,
        });
    }

    // Last-wins dedupe on code so the upsert never sees the same conflict key twice
    const deduped = dedupeByCode(cleaned.map(c => ({ ...c, code: c.code })));

    // Find which codes already exist in this framework
    const codes = deduped.map(d => d.code);
    const { data: existingRows } = await supabase
        .from("controls")
        .select("control_id")
        .eq("framework_id", frameworkId)
        .in("control_id", codes);
    const existingSet = new Set((existingRows ?? []).map(r => r.control_id));

    const now = new Date().toISOString();

    if (mode === "skip") {
        const toInsert = deduped
            .filter(d => !existingSet.has(d.code))
            .map(d => ({
                framework_id: frameworkId,
                control_id: d.code,
                title: d.title,
                description: d.description,
                domain: d.domain,
                sort_order: d.sort_order,
                updated_at: now,
            }));
        const skipped = deduped.length - toInsert.length;
        if (toInsert.length === 0) {
            console.log(`[catalog] bulk_import (skip) on framework "${fw.slug}": 0 created, ${skipped} skipped`);
            return NextResponse.json({ data: { created: 0, updated: 0, skipped } }, { status: 201 });
        }
        const { error } = await supabase.from("controls").insert(toInsert);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        console.log(`[catalog] bulk_import (skip) on framework "${fw.slug}": ${toInsert.length} created, ${skipped} skipped`);
        return NextResponse.json(
            { data: { created: toInsert.length, updated: 0, skipped } },
            { status: 201 }
        );
    }

    // mode === 'upsert'
    const payload = deduped.map(d => ({
        framework_id: frameworkId,
        control_id: d.code,
        title: d.title,
        description: d.description,
        domain: d.domain,
        sort_order: d.sort_order,
        updated_at: now,
    }));

    const { error } = await supabase
        .from("controls")
        .upsert(payload, { onConflict: "framework_id,control_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const updated = payload.filter(p => existingSet.has(p.control_id)).length;
    const created = payload.length - updated;
    console.log(`[catalog] bulk_import (upsert) on framework "${fw.slug}": ${created} created, ${updated} updated`);
    return NextResponse.json(
        { data: { created, updated, skipped: 0 } },
        { status: 201 }
    );
}
