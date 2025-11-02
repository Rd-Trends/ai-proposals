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
      <Drawer open={open} onOpenChange={setOpen} direction="bottom">
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="Open navigation menu"
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
            <nav className="pb-10" aria-label="Main navigation">
              <ul className="grid grid-cols-1 gap-2 list-none">
                {navItems.map((item) => (
                  <li key={item.label}>
                    <Button variant="link" asChild className="px-0">
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
              <UserDropdownMenu user={user} className="w-full">
                <Button size="lg" variant="outline" className="w-full">
                  <Avatar className="h-8 w-8 rounded-lg grayscale">
                    <AvatarImage
                      src={user.image || undefined}
                      alt={user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {userInitials.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    {user.name && (
                      <span className="truncate font-medium">{user.name}</span>
                    )}
                    <span className="text-muted-foreground truncate text-xs">
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
