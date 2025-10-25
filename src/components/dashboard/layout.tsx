"use client";

import {
  Briefcase,
  FileStack,
  FileText,
  Home,
  MessageSquare,
  MessageSquareQuote,
  Settings,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Fragment } from "react";
import { UserMenu } from "@/components/auth/user-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

type NavigationItem = {
  title: string;
  url: Route;
  icon: React.ElementType;
};

// Navigation items
const navigation: Array<NavigationItem> = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Chat",
    url: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Proposals",
    url: "/dashboard/proposals",
    icon: FileText,
  },
  {
    title: "Templates",
    url: "/dashboard/templates",
    icon: FileStack,
  },
  {
    title: "Projects",
    url: "/dashboard/projects",
    icon: Briefcase,
  },
  {
    title: "Testimonials",
    url: "/dashboard/testimonials",
    icon: MessageSquareQuote,
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: Settings,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const NavLink = (item: NavigationItem) => {
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenuButton asChild>
      <Link href={item.url} onClick={() => setOpenMobile(false)}>
        <item.icon /> {item.title}
      </Link>
    </SidebarMenuButton>
  );
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <a href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <FileText className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">AI Proposals</span>
                    <span className="truncate text-xs">Pro</span>
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <NavLink {...item} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <UserMenu />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="@container/main flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export const DashboardLayoutHeader = ({
  breadcrumbs,
}: {
  breadcrumbs: Array<{ label: string; href?: Route }>;
}) => {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              const hideOnMobile = breadcrumbs.length > 1 && !isLast;

              return (
                <Fragment key={crumb.href || crumb.label}>
                  {index > 0 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                  <BreadcrumbItem
                    className={hideOnMobile ? "hidden md:block" : ""}
                  >
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};

export const DashboardPageHeader = ({
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) => {
  return (
    <div className="flex flex-col gap-4 px-4 pt-4 md:flex-row md:items-center md:justify-between md:px-6 lg:px-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export const DashboardGutter = ({
  as,
  children,
  className,
}: React.PropsWithChildren<{ as?: React.ElementType; className?: string }>) => {
  const Component = as || "div";
  return (
    <Component
      className={cn(
        "container mx-auto flex flex-1 flex-col gap-6 py-6 px-4 md:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </Component>
  );
};
