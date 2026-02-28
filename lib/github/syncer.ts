import { Octokit } from "@octokit/rest";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GitHubFindingResult {
    type: "secret" | "code_scan" | "dependabot";
    severity: string;
    repository: string;
    title: string;
    details: Record<string, unknown>;
    state: string;
    external_id: string;
}

export interface GitHubRepoResult {
    repo_name: string;
    repo_id: number;
    private: boolean;
    default_branch: string;
    settings: Record<string, unknown>;
    compliance_issues: Record<string, unknown>;
}

export interface OrgSecuritySettings {
    // Org profile
    two_factor_required: boolean;
    default_repo_permission: string;
    members_can_create_public_repos: boolean;
    members_can_fork_private: boolean;
    // Actions
    actions_enabled: string | null;      // "all" | "selected" | "none"
    actions_allowed: string | null;      // "all" | "local_only" | "selected"
    // Collaborators & members (best-effort — needs admin:org scope)
    outside_collaborators: number | null;
    members_without_2fa: number | null;
    // Org plan
    plan: string | null;
    public_repos: number;
    private_repos: number;
    // Computed issues list for UI display
    issues: { label: string; severity: "critical" | "high" | "medium" | "low" }[];
}

export interface SyncResult {
    findings: GitHubFindingResult[];
    repos: GitHubRepoResult[];
    orgSettings: OrgSecuritySettings;
}

// ─── Syncer ───────────────────────────────────────────────────────────────────

