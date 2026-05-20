// TipTap inline atom Node for [Variable_Name] chips.
// Renders as a span with chip styling and the substituted value as inner text.

import { Node, mergeAttributes } from "@tiptap/core";

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        variableChip: {
            insertVariableChip: (chipKey: string, value?: string) => ReturnType;
        };
    }
}

export interface VariableChipOptions {
    HTMLAttributes: Record<string, unknown>;
    /** Lookup of current org values, keyed by `[Variable_Name]`. */
    values: Record<string, string>;
}

export const VariableChipNode = Node.create<VariableChipOptions>({
    name: "variableChip",
    inline: true,
    group: "inline",
    atom: true,
    selectable: true,
    draggable: false,

    addOptions() {
        return {
            HTMLAttributes: {},
            values: {},
        };
    },

    addAttributes() {
        return {
            chipKey: {
                default: "",
                parseHTML: el => (el as HTMLElement).getAttribute("data-variable") ?? "",
                renderHTML: attrs => ({ "data-variable": attrs.chipKey }),
            },
        };
    },

    parseHTML() {
        return [{ tag: "span[data-variable]" }];
    },

    renderHTML({ HTMLAttributes, node }) {
        const key = (node.attrs.chipKey as string) || "";
        const value = this.options.values[key] ?? key;
        return [
            "span",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                class: "var-chip",
                title: `Variable: ${key} — edit in Settings → Policy Variables`,
            }),
            value,
        ];
    },

    addCommands() {
        return {
            insertVariableChip: (chipKey: string) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: { chipKey },
                });
            },
        };
    },
});
