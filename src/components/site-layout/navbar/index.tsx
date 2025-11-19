import Link from "next/link";
import { Logo } from "@/components/logo";
import { Container } from "@/components/site-layout/container";
import { cn } from "@/lib/utils";
import { ThemeModeSwitcher } from "../../theme-mode-switcher";
import { Separator } from "../../ui/separator";
import { MobileNav } from "../mobile-nav";
import { UserDropdown } from "./user-dropdown";

const navItems = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#benefits", label: "Benefits" },
  { href: "#faq", label: "FAQ" },
] as const;

export const Navbar = () => (
  <header className="sticky top-0 z-50 w-full bg-background/15 px-4 backdrop-blur-lg md:px-10">
    <Container size="full">
      <div className="flex h-(--header-height) items-center">
        <Link className="mr-10" href="/">
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
    </Container>
  </header>
);

function NavigationMenuLink({
  className,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "flex flex-col gap-1 rounded-sm p-2 text-sm outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:outline-1 focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
        className
      )}
      data-slot="navigation-menu-link"
      {...props}
    />
  );
}
