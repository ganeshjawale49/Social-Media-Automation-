"use client";

import React from "react";
import Link from "next/link";
import { Bot } from "lucide-react";

export const PublicFooter: React.FC = () => {
  const handleScroll = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-[#080808] border-t border-[#242424] text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white">
                <Bot className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                SocialAutomate
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              An AI-powered social media automation platform designed to simplify planning, content generation, scheduled publishing, and performance analytics across channels.
            </p>
            <div className="pt-1 text-[11px] text-neutral-500 font-medium">
              Developed by <span className="text-neutral-300 font-semibold">Bharti Nexus Technologies</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Platform
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <a
                  href="/#features"
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      handleScroll("features");
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/#connectivity"
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      handleScroll("connectivity");
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  Connectivity
                </a>
              </li>
              <li>
                <a
                  href="/#about"
                  onClick={(e) => {
                    if (window.location.pathname === "/") {
                      e.preventDefault();
                      handleScroll("about");
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
            </ul>
          </div>

          {/* Account & Access */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              Account & Portal
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-white transition-colors">
                  Register / Get Started
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Workspace Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#1a1a1a] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} SocialAutomate by Bharti Nexus Technologies. All rights reserved.</p>
          <p className="font-mono text-neutral-600">Stage 1 Foundation Architecture</p>
        </div>
      </div>
    </footer>
  );
};
