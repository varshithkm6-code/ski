"use client";

import React, { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useToast } from "@/components/ui/Toast";
import { X, ShieldAlert, Trash2, CheckCircle2, User, Loader2 } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!isOpen) return null;

  const user = session?.user as { name?: string | null; email?: string | null; role?: string } | undefined;

  const handleDeleteData = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/me", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete account");

      toast({
        type: "success",
        title: "Data Deleted",
        description: "All your profile records and assessments have been wiped.",
      });

      onClose();
      signOut({ callbackUrl: "/login" });
    } catch (e) {
      toast({
        type: "error",
        title: "Deletion Failed",
        description: e instanceof Error ? e.message : "Could not complete account deletion.",
      });
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        className="relative z-50 w-full max-w-md bg-surface border border-border rounded-card shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <h2 id="settings-dialog-title" className="text-base font-semibold text-ink">
              Account & Privacy Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings dialog"
            className="p-1 rounded-lg text-muted hover:text-ink hover:bg-surface-subtle transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-3.5 rounded-control bg-surface-subtle border border-border text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted">Name:</span>
            <span className="font-semibold text-ink">{user?.name || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Email:</span>
            <span className="font-mono text-ink">{user?.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Role:</span>
            <span className="font-mono uppercase font-bold text-primary">{user?.role}</span>
          </div>
        </div>

        {/* Privacy & Fairness Assurance */}
        <div className="space-y-2 text-xs text-muted">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-strong shrink-0 mt-0.5" />
            <span>Zero demographic profiling: algorithms never inspect age, gender, or race.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-status-strong shrink-0 mt-0.5" />
            <span>AES-256 encrypted raw resume storage with zero persistent plain-text logs.</span>
          </div>
        </div>

        {/* Data Erasure Section */}
        <div className="pt-3 border-t border-border">
          <h3 className="text-xs font-semibold text-status-critical uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4" />
            <span>Right to Erasure (GDPR / CCPA)</span>
          </h3>

          {!confirmDelete ? (
            <div>
              <p className="text-xs text-muted leading-relaxed mb-3">
                Permanently delete all your personal competencies, uploaded resumes, assessment results, and roadmap progress. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="btn-secondary border-status-critical/30 text-status-critical-text hover:bg-status-critical-bg text-xs w-full justify-center h-10 gap-2 cursor-pointer font-semibold"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete my data</span>
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-control bg-status-critical-bg border border-status-critical/30 space-y-3">
              <p className="text-xs text-status-critical-text font-semibold">
                Are you absolutely sure? All analysis records and account details will be irreversibly deleted.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleDeleteData}
                  className="btn-primary bg-status-critical hover:bg-status-critical/90 text-xs flex-1 justify-center h-9 font-semibold cursor-pointer"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Yes, permanently wipe data</span>
                  )}
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setConfirmDelete(false)}
                  className="btn-secondary text-xs px-3 h-9 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
