"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, X, AlertTriangle } from "lucide-react";

interface DeleteWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceName: string;
  onSuccess?: () => void;
}

export const DeleteWorkspaceModal: React.FC<DeleteWorkspaceModalProps> = ({
  isOpen,
  onClose,
  workspaceId,
  workspaceName,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { deleteWorkspace } = useAuth();

  if (!isOpen) return null;

  const handleDelete = async () => {
    setError(null);
    setLoading(true);
    try {
      await deleteWorkspace(workspaceId);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || "Failed to delete workspace. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <Card
        glass={false}
        className="w-full max-w-md p-6 relative space-y-6 shadow-2xl border border-red-900/60 bg-[#0d0d0d] rounded-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#242424] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                Delete workspace?
              </h2>
              <p className="text-xs text-red-400 font-medium">This action cannot be undone.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-lg bg-red-950/60 border border-red-900/80 text-red-200 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2 text-sm text-neutral-300">
          <p>
            Are you sure you want to permanently delete{" "}
            <span className="font-bold text-white">"{workspaceName}"</span>?
          </p>
          <p className="text-xs text-neutral-400 leading-relaxed">
            All associated settings, member access rights, and workspace configurations will be permanently removed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-[#242424]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleDelete}
            isLoading={loading}
          >
            <Trash2 className="w-4 h-4" />
            Yes, Delete Workspace
          </Button>
        </div>
      </Card>
    </div>
  );
};
