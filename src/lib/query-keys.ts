/**
 * Centralized React Query key management
 *
 * This file contains all query keys used throughout the application.
 * Using a factory pattern helps maintain consistency and enables easy refactoring.
 *
 * Benefits:
 * - Type-safe query keys
 * - Easy to find and update all keys in one place
 * - Prevents typos and inconsistencies
 * - Enables query invalidation patterns
 * - Provides clear hierarchy and relationships
 */

export const queryKeys = {
  // Conversation keys
  conversations: {
    all: ["conversations"] as const,
    lists: () => [...queryKeys.conversations.all, "list"] as const,
    list: (filters: { pageSize?: number } = {}) =>
      [...queryKeys.conversations.lists(), filters] as const,
    details: () => [...queryKeys.conversations.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.conversations.details(), id] as const,
    history: (pageSize?: number) =>
      pageSize
        ? (["conversation-history", pageSize] as const)
        : (["conversation-history"] as const),
  },
} as const;
