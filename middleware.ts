import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    // Refresh session — keeps cookies alive on every request
    const { data: { user } } = await supabase.auth.getUser();

    const { pathname } = request.nextUrl;

    // Public paths that don't require auth
    const isPublicPath =
        pathname === "/login" ||
        pathname.startsWith("/auth/") ||       // email confirm, set-password
        pathname.startsWith("/q/") ||          // vendor questionnaire public token URLs
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/api/integrations/github/callback") ||
        pathname === "/favicon.ico";

    if (isPublicPath) {
        // If logged-in user hits /login, redirect them home
        if (user && pathname === "/login") {
            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            const dest = profile?.role === "admin" ? "/admin" : "/";
            return NextResponse.redirect(new URL(dest, request.url));
        }
        return supabaseResponse;
    }

    // Not logged in — redirect to login
    if (!user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Only fetch role when navigating to routes that require the role check:
    //   - /admin/* — to block non-admins
    //   - /       — to redirect admins to /admin
    // All other routes skip the DB query entirely.
    const needsRoleCheck = pathname === "/" || pathname.startsWith("/admin");

    if (needsRoleCheck) {
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        const isAdmin = profile?.role === "admin";

        if (pathname.startsWith("/admin") && !isAdmin) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        if (pathname === "/" && isAdmin) {
            return NextResponse.redirect(new URL("/admin", request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
