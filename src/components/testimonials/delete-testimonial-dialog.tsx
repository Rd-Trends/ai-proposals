"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTestimonial } from "@/actions/testimonial-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Testimonial } from "@/lib/db";

interface DeleteTestimonialDialogProps {
  testimonial: Testimonial;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTestimonialDialog({
  testimonial,
  open,
  onOpenChange,
}: DeleteTestimonialDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDeleteTemplate = async () => {
    startTransition(async () => {
      try {
        const result = await deleteTestimonial(testimonial.id);
        if (result.success) {
          toast.success(
            `Testimonial from "${testimonial.clientName}" deleted successfully`,
          );
          startTransition(() => {
            onOpenChange(false);
            router.refresh();
          });
        } else {
          toast.error(result.error || "Failed to delete testimonial");
        }
      } catch (error) {
        console.error("Error deleting testimonial", error);
        toast.error("Failed to delete testimonial");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Testimonial</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the testimonial from "
            {testimonial.clientName}"? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteTemplate}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-b-transparent" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Testimonial
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
