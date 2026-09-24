"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal";
import { LogOut, User, Building2, ChevronDown, Plus, Check, Bot } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, workspace, workspaces, logout, switchWorkspace } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectWorkspace = async (wsId: string) => {
    setIsDropdownOpen(false);
    await switchWorkspace(wsId);
  };

  return (
    <>
      <header className="h-16 border-b border-[#242424] bg-[#050505] px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
        {/* Brand Logo & Workspace Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white flex items-center gap-2">
                SocialAutomate
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-800 rounded-md">
                  Stage 1
                </span>
              </h1>
            </div>
          </div>

          {/* Workspace Dropdown */}
          {workspace && (
            <div className="relative pl-3 border-l border-[#242424]">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0d0d0d] border border-[#242424] hover:border-neutral-700 text-xs font-medium text-neutral-300 hover:text-white transition-all"
              >
                <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                <span className="max-w-[140px] truncate font-semibold text-white">{workspace.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 mt-2 w-64 rounded-xl bg-[#0d0d0d] border border-[#242424] shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
                    <span>Workspaces</span>
                    <span className="text-white font-semibold">{workspaces.length}</span>
                  </div>
                  <div className="max-h-52 overflow-y-auto space-y-1 px-1.5 py-1">
                    {workspaces.map((ws) => (
                      <button
                        key={ws.id}
                        onClick={() => handleSelectWorkspace(ws.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-all ${
                          ws.id === workspace.id
                            ? "bg-neutral-800 text-white font-semibold"
                            : "text-neutral-400 hover:bg-neutral-900 hover:text-white"
                        }`}
                      >
                        <span className="truncate">{ws.name}</span>
                        {ws.id === workspace.id && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-[#242424] mt-1 pt-1 px-1.5">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setIsModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-neutral-900 font-semibold flex items-center gap-2 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Create New Workspace
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-3">
          {user && (
            <div className="flex items-center space-x-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsModalOpen(true)}
                className="hidden sm:inline-flex"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Workspace
              </Button>

              <div className="flex items-center space-x-3 pl-3 border-l border-[#242424]">
                <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white font-semibold text-xs">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-white">{user.full_name}</p>
                  <p className="text-[11px] text-neutral-400">{user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-neutral-400 hover:text-white"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Logout</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
