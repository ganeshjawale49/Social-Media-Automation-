"use client";

import React from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/public/public-navbar";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  PenTool,
  Image as ImageIcon,
  Clock,
  Send,
  BarChart3,
  BrainCircuit,
  Repeat,
  Building2,
  ShieldCheck,
  Instagram,
  Facebook,
  Linkedin,
  Youtube,
  Video,
  Layers,
  Zap,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  const heroCapabilities = [
    "Plan content",
    "Generate AI content",
    "Create creatives",
    "Schedule posts",
    "Publish across platforms",
    "Analyze performance",
    "Optimize future content",
  ];

  const features = [
    {
      title: "Content Calendar",
      icon: Calendar,
      description: "Interactive visual calendar to map, organize, and manage your posting schedule seamlessly.",
      status: "Available in Stage 1",
      isCurrentStage: true,
    },
    {
      title: "AI Content Creation",
      icon: PenTool,
      description: "Generate multi-platform text, captions, hashtags, and copywriting tailored to your brand voice.",
      status: "Coming in Stage 2",
      isCurrentStage: false,
    },
    {
      title: "AI Creative Generation",
      icon: ImageIcon,
      description: "Generate stunning visual assets, custom graphics, and image posts powered by generative AI models.",
      status: "Coming in Stage 2",
      isCurrentStage: false,
    },
    {
      title: "Smart Scheduling",
      icon: Clock,
      description: "Automated posting queues tuned to peak audience activity hours for optimal post reach.",
      status: "Coming in Stage 3",
      isCurrentStage: false,
    },
    {
      title: "Social Media Publishing",
      icon: Send,
      description: "Direct, automated multi-channel publishing to top social platforms from one workspace.",
      status: "Coming in Stage 3",
      isCurrentStage: false,
    },
    {
      title: "Analytics & Reporting",
      icon: BarChart3,
      description: "Comprehensive performance metrics, audience engagement analytics, and post insights.",
      status: "Coming in Stage 4",
      isCurrentStage: false,
    },
    {
      title: "AI Optimization",
      icon: BrainCircuit,
      description: "Continuous learning models that analyze metrics to suggest optimal posting strategies.",
      status: "Coming in Stage 4",
      isCurrentStage: false,
    },
    {
      title: "Content Repurposing",
      icon: Repeat,
      description: "Effortlessly convert long-form content, blogs, or videos into snippets across channels.",
      status: "Coming in Stage 5",
      isCurrentStage: false,
    },
  ];

  const platforms = [
    {
      name: "Instagram",
      icon: Instagram,
      description: "Publish feed posts, reels, and stories directly to your Instagram profiles.",
      status: "Available in Stage 3",
    },
    {
      name: "Facebook",
      icon: Facebook,
      description: "Automate updates and media distribution for Facebook Pages and groups.",
      status: "Available in Stage 3",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      description: "Share professional insights, articles, and corporate updates on LinkedIn.",
      status: "Available in Stage 3",
    },
    {
      name: "X (Twitter)",
      icon: Zap,
      description: "Schedule threads, text updates, and media posts directly to your feed.",
      status: "Available in Stage 3",
    },
    {
      name: "YouTube",
      icon: Youtube,
      description: "Schedule video uploads, shorts, and community channel announcements.",
      status: "Available in Stage 3",
    },
    {
      name: "TikTok",
      icon: Video,
      description: "Auto-publish short-form video content directly to your TikTok account.",
      status: "Available in Stage 3",
    },
    {
      name: "Pinterest",
      icon: ImageIcon,
      description: "Schedule pins, boards, and visual graphics for targeted organic traffic.",
      status: "Available in Stage 3",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <PublicNavbar />

      <main className="flex-1 space-y-24 pb-20">
        {/* HERO SECTION */}
        <section className="relative pt-16 md:pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            {/* Stage Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span>AI-POWERED SOCIAL MEDIA AUTOMATION</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              AI-Powered Social Media Automation
            </h1>

            {/* Platform Scope Summary */}
            <p className="text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              SocialAutomate provides a unified workspace to plan, create, schedule, publish, and optimize your entire social media presence with intelligent automation.
            </p>

            {/* Key Capabilities List */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
              {heroCapabilities.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#0d0d0d] border border-[#242424] text-xs font-medium text-neutral-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 text-sm">
                    Go to Workspace Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto gap-2 text-sm">
                      Get Started Free
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href="/login" className="w-full sm:w-auto">
                    <Button variant="secondary" size="lg" className="w-full sm:w-auto text-sm">
                      Login to Workspace
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Hero Interface Graphic Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[#242424] bg-[#0c0c0c] p-4 sm:p-6 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-[#242424] mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-neutral-800"></div>
                <div className="w-3 h-3 rounded-full bg-neutral-800"></div>
                <div className="w-3 h-3 rounded-full bg-neutral-800"></div>
                <span className="ml-2 text-xs font-mono text-neutral-400">socialautomate.app / workspace</span>
              </div>
              <Badge variant="gray" className="text-[10px]">
                Stage 1 Active Workspace
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#121212] border border-[#242424] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Centralized Workspace</span>
                  <Building2 className="w-4 h-4 text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Provision personal & team workspaces with isolated settings and user roles.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-[#242424] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Interactive Calendar</span>
                  <Calendar className="w-4 h-4 text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Organize post timelines and schedule content across publishing slots.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#121212] border border-[#242424] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Unified Platform Mesh</span>
                  <Layers className="w-4 h-4 text-neutral-400" />
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Connect multi-channel social accounts into a single management interface.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Platform Features & Capabilities
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
              Explore the capabilities designed to streamline your entire social media lifecycle. Advanced AI modules are marked with their upcoming release stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <Card
                  key={idx}
                  glass={false}
                  className={`p-6 space-y-4 border transition-all ${
                    item.isCurrentStage
                      ? "border-neutral-700 bg-[#0d0d0d]"
                      : "border-[#242424] bg-[#090909]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <Badge
                      variant={item.isCurrentStage ? "green" : "gray"}
                      className="text-[10px] font-semibold"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CONNECTIVITY SECTION */}
        <section id="connectivity" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-400">
              <span>UNIFIED WORKSPACE INTEGRATION</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
              Connect Your Social Platforms
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
              SocialAutomate is designed to connect all your major social media networks into one workspace. Multi-platform API integration will be enabled in upcoming platform stages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform, idx) => {
              const IconComponent = platform.icon;
              return (
                <Card
                  key={idx}
                  glass={false}
                  className="p-6 space-y-4 border border-[#242424] bg-[#0d0d0d] hover:border-neutral-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <Badge variant="gray" className="text-[10px] font-medium">
                      {platform.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-white">{platform.name}</h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {platform.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Integration Stage Banner */}
          <div className="mt-8 p-6 rounded-xl bg-[#0a0a0a] border border-[#242424] text-center space-y-2">
            <p className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
              Stage 1 Foundation Architecture Notice
            </p>
            <p className="text-xs text-neutral-400 max-w-xl mx-auto leading-relaxed">
              Social network OAuth credentials and automated publishing protocols will be fully active in Stage 3. Stage 1 focuses on core account authentication and workspace management.
            </p>
          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section id="about" className="scroll-mt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Card glass={false} className="p-8 sm:p-12 border border-[#242424] bg-[#0a0a0a] space-y-8 rounded-2xl">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-400">
                <span>COMPANY & PRODUCT VISION</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">
                About SocialAutomate
              </h2>
              <p className="text-sm font-semibold text-neutral-300">
                Developed by Bharti Nexus Technologies
              </p>
            </div>

            <div className="space-y-4 text-sm text-neutral-300 leading-relaxed max-w-4xl">
              <p>
                SocialAutomate is an AI-powered platform designed to simplify social media planning, content creation, scheduled publishing, and performance optimization.
              </p>
              <p>
                Our core vision is to build a unified operating system for digital presence — empowering creators, agencies, and businesses to automate repetitive publishing tasks while utilizing state-of-the-art generative AI for high-performing copy and visual content.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#242424]">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-neutral-400" />
                  <span>Unified Workspaces</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Manage multiple brand profiles and team workspaces with clean permissions and centralized settings.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <BrainCircuit className="w-4 h-4 text-neutral-400" />
                  <span>AI Automation</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Harness AI models to automate content creation, visual asset generation, and post timing optimization.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  <Building2 className="w-4 h-4 text-neutral-400" />
                  <span>Bharti Nexus Technologies</span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Built on modern, robust web infrastructure to ensure privacy, performance, and reliable delivery.
                </p>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
