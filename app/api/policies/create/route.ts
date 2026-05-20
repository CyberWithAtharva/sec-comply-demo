import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const CATEGORY_PREFIX: Record<string, string> = {
    "Governance": "GOV",
    "Access Control": "ACC",
    "Operations": "OPS",
    "Incident & BCP": "INC",
    "Data": "DAT",
    "HR": "HR",
    "Vendor": "VEN",
    "Physical": "PHY",
    "Privacy": "PRV",
};

export async function POST(req: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
    if (!membership) return NextResponse.json({ error: "No org" }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const title: string = String(body.title ?? "").trim();
    const category: string = String(body.category ?? "Governance").trim();
    const policy_type: string = String(body.policy_type ?? "Policy").trim();
    const description: string = String(body.description ?? "").trim();
    const whyNeeded: string = String(body.why_needed ?? "").trim();
    const frameworks: string[] = Array.isArray(body.frameworks) ? body.frameworks.map(String) : [];
    const controls: Record<string, string[]> = (body.controls && typeof body.controls === "object") ? body.controls : {};
    const content: string = String(body.content ?? "").trim();

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!description) return NextResponse.json({ error: "Description is required" }, { status: 400 });

    // Generate a per-org code: CUST-<CAT>-<NNN> where NNN is the next free number.
    const prefix = `CUST-${CATEGORY_PREFIX[category] ?? "GEN"}-`;
    const { data: existing } = await supabase
        .from("policies")
        .select("code")
        .eq("org_id", membership.org_id)
        .like("code", `${prefix}%`);
    const maxN = (existing ?? []).reduce((m, p) => {
        const match = p.code?.match(new RegExp(`^${prefix.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}(\\d+)$`));
        const n = match ? parseInt(match[1], 10) : 0;
        return Number.isFinite(n) && n > m ? n : m;
    }, 0);
    const code = `${prefix}${String(maxN + 1).padStart(3, "0")}`;

    // Insert the policy row at status=draft, version=v1.0
    const fullDescription = whyNeeded
        ? `${description}\n\n${whyNeeded}`
        : description;

    const { data: created, error: insertErr } = await supabase
        .from("policies")
        .insert({
            org_id: membership.org_id,
            code,
            title,
            category,
            policy_type,
            description: fullDescription,
            content: content || `## Purpose\n\n${description}\n\n## Scope\n\nApplies to all employees, contractors, and systems.\n\n## Review\n\nReviewed annually or upon significant change.`,
            frameworks_list: frameworks,
            status: "draft",
            version: "v1.0",
            owner_id: user.id,
            is_generated: false,
        })
        .select("id")
        .single();
    if (insertErr || !created) {
        return NextResponse.json({ error: insertErr?.message ?? "Insert failed" }, { status: 500 });
    }

    // Seed the initial draft version row
    await supabase.from("policy_versions").insert({
        policy_id: created.id,
        version: "v1.0",
        status: "draft",
        content: content || null,
        created_by: user.id,
        summary: "Initial draft from custom-policy wizard.",
    });

    // Insert framework controls
    const controlRows: { policy_id: string; framework: string; control_code: string; description: string | null }[] = [];
    for (const fw of frameworks) {
        const codes = controls[fw] ?? [];
        if (codes.length === 0) {
            controlRows.push({ policy_id: created.id, framework: fw, control_code: "—", description: "Add specific controls in the detail view." });
        } else {
            for (const c of codes) {
                controlRows.push({ policy_id: created.id, framework: fw, control_code: c, description: null });
            }
        }
    }
    if (controlRows.length > 0) {
        await supabase.from("policy_framework_controls").insert(controlRows);
    }

    return NextResponse.json({ ok: true, id: created.id, code });
}
