"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PenTool,
  Send,
  BrainCircuit,
  BarChart3,
  Lock,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const activeNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  const stage2NavItems = [
    { name: "Content Studio", icon: PenTool },
    { name: "Publishing Queue", icon: Send },
    { name: "Brand Brain", icon: BrainCircuit },
    { name: "Analytics", icon: BarChart3 },
  ];

  return (
    <aside className="w-64 border-r border-[#242424] bg-[#080808] p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Core Stage 1 Navigation */}
        <div>
          <p className="px-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-neutral-400" />
            Core Workspace
          </p>
          <nav className="space-y-1">
            {activeNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${
                    isActive
                      ? "bg-neutral-900 text-white border border-neutral-800"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-white" />
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-neutral-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Stage 2+ Modules (Disabled Placeholders) */}
        <div>
          <p className="px-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>AI Modules</span>
            <Lock className="w-3 h-3 text-neutral-500" />
          </p>
          <div className="space-y-1.5 opacity-70">
            {stage2NavItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-neutral-400 cursor-not-allowed select-none bg-[#0d0d0d] border border-[#242424]"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-neutral-500" />
                    <span>{item.name}</span>
                  </div>
                  <Badge variant="gray" className="text-[10px] py-0 px-1.5 font-medium">
                    Stage 2+
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Engine Status Footer */}
      <div className="p-3.5 rounded-xl bg-[#0d0d0d] border border-[#242424] text-xs text-neutral-400 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Stage 1 Core
          </span>
          <Badge variant="green" className="text-[9px] py-0 px-1 font-semibold">
            ACTIVE
          </Badge>
        </div>
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          Auth & Workspace provisioned cleanly.
        </p>
      </div>
    </aside>
  );
};
