// Convert between our markdown-ish policy content and TipTap ProseMirror JSON.
// Both directions preserve [Variable_Name] tokens as variableChip nodes.

export type PmNode = {
    type: string;
    attrs?: Record<string, unknown>;
    content?: PmNode[];
    text?: string;
    marks?: { type: string; attrs?: Record<string, unknown> }[];
};

const VAR_RE = /\[([A-Za-z0-9_]+)\]/g;

/** Convert a paragraph-style line into a list of inline PM nodes (text + variableChip). */
function inlineNodes(text: string): PmNode[] {
    const nodes: PmNode[] = [];
    let last = 0;
    VAR_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = VAR_RE.exec(text)) !== null) {
        if (m.index > last) {
            nodes.push({ type: "text", text: text.slice(last, m.index) });
        }
        nodes.push({ type: "variableChip", attrs: { chipKey: m[0] } });
        last = m.index + m[0].length;
    }
    if (last < text.length) {
        nodes.push({ type: "text", text: text.slice(last) });
    }
    return nodes;
}

/** Parse our markdown-ish policy content into a TipTap doc (PM JSON). */
export function markdownToDoc(md: string): PmNode {
    const blocks: PmNode[] = [];
    // Normalise line endings + collapse runs of \r — content stored from various
    // sources (DOCX paste, server seed, Windows shells) may carry CRLF.
    const normalised = (md ?? "").replace(/\r\n/g, "\n").replace(/\r/g, "");
    const rawBlocks = normalised.split(/\n{2,}/);
    for (const raw of rawBlocks) {
        const block = raw.trim();
        if (!block) continue;

        if (block.startsWith("## ")) {
            blocks.push({ type: "heading", attrs: { level: 2 }, content: inlineNodes(block.slice(3).trim()) });
            continue;
        }
        if (block.startsWith("### ")) {
            blocks.push({ type: "heading", attrs: { level: 3 }, content: inlineNodes(block.slice(4).trim()) });
            continue;
        }
        if (block.startsWith("# ")) {
            blocks.push({ type: "heading", attrs: { level: 1 }, content: inlineNodes(block.slice(2).trim()) });
            continue;
        }
        const lines = block.split("\n").map(l => l.trim()).filter(Boolean);
        if (lines.length > 0 && lines.every(l => l.startsWith("- "))) {
            blocks.push({
                type: "bulletList",
                content: lines.map(l => ({
                    type: "listItem",
                    content: [{ type: "paragraph", content: inlineNodes(l.slice(2).trim()) }],
                })),
            });
            continue;
        }
        if (lines.length > 0 && lines.every(l => /^\d+\.\s/.test(l))) {
            blocks.push({
                type: "orderedList",
                content: lines.map(l => ({
                    type: "listItem",
                    content: [{ type: "paragraph", content: inlineNodes(l.replace(/^\d+\.\s+/, "")) }],
                })),
            });
            continue;
        }
        // Default: paragraph (treat single newlines as soft breaks → join with spaces)
        const paraText = block.replace(/\n+/g, " ").trim();
        blocks.push({ type: "paragraph", content: inlineNodes(paraText) });
    }

    if (blocks.length === 0) blocks.push({ type: "paragraph" });
    return { type: "doc", content: blocks };
}

/** Serialize inline content back to a markdown line: text + chip keys + link/bold/italic marks. */
function inlineToMarkdown(content: PmNode[] | undefined): string {
    if (!content || content.length === 0) return "";
    return content.map(n => {
        if (n.type === "text") {
            let text = n.text ?? "";
            const marks = n.marks ?? [];
            const hasBold = marks.some(m => m.type === "bold");
            const hasItalic = marks.some(m => m.type === "italic");
            const link = marks.find(m => m.type === "link");
            if (hasBold) text = `**${text}**`;
            if (hasItalic) text = `_${text}_`;
            if (link && link.attrs && typeof link.attrs.href === "string") text = `[${text}](${link.attrs.href})`;
            return text;
        }
        if (n.type === "variableChip") {
            const key = (n.attrs?.chipKey as string) ?? "";
            return key;
        }
        if (n.type === "hardBreak") return "\n";
        return n.text ?? "";
    }).join("");
}

/** Serialize a TipTap doc back to our markdown-ish policy content. */
export function docToMarkdown(doc: PmNode): string {
    if (!doc || doc.type !== "doc" || !doc.content) return "";
    const out: string[] = [];
    for (const block of doc.content) {
        if (block.type === "heading") {
            const level = (block.attrs?.level as number) ?? 2;
            const prefix = "#".repeat(Math.min(Math.max(level, 1), 6));
            out.push(`${prefix} ${inlineToMarkdown(block.content)}`);
        } else if (block.type === "paragraph") {
            out.push(inlineToMarkdown(block.content));
        } else if (block.type === "bulletList" || block.type === "orderedList") {
            const items = (block.content ?? []).map((li, i) => {
                const paragraph = li.content?.[0];
                const text = inlineToMarkdown(paragraph?.content);
                return block.type === "bulletList" ? `- ${text}` : `${i + 1}. ${text}`;
            });
            out.push(items.join("\n"));
        } else if (block.type === "codeBlock") {
            out.push("```\n" + inlineToMarkdown(block.content) + "\n```");
        } else if (block.type === "blockquote") {
            const inner = (block.content ?? []).map(c => inlineToMarkdown(c.content)).join("\n");
            out.push(inner.split("\n").map(l => `> ${l}`).join("\n"));
        }
    }
    return out.join("\n\n").trim();
}
