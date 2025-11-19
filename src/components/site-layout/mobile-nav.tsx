"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useSession } from "@/lib/auth-client";
import { UserDropdownMenu } from "./user-dropdown";

const navItems = [
  { href: "#", label: "Features" },
  { href: "#", label: "Pricing" },
  { href: "#", label: "About" },
] as const;

export const MobileNav = () => {
  const { data } = useSession();

  const [open, setOpen] = useState(false);

  const user = data?.user;

  const handleLinkClick = () => {
    setOpen(false);
  };

  // Get user initials for avatar fallback
  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
    : user?.email[0] || "U";

  return (
    <div className="md:hidden">
      <Drawer direction="bottom" onOpenChange={setOpen} open={open}>
        <DrawerTrigger asChild>
          <Button
            aria-label="Open navigation menu"
            className="h-9 w-9"
            size="icon"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open navigation menu</span>
          </Button>
        </DrawerTrigger>

        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Navigation</DrawerTitle>
          </DrawerHeader>

          <div className="p-6">
            <nav aria-label="Main navigation" className="pb-10">
              <ul className="grid list-none grid-cols-1 gap-2">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Button asChild className="px-0" variant="link">
                      <Link href={item.href} onClick={handleLinkClick}>
                        {item.label}
                      </Link>
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>

            {/* User Section */}
            {user ? (
              <UserDropdownMenu className="w-full" user={user}>
                <Button className="w-full" size="lg" variant="outline">
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    <AvatarImage
                      alt={user.name}
                      src={user.image || undefined}
                    />
                    <AvatarFallback className="rounded-lg">
                      {userInitials.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {user.name && (
                      <span className="truncate font-medium">{user.name}</span>
                    )}
                    <span className="truncate text-muted-foreground text-xs">
                      {user.email}
                    </span>
                  </div>
                </Button>
              </UserDropdownMenu>
            ) : (
              <div className="border-t pt-4">
                <Button asChild className="w-full">
                  <Link href="/auth/signin" onClick={handleLinkClick}>
                    Sign In
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
