"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { UserDropdownMenu } from "../user-dropdown";

export function UserDropdown() {
  const { data, isPending } = useSession();

  const user = data?.user;

  // Show skeleton while loading
  if (isPending) {
    return <Skeleton className="h-8 w-8 rounded-full" />;
  }

  // Show sign in button if no user
  if (!user) {
    return (
      <Button asChild size="sm" variant="default">
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    );
  }

  // Get user initials for avatar fallback
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : user.email[0];

  return (
    <UserDropdownMenu className="w-56" user={user}>
      <Button
        className="hidden rounded-full md:flex"
        size="icon"
        variant="ghost"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            alt={user.name || user.email}
            src={user.image || undefined}
          />
          <AvatarFallback className="text-sm">
            {userInitials.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
    </UserDropdownMenu>
  );
}
