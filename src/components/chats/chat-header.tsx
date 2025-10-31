"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useGetConversation } from "@/hooks/use-conversation";
import type { Conversation } from "@/lib/db";
import { DeleteChatModal } from "./delete-chat-modal";
import { RenameChatModal } from "./rename-chat-modal";

export const ChatHeader = ({
  conversationId,
  conversation: initialData,
}: {
  conversationId: string;
  conversation?: Conversation | null;
}) => {
  const { data: conversation } = useGetConversation({
    id: conversationId,
    initialData,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="w-full flex flex-1 items-center gap-2 px-4">
          <div className="flex items-center gap-2 shrink-0">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
          </div>

          <h1 className="flex-1 truncate text-base font-medium">
            {conversation?.title || "New Chat"}
          </h1>

          {conversation && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto shrink-0"
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Chat options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsRenameModalOpen(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Rename chat
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete chat
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {conversation && (
        <>
          <DeleteChatModal
            conversation={conversation}
            open={isDeleteModalOpen}
            onOpenChange={setIsDeleteModalOpen}
          />

          <RenameChatModal
            conversation={conversation}
            open={isRenameModalOpen}
            onOpenChange={setIsRenameModalOpen}
          />
        </>
      )}
    </>
  );
};
