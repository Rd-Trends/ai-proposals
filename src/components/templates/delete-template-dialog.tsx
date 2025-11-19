"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTemplateAction } from "@/actions/template-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Template } from "@/lib/db/schema/templates";

type DeleteTemplateDialogProps = {
  template: Template;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteTemplateDialog({
  template,
  open,
  onOpenChange,
}: DeleteTemplateDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDeleteTemplate = () => {
    startTransition(async () => {
      try {
        const result = await deleteTemplateAction(template.id);
        if (result.success) {
          toast.success(`Template "${template.title}" deleted successfully`);
          startTransition(() => {
            onOpenChange(false);
            router.refresh();
          });
        } else {
          toast.error(result.error || "Failed to delete template");
        }
      } catch (error) {
        console.error("Error deleting template:", error);
        toast.error("Failed to delete template");
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Template</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{template.title}&quot;? This
            action cannot be undone. All data associated with this template will
            be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => onOpenChange?.(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDeleteTemplate}
            variant="destructive"
          >
            {isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
