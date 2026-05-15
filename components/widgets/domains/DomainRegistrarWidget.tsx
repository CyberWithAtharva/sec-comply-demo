"use client";

import React from "react";
import { Network, Globe2, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const domains = [
    { name: "omniguard.app", expiration: "345 days", registrar: "Route53", status: "secure" },
    { name: "api.omniguard.io", expiration: "12 days", registrar: "Cloudflare", status: "warning" },
    { name: "omniguard-staging.com", expiration: "Expired", registrar: "GoDaddy", status: "critical" },
    { name: "auth.omniguard.net", expiration: "89 days", registrar: "Route53", status: "secure" },
];

export function DomainRegistrarWidget() {
    return (
        <div className="glass-panel p-6 rounded-2xl flex flex-col h-full border border-border/50">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                    <Globe2 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-foreground tracking-tight">Active Domains</h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3">
                {domains.map((dom, idx) => (
                    <div key={idx} className="p-3 bg-card/40 rounded-xl border border-border/50 flex space-x-3 group cursor-pointer hover:bg-secondary/40 transition-colors">
                        <div className="mt-0.5">
                            {dom.status === "secure" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : dom.status === "warning" ? (
                                <AlertTriangle className="w-4 h-4 text-amber-500" />
                            ) : (
                                <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                            )}
                        </div>
                        <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium text-foreground group-hover:text-indigo-400 transition-colors">{dom.name}</span>
                            <div className="flex items-center justify-between mt-1">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    {dom.registrar}
                                </span>
                                <span className={`text-[10px] font-mono ${dom.status === "critical" ? "text-red-400 font-bold" : dom.status === "warning" ? "text-amber-400" : "text-muted-foreground"}`}>
                                    {dom.expiration}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Button variant="link" className="h-auto p-0 hover:no-underline text-xs text-muted-foreground hover:text-indigo-400 mt-4 text-center font-medium">
                Manage Registrars →
            </Button>
        </div>
    );
}
