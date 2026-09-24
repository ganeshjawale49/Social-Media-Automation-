"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ArrowRight, AlertCircle, CheckCircle2, Bot, Sparkles } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName || !email || !password) {
      setError("Please complete all registration fields");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
      });
      router.push("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#050505] relative overflow-hidden">
      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-xl bg-neutral-900 border border-neutral-800 items-center justify-center text-white mb-1 shadow-lg">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
              SocialAutomate
              <Sparkles className="w-4 h-4 text-neutral-400" />
            </h1>
            <p className="text-sm font-medium text-neutral-400">
              AI Social Media Automation Platform
            </p>
          </div>
        </div>

        {/* Register Card */}
        <Card glass={false} className="p-8 space-y-6 shadow-2xl border border-[#242424] bg-[#0d0d0d] rounded-xl">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold text-white">Get Started Free</h2>
            <p className="text-xs text-neutral-400">Creates your user account & auto-provisions workspace</p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-900/80 text-red-200 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Johnson"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-neutral-400 space-y-1.5">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Automatic Workspace Onboarding
              </p>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Registering automatically provisions your personal workspace with Owner permissions.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={loading}
            >
              Create Account & Workspace
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="pt-4 border-t border-[#242424] text-center text-xs text-neutral-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-white hover:underline font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
