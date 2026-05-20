// Server-only: parse the markdown-ish policy content into a flat node list
// the PDF renderer can map to <Text>/<View> primitives.

export type PdfNode =
    | { type: "h2"; text: string }
    | { type: "h3"; text: string }
    | { type: "p"; text: string }
    | { type: "li"; text: string };

/** Substitute every [Variable_Name] occurrence with the org's value. Unknown keys left intact. */
export function substituteVariables(content: string, vars: Record<string, string>): string {
    return content.replace(/\[([A-Za-z0-9_]+)\]/g, (m, key) => {
        const v = vars[`[${key}]`];
        return v != null && v !== "" ? v : m;
    });
}

/** Parse Markdown-ish content into a flat node list for PDF rendering. */
export function parseContent(content: string): PdfNode[] {
    const out: PdfNode[] = [];
    const blocks = content.split(/\n{2,}/);
    for (const raw of blocks) {
        const block = raw.trim();
        if (!block) continue;

        if (block.startsWith("## ")) {
            out.push({ type: "h2", text: block.slice(3).trim() });
            continue;
        }
        if (block.startsWith("### ")) {
            out.push({ type: "h3", text: block.slice(4).trim() });
            continue;
        }
        const lines = block.split("\n");
        if (lines.every(l => l.trim().startsWith("- "))) {
            for (const l of lines) out.push({ type: "li", text: l.trim().slice(2).trim() });
            continue;
        }
        out.push({ type: "p", text: block });
    }
    return out;
}
