"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import {
  useConversationHistory,
  useDeleteConversation,
  useUpdateConversation,
} from "@/hooks/use-conversation";
import { useIsMobile } from "@/hooks/use-mobile";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

export const ChatHistory = () => {
  const isMobile = useIsMobile();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationHistory(10);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const conversations = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  if (conversations.length > 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
        <SidebarMenu>
          {conversations.map((conversation) => (
            <SidebarMenuItem key={conversation.id}>
              <SidebarMenuButton asChild>
                <Link href={`/dashboard/chat/${conversation.id}`}>
                  <span className="truncate">{conversation.title}</span>
                </Link>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                  className="min-w-40 rounded-lg"
                >
                  <DropdownMenuItem
                    onSelect={() => {
                      setSelectedConversation(conversation);
                      setShowRenameModal(true);
                    }}
                  >
                    <Pencil className="size-4" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    variant="destructive"
                    onSelect={() => {
                      setSelectedConversation(conversation);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash2 className="size-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))}
          {hasNextPage && (
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="w-full"
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        {/* Rename Conversation Modal */}
        <RenameConversationModal
          conversation={selectedConversation}
          open={showRenameModal}
          onOpenChange={setShowRenameModal}
        />

        {/* Delete Conversation Modal */}
        <DeleteConversationModal
          conversation={selectedConversation}
          open={showDeleteModal}
          onOpenChange={setShowDeleteModal}
        />
      </SidebarGroup>
    );
  }
};

// Form schema for renaming conversation
const renameConversationSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters")
    .trim(),
});

type RenameConversationFormValues = z.infer<typeof renameConversationSchema>;

// Rename conversation modal
const RenameConversationModal = ({
  conversation,
  open,
  onOpenChange,
}: {
  conversation: Conversation | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { mutate: updateConversation, isPending } = useUpdateConversation();

  const form = useForm<RenameConversationFormValues>({
    resolver: zodResolver(renameConversationSchema),
    defaultValues: {
      title: "",
    },
  });

  // Update form when conversation changes
  useEffect(() => {
    if (conversation && open) {
      form.reset({ title: conversation.title });
    }
  }, [conversation, open, form]);

  const handleSubmit = form.handleSubmit((data) => {
    if (!conversation) return;

    updateConversation(
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
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter conversation title"
                      {...field}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmit();
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
              <Button type="submit" disabled={isPending}>
                {isPending ? "Renaming..." : "Rename"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Delete conversation modal
const DeleteConversationModal = ({
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
    if (!conversation) return;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
