"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useDeleteConversation } from "@/hooks/use-conversation";
import type { Conversation } from "@/lib/db/schema/conversations";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export const DeleteChatModal = ({
  conversation,
  open,
  onOpenChange,
}: {
  conversation: Conversation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { id } = useParams();
  const router = useRouter();
  const { mutate: deleteConversation, isPending } = useDeleteConversation();

  const handleDelete = () => {
    if (!conversation) {
      return;
    }

    deleteConversation(conversation.id, {
      onSuccess: (_, deletedId) => {
        toast.success("Conversation deleted successfully");
        onOpenChange(false);
        if (deletedId === id) {
          router.push("/dashboard/chat");
        }
      },
      onError: () => {
        toast.error("Failed to delete conversation");
      },
    });
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Conversation</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{conversation?.title}"? This action
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
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
