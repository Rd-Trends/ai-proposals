"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useUpdateConversation } from "@/hooks/use-conversation";
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
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";

const renameConversationSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
});

type RenameConversationFormValues = z.infer<typeof renameConversationSchema>;

export const RenameChatModal = ({
  conversation,
  open,
  onOpenChange,
}: {
  conversation: Conversation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { mutate, isPending } = useUpdateConversation();

  const form = useForm<RenameConversationFormValues>({
    resolver: zodResolver(renameConversationSchema),
    defaultValues: {
      title: conversation.title,
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    if (!conversation) {
      return;
    }

    mutate(
      { id: conversation.id, title: data.title },
      {
        onSuccess: () => {
          toast.success("Conversation renamed successfully");
          onOpenChange(false);
          form.reset();
        },
        onError: () => {
          toast.error("Failed to rename conversation");
        },
      }
    );
  });

  return (
    <Dialog
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
      open={open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Conversation</DialogTitle>
          <DialogDescription>
            Enter a new title for this conversation.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          id="rename-chat-form"
          onSubmit={handleSubmit}
        >
          <Controller
            control={form.control}
            name="title"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="rename-chat-title">Title</FieldLabel>
                <Input
                  {...field}
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  id="rename-chat-title"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder="Enter conversation title"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <DialogFooter>
            <Button
              disabled={isPending}
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isPending} form="rename-chat-form" type="submit">
              {isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
