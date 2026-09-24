"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { PublicNavbar } from "@/components/public/public-navbar";
import { PublicFooter } from "@/components/public/public-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  AlertCircle,
  Bot,
  Sparkles,
  CheckCircle2,
  Building2,
  Layers,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white">
      <PublicNavbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-12 relative overflow-hidden">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10 my-auto">
          {/* Side Information Panel (Desktop) */}
          <div className="lg:col-span-6 space-y-6 text-left hidden lg:block pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-semibold text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-neutral-300" />
              <span>SOCIALAUTOMATE WORKSPACE</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
                AI-Powered Social Media Automation
              </h1>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Log in to access your personal or team workspace and manage your social media automation pipelines.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4 text-neutral-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Centralized Workspaces</h4>
                  <p className="text-xs text-neutral-400">
                    Switch between multi-brand environments with complete data isolation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Layers className="w-4 h-4 text-neutral-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Interactive Content Calendar</h4>
                  <p className="text-xs text-neutral-400">
                    Organize post schedules and manage timelines across channels.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-neutral-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Secure Authentication</h4>
                  <p className="text-xs text-neutral-400">
                    JWT-based session authentication with encrypted credential protection.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1e1e1e] text-xs text-neutral-500">
              SocialAutomate by <span className="text-neutral-300 font-semibold">Bharti Nexus Technologies</span>
            </div>
          </div>

          {/* Login Card Panel */}
          <div className="lg:col-span-6 w-full max-w-md mx-auto">
            <Card glass={false} className="p-8 space-y-6 shadow-2xl border border-[#242424] bg-[#0d0d0d] rounded-2xl">
              {/* Branding Header */}
              <div className="text-center space-y-2">
                <div className="inline-flex w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 items-center justify-center text-white mb-1 shadow-lg">
                  <Bot className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold tracking-tight text-white">
                    Sign In to SocialAutomate
                  </h2>
                  <p className="text-xs text-neutral-400">
                    AI Social Media Automation Platform
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-900/80 text-red-200 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full mt-2"
                  isLoading={loading}
                >
                  Sign In to Workspace
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="pt-4 border-t border-[#242424] text-center text-xs text-neutral-400">
                Don't have an account yet?{" "}
                <Link
                  href="/register"
                  className="text-white hover:underline font-semibold transition-colors"
                >
                  Get Started / Register
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
