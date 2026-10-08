"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Drawer({ isOpen, onClose, title, description, children }: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/30 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content: bottom sheet on mobile, right panel on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className="relative z-50 w-full md:max-w-md lg:max-w-lg bg-surface h-[90vh] md:h-full mt-auto md:mt-0 rounded-t-card md:rounded-t-none md:rounded-l-card shadow-2xl flex flex-col border-t md:border-t-0 md:border-l border-border animate-in slide-in-from-bottom md:slide-in-from-right duration-250 ease-out"
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between bg-surface-subtle/50">
          <div>
            <h2 id="drawer-title" className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-muted mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-subtle transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
}
