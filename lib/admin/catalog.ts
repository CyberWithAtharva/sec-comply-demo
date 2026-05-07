// Shared helpers for the framework catalog admin API.

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-f]{6}$/i;

export function isValidSlug(slug: string): boolean {
    return SLUG_RE.test(slug);
}

export function normalizeHexColor(input: string | null | undefined): string | null {
    if (!input) return null;
    let v = input.trim().toLowerCase();
    if (!v) return null;
    if (!v.startsWith("#")) v = "#" + v;
    // Expand 3-char hex to 6-char
    if (/^#[0-9a-f]{3}$/.test(v)) {
        v = "#" + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    return HEX_RE.test(v) ? v : null;
}

/**
 * Strip empty strings and undefined from a payload so they don't clobber
 * nullable DB columns. Keeps `null` (explicit clears) and `false`/`0`.
 */
export function stripEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === undefined) continue;
        if (typeof v === "string" && v.trim() === "") continue;
        out[k] = v;
    }
    return out as Partial<T>;
}

export type BulkControlInput = {
    code: string;
    name: string;
    description?: string | null;
    domain?: string | null;
    sort_order?: number;
};

export type BulkControlMode = "skip" | "upsert";

export type BulkControlsResult = {
    created: number;
    updated: number;
    skipped: number;
};

export const BULK_LIMIT = 2000;

/**
 * De-duplicate bulk rows by code (last-wins). Avoids hitting the unique
 * constraint twice in one upsert call.
 */
export function dedupeByCode<T extends { code: string }>(rows: T[]): T[] {
    const map = new Map<string, T>();
    for (const r of rows) map.set(r.code, r);
    return Array.from(map.values());
}
