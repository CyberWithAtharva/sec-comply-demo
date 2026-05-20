import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const supabase = await createClient();

    const body = await req.json().catch(() => ({}));
    const submittedName = String(body.name ?? "").trim();
    if (!submittedName) return NextResponse.json({ error: "Name required" }, { status: 400 });

    const { data: recipient } = await supabase
        .from("policy_ack_recipients")
        .select("id, status, name, expires_at")
        .eq("token", token)
        .maybeSingle();
    if (!recipient) return NextResponse.json({ error: "Invalid link" }, { status: 404 });

    if (recipient.status === "acknowledged") {
        return NextResponse.json({ error: "Already acknowledged" }, { status: 400 });
    }
    if (new Date(recipient.expires_at) < new Date()) {
        await supabase.from("policy_ack_recipients").update({ status: "expired" }).eq("id", recipient.id);
        return NextResponse.json({ error: "Link expired" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? null;
    const userAgent = req.headers.get("user-agent") ?? null;

    const matchStatus = recipient.name
        && submittedName.toLowerCase() === recipient.name.toLowerCase()
        ? "matched" : "unverified";

    const { error } = await supabase
        .from("policy_ack_recipients")
        .update({
            status: "acknowledged",
            submitted_name: submittedName,
            match_status: matchStatus,
            ip_address: ip,
            user_agent: userAgent,
            acknowledged_at: new Date().toISOString(),
        })
        .eq("id", recipient.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true, matchStatus });
}
