import Link from "next/link";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";
import { ThemeModeSwitcher } from "../../theme-mode-switcher";
import { Separator } from "../../ui/separator";
import { MobileNav } from "../mobile-nav";
import { UserDropdown } from "./user-dropdown";

const navItems = [
  { href: "#", label: "Features" },
  { href: "#", label: "Pricing" },
  { href: "#", label: "About" },
] as const;

export const Navbar = () => {
  return (
    <header className="bg-background/15 backdrop-blur-lg sticky top-0 z-50 w-full">
      <div className="px-6">
        <div className="flex h-(--header-height) items-center">
          <Link href="/" className="mr-10">
            <Logo />
          </Link>
          <nav className="mr-4 hidden md:flex">
            <ul className="group flex flex-1 list-none items-center justify-center gap-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <NavigationMenuLink href={item.href}>
                    {item.label}
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 md:flex-1 md:justify-end">
            <UserDropdown />
            <Separator orientation="vertical" />
            <ThemeModeSwitcher />
            <MobileNav />
          </div>
        </div>
      </div>
    </header>
  );
};

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col gap-1 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
}
