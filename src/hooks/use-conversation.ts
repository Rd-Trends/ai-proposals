import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { Conversation } from "@/lib/db";
import { queryKeys } from "@/lib/query-keys";
import type { PaginatedResult } from "@/lib/types";

export const useGetConversation = ({
  id,
  initialData,
}: {
  id: string;
  initialData?: Conversation | null;
}) => {
  return useQuery({
    queryKey: queryKeys.conversations.detail(id),
    queryFn: async () => {
      const response = await fetch(`/api/chat/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch conversation");
      }

      const data = await response.json();
      return data.conversation as Conversation;
    },
    initialData: initialData ?? null,
  });
};

export const useConversationHistory = (pageSize = 10) => {
  return useInfiniteQuery<PaginatedResult<Conversation>>({
    queryKey: queryKeys.conversations.history(pageSize),
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: (pageParam as number).toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/chat/history?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch conversation history");
      }

      return response.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
};

export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      id: string;
      title?: string;
      isPublic?: boolean;
    }) => {
      const response = await fetch(`/api/chat/${payload.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update conversation");
      }

      return response.json();
    },
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.conversations.all,
      });

      const previousData = queryClient.getQueriesData<
        InfiniteData<PaginatedResult<Conversation>> | Conversation
      >({ queryKey: queryKeys.conversations.all });

      queryClient.setQueriesData<
        InfiniteData<PaginatedResult<Conversation>> | Conversation
      >({ queryKey: queryKeys.conversations.all }, (oldData) => {
        if (!oldData) return oldData;

        if ("pages" in oldData) {
          const newPages = oldData.pages.map((page) => {
            return {
              ...page,
              data: page.data.map((conversation) =>
                conversation.id === payload.id
                  ? {
                      ...conversation,
                      ...payload,
                    }
                  : conversation,
              ),
            };
          });

          return {
            ...oldData,
            pages: newPages,
          };
        } else {
          if (oldData.id === payload.id) {
            return {
              ...oldData,
              ...payload,
            };
          }
        }
      });

      return previousData;
    },
    onError: (_, __, context) => {
      if (context) {
        context.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/chat/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete conversation");
      }

      return response.json();
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.conversations.all,
      });

      const previousData = queryClient.getQueriesData<
        InfiniteData<PaginatedResult<Conversation>> | Conversation
      >({ queryKey: queryKeys.conversations.all });

      queryClient.setQueriesData<
        InfiniteData<PaginatedResult<Conversation>> | Conversation
      >({ queryKey: queryKeys.conversations.all }, (oldData) => {
        if (!oldData) return oldData;

        if ("pages" in oldData) {
          const newPages = oldData.pages.map((page) => {
            return {
              ...page,
              data: page.data.filter((conversation) => conversation.id !== id),
            };
          });

          return {
            ...oldData,
            pages: newPages,
          };
        }
      });

      return previousData;
    },
    onError: (_, _id, context) => {
      if (context) {
        context.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
  });
};
