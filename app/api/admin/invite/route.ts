import { NextRequest, NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Only admins can invite
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { email, orgId, role } = await req.json();
    if (!email || !orgId) return NextResponse.json({ error: "email and orgId are required" }, { status: 400 });

    const serviceClient = await createServiceClient();

    // Invite user via Supabase Auth (sends magic link / invite email)
    const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
        data: { invited_org_id: orgId, invited_role: role ?? "member" },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/accept-invite`,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    // Pre-create org_member entry (will be confirmed when user accepts invite)
    const { error: memberError } = await serviceClient
        .from("organization_members")
        .upsert({ user_id: data.user.id, org_id: orgId, role: role ?? "member", invited_by: user.id })
        .select();

    if (memberError) {
        // Non-fatal — user can still accept the invite and be added later
        console.error("org_member pre-create error:", memberError.message);
    }

    return NextResponse.json({ success: true });
}
