"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { brandProfileApi } from "@/lib/brand-profile";
import { BrandProfile, BrandBrainContext } from "@/types";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  Building2,
  Sparkles,
  Edit3,
  Trash2,
  Check,
  BrainCircuit,
  Globe,
  MapPin,
  Tag,
  Users,
  Target,
  FileText,
  AlertCircle,
  Code,
  CheckCircle2,
  Plus,
  RefreshCw,
} from "lucide-react";

export default function BrandProfilePage() {
  const { user, workspace, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [brainContext, setBrainContext] = useState<BrandBrainContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showBrainPreview, setShowBrainPreview] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    brand_name: "",
    industry: "",
    products_services: "",
    target_audience: "",
    location: "",
    brand_tone: "",
    brand_colors: "",
    website: "",
    competitors: "",
    usp: "",
    business_goals: "",
    preferred_language: "English",
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadBrandProfile = async () => {
    if (!workspace) return;
    setLoading(true);
    try {
      const data = await brandProfileApi.getProfile(workspace.id);
      setProfile(data);
      if (data) {
        setFormData({
          brand_name: data.brand_name || "",
          industry: data.industry || "",
          products_services: data.products_services || "",
          target_audience: data.target_audience || "",
          location: data.location || "",
          brand_tone: data.brand_tone || "",
          brand_colors: data.brand_colors || "",
          website: data.website || "",
          competitors: data.competitors || "",
          usp: data.usp || "",
          business_goals: data.business_goals || "",
          preferred_language: data.preferred_language || "English",
        });
        setIsEditing(false);
      } else {
        setIsEditing(true);
      }

      // Fetch normalized AI Brand Brain Context
      const ctx = await brandProfileApi.getContext(workspace.id);
      setBrainContext(ctx);
    } catch (err: any) {
      console.error("Failed to load brand profile:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.detail || "Failed to load brand profile",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspace?.id) {
      loadBrandProfile();
    }
  }, [workspace?.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.brand_name.trim()) {
      errors.brand_name = "Brand / Company Name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setNotification(null);

    try {
      let updatedProfile: BrandProfile;
      if (profile) {
        updatedProfile = await brandProfileApi.updateProfile(formData, workspace?.id);
        setNotification({ type: "success", message: "Brand profile updated successfully!" });
      } else {
        updatedProfile = await brandProfileApi.createProfile(formData, workspace?.id);
        setNotification({ type: "success", message: "Brand profile created successfully!" });
      }

      setProfile(updatedProfile);
      setIsEditing(false);

      // Refresh brain context
      const ctx = await brandProfileApi.getContext(workspace?.id);
      setBrainContext(ctx);
    } catch (err: any) {
      console.error("Failed to save brand profile:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.detail || "Failed to save brand profile. Please check inputs.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!workspace) return;
    setDeleting(true);
    try {
      await brandProfileApi.deleteProfile(workspace.id);
      setProfile(null);
      setBrainContext(null);
      setFormData({
        brand_name: "",
        industry: "",
        products_services: "",
        target_audience: "",
        location: "",
        brand_tone: "",
        brand_colors: "",
        website: "",
        competitors: "",
        usp: "",
        business_goals: "",
        preferred_language: "English",
      });
      setShowDeleteModal(false);
      setIsEditing(true);
      setNotification({ type: "success", message: "Brand profile deleted successfully." });
    } catch (err: any) {
      console.error("Failed to delete brand profile:", err);
      setNotification({
        type: "error",
        message: err.response?.data?.detail || "Failed to delete brand profile.",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
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
          {/* Header Banner */}
          <div className="relative overflow-hidden p-6 md:p-8 rounded-2xl bg-[#0d0d0d] border border-[#242424]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Brand Profile
                  </h1>
                  {profile ? (
                    <Badge variant="green" className="text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" /> Profile Configured
                    </Badge>
                  ) : (
                    <Badge variant="gray" className="text-xs font-medium text-amber-400 bg-amber-950/60 border-amber-800/80">
                      Setup Required
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-400 max-w-2xl leading-relaxed">
                  Establish your brand identity, tone, products, and USP. This memory layer serves as the foundation for the AI Brand Brain.
                </p>
              </div>

              {profile && !isEditing && (
                <div className="flex items-center gap-3 shrink-0">
                  <Button variant="secondary" size="md" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Notification Banner */}
          {notification && (
            <div
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                notification.type === "success"
                  ? "bg-emerald-950/50 border-emerald-800/80 text-emerald-300"
                  : "bg-red-950/50 border-red-800/80 text-red-300"
              }`}
            >
              <div className="flex items-center gap-3 text-sm font-medium">
                {notification.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <span>{notification.message}</span>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-neutral-400 hover:text-white text-xs font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* AI Brand Brain Status Overview Card */}
          <Card className="space-y-4 border border-[#242424] bg-[#0d0d0d] relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#242424]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/50 border border-purple-800/60 flex items-center justify-center text-purple-400">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    AI Brand Brain Foundation
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Structured brand memory context for future AI automation engine
                  </p>
                </div>
              </div>

              <div>
                {brainContext?.is_ready ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Brand Brain Ready</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Brand Brain Unconfigured</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-neutral-300 leading-relaxed">
                The saved Brand Profile provides normalized context (voice, colors, USP, audience) for future AI generation modules. AI content generation will be enabled in a future stage.
              </p>

              {brainContext?.is_ready && (
                <div className="pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 px-0"
                    onClick={() => setShowBrainPreview(!showBrainPreview)}
                  >
                    <Code className="w-3.5 h-3.5" />
                    {showBrainPreview ? "Hide AI Context Prompt Preview" : "Inspect Normalized AI Brand Context Prompt"}
                  </Button>

                  {showBrainPreview && (
                    <div className="mt-3 p-4 rounded-xl bg-black border border-[#242424] font-mono text-xs text-neutral-300 whitespace-pre-wrap overflow-x-auto leading-relaxed">
                      {brainContext.formatted_context_prompt}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Main Content Area: Form vs Overview */}
          {isEditing ? (
            /* Editable Form Section */
            <Card className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#242424]">
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {profile ? "Edit Brand Profile" : "Create Brand Profile"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Complete all details to configure your workspace brand identity.
                  </p>
                </div>
                {profile && (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Brand Name */}
                  <Input
                    label="Brand / Company Name *"
                    placeholder="e.g. Acme Corporation"
                    value={formData.brand_name}
                    onChange={(e) => handleInputChange("brand_name", e.target.value)}
                    error={formErrors.brand_name}
                  />

                  {/* Industry */}
                  <Input
                    label="Industry"
                    placeholder="e.g. B2B SaaS, E-Commerce, FinTech"
                    value={formData.industry}
                    onChange={(e) => handleInputChange("industry", e.target.value)}
                  />

                  {/* Website */}
                  <Input
                    label="Website"
                    placeholder="e.g. https://acme.com"
                    value={formData.website}
                    onChange={(e) => handleInputChange("website", e.target.value)}
                  />

                  {/* Location */}
                  <Input
                    label="Location"
                    placeholder="e.g. San Francisco, CA / Global"
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />

                  {/* Brand Tone */}
                  <Input
                    label="Brand Tone"
                    placeholder="e.g. Professional, Friendly, Authoritative, Witty"
                    value={formData.brand_tone}
                    onChange={(e) => handleInputChange("brand_tone", e.target.value)}
                  />

                  {/* Brand Colors */}
                  <Input
                    label="Brand Colors"
                    placeholder="e.g. Emerald Green (#10B981), Obsidian Black (#0D0D0D)"
                    value={formData.brand_colors}
                    onChange={(e) => handleInputChange("brand_colors", e.target.value)}
                  />

                  {/* Preferred Language */}
                  <Input
                    label="Preferred Language"
                    placeholder="e.g. English, Spanish, French"
                    value={formData.preferred_language}
                    onChange={(e) => handleInputChange("preferred_language", e.target.value)}
                  />

                  {/* Competitors */}
                  <Input
                    label="Key Competitors"
                    placeholder="e.g. Competitor X, Competitor Y"
                    value={formData.competitors}
                    onChange={(e) => handleInputChange("competitors", e.target.value)}
                  />

                  {/* Products / Services */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="Products / Services"
                      placeholder="Describe your core product offerings, features, or service tiers..."
                      value={formData.products_services}
                      onChange={(e) => handleInputChange("products_services", e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Target Audience */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="Target Audience"
                      placeholder="Describe your primary ideal customer profile, demographics, pain points..."
                      value={formData.target_audience}
                      onChange={(e) => handleInputChange("target_audience", e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* USP */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="Unique Selling Proposition (USP)"
                      placeholder="What sets your brand apart from competitors? Key value proposition..."
                      value={formData.usp}
                      onChange={(e) => handleInputChange("usp", e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Business Goals */}
                  <div className="md:col-span-2">
                    <Textarea
                      label="Business Goals"
                      placeholder="Key objectives, growth targets, or brand positioning strategy..."
                      value={formData.business_goals}
                      onChange={(e) => handleInputChange("business_goals", e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#242424]">
                  {profile ? (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Brand Profile
                    </Button>
                  ) : (
                    <div />
                  )}

                  <div className="flex items-center gap-3">
                    {profile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="md"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button type="submit" variant="primary" size="md" isLoading={saving}>
                      <Check className="w-4 h-4" />
                      Save Brand Profile
                    </Button>
                  </div>
                </div>
              </form>
            </Card>
          ) : profile ? (
            /* View Mode: Brand Overview */
            <Card className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#242424]">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {profile.brand_name}
                  </h2>
                  {profile.industry && (
                    <p className="text-xs text-neutral-400 mt-0.5">{profile.industry}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit3 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Brand Name */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                    Brand Name
                  </p>
                  <p className="text-sm font-bold text-white">{profile.brand_name}</p>
                </div>

                {/* Industry */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-neutral-400" />
                    Industry
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {profile.industry || "Not specified"}
                  </p>
                </div>

                {/* Website */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-neutral-400" />
                    Website
                  </p>
                  {profile.website ? (
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-white font-medium underline underline-offset-2 truncate block hover:text-neutral-300"
                    >
                      {profile.website}
                    </a>
                  ) : (
                    <p className="text-sm text-neutral-500">Not specified</p>
                  )}
                </div>

                {/* Location */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    Location
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {profile.location || "Not specified"}
                  </p>
                </div>

                {/* Brand Tone */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                    Brand Tone
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {profile.brand_tone || "Not specified"}
                  </p>
                </div>

                {/* Preferred Language */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-neutral-400" />
                    Preferred Language
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {profile.preferred_language || "English"}
                  </p>
                </div>

                {/* Brand Colors */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-neutral-400" />
                    Brand Colors
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {profile.brand_colors || "Not specified"}
                  </p>
                </div>

                {/* Competitors */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    Competitors
                  </p>
                  <p className="text-sm font-semibold text-white">
                    {profile.competitors || "Not specified"}
                  </p>
                </div>

                {/* Created / Updated */}
                <div className="space-y-1 p-3.5 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
                    Last Updated
                  </p>
                  <p className="text-sm text-neutral-300 font-medium">
                    {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "N/A"}
                  </p>
                </div>

                {/* Products / Services */}
                <div className="md:col-span-2 lg:col-span-3 space-y-1 p-4 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-neutral-400" />
                    Products / Services
                  </p>
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap mt-1">
                    {profile.products_services || "Not specified"}
                  </p>
                </div>

                {/* Target Audience */}
                <div className="md:col-span-2 lg:col-span-3 space-y-1 p-4 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    Target Audience
                  </p>
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap mt-1">
                    {profile.target_audience || "Not specified"}
                  </p>
                </div>

                {/* Unique Selling Proposition */}
                <div className="md:col-span-2 lg:col-span-3 space-y-1 p-4 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
                    Unique Selling Proposition (USP)
                  </p>
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap mt-1">
                    {profile.usp || "Not specified"}
                  </p>
                </div>

                {/* Business Goals */}
                <div className="md:col-span-2 lg:col-span-3 space-y-1 p-4 rounded-lg bg-[#141414] border border-[#242424]">
                  <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-neutral-400" />
                    Business Goals
                  </p>
                  <p className="text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap mt-1">
                    {profile.business_goals || "Not specified"}
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            /* Empty State when no profile exists */
            <Card className="p-8 text-center space-y-4 border border-[#242424] bg-[#0d0d0d] rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 mx-auto">
                <Building2 className="w-6 h-6 text-neutral-300" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-white">No Brand Profile Configured</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Your workspace does not have a Brand Profile yet. Create your profile to initialize the AI Brand Brain.
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsEditing(true)}
                className="mx-auto"
              >
                <Plus className="w-4 h-4" />
                Create Brand Profile
              </Button>
            </Card>
          )}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md space-y-4 bg-[#0d0d0d] border border-[#242424]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Brand Profile?</h3>
                <p className="text-xs text-neutral-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Deleting this brand profile will remove all brand context and reset the AI Brand Brain status for workspace <strong>{workspace?.name}</strong>.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                isLoading={deleting}
              >
                Confirm Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
