/**
 * Shared client-side types for the Risk Management module.
 */

import type { Database } from "@/types/database";
import type { FrameworkMapping } from "@/lib/risk-library";

export type RiskRow = Database["public"]["Tables"]["risks"]["Row"] & {
    profiles: { id: string; full_name: string | null; avatar_url: string | null } | null;
};

export type StatusHistoryRow = Database["public"]["Tables"]["risk_status_history"]["Row"] & {
    profiles?: { id: string; full_name: string | null } | null;
};

/** UI-coerced framework mappings (the JSONB column stores this shape). */
export function readFrameworkMappings(value: unknown): FrameworkMapping[] {
    if (!Array.isArray(value)) return [];
    return value.filter(
        (m): m is FrameworkMapping =>
            !!m &&
            typeof m === "object" &&
            typeof (m as FrameworkMapping).framework === "string" &&
            typeof (m as FrameworkMapping).clause === "string" &&
            typeof (m as FrameworkMapping).name === "string",
    );
}

export interface OwnerOption {
    id: string;
    name: string;
}
