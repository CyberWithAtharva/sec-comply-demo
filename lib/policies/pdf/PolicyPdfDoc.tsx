// Server-only React component rendered by @react-pdf/renderer.
// Do NOT add "use client" — this code is never sent to the browser.

import React from "react";
import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { pdfStyles, colors } from "./styles";
import type { PdfNode } from "./render-content";

export interface VersionRow {
    version: string;
    status: string;
    createdByName: string | null;
    createdAt: string | null;
    approvedByName: string | null;
    approvedAt: string | null;
    summary: string | null;
}

export interface PolicyPdfProps {
    orgName: string;
    orgInitial: string;
    logoUrl: string | null;
    policyTitle: string;
    policyCode: string | null;
    version: string;
    approvedAt: string | null;
    classification: string;
    nodes: PdfNode[];
    versions: VersionRow[];
    superseded: boolean;
}

function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    try {
        return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
        return iso;
    }
}

export function PolicyPdfDoc(props: PolicyPdfProps) {
    const { orgName, orgInitial, logoUrl, policyTitle, policyCode, version, approvedAt, classification, nodes, versions, superseded } = props;

    const HeaderFooter = (
        <>
            <View style={pdfStyles.pageHeader} fixed>
                <Text>{policyTitle} {policyCode ? `· ${policyCode}` : ""}</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text>{version}</Text>
                    <Text style={pdfStyles.headerLogoBox}>{orgInitial}</Text>
                </View>
            </View>
            <View style={pdfStyles.pageFooter} fixed>
                <Text>{classification}</Text>
                <Text render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}`} />
                <Text>Confidential — Do not distribute</Text>
            </View>
            {superseded && <Text style={pdfStyles.watermark} fixed>SUPERSEDED</Text>}
        </>
    );

    return (
        <Document title={`${policyTitle} ${version}`} author={orgName} producer="Overwatch · SecComply">
            {/* Cover page */}
            <Page size="A4" style={pdfStyles.coverPage}>
                {logoUrl ? (
                    <Image src={logoUrl} style={pdfStyles.coverLogo} />
                ) : (
                    <Text style={pdfStyles.coverInitial}>{orgInitial}</Text>
                )}
                <Text style={pdfStyles.coverTitle}>{policyTitle}</Text>
                <Text style={pdfStyles.coverOrg}>{orgName}</Text>
                <Text style={pdfStyles.coverClassification}>{classification}</Text>
                <Text style={pdfStyles.coverMeta}>
                    Version {version}{approvedAt ? ` · Approved ${fmtDate(approvedAt)}` : ""}
                </Text>
                {superseded && <Text style={pdfStyles.watermark}>SUPERSEDED</Text>}
            </Page>

            {/* Content page(s) */}
            <Page size="A4" style={pdfStyles.page}>
                {HeaderFooter}
                {nodes.map((n, i) => {
                    if (n.type === "h2") return <Text key={i} style={pdfStyles.h2}>{n.text}</Text>;
                    if (n.type === "h3") return <Text key={i} style={pdfStyles.h3}>{n.text}</Text>;
                    if (n.type === "li") return <Text key={i} style={pdfStyles.li}>• {n.text}</Text>;
                    return <Text key={i} style={pdfStyles.p}>{n.text}</Text>;
                })}
            </Page>

            {/* Version history page */}
            <Page size="A4" style={pdfStyles.page}>
                {HeaderFooter}
                <Text style={pdfStyles.historyTitle}>Version History</Text>
                <View style={pdfStyles.historyTable}>
                    <View style={pdfStyles.historyHead}>
                        <Text style={pdfStyles.cellVersion}>Version</Text>
                        <Text style={pdfStyles.cellStatus}>Status</Text>
                        <Text style={pdfStyles.cellPerson}>Created By</Text>
                        <Text style={pdfStyles.cellDate}>Created</Text>
                        <Text style={pdfStyles.cellPerson}>Approved By</Text>
                        <Text style={pdfStyles.cellDate}>Approved</Text>
                    </View>
                    {versions.map((v, i) => {
                        const isCurrent = v.version === version && v.status === "active";
                        return (
                            <View key={i} style={[pdfStyles.historyRow, isCurrent ? pdfStyles.historyCurrent : {}]} wrap={false}>
                                <Text style={pdfStyles.cellVersion}>{v.version}</Text>
                                <Text style={[pdfStyles.cellStatus, { color: isCurrent ? colors.ACCENT : colors.MUTED }]}>{v.status}</Text>
                                <Text style={pdfStyles.cellPerson}>{v.createdByName ?? "—"}</Text>
                                <Text style={pdfStyles.cellDate}>{fmtDate(v.createdAt)}</Text>
                                <Text style={pdfStyles.cellPerson}>{v.approvedByName ?? "—"}</Text>
                                <Text style={pdfStyles.cellDate}>{fmtDate(v.approvedAt)}</Text>
                            </View>
                        );
                    })}
                </View>
            </Page>
        </Document>
    );
}
