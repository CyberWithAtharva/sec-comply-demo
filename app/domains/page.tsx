"use client";

import React from "react";
import { motion } from "framer-motion";
import { Network, ScanSearch, Plus } from "lucide-react";

import { DomainRegistrarWidget } from "@/components/widgets/domains/DomainRegistrarWidget";
import { SSLStatusWidget } from "@/components/widgets/domains/SSLStatusWidget";
import { SubdomainTakeoverWidget } from "@/components/widgets/domains/SubdomainTakeoverWidget";
import { ShadowDomainWidget } from "@/components/widgets/domains/ShadowDomainWidget";
import { DomainTrafficWidget } from "@/components/widgets/domains/DomainTrafficWidget";

export default function DomainsPage() {
    return (
        <div className="w-full flex flex-col space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-100 tracking-tight flex items-center">
                        <Network className="w-8 h-8 mr-3 text-emerald-500" />
                        External Attack Surface
                    </h1>
                    <p className="text-sm text-slate-400 mt-2">Continuous discovery and monitoring of domains, SSL certificates, and shadow IT.</p>
                </div>
                <div className="flex space-x-3">
                    <button className="px-5 py-2.5 border border-slate-700 hover:bg-slate-800 rounded-xl text-sm font-medium text-slate-300 transition-all flex items-center">
                        <ScanSearch className="w-4 h-4 mr-2" />
                        Init Scan
                    </button>
                    <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center">
                        <Plus className="w-4 h-4 mr-2" />
                        Track Domain
                    </button>
                </div>
            </div>

            {/* Top Row: Domains, SSL, Subdomain Risks */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 h-[320px]">
                    <DomainRegistrarWidget />
                </div>
                <div className="lg:col-span-1 h-[320px]">
                    <SSLStatusWidget />
                </div>
                <div className="lg:col-span-1 h-[320px]">
                    <SubdomainTakeoverWidget />
                </div>
            </div>

            {/* Bottom Row: Shadow Domains, Traffic */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 min-h-[350px]">
                <div className="xl:col-span-1">
                    <ShadowDomainWidget />
                </div>
                <div className="xl:col-span-1">
                    <DomainTrafficWidget />
                </div>
            </div>
        </div>
    );
}
