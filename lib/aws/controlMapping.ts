/**
 * Maps AWS scanner rule IDs → compliance control_id text values
 * Used to update control_status when findings are detected or resolved.
 */
export const RULE_CONTROL_MAP: Record<string, string[]> = {
    // IAM — Access Control
    "IAM-001": ["CC6.1", "CC6.2", "A.5.16", "PR.AA-03"],
    "IAM-002": ["CC6.2", "A.5.18", "PR.AA-05"],
    "IAM-003": ["CC6.1", "A.5.17", "PR.AA-01"],
    "IAM-004": ["CC6.3", "A.5.15", "PR.AA-05"],
    "IAM-005": ["CC6.1", "CC6.3", "A.5.16"],
    // CloudTrail — Audit Logging
    "CT-001":  ["CC4.1", "CC7.2", "A.8.15", "DE.CM-03"],
    "CT-002":  ["CC4.1", "A.8.15"],
    // S3 — Confidentiality / Data Protection
    "S3-001":  ["CC6.6", "C1.1", "A.5.10"],
    "S3-002":  ["C1.1", "A.8.24"],
    "S3-003":  ["CC4.1", "A.8.15"],
    // EC2 / Network
    "EC2-001": ["CC6.6", "A.8.20"],
    "EC2-002": ["CC6.6", "CC6.7", "A.8.20", "PR.PS-04"],
    "EC2-003": ["CC6.6", "CC6.7", "A.8.20"],
    "VPC-001": ["CC6.6", "A.8.22"],
};

/**
 * Returns all control_id strings affected by a given rule_id.
 */
export function getControlsForRule(ruleId: string): string[] {
    return RULE_CONTROL_MAP[ruleId] ?? [];
}
