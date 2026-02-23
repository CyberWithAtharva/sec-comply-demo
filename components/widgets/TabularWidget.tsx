"use client";

import React from "react";
import { cn } from "../ui/Card";

type TabularRow = { id: string; title: string; status: string; severity: string; };

const DATA_MAP: Record<string, TabularRow[]> = {
    soc2: [
        { id: "CC6.1", title: "Logical Access Security", status: "Not Started", severity: "High" },
        { id: "CC6.2", title: "User Registration & Auth", status: "In Progress", severity: "Medium" },
        { id: "CC6.3", title: "Role-Based Access Control", status: "Completed", severity: "High" },
        { id: "CC6.4", title: "Physical Access Restrictions", status: "Completed", severity: "Low" },
        { id: "CC6.5", title: "Asset Disposal", status: "Not Started", severity: "Medium" },
    ],
    iso27001: [
        { id: "A.9.1", title: "Business Requirements for Access", status: "Completed", severity: "High" },
        { id: "A.9.2", title: "User Access Management", status: "Completed", severity: "High" },
        { id: "A.9.4", title: "System and App Access Control", status: "In Progress", severity: "Medium" },
        { id: "A.10.1", title: "Cryptographic Controls", status: "Not Started", severity: "High" },
        { id: "A.11.1", title: "Secure Areas", status: "Completed", severity: "Low" },
    ],
    dpd: [
        { id: "DPD.1", title: "Data Subject Rights Request", status: "Completed", severity: "High" },
        { id: "DPD.2", title: "Consent Management", status: "Completed", severity: "High" },
        { id: "DPD.3", title: "Data Breach Notification", status: "Not Started", severity: "High" },
        { id: "DPD.4", title: "Privacy by Design", status: "In Progress", severity: "Medium" },
        { id: "DPD.5", title: "DPIAs Conducted", status: "Completed", severity: "Low" },
    ]
};

export function TabularWidget({ frameworkId = "soc2" }: { frameworkId?: string }) {
    const data = DATA_MAP[frameworkId] || DATA_MAP.soc2;

    return (
        <div className="glass-panel rounded-2xl overflow-hidden col-span-full xl:col-span-2 border border-slate-800/50">
            <div className="p-5 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/20">
                <h3 className="font-semibold text-slate-100">Critical Access Controls</h3>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium tracking-wideuppercase">View All</button>
            </div>
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="text-xs text-slate-500 font-mono uppercase bg-slate-900/40">
                        <tr>
                            <th className="px-6 py-3 font-medium">Control ID</th>
                            <th className="px-6 py-3 font-medium">Description</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium text-right">Severity</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {data.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-800/20 transition-colors group cursor-pointer">
                                <td className="px-6 py-4 font-mono text-slate-300 group-hover:text-blue-400 transition-colors">{row.id}</td>
                                <td className="px-6 py-4 text-slate-200">{row.title}</td>
                                <td className="px-6 py-4">
                                    <span className={cn(
                                        "px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded border",
                                        {
                                            "bg-emerald-500/10 text-emerald-400 border-emerald-500/20": row.status === "Completed",
                                            "bg-blue-500/10 text-blue-400 border-blue-500/20": row.status === "In Progress",
                                            "bg-slate-500/10 text-slate-400 border-slate-500/20": row.status === "Not Started",
                                        }
                                    )}>
                                        {row.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end space-x-1">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", row.severity === "High" ? "bg-red-500" : row.severity === "Medium" ? "bg-amber-500" : "bg-emerald-500")} />
                                        <span className="text-xs">{row.severity}</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
