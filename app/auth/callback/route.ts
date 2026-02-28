import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Supabase redirects here after email invite / confirmation / password reset
// Works for both ?token_hash=... (PKCE) and ?code=... (OAuth code exchange)
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const code = searchParams.get("code");
    const type = searchParams.get("type") as "invite" | "signup" | "recovery" | "email_change" | null;

    const supabase = await createClient();

    // PKCE flow — token_hash + type
    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ token_hash, type });
        if (error) {
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
        }
        if (type === "invite" || type === "recovery") {
            return NextResponse.redirect(new URL("/auth/set-password", request.url));
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    // OAuth / magic link code exchange
    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url));
        }
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.redirect(new URL("/login?error=invalid_link", request.url));
}
