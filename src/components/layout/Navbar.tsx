"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Chip } from "@/components/ui/Chip";
import { SettingsModal } from "@/components/layout/SettingsModal";
import { LogOut, Compass, History, Users, BarChart3, Menu, X, Settings } from "lucide-react";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const user = session?.user as { role?: string; name?: string | null; email?: string | null } | undefined;
  const isCounselor = user?.role === "COUNSELOR" || user?.role === "ADMIN";

  const navItems = [
    { label: "Assess", href: "/dashboard", icon: <BarChart3 className="w-4 h-4" /> },
    { label: "Roles", href: "/roles", icon: <Compass className="w-4 h-4" /> },
    { label: "History", href: "/history", icon: <History className="w-4 h-4" /> },
    ...(isCounselor ? [{ label: "Counselor", href: "/counselor", icon: <Users className="w-4 h-4" /> }] : []),
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-control bg-primary text-white flex items-center justify-center font-bold text-sm tracking-tight transition group-hover:bg-primary-hover shadow-sm">
                SB
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-base text-ink leading-tight tracking-tight">
                  SkillBridge
                </span>
                <span className="text-[11px] text-muted tracking-tight hidden sm:block">
                  Career Readiness Analyzer
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-sm font-medium transition ${
                      active
                        ? "bg-surface-subtle text-primary font-semibold"
                        : "text-muted hover:text-ink hover:bg-surface-subtle/60"
                    }`}
                  >
                    <span className={active ? "text-primary" : "text-muted"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Menu / Auth actions (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-end text-right mr-1">
                  <span className="text-xs font-semibold text-ink leading-tight">
                    {user.name || user.email}
                  </span>
                  <span className="text-[10px] text-muted mt-0.5">
                    <Chip
                      variant={isCounselor ? "strong" : "neutral"}
                      className="py-0 px-2 text-[10px] uppercase font-mono tracking-wider"
                    >
                      {user.role}
                    </Chip>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="btn-secondary text-xs p-2 h-9 text-muted hover:text-ink"
                  title="Settings & Privacy"
                  aria-label="Open settings and privacy"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="btn-secondary text-xs px-2.5 py-1.5 h-9 gap-1.5"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5 text-muted" />
                  <span>Sign out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="btn-secondary text-xs px-3.5 py-1.5 h-9">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary text-xs px-3.5 py-1.5 h-9">
                  Get started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button (44px hit target) */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              className="w-11 h-11 flex items-center justify-center rounded-lg text-ink hover:bg-surface-subtle transition focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer / Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-surface px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      active
                        ? "bg-surface-subtle text-primary font-semibold"
                        : "text-ink hover:bg-surface-subtle/50"
                    }`}
                  >
                    <span className={active ? "text-primary" : "text-muted"}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-border">
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">{user.name || user.email}</div>
                      <div className="text-xs text-muted font-mono">{user.email}</div>
                    </div>
                    <Chip
                      variant={isCounselor ? "strong" : "neutral"}
                      className="text-[10px] uppercase font-mono"
                    >
                      {user.role}
                    </Chip>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setSettingsOpen(true);
                      }}
                      className="btn-secondary text-xs h-10 gap-1.5 justify-center"
                    >
                      <Settings className="w-3.5 h-3.5 text-muted" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut({ callbackUrl: "/login" });
                      }}
                      className="btn-secondary text-xs h-10 gap-1.5 justify-center"
                    >
                      <LogOut className="w-3.5 h-3.5 text-muted" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-secondary text-xs h-10 text-center justify-center"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-primary text-xs h-10 text-center justify-center"
                  >
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Settings Modal */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
