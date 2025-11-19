"use client";

import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useConversationHistory } from "@/hooks/use-conversation";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Conversation } from "@/lib/db/schema/conversations";
import { DeleteChatModal } from "../chats/delete-chat-modal";
import { RenameChatModal } from "../chats/rename-chat-modal";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "../ui/sidebar";

export const ChatHistory = () => {
  const isMobile = useIsMobile();
  const { setOpenMobile } = useSidebar();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useConversationHistory(10);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const conversations = useMemo(
    () => data?.pages.flatMap((page) => page.data) || [],
    [data]
  );

  if (conversations.length > 0) {
    return (
      <SidebarGroup>
        <SidebarGroupLabel>Recent Conversations</SidebarGroupLabel>
        <SidebarMenu>
          {conversations.map((conversation) => (
            <SidebarMenuItem key={conversation.id}>
              <SidebarMenuButton asChild>
                <Link
                  href={`/dashboard/chat/${conversation.id}`}
                  onClick={() => setOpenMobile(false)}
                >
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
                  align={isMobile ? "end" : "start"}
                  className="min-w-40 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
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
                    onSelect={() => {
                      setSelectedConversation(conversation);
                      setShowDeleteModal(true);
                    }}
                    variant="destructive"
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
                className="w-full"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>

        {selectedConversation && (
          <>
            <RenameChatModal
              conversation={selectedConversation}
              key={`${selectedConversation.id}-rename-chat`}
              onOpenChange={setShowRenameModal}
              open={showRenameModal}
            />
            <DeleteChatModal
              conversation={selectedConversation}
              key={`${selectedConversation.id}-delete-chat`}
              onOpenChange={setShowDeleteModal}
              open={showDeleteModal}
            />
          </>
        )}
      </SidebarGroup>
    );
  }
};
