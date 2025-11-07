"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useUpdateConversation } from "@/hooks/use-conversation";
import type { Conversation } from "@/lib/db";
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
    if (!conversation) return;

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
      },
    );
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          form.reset();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Conversation</DialogTitle>
          <DialogDescription>
            Enter a new title for this conversation.
          </DialogDescription>
        </DialogHeader>
        <form
          id="rename-chat-form"
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="rename-chat-title">Title</FieldLabel>
                <Input
                  {...field}
                  id="rename-chat-title"
                  placeholder="Enter conversation title"
                  aria-invalid={fieldState.invalid}
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                form.reset();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" form="rename-chat-form" disabled={isPending}>
              {isPending ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
