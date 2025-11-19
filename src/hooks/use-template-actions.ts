"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteTemplateAction,
  duplicateTemplateAction,
  toggleTemplateFavoriteAction,
} from "@/actions/template-actions";
import type { Template } from "@/lib/db/schema/templates";

export function useTemplateActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDuplicateTemplate = useCallback(
    (template: Template) => {
      startTransition(() => {
        const duplicatePromise = duplicateTemplateAction(template.id).then(
          (result) => {
            if (result.success) {
              router.refresh();
              return result;
            }
            throw new Error(result.error || "Failed to duplicate template");
          }
        );

        toast.promise(duplicatePromise, {
          loading: `Duplicating "${template.title}"...`,
          success: `Template "${template.title}" duplicated successfully`,
          error: (error) => error.message || "Failed to duplicate template",
        });
      });
    },
    [router]
  );

  const handleDeleteTemplate = useCallback(
    (template: Template) => {
      startTransition(async () => {
        try {
          const result = await deleteTemplateAction(template.id);
          if (result.success) {
            toast.success(`Template "${template.title}" deleted successfully`);
            router.refresh();
          } else {
            toast.error(result.error || "Failed to delete template");
          }
        } catch (error) {
          console.error("Error deleting template:", error);
          toast.error("Failed to delete template");
        }
      });
    },
    [router]
  );

  const handleToggleFavorite = useCallback(
    (template: Template) => {
      startTransition(() => {
        const action = template.isFavorite ? "removed from" : "added to";
        const actionVerb = template.isFavorite ? "Removing from" : "Adding to";

        const togglePromise = toggleTemplateFavoriteAction(template.id).then(
          (result) => {
            if (result.success) {
              router.refresh();
              return result;
            }
            throw new Error(result.error || "Failed to update favorites");
          }
        );

        toast.promise(togglePromise, {
          loading: `${actionVerb} favorites...`,
          success: `Template "${template.title}" ${action} favorites`,
          error: (error) => error.message || "Failed to update favorites",
        });
      });
    },
    [router]
  );
  const handleCopyId = useCallback(async (template: Template) => {
    try {
      await navigator.clipboard.writeText(template.id);
      toast.success("Template ID copied to clipboard");
    } catch (error) {
      console.error("Error copying ID:", error);
      toast.error("Failed to copy template ID");
    }
  }, []);

  return {
    isPending,
    handleDuplicateTemplate,
    handleDeleteTemplate,
    handleToggleFavorite,
    handleCopyId,
  };
}
