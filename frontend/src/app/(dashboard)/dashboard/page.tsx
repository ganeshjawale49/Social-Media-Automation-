"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { brandProfileApi } from "@/lib/brand-profile";
import { BrandProfile } from "@/types";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal";
import { DeleteWorkspaceModal } from "@/components/workspace/delete-workspace-modal";
import {
  Building2,
  ShieldCheck,
  Clock,
  Edit3,
  Trash2,
  Check,
  Plus,
  PenTool,
  Send,
  BrainCircuit,
  BarChart3,
  Layers,
  Sparkles,
  Zap,
  FolderPlus,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export default function DashboardPage() {
  const { user, workspace, workspaces, loading, updateWorkspace, switchWorkspace } = useAuth();
  const router = useRouter();

  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [wsName, setWsName] = useState("");
  const [wsDesc, setWsDesc] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
    if (workspace) {
      setWsName(workspace.name);
      setWsDesc(workspace.description || "");
    }
  }, [user, workspace, loading, router]);

  useEffect(() => {
    const fetchBrandProfileStatus = async () => {
      if (!workspace?.id) return;
      setProfileLoading(true);
      try {
        const res = await brandProfileApi.getProfile(workspace.id);
        setBrandProfile(res);
      } catch (err) {
        setBrandProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchBrandProfileStatus();
  }, [workspace?.id]);

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateSuccess(false);
    try {
      await updateWorkspace(wsName, wsDesc);
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update workspace:", err);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#050505]">
      <Navbar />

      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 space-y-8 max-w-7xl mx-auto w-full">
          {/* Top Hero Banner */}
          <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-[#0d0d0d] border border-[#242424]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                    <Sparkles className="w-4 h-4 text-neutral-300" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Welcome back, {user.full_name}!
                  </h1>
                  <Badge variant="green" className="text-xs font-medium">
                    Session Active
                  </Badge>
                </div>
                <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
                  SocialAutomate Stage 2 is active. Configure your workspace brand identity and initialize your AI Brand Brain context below.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </Button>
              </div>
            </div>
          </div>

          {/* STAGE 2: Brand Profile Status Card */}
          {workspace && (
            <Card className="p-6 bg-[#0d0d0d] border border-[#242424] flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                  brandProfile
                    ? "bg-emerald-950/60 border-emerald-800/80 text-emerald-400"
                    : "bg-amber-950/60 border-amber-800/80 text-amber-400"
                }`}>
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-base font-bold text-white">Brand Profile</h3>
                    {profileLoading ? (
                      <Spinner size="sm" />
                    ) : brandProfile ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-400 border border-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5" /> Setup required
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 leading-relaxed max-w-xl">
                    {brandProfile
                      ? `Brand profile set up for "${brandProfile.brand_name}". AI Brand Brain context is normalized and ready.`
                      : "No brand profile found for this workspace. Set up your brand identity to enable AI Brand Brain context."}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <Link href="/brand-profile">
                  <Button variant={brandProfile ? "secondary" : "primary"} size="md" className="gap-2">
                    <span>{brandProfile ? "View / Edit Profile" : "Setup Brand Profile"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          )}

          {/* Active Workspace Details Section */}
          {workspace ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-neutral-400" />
                  Active Workspace Details
                </h2>
                {updateSuccess && (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                    <Check className="w-3.5 h-3.5" /> Workspace updated
                  </span>
                )}
              </div>

              <Card className="space-y-6">
                {!isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Workspace Name
                      </p>
                      <p className="text-base font-bold text-white">{workspace?.name}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Workspace Slug
                      </p>
                      <p className="text-xs font-mono text-white bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-lg inline-block font-semibold">
                        {workspace?.slug}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Role & Permissions
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-white font-medium">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Owner ({user.full_name})</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                        Created Date
                      </p>
                      <div className="flex items-center gap-1.5 text-sm text-neutral-400">
                        <Clock className="w-4 h-4 text-neutral-500" />
                        <span>{workspace?.created_at ? new Date(workspace.created_at).toLocaleDateString() : "N/A"}</span>
                      </div>
                    </div>

                    {workspace?.description && (
                      <div className="md:col-span-2 lg:col-span-4 pt-3 border-t border-[#242424]">
                        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
                          Description
                        </p>
                        <p className="text-sm text-neutral-300 mt-1">{workspace.description}</p>
                      </div>
                    )}

                    <div className="md:col-span-2 lg:col-span-4 flex items-center justify-end gap-3 pt-2">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setIsDeleteModalOpen(true)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete Workspace
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit Settings
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsCreateModalOpen(true)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create Workspace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-xl">
                    <h3 className="text-sm font-bold text-white">
                      Edit Workspace Settings
                    </h3>
                    <Input
                      label="Workspace Name"
                      value={wsName}
                      onChange={(e) => setWsName(e.target.value)}
                      required
                    />
                    <Input
                      label="Description"
                      value={wsDesc}
                      onChange={(e) => setWsDesc(e.target.value)}
                      placeholder="Optional workspace description"
                    />
                    <div className="flex items-center gap-3 pt-2">
                      <Button type="submit" variant="primary" size="sm" isLoading={updateLoading}>
                        Save Changes
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </Card>
            </div>
          ) : (
            /* Empty Workspace State */
            <Card className="p-8 text-center space-y-4 border border-[#242424] bg-[#0d0d0d] rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">No active workspace</h3>
                <p className="text-xs text-neutral-400">
                  You currently have no active workspaces. Create a new workspace to get started.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsCreateModalOpen(true)}
                className="mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Workspace
              </Button>
            </Card>
          )}

          {/* User Workspaces Grid Overview */}
          {workspaces.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-neutral-400" />
                  Your Provisioned Workspaces ({workspaces.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workspaces.map((ws) => (
                  <Card
                    key={ws.id}
                    className={`p-5 space-y-2.5 cursor-pointer transition-all ${
                      ws.id === workspace?.id
                        ? "border-white bg-[#141414]"
                        : "hover:border-neutral-600 bg-[#0d0d0d]"
                    }`}
                    onClick={() => switchWorkspace(ws.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{ws.name}</h4>
                      {ws.id === workspace?.id ? (
                        <Badge variant="gray" className="text-[10px] font-semibold bg-white text-black border-white">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="gray" className="text-[10px]">
                          Switch
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-mono text-neutral-400 font-medium">{ws.slug}</p>
                    {ws.description && (
                      <p className="text-xs text-neutral-500 line-clamp-1">{ws.description}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Future Stage 3+ Modules Roadmap Overview */}
          <div className="space-y-4 pt-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-neutral-400" />
                Platform Roadmap & Placeholder Modules
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Stage 2 Brand Identity established. Social integrations & AI content generation will unlock in Stage 3+.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card glass={false} className="space-y-3 border border-dashed border-[#242424] bg-[#0d0d0d]/60">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                    <PenTool className="w-4 h-4" />
                  </div>
                  <Badge variant="gray" className="text-[10px] font-medium">
                    Stage 3+
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Content Studio</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Multi-platform post editor and media asset manager.
                  </p>
                </div>
              </Card>

              <Card glass={false} className="space-y-3 border border-dashed border-[#242424] bg-[#0d0d0d]/60">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                    <Send className="w-4 h-4" />
                  </div>
                  <Badge variant="gray" className="text-[10px] font-medium">
                    Stage 3+
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Publishing Queue</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Automated scheduling & social channel publishing engine.
                  </p>
                </div>
              </Card>

              <Card glass={false} className="space-y-3 border border-dashed border-[#242424] bg-[#0d0d0d]/60">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                  <Badge variant="green" className="text-[10px] font-medium">
                    Stage 2 Ready
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">AI Brand Brain</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Normalized brand context layer active for future AI prompt orchestration.
                  </p>
                </div>
              </Card>

              <Card glass={false} className="space-y-3 border border-dashed border-[#242424] bg-[#0d0d0d]/60">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <Badge variant="gray" className="text-[10px] font-medium">
                    Stage 3+
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Analytics</h3>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                    Engagement reports & post performance metrics.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {workspace && (
        <DeleteWorkspaceModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          workspaceId={workspace.id}
          workspaceName={workspace.name}
        />
      )}
    </div>
  );
}
