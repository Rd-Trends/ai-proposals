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
      <Button asChild variant="default" size="sm">
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
    <UserDropdownMenu user={user} className="w-56">
      <Button
        size="icon"
        variant="ghost"
        className="rounded-full hidden md:flex"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={user.image || undefined}
            alt={user.name || user.email}
          />
          <AvatarFallback className="text-sm">
            {userInitials.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
    </UserDropdownMenu>
  );
}
