"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Bot, Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";

export const PublicNavbar: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScroll = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#242424]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white group-hover:border-neutral-600 transition-colors">
            <Bot className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              SocialAutomate
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-neutral-900 text-neutral-300 border border-neutral-800 rounded-md">
                Stage 1
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-neutral-300">
          <Link
            href="/"
            onClick={(e) => {
              if (window.location.pathname === "/") {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="hover:text-white transition-colors"
          >
            Home
          </Link>
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
        </nav>

        {/* Desktop Action Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Link href="/dashboard">
              <Button variant="primary" size="sm" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-neutral-300 hover:text-white">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm" className="gap-1.5">
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#242424] bg-[#0d0d0d] px-4 pt-4 pb-6 space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-neutral-300">
            <Link
              href="/"
              onClick={() => {
                setMobileMenuOpen(false);
                if (window.location.pathname === "/") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Home
            </Link>
            <a
              href="/#features"
              onClick={(e) => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  handleScroll("features");
                } else {
                  setMobileMenuOpen(false);
                }
              }}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="/#connectivity"
              onClick={(e) => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  handleScroll("connectivity");
                } else {
                  setMobileMenuOpen(false);
                }
              }}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors"
            >
              Connectivity
            </a>
            <a
              href="/#about"
              onClick={(e) => {
                if (window.location.pathname === "/") {
                  e.preventDefault();
                  handleScroll("about");
                } else {
                  setMobileMenuOpen(false);
                }
              }}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white transition-colors"
            >
              About Us
            </a>
          </nav>

          <div className="pt-3 border-t border-[#242424] flex flex-col space-y-2">
            {user ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" className="w-full justify-center">
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full justify-center gap-2">
                    Get Started Free
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
