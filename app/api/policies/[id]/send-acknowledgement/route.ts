import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "node:crypto";

export const runtime = "nodejs";

interface RecipientIn { name?: string | null; email: string }

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const recipientsIn: RecipientIn[] = Array.isArray(body.recipients) ? body.recipients : [];
    const clean = recipientsIn
        .map(r => ({ email: String(r.email ?? "").trim().toLowerCase(), name: r.name ? String(r.name).trim() : null }))
        .filter(r => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email));
    if (clean.length === 0) return NextResponse.json({ error: "No valid recipients" }, { status: 400 });

    const { data: policy } = await supabase
        .from("policies")
        .select("id, version, status")
        .eq("id", id)
        .single();
    if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (policy.status !== "active" && policy.status !== "approved") {
        return NextResponse.json({ error: "Only active policies can be sent for acknowledgement" }, { status: 400 });
    }

    const { data: activeVer } = await supabase
        .from("policy_versions")
        .select("id")
        .eq("policy_id", id)
        .eq("status", "active")
        .maybeSingle();

    const rows = clean.map(r => ({
        policy_id: id,
        version_id: activeVer?.id ?? null,
        policy_version_label: policy.version,
        email: r.email,
        name: r.name,
        token: crypto.randomBytes(24).toString("hex"),
        sent_by: user.id,
    }));

    const { data: inserted, error } = await supabase
        .from("policy_ack_recipients")
        .insert(rows)
        .select("email, token");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const origin = req.headers.get("origin") ?? req.headers.get("x-forwarded-host")
        ? `https://${req.headers.get("x-forwarded-host")}`
        : "";
    const magicLinks = (inserted ?? []).map(r => ({
        email: r.email,
        url: `${origin}/policies/ack/${r.token}`,
    }));

    return NextResponse.json({ ok: true, count: rows.length, magicLinks });
}
