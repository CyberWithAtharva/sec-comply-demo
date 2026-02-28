import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Octokit } from "@octokit/rest";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { org_id, github_org, access_token } = body;

        if (!org_id || !github_org || !access_token) {
            return NextResponse.json(
                { error: "org_id, github_org, and access_token are required" },
                { status: 400 }
            );
        }

        // Verify the token works before storing it
        const octokit = new Octokit({ auth: access_token });
        try {
            await octokit.users.getAuthenticated();
        } catch {
            return NextResponse.json(
                { error: "Invalid GitHub token — make sure it has repo, security_events and read:org scopes" },
                { status: 400 }
            );
        }

        // Use a timestamp-based bigint as installation_id for PAT connections
        const patInstallationId = Date.now();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase.from("github_installations") as any)
            .insert({
                org_id,
                installation_id: patInstallationId,
                github_org: github_org.trim(),
                access_token,
                status: "active",
            })
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        // Return without the token in the response
        const { access_token: _tok, ...safe } = data;
        void _tok;
        return NextResponse.json({ installation: safe });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Connection failed";
        return NextResponse.json({ error: msg }, { status: 400 });
    }
}
