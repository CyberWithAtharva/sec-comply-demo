// Styles + font registration for the policy PDF renderer.
// Server-only. Do not import from a "use client" file.

import { StyleSheet, Font } from "@react-pdf/renderer";

// Register Inter from a stable CDN URL. The PDF runtime fetches this once
// at first render and caches it for the process lifetime.
Font.register({
    family: "Inter",
    fonts: [
        { src: "https://rsms.me/inter/font-files/Inter-Regular.woff", fontWeight: 400 },
        { src: "https://rsms.me/inter/font-files/Inter-Medium.woff", fontWeight: 500 },
        { src: "https://rsms.me/inter/font-files/Inter-SemiBold.woff", fontWeight: 600 },
        { src: "https://rsms.me/inter/font-files/Inter-Bold.woff", fontWeight: 700 },
    ],
});

const FG = "#0f172a";
const MUTED = "#475569";
const BORDER = "#e2e8f0";
const ACCENT = "#f97316";

export const colors = { FG, MUTED, BORDER, ACCENT };

export const pdfStyles = StyleSheet.create({
    page: {
        paddingTop: 64,
        paddingBottom: 56,
        paddingHorizontal: 56,
        fontFamily: "Inter",
        fontSize: 11,
        color: FG,
        lineHeight: 1.55,
    },
    coverPage: {
        padding: 56,
        fontFamily: "Inter",
        color: FG,
        alignItems: "center",
        justifyContent: "center",
    },
    coverLogo: {
        width: 140,
        marginBottom: 32,
        marginTop: 80,
    },
    coverInitial: {
        width: 90,
        height: 90,
        borderRadius: 18,
        backgroundColor: ACCENT,
        color: "#ffffff",
        marginBottom: 32,
        textAlign: "center",
        fontSize: 44,
        fontWeight: 700,
        padding: 12,
    },
    coverTitle: {
        fontSize: 28,
        fontWeight: 700,
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 1.2,
    },
    coverOrg: {
        fontSize: 13,
        color: MUTED,
        marginBottom: 8,
    },
    coverMeta: {
        fontSize: 11,
        color: MUTED,
        textAlign: "center",
        marginTop: 24,
        letterSpacing: 0.5,
    },
    coverClassification: {
        fontSize: 10,
        color: ACCENT,
        textAlign: "center",
        marginTop: 4,
        letterSpacing: 1.2,
        fontWeight: 600,
    },
    pageHeader: {
        position: "absolute",
        top: 24,
        left: 56,
        right: 56,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 9,
        color: MUTED,
        borderBottom: `1pt solid ${BORDER}`,
        paddingBottom: 6,
    },
    pageFooter: {
        position: "absolute",
        bottom: 24,
        left: 56,
        right: 56,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 9,
        color: MUTED,
        borderTop: `1pt solid ${BORDER}`,
        paddingTop: 6,
    },
    h2: {
        fontSize: 14,
        fontWeight: 700,
        marginTop: 16,
        marginBottom: 6,
        color: FG,
    },
    h3: {
        fontSize: 12,
        fontWeight: 600,
        marginTop: 10,
        marginBottom: 4,
        color: FG,
    },
    p: {
        fontSize: 11,
        marginBottom: 8,
        color: FG,
    },
    li: {
        fontSize: 11,
        marginBottom: 4,
        marginLeft: 12,
        color: FG,
    },
    headerLogoBox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        backgroundColor: ACCENT,
        color: "#fff",
        textAlign: "center",
        fontSize: 10,
        fontWeight: 700,
        padding: 2,
    },
    historyTitle: {
        fontSize: 16,
        fontWeight: 700,
        marginBottom: 12,
        color: FG,
    },
    historyTable: {
        border: `1pt solid ${BORDER}`,
        borderRadius: 4,
    },
    historyRow: {
        flexDirection: "row",
        borderBottom: `1pt solid ${BORDER}`,
        paddingVertical: 6,
        paddingHorizontal: 8,
    },
    historyHead: {
        flexDirection: "row",
        backgroundColor: "#f1f5f9",
        paddingVertical: 6,
        paddingHorizontal: 8,
        fontSize: 9,
        fontWeight: 600,
        color: MUTED,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    historyCurrent: {
        backgroundColor: "#fff7ed",
    },
    cellVersion: { width: "12%", fontSize: 10, fontWeight: 600 },
    cellStatus:  { width: "14%", fontSize: 9 },
    cellPerson:  { width: "22%", fontSize: 9 },
    cellDate:    { width: "16%", fontSize: 9 },
    cellSummary: { width: "36%", fontSize: 9, color: MUTED },
    watermark: {
        position: "absolute",
        top: "45%",
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: 70,
        fontWeight: 700,
        color: "#fee2e2",
        opacity: 0.8,
        transform: "rotate(-30deg)",
    },
});
