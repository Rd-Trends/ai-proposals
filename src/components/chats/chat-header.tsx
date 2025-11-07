"use client";

import { Check, Copy, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useClipboard } from "@/hooks/use-clipboard";
import {
  useGetConversation,
  useUpdateConversation,
} from "@/hooks/use-conversation";
import type { Conversation } from "@/lib/db";
import { ThemeModeSwitcher } from "../theme-mode-switcher";
import { DeleteChatModal } from "./delete-chat-modal";
import { RenameChatModal } from "./rename-chat-modal";

const visibilityOptions = [
  {
    value: "private",
    label: "Private",
    description: "Only you can access this chat",
  },
  {
    value: "public",
    label: "Public",
    description: "Anyone can access this chat",
  },
];

export const ChatHeader = ({
  conversationId,
  conversation: initialData,
  isReadonly,
}: {
  conversationId: string;
  conversation?: Conversation | null;
  isReadonly: boolean;
}) => {
  const pathname = usePathname();
  const updateConversation = useUpdateConversation();
  const { data: conversation } = useGetConversation({
    id: conversationId,
    initialData,
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const { copy, copied } = useClipboard();

  const handleCopyLink = () => {
    const url = `${window.location.origin}/chat/${conversationId}`;
    copy(url);
  };

  const isPublicRoute = pathname.startsWith("/chat/");

  return (
    <>
      <header className="flex h-(--header-height,3rem) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="w-full flex flex-1 items-center gap-2 px-4">
          {!isPublicRoute && (
            <div className="flex items-center gap-2 shrink-0">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="data-[orientation=vertical]:h-4"
              />
            </div>
          )}

          <h1 className="flex-1 truncate text-base font-medium">
            {conversation?.title || "New Chat"}
          </h1>

          <div className="flex items-center gap-2">
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
                  {!isReadonly && (
                    <>
                      <DropdownMenuLabel>Chat Visibility</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup
                        value={conversation.isPublic ? "public" : "private"}
                        onValueChange={(value) => {
                          const isPublic = value === "public";
                          if (conversation.isPublic === isPublic) return;

                          updateConversation.mutate({
                            id: conversationId,
                            isPublic,
                          });
                        }}
                      >
                        {visibilityOptions.map((option) => (
                          <DropdownMenuRadioItem
                            value={option.value}
                            key={option.value}
                            disabled={updateConversation.isPending}
                          >
                            <div className="flex flex-col items-start gap-1">
                              {option.label}

                              <div className="text-muted-foreground text-xs">
                                {option.description}
                              </div>
                            </div>
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsRenameModalOpen(true)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Rename chat
                      </DropdownMenuItem>
                    </>
                  )}
                  {conversation.isPublic && (
                    <DropdownMenuItem onClick={handleCopyLink}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Link copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy link
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  {!isReadonly && (
                    <DropdownMenuItem
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete chat
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <ThemeModeSwitcher />
          </div>
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
