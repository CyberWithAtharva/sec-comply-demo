import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import React, { type ReactElement } from "react";
import { PolicyPdfDoc } from "@/lib/policies/pdf/PolicyPdfDoc";
import { parseContent, substituteVariables } from "@/lib/policies/pdf/render-content";

// @react-pdf is a heavy Node-only renderer.
export const runtime = "nodejs";
// Force dynamic so we never cache a stale PDF.
export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const url = new URL(req.url);
    const requestedVersion = url.searchParams.get("version");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Org-scoped membership check (the policy_select RLS will enforce too).
    const { data: membership } = await supabase
        .from("organization_members")
        .select("org_id")
        .eq("user_id", user.id)
        .limit(1)
        .single();
    if (!membership) return NextResponse.json({ error: "No org" }, { status: 403 });

    const { data: policy } = await supabase
        .from("policies")
        .select("id, code, title, content, version, status, org_id, organizations(name)")
        .eq("id", id)
        .eq("org_id", membership.org_id)
        .single();
    if (!policy) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Pick the version to render. Default to the policy's active version.
    let renderVersion = policy.version;
    let renderContent = policy.content ?? "";
    let renderApprovedAt: string | null = null;
    let superseded = false;

    if (requestedVersion) {
        const { data: v } = await supabase
            .from("policy_versions")
            .select("version, status, content, approved_at")
            .eq("policy_id", id)
            .eq("version", requestedVersion)
            .maybeSingle();
        if (!v) return NextResponse.json({ error: "Version not found" }, { status: 404 });
        if (v.status !== "active" && v.status !== "superseded") {
            return NextResponse.json({ error: "Preview only — not available for download" }, { status: 400 });
        }
        renderVersion = v.version;
        renderContent = v.content ?? policy.content ?? "";
        renderApprovedAt = v.approved_at;
        superseded = v.status === "superseded";
    } else {
        // Default — only active policies are downloadable
        if (policy.status !== "active" && policy.status !== "approved") {
            return NextResponse.json({ error: "Preview only — not available for download" }, { status: 400 });
        }
        const { data: active } = await supabase
            .from("policy_versions")
            .select("approved_at")
            .eq("policy_id", id)
            .eq("status", "active")
            .maybeSingle();
        renderApprovedAt = active?.approved_at ?? null;
    }

    // Variables for the org
    const { data: varRows } = await supabase
        .from("org_policy_variables")
        .select("var_key, value")
        .eq("org_id", policy.org_id);
    const variables: Record<string, string> = {};
    for (const v of varRows ?? []) variables[v.var_key] = v.value ?? "";

    // Branding
    const { data: branding } = await supabase
        .from("org_branding")
        .select("display_name, logo_url")
        .eq("org_id", policy.org_id)
        .maybeSingle();

    // Version history
    const { data: versions } = await supabase
        .from("policy_versions")
        .select("version, status, created_at, approved_at, summary, created_by:profiles!policy_versions_created_by_fkey(full_name), approved_by:profiles!policy_versions_approved_by_fkey(full_name)")
        .eq("policy_id", id)
        .order("created_at", { ascending: true });

    const orgName = branding?.display_name
        ?? (policy.organizations as unknown as { name: string } | null)?.name
        ?? "Your organisation";
    const orgInitial = orgName.trim().slice(0, 1).toUpperCase() || "?";

    const substituted = substituteVariables(renderContent, variables);
    const nodes = parseContent(substituted);

    const element = React.createElement(PolicyPdfDoc, {
        orgName,
        orgInitial,
        logoUrl: branding?.logo_url ?? null,
        policyTitle: policy.title,
        policyCode: policy.code,
        version: renderVersion,
        approvedAt: renderApprovedAt,
        classification: "CONFIDENTIAL",
        nodes,
        versions: (versions ?? []).map(v => ({
            version: v.version,
            status: v.status,
            createdByName: (v.created_by as unknown as { full_name: string | null } | null)?.full_name ?? null,
            createdAt: v.created_at,
            approvedByName: (v.approved_by as unknown as { full_name: string | null } | null)?.full_name ?? null,
            approvedAt: v.approved_at,
            summary: v.summary,
        })),
        superseded,
    }) as unknown as ReactElement<DocumentProps>;
    const buf = await renderToBuffer(element);

    const filename = `${(policy.code ?? policy.title).replace(/[^a-zA-Z0-9_-]+/g, "_")}_${renderVersion}.pdf`;
    return new NextResponse(new Uint8Array(buf), {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${filename}"`,
            "Cache-Control": "no-store",
        },
    });
}
