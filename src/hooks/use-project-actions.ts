"use client";

import { toast } from "sonner";

export const useProjectActions = () => {
  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      toast.success("Project ID copied to clipboard");
    } catch {
      toast.error("Failed to copy project ID");
    }
  };

  return {
    handleCopyId,
  };
};
