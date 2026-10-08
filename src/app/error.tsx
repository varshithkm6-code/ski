"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas p-6 text-ink">
      <div className="card max-w-md w-full p-8 text-center bg-surface border border-border shadow-lg space-y-4">
        <div className="w-12 h-12 rounded-full bg-status-critical-bg border border-status-critical/20 text-status-critical flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h2 className="text-xl font-bold text-ink">Something went wrong</h2>
        <p className="text-xs text-muted leading-relaxed">
          An unexpected application error occurred. You can retry the current operation or return to the main dashboard.
        </p>

        {error.message && (
          <div className="p-3 rounded-control bg-surface-subtle border border-border text-[11px] font-mono text-muted text-left overflow-x-auto">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="btn-primary text-xs px-4 h-10 gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try again</span>
          </button>
          <Link
            href="/dashboard"
            className="btn-secondary text-xs px-4 h-10 gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
