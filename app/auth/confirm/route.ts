import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as "invite" | "signup" | "recovery" | "email_change" | null;
    const next = searchParams.get("next") ?? "/";

    if (!token_hash || !type) {
        return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
    }

    // Invited users have no password yet — send them to set one
    if (type === "invite" || type === "recovery") {
        return NextResponse.redirect(new URL("/auth/set-password", request.url));
    }

    // Email confirmation / email change — go to the app
    return NextResponse.redirect(new URL(next, request.url));
}
