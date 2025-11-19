"use client";

import { Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteWaitlistEntry } from "@/actions/waitlist-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Waitlist } from "@/lib/db/schema/waitlist";

type DeleteWaitlistDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: Waitlist;
};

export function DeleteWaitlistDialog({
  open,
  onOpenChange,
  entry,
}: DeleteWaitlistDialogProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteWaitlistEntry(entry.email);
        toast.success("Waitlist entry deleted successfully");
        onOpenChange(false);
      } catch {
        toast.error("Failed to delete waitlist entry");
      }
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Waitlist Entry</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the waitlist entry for{" "}
            <span className="font-semibold">{entry.email}</span>? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={() => onOpenChange(false)}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={handleDelete}
            variant="destructive"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
