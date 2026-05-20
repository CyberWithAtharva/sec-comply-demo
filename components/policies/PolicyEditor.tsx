"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import { toast } from "sonner";
import {
    Bold, Italic, Strikethrough, Heading2, Heading3, List, ListOrdered,
    Link as LinkIcon, Undo, Redo, Code, Quote, Braces, CloudCheck,
    Loader2, ChevronDown,
} from "lucide-react";
import { cn } from "@/components/ui/Card";
import { Button } from "@/components/ui/button";
import { VariableChipNode } from "./variable-chip-node";
import { markdownToDoc, docToMarkdown, type PmNode } from "@/lib/policies/markdown";

interface Props {
    policyId: string;
    initialMarkdown: string;
    variables: Record<string, string>;
    /** When `false`, the editor is read-only (no toolbar, no auto-save). */
    editable?: boolean;
    /** Show the surrounding "paper" + toolbar styling. */
    chrome?: boolean;
    /** "app" = dark/themed (default). "paper" = slate colours for the white-paper preview. */
    tone?: "app" | "paper";
}

export function PolicyEditor({ policyId, initialMarkdown, variables, editable = true, chrome = true, tone = "app" }: Props) {
    const [saveState, setSaveState] = useState<"idle" | "dirty" | "saving" | "saved">("idle");
    const [insertOpen, setInsertOpen] = useState(false);
    const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const initialDoc = useMemo(() => markdownToDoc(initialMarkdown ?? ""), [initialMarkdown]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Placeholder.configure({
                placeholder: "Write your policy content here…",
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
                HTMLAttributes: { class: "text-primary underline" },
            }),
            VariableChipNode.configure({ values: variables }),
        ],
        content: initialDoc,
        editable,
        immediatelyRender: false, // SSR-safe
        editorProps: {
            attributes: {
                class: cn(
                    "max-w-none focus:outline-none min-h-[400px]",
                    tone === "app"
                        ? cn(
                            "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-foreground",
                            "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-foreground",
                            "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-foreground",
                            "[&_p]:text-sm [&_p]:leading-relaxed [&_p]:my-2 [&_p]:text-muted-foreground",
                            "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:text-sm [&_ul]:text-muted-foreground [&_ul>li]:my-1",
                            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_ol]:text-sm [&_ol]:text-muted-foreground [&_ol>li]:my-1",
                            "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-3",
                            "[&_code]:bg-secondary [&_code]:text-primary [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_code]:font-mono",
                            "[&_.var-chip]:bg-primary/10 [&_.var-chip]:text-primary [&_.var-chip]:border-primary/30",
                        )
                        : cn(
                            "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-slate-900",
                            "[&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-slate-900",
                            "[&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-slate-900",
                            "[&_p]:text-sm [&_p]:leading-relaxed [&_p]:my-2 [&_p]:text-slate-700",
                            "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-3 [&_ul]:text-sm [&_ul]:text-slate-700 [&_ul>li]:my-1",
                            "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-3 [&_ol]:text-sm [&_ol]:text-slate-700 [&_ol>li]:my-1",
                            "[&_blockquote]:border-l-2 [&_blockquote]:border-slate-300 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:my-3 [&_blockquote]:text-slate-600",
                            "[&_code]:bg-slate-100 [&_code]:text-slate-800 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-[12px] [&_code]:font-mono",
                            "[&_.var-chip]:bg-orange-50 [&_.var-chip]:text-orange-700 [&_.var-chip]:border-orange-200",
                        ),
                    "[&_.var-chip]:inline-flex [&_.var-chip]:items-center [&_.var-chip]:px-1.5 [&_.var-chip]:py-0.5 [&_.var-chip]:mx-0.5",
                    "[&_.var-chip]:rounded [&_.var-chip]:border [&_.var-chip]:text-[12px] [&_.var-chip]:font-medium [&_.var-chip]:cursor-default",
                ),
            },
        },
        onUpdate({ editor }) {
            if (!editable) return;
            setSaveState("dirty");
            if (saveTimer.current) clearTimeout(saveTimer.current);
            saveTimer.current = setTimeout(() => {
                void save(editor.getJSON() as unknown as PmNode);
            }, 1200);
        },
    });

    // Save on unmount + when explicitly invoked
    const save = useCallback(async (doc: PmNode) => {
        setSaveState("saving");
        const md = docToMarkdown(doc);
        try {
            const res = await fetch(`/api/policies/${policyId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: md }),
            });
            if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Save failed");
            setSaveState("saved");
            setTimeout(() => setSaveState(s => (s === "saved" ? "idle" : s)), 1800);
        } catch (e) {
            toast.error(e instanceof Error ? e.message : "Save failed");
            setSaveState("dirty");
        }
    }, [policyId]);

    useEffect(() => () => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
    }, []);

    // Ensure the editor receives the content once it's ready. The `content` option
    // only fires on init, so if the markdown changes (or the editor created with an
    // empty doc race) we replace the content here. `emitUpdate: false` avoids
    // marking the new doc as a "dirty" change.
    useEffect(() => {
        if (!editor) return;
        const current = docToMarkdown(editor.getJSON() as unknown as PmNode);
        const target = (initialMarkdown ?? "").trim();
        if (current.trim() !== target) {
            editor.commands.setContent(initialDoc, { emitUpdate: false });
        }
    }, [editor, initialDoc, initialMarkdown]);

    // Re-sync chip values when the org variables change without remounting the editor.
    useEffect(() => {
        if (!editor) return;
        editor.view.dispatch(editor.state.tr.setMeta("forceUpdate", true));
    }, [editor, variables]);

    if (!editor) {
        return <div className="text-sm text-muted-foreground p-4">Loading editor…</div>;
    }

    const isContentEmpty = !initialMarkdown || initialMarkdown.trim().length === 0;

    const Toolbar = editable && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-secondary/30 rounded-t-lg flex-wrap">
            <Tb active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (⌘B)"><Bold className="w-3.5 h-3.5" /></Tb>
            <Tb active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (⌘I)"><Italic className="w-3.5 h-3.5" /></Tb>
            <Tb active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></Tb>
            <Tb active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code"><Code className="w-3.5 h-3.5" /></Tb>
            <TbDivider />
            <Tb active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></Tb>
            <Tb active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></Tb>
            <TbDivider />
            <Tb active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list"><List className="w-3.5 h-3.5" /></Tb>
            <Tb active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list"><ListOrdered className="w-3.5 h-3.5" /></Tb>
            <Tb active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote"><Quote className="w-3.5 h-3.5" /></Tb>
            <TbDivider />
            <Tb onClick={() => {
                const prev = editor.getAttributes("link").href;
                const url = window.prompt("Link URL", prev || "https://");
                if (url === null) return;
                if (url === "") editor.chain().focus().extendMarkRange("link").unsetLink().run();
                else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
            }} active={editor.isActive("link")} title="Link"><LinkIcon className="w-3.5 h-3.5" /></Tb>
            <TbDivider />
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setInsertOpen(o => !o)}
                    onBlur={() => setTimeout(() => setInsertOpen(false), 160)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs text-primary hover:bg-primary/10"
                    title="Insert variable"
                >
                    <Braces className="w-3.5 h-3.5" /> Insert variable <ChevronDown className="w-3 h-3" />
                </button>
                {insertOpen && (
                    <div className="absolute top-full left-0 mt-1 z-50 w-72 max-h-72 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg p-1">
                        {Object.keys(variables).length === 0 && (
                            <div className="px-3 py-2 text-xs text-muted-foreground">No variables defined yet.</div>
                        )}
                        {Object.entries(variables).map(([key, value]) => (
                            <button
                                key={key}
                                type="button"
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => {
                                    editor.chain().focus().insertVariableChip(key).run();
                                    setInsertOpen(false);
                                }}
                                className="w-full flex items-center justify-between gap-3 px-2 py-1.5 rounded hover:bg-secondary text-left"
                            >
                                <code className="text-[11px] font-mono text-primary truncate">{key}</code>
                                <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">{value}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <TbDivider />
            <Tb onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo className="w-3.5 h-3.5" /></Tb>
            <Tb onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo className="w-3.5 h-3.5" /></Tb>

            <div className="flex-1" />

            <SaveIndicator state={saveState} onSaveNow={() => {
                if (saveTimer.current) clearTimeout(saveTimer.current);
                void save(editor.getJSON() as unknown as PmNode);
            }} />
        </div>
    );

    if (!chrome) {
        return <EditorContent editor={editor} className="px-1" />;
    }

    return (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
            {Toolbar}
            <div className="p-6 lg:p-8">
                {isContentEmpty && editable && (
                    <div className="mb-4 p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
                        This policy has no content yet — start typing below to draft it.
                    </div>
                )}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}

function Tb({ children, active, onClick, disabled, title }: { children: React.ReactNode; active?: boolean; onClick: () => void; disabled?: boolean; title?: string }) {
    return (
        <button
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={cn(
                "h-7 w-7 inline-flex items-center justify-center rounded text-muted-foreground transition-colors",
                active ? "bg-primary/10 text-primary" : "hover:bg-secondary hover:text-foreground",
                disabled && "opacity-40 cursor-not-allowed",
            )}
        >
            {children}
        </button>
    );
}

function TbDivider() {
    return <span className="w-px h-5 bg-border mx-1" />;
}

function SaveIndicator({ state, onSaveNow }: { state: "idle" | "dirty" | "saving" | "saved"; onSaveNow: () => void }) {
    if (state === "saving") {
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>;
    }
    if (state === "saved") {
        return <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400"><CloudCheck className="w-3 h-3" /> Saved</span>;
    }
    if (state === "dirty") {
        return (
            <Button variant="ghost" size="sm" onClick={onSaveNow} className="h-7 px-2 text-[11px] text-amber-400 gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Unsaved · Save now
            </Button>
        );
    }
    return <span className="text-[11px] text-muted-foreground/60">Idle</span>;
}
