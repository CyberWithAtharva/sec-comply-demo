import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SecurityFinding {
    label: string;
    passed: boolean;
    description: string;
    points: number;
}

// ─── DNS-over-HTTPS helper (Cloudflare 1.1.1.1) ─────────────────────────────

async function queryTxt(name: string): Promise<string[]> {
    try {
        const res = await fetch(`https://1.1.1.1/dns-query?name=${encodeURIComponent(name)}&type=TXT`, {
            headers: { Accept: "application/dns-json" },
            signal: AbortSignal.timeout(5_000),
        });
        if (!res.ok) return [];
        const json = await res.json();
        // DNS TXT records come back with surrounding quotes — strip them
        return (json.Answer ?? []).map((a: { data: string }) =>
            (a.data ?? "").replace(/^"|"$/g, "")
        );
    } catch {
        return [];
    }
}

// ─── Core assessment logic ────────────────────────────────────────────────────

async function assessDomain(domain: string): Promise<{ score: number; findings: SecurityFinding[] }> {
    const findings: SecurityFinding[] = [];

    // ── 1. HTTPS accessible ──────────────────────────────────────────────────
    let httpsOk = false;
    let resHeaders: Headers | null = null;
    try {
        const r = await fetch(`https://${domain}`, {
            method: "HEAD",
            redirect: "follow",
            signal: AbortSignal.timeout(8_000),
        });
        httpsOk = r.status < 500;
        resHeaders = r.headers;
    } catch { /* unreachable */ }

    findings.push({
        label: "HTTPS Accessible",
        passed: httpsOk,
        description: httpsOk
            ? "Domain responds over HTTPS"
            : "Domain did not respond over HTTPS — connection refused or timeout",
        points: 20,
    });

    // ── 2. HTTP Strict Transport Security (HSTS) ─────────────────────────────
    const hsts = resHeaders?.get("strict-transport-security") ?? null;
    findings.push({
        label: "HTTP Strict Transport Security (HSTS)",
        passed: !!hsts,
        description: hsts
            ? `HSTS enabled (${hsts.slice(0, 80)})`
            : "Strict-Transport-Security header missing — browsers may allow downgrade to HTTP",
        points: 15,
    });

    // ── 3. Content-Security-Policy ───────────────────────────────────────────
    const csp = resHeaders?.get("content-security-policy") ?? null;
    findings.push({
        label: "Content Security Policy (CSP)",
        passed: !!csp,
        description: csp
            ? "Content-Security-Policy header present"
            : "Content-Security-Policy header missing — XSS risk elevated",
        points: 15,
    });

    // ── 4. Clickjacking protection ───────────────────────────────────────────
    const xfo = resHeaders?.get("x-frame-options") ?? null;
    const cspFrameAncestors = csp?.includes("frame-ancestors") ?? false;
    const frameProtected = !!xfo || cspFrameAncestors;
    findings.push({
        label: "Clickjacking Protection (X-Frame-Options / CSP)",
        passed: frameProtected,
        description: frameProtected
            ? `Clickjacking protection active${xfo ? ` (X-Frame-Options: ${xfo})` : " (CSP frame-ancestors)"}`
            : "No clickjacking protection (X-Frame-Options or CSP frame-ancestors) found",
        points: 10,
    });

    // ── 5. MIME sniffing protection ──────────────────────────────────────────
    const xcto = resHeaders?.get("x-content-type-options") ?? null;
    findings.push({
        label: "MIME Sniffing Protection",
        passed: !!xcto,
        description: xcto
            ? "X-Content-Type-Options: nosniff"
            : "X-Content-Type-Options header missing — MIME confusion attacks possible",
        points: 10,
    });

    // ── 6. SPF record ────────────────────────────────────────────────────────
    const spfRecords = await queryTxt(domain);
    const spfOk = spfRecords.some(r => r.startsWith("v=spf1"));
    findings.push({
        label: "SPF Record (Email Spoofing Prevention)",
        passed: spfOk,
        description: spfOk
            ? "SPF record found — email spoofing protection enabled"
            : "No SPF record — domain email can be spoofed by attackers",
        points: 15,
    });

    // ── 7. DMARC policy ──────────────────────────────────────────────────────
    const dmarcRecords = await queryTxt(`_dmarc.${domain}`);
    const dmarcOk = dmarcRecords.some(r => r.startsWith("v=DMARC1"));
    findings.push({
        label: "DMARC Policy (Email Authentication)",
        passed: dmarcOk,
        description: dmarcOk
            ? "DMARC policy found — email authentication enforced"
            : "No DMARC policy — phishing via this domain is undetected by recipients",
        points: 15,
    });

    const score = findings.reduce((sum, f) => sum + (f.passed ? f.points : 0), 0);
    return { score, findings };
}

// ─── Extract domain from URL or raw domain string ────────────────────────────

function parseDomain(raw: string): string {
    const s = raw.trim();
    try {
        const url = new URL(s.includes("://") ? s : `https://${s}`);
        return url.hostname.replace(/^www\./, "");
    } catch {
        return s.replace(/^www\./, "");
    }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { vendor_id, domain: rawDomain } = await req.json();
        if (!vendor_id || !rawDomain) {
            return NextResponse.json({ error: "vendor_id and domain required" }, { status: 400 });
        }

        const { data: membership } = await supabase
            .from("organization_members")
            .select("org_id")
            .eq("user_id", user.id)
            .single();
        if (!membership) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Confirm vendor belongs to org
        const { data: vendor } = await supabase
            .from("vendors")
            .select("id")
            .eq("id", vendor_id)
            .eq("org_id", membership.org_id)
            .single();
        if (!vendor) return NextResponse.json({ error: "Vendor not found" }, { status: 404 });

        const domain = parseDomain(rawDomain);
        const { score, findings } = await assessDomain(domain);
        const checked_at = new Date().toISOString();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from("vendors") as any)
            .update({ security_score: score, security_findings: findings, security_checked_at: checked_at })
            .eq("id", vendor_id);

        return NextResponse.json({ score, findings, checked_at, domain });
    } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Assessment failed";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
