import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runFullScan } from "@/lib/aws/scanner";
import { getControlsForRule } from "@/lib/aws/controlMapping";

// AWS scan hits IAM, CloudTrail, EC2, S3 across multiple regions — needs extended timeout
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { account_id } = await req.json();
        if (!account_id) return NextResponse.json({ error: "account_id required" }, { status: 400 });

        // Fetch the AWS account record
        const { data: account, error: accErr } = await supabase
            .from("aws_accounts")
            .select("*")
            .eq("id", account_id)
            .single();

        if (accErr || !account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        // Run scan
        const { assets, findings } = await runFullScan(
            account.role_arn,
            account.external_id,
            account.regions ?? ["us-east-1"]
        );

        // Upsert assets
        if (assets.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from("assets") as any).upsert(
                assets.map(a => ({
                    org_id: account.org_id,
                    name: a.name,
                    type: a.type,
                    provider: "aws",
                    external_id: a.external_id,
                    region: a.region,
                    metadata: a.metadata,
                    last_seen: new Date().toISOString(),
                })),
                { onConflict: "org_id, external_id" }
            );
        }

        // Upsert findings — conflict key matches the UNIQUE(aws_account_id, rule_id, resource_arn) constraint
        if (findings.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from("aws_findings") as any).upsert(
                findings.map(f => ({
                    aws_account_id: account_id,
                    rule_id: f.rule_id,
                    title: f.title,
                    resource_arn: f.resource_arn,
                    resource_type: f.resource_type,
                    resource_id: f.resource_id,
                    // DB CHECK constraint requires uppercase severity
                    severity: f.severity.toUpperCase(),
                    status: f.status.toUpperCase(),
                    details: f.details,
                    first_seen: new Date().toISOString(),
                    last_seen: new Date().toISOString(),
                })),
                { onConflict: "aws_account_id, rule_id, resource_arn" }
            );
        }

        // ── Auto-create/close risks + update control_status from findings ────────
        if (findings.length > 0) {
            // Get org's frameworks and their controls for control_status updates
            const { data: orgFrameworks } = await supabase
                .from("org_frameworks")
                .select("framework_id")
                .eq("org_id", account.org_id);

            if (orgFrameworks && orgFrameworks.length > 0) {
                const frameworkIds = orgFrameworks.map(f => f.framework_id);

                // Build a map: control_id text → control UUID
                const { data: allControls } = await supabase
                    .from("controls")
                    .select("id, control_id")
                    .in("framework_id", frameworkIds);

                const controlTextToId = new Map(
                    (allControls ?? []).map(c => [c.control_id, c.id])
                );

                // Process each finding
                for (const finding of findings) {
                    const affectedControlTexts = getControlsForRule(finding.rule_id);

                    // Update control statuses for affected controls
                    for (const controlText of affectedControlTexts) {
                        const controlUUID = controlTextToId.get(controlText);
                        if (!controlUUID) continue;

                        if (finding.status === "ACTIVE") {
                            // Move not_started → in_progress
                            await supabase
                                .from("control_status")
                                .upsert({
                                    org_id: account.org_id,
                                    control_id: controlUUID,
                                    status: "in_progress",
                                    last_updated: new Date().toISOString(),
                                }, { onConflict: "org_id, control_id" })
                                // Only update if not already verified
                                .filter("status", "neq", "verified");
                        }
                    }

                    // Auto-create risk for HIGH/CRITICAL active findings
                    if (finding.status === "ACTIVE" && ["high", "critical"].includes(finding.severity.toLowerCase())) {
                        const sourceRef = `${finding.rule_id}:${finding.resource_id ?? finding.resource_arn ?? "unknown"}`;

                        const { data: existingRisk } = await supabase
                            .from("risks")
                            .select("id")
                            .eq("org_id", account.org_id)
                            .eq("source", "aws")
                            .eq("source_ref", sourceRef)
                            .maybeSingle();

                        if (!existingRisk) {
                            await supabase.from("risks").insert({
                                org_id: account.org_id,
                                title: finding.title,
                                category: "technical",
                                description: `AWS finding [${finding.rule_id}] on ${finding.resource_type ?? "resource"}: ${finding.resource_arn ?? finding.resource_id ?? ""}`,
                                likelihood: finding.severity.toLowerCase() === "critical" ? 5 : 4,
                                impact: finding.severity.toLowerCase() === "critical" ? 5 : 4,
                                status: "identified",
                                source: "aws",
                                source_ref: sourceRef,
                            });
                        }
                    }

                    // Auto-close risks when finding is resolved
                    if (finding.status === "RESOLVED") {
                        const sourceRef = `${finding.rule_id}:${finding.resource_id ?? finding.resource_arn ?? "unknown"}`;
                        await supabase
                            .from("risks")
                            .update({ status: "closed", updated_at: new Date().toISOString() })
                            .eq("org_id", account.org_id)
                            .eq("source", "aws")
                            .eq("source_ref", sourceRef)
                            .not("status", "in", '("closed","accepted")');
                    }
                }
            }
        }

        // Update last_scan timestamp
        await supabase
            .from("aws_accounts")
            .update({ last_scan: new Date().toISOString(), status: "active" })
            .eq("id", account_id);

        // Build the response findings from scan results directly (no RLS re-query needed)
        const now = new Date().toISOString();
        const responseFindings = findings.map(f => ({
            id: `${account_id}:${f.rule_id}:${f.resource_id ?? f.resource_arn ?? "unknown"}`,
            aws_account_id: account_id,
            rule_id: f.rule_id,
            title: f.title,
            resource_arn: f.resource_arn,
            resource_type: f.resource_type,
            resource_id: f.resource_id,
            severity: f.severity.toUpperCase(),
            status: f.status.toUpperCase(),
            details: f.details,
            first_seen: now,
            last_seen: now,
        }));

        return NextResponse.json({
            success: true,
            assets_found: assets.length,
            findings_found: findings.length,
            findings: responseFindings,
        });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Scan failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
