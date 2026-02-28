import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncGitHubInstallation } from "@/lib/github/syncer";

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { installation_id } = await req.json();
        if (!installation_id) return NextResponse.json({ error: "installation_id required" }, { status: 400 });

        // Fetch the installation record
        const { data: installation, error: instErr } = await supabase
            .from("github_installations")
            .select("*")
            .eq("id", installation_id)
            .single();

        if (instErr || !installation) return NextResponse.json({ error: "Installation not found" }, { status: 404 });

        // Resolve auth token — PAT takes priority over GitHub App
        let token: string;
        if (installation.access_token) {
            token = installation.access_token;
        } else {
            const { App } = await import("@octokit/app");
            const appId = process.env.GITHUB_APP_ID;
            const privateKey = process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n");

            if (!appId || !privateKey) {
                return NextResponse.json(
                    { error: "GitHub App not configured and no PAT stored" },
                    { status: 500 }
                );
            }

            const app = new App({ appId, privateKey });
            const octokit = await app.getInstallationOctokit(installation.installation_id);
            token = (await octokit.auth({ type: "installation" }) as { token: string }).token;
        }

        // Run sync
        const { findings, repos, orgSettings } = await syncGitHubInstallation(token, installation.github_org);

        // Upsert repos
        if (repos.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from("github_repos") as any).upsert(
                repos.map(r => ({
                    installation_id,
                    repo_name: r.repo_name,
                    repo_id: r.repo_id,
                    private: r.private,
                    default_branch: r.default_branch,
                    settings: r.settings,
                    compliance_issues: r.compliance_issues,
                    updated_at: new Date().toISOString(),
                })),
                { onConflict: "installation_id, repo_id" }
            );
        }

        // Upsert findings
        if (findings.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from("github_findings") as any).upsert(
                findings.map(f => ({
                    installation_id,
                    type: f.type,
                    severity: f.severity,
                    repository: f.repository,
                    title: f.title,
                    details: f.details,
                    state: f.state,
                    external_id: f.external_id,
                    updated_at: new Date().toISOString(),
                })),
                { onConflict: "installation_id, external_id" }
            );
        }

        // Update last_sync + persist org_settings
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("github_installations") as any)
            .update({ last_sync: new Date().toISOString(), status: "active", org_settings: orgSettings })
            .eq("id", installation_id);

        // Return findings + org settings directly (bypass RLS re-query)
        return NextResponse.json({
            success: true,
            repos_synced: repos.length,
            findings_found: findings.length,
            org_settings: orgSettings,
            repos: repos.map(r => ({
                id: `${installation_id}:${r.repo_id}`,
                installation_id,
                repo_name: r.repo_name,
                repo_id: r.repo_id,
                private: r.private,
                default_branch: r.default_branch,
                settings: r.settings,
                compliance_issues: r.compliance_issues,
                updated_at: new Date().toISOString(),
            })),
            findings: findings.map(f => ({
                id: f.external_id,
                installation_id,
                type: f.type,
                severity: f.severity,
                repository: f.repository,
                title: f.title,
                details: f.details,
                state: f.state,
                external_id: f.external_id,
                updated_at: new Date().toISOString(),
            })),
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Sync failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