export async function syncGitHubInstallation(
    accessToken: string,
    githubOrg: string
): Promise<SyncResult> {
    const octokit = new Octokit({ auth: accessToken });
    const findings: GitHubFindingResult[] = [];
    const repos: GitHubRepoResult[] = [];

    // ── Org-level security settings ───────────────────────────────────────────
    const orgSettings: OrgSecuritySettings = {
        two_factor_required: false,
        default_repo_permission: "unknown",
        members_can_create_public_repos: true,
        members_can_fork_private: true,
        actions_enabled: null,
        actions_allowed: null,
        outside_collaborators: null,
        members_without_2fa: null,
        plan: null,
        public_repos: 0,
        private_repos: 0,
        issues: [],
    };

    try {
        const orgRes = await octokit.orgs.get({ org: githubOrg });
        const org = orgRes.data;
        orgSettings.two_factor_required = org.two_factor_requirement_enabled ?? false;
        orgSettings.default_repo_permission = org.default_repository_permission ?? "read";
        orgSettings.members_can_create_public_repos = org.members_can_create_public_repositories ?? true;
        orgSettings.members_can_fork_private = (org as Record<string, unknown>).members_can_fork_private_repositories as boolean ?? true;
        orgSettings.plan = org.plan?.name ?? null;
        orgSettings.public_repos = org.public_repos ?? 0;
        orgSettings.private_repos = (org as Record<string, unknown>).owned_private_repos as number ?? 0;
    } catch { /* personal account or insufficient scope */ }

    // Actions permissions (requires admin:org or read:org)
    try {
        const actRes = await octokit.actions.getGithubActionsPermissionsOrganization({ org: githubOrg });
        orgSettings.actions_enabled = actRes.data.enabled_repositories;
        orgSettings.actions_allowed = actRes.data.allowed_actions ?? null;
    } catch { /* insufficient scope */ }

    // Outside collaborators count (requires admin:org)
    try {
        const collabRes = await octokit.orgs.listOutsideCollaborators({ org: githubOrg, per_page: 100 });
        orgSettings.outside_collaborators = collabRes.data.length;
    } catch { /* insufficient scope */ }

    // Members without 2FA (requires admin:org and 2FA enforcement to be off to have non-compliant members)
    try {
        const no2FA = await octokit.orgs.listMembers({ org: githubOrg, filter: "2fa_disabled" as "2fa_disabled", per_page: 100 });
        orgSettings.members_without_2fa = no2FA.data.length;
    } catch { /* insufficient scope */ }

    // Build issue list from org settings
    if (!orgSettings.two_factor_required) {
        orgSettings.issues.push({ label: "2FA not enforced org-wide", severity: "high" });
    }
    if (orgSettings.members_without_2fa && orgSettings.members_without_2fa > 0) {
        orgSettings.issues.push({
            label: `${orgSettings.members_without_2fa} member${orgSettings.members_without_2fa > 1 ? "s" : ""} without 2FA`,
            severity: "critical",
        });
    }
    if (orgSettings.default_repo_permission === "write" || orgSettings.default_repo_permission === "admin") {
        orgSettings.issues.push({ label: `Default member permission is "${orgSettings.default_repo_permission}" (should be read or none)`, severity: "high" });
    }
    if (orgSettings.members_can_fork_private) {
        orgSettings.issues.push({ label: "Members can fork private repositories", severity: "medium" });
    }
    if (orgSettings.actions_allowed === "all") {
        orgSettings.issues.push({ label: "GitHub Actions allows all third-party actions (no allowlist)", severity: "medium" });
    }
    if (orgSettings.outside_collaborators && orgSettings.outside_collaborators > 0) {
        orgSettings.issues.push({
            label: `${orgSettings.outside_collaborators} outside collaborator${orgSettings.outside_collaborators > 1 ? "s" : ""} with repo access`,
            severity: "low",
        });
    }

    // ── Fetch repos ───────────────────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allRepos: any[] = [];
    try {
        const reposRes = await octokit.repos.listForOrg({ org: githubOrg, per_page: 100, type: "all" });
        allRepos = reposRes.data;
    } catch {
        // Fallback: try as a personal account
        const reposRes = await octokit.repos.listForAuthenticatedUser({ per_page: 100 });
        allRepos = reposRes.data;
    }

    for (const repo of allRepos) {
        const [owner, repoName] = repo.full_name.split("/");
        const complianceIssues: Record<string, string> = {};
        const secAnalysis = repo.security_and_analysis ?? {};

        const settings: Record<string, unknown> = {
            private: repo.private,
            default_branch: repo.default_branch,
            archived: repo.archived ?? false,
            fork: repo.fork ?? false,
            // Security feature status from repo metadata
            dependabot_alerts: repo.security_and_analysis == null ? null
                : (secAnalysis.dependabot_security_updates?.status === "enabled"),
            secret_scanning: secAnalysis.secret_scanning?.status === "enabled",
            secret_scanning_push_protection: secAnalysis.secret_scanning_push_protection?.status === "enabled",
        };

        // Skip archived repos for most checks
        if (!repo.archived) {
            // ── Branch protection ──
            try {
                const bp = await octokit.repos.getBranchProtection({
                    owner, repo: repoName, branch: repo.default_branch,
                });
                settings.branch_protection = {
                    enabled: true,
                    required_reviews: bp.data.required_pull_request_reviews?.required_approving_review_count ?? 0,
                    dismiss_stale: bp.data.required_pull_request_reviews?.dismiss_stale_reviews ?? false,
                    signed_commits: bp.data.required_signatures?.enabled ?? false,
                    required_status_checks: (bp.data.required_status_checks?.contexts ?? []).length > 0,
                    enforce_admins: bp.data.enforce_admins?.enabled ?? false,
                };
                const reviews = bp.data.required_pull_request_reviews?.required_approving_review_count ?? 0;
                if (reviews < 1) complianceIssues["CC8.1"] = "No required PR reviews on default branch";
            } catch {
                settings.branch_protection = { enabled: false };
                complianceIssues["CC8.1"] = "No branch protection on default branch";
            }

            // ── Secret scanning push protection ──
            if (settings.secret_scanning === false && !repo.private === false) {
                complianceIssues["CC6.7"] = "Secret scanning not enabled";
            }
            if (settings.secret_scanning_push_protection === false) {
                complianceIssues["CC6.7b"] = "Secret scanning push protection not enabled";
            }

            // ── Public repo flag ──
            if (!repo.private) {
                complianceIssues["CC6.6"] = "Repository is public";
            }
        }

        // ── Dependabot alerts ──
        try {
            const depRes = await octokit.rest.dependabot.listAlertsForRepo({
                owner, repo: repoName, state: "open", per_page: 50,
            });
            for (const alert of depRes.data) {
                findings.push({
                    type: "dependabot",
                    severity: (alert.security_advisory?.severity as string) ?? "medium",
                    repository: repo.full_name,
                    title: `Dependabot: ${alert.security_advisory?.summary ?? alert.dependency?.package?.name ?? "Dependency vulnerability"}`,
                    details: {
                        cve_id: alert.security_advisory?.cve_id,
                        package: alert.dependency?.package?.name,
                        ecosystem: alert.dependency?.package?.ecosystem,
                        severity_score: (alert.security_vulnerability as Record<string, unknown>)?.severity,
                        patched_version: alert.security_advisory?.references?.[0]?.url,
                        url: alert.html_url,
                    },
                    state: alert.state ?? "open",
                    external_id: `dep-${repo.full_name}-${alert.number}`,
                });
            }
        } catch { /* Dependabot may not be enabled or token lacks scope */ }

        // ── Secret scanning alerts ──
        try {
            const secretsRes = await octokit.rest.secretScanning.listAlertsForRepo({
                owner, repo: repoName, state: "open", per_page: 50,
            });
            for (const alert of secretsRes.data) {
                findings.push({
                    type: "secret",
                    severity: "critical",
                    repository: repo.full_name,
                    title: `Secret detected: ${alert.secret_type_display_name ?? alert.secret_type ?? "Unknown secret"}`,
                    details: {
                        secret_type: alert.secret_type,
                        created_at: alert.created_at,
                        html_url: alert.html_url,
                        resolution: alert.resolution,
                    },
                    state: alert.state ?? "open",
                    external_id: `secret-${repo.full_name}-${alert.number}`,
                });
            }
        } catch { /* Secret scanning may not be enabled */ }

        // ── Code scanning alerts ──
        try {
            const codeRes = await octokit.rest.codeScanning.listAlertsForRepo({
                owner, repo: repoName, state: "open", per_page: 50,
            });
            for (const alert of codeRes.data) {
                findings.push({
                    type: "code_scan",
                    severity: (alert.rule?.security_severity_level as string) ?? "medium",
                    repository: repo.full_name,
                    title: `Code scan: ${alert.rule?.description ?? alert.rule?.id ?? "Code vulnerability"}`,
                    details: {
                        rule_id: alert.rule?.id,
                        rule_name: alert.rule?.name,
                        tool: alert.tool?.name,
                        html_url: alert.html_url,
                    },
                    state: alert.state ?? "open",
                    external_id: `code-${repo.full_name}-${alert.number}`,
                });
            }
        } catch { /* Code scanning may not be configured */ }

        repos.push({
            repo_name: repo.full_name,
            repo_id: repo.id,
            private: repo.private,
            default_branch: repo.default_branch,
            settings,
            compliance_issues: complianceIssues,
        });
    }

    return { findings, repos, orgSettings };
}
