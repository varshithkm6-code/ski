"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-[#F7F8FF] p-6 text-[#12142B] font-sans">
        <div className="max-w-md w-full p-8 text-center bg-white border border-[#E3E6F5] rounded-2xl shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#FFF1F2] border border-[#E11D48]/20 text-[#E11D48] flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-bold">Critical Application Error</h2>
          <p className="text-xs text-[#5B6080] leading-relaxed">
            A system-level error occurred while loading SkillBridge. Please refresh or return to the application.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => reset()}
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-[#4F46E5] text-white text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl bg-white border border-[#E3E6F5] text-[#12142B] text-xs font-medium cursor-pointer"
            >
              <span>Home</span>
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
