"use client";

import {
  Briefcase,
  FileStack,
  FileText,
  Home,
  MessageSquare,
  PlusCircle,
  Settings,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { UserMenu } from "@/components/auth/user-menu";
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
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

// Navigation items
const navigation: Array<{
  title: string;
  url: Route;
  icon: React.ElementType;
}> = [
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
    title: "Profile",
    url: "/dashboard/profile",
    icon: Settings,
  },
  // {
  //   title: "Analytics",
  //   url: "/dashboard/analytics",
  //   icon: BarChart3,
  // },
];

const tools = [
  {
    title: "New Proposal",
    url: "/dashboard/proposals/new",
    icon: PlusCircle,
  },
];

const account = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" side={isMobile ? "right" : "left"}>
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
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon /> {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {tools.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {account.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
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
  title,
  description,
  action,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) => {
  return (
    <header className="flex items-start justify-between shrink-0 gap-2 px-4 md:px-6 lg:px-8 pt-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        <p className=" text-xs md:text-sm text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="hidden md:flex items-center gap-2">{action}</div>

      <SidebarTrigger className=" md:hidden mr-1 [&_svg]:size-5!" />
    </header>
  );
};

export const DashboardGutter = ({
  as,
  children,
}: React.PropsWithChildren<{ as?: React.ElementType }>) => {
  const Component = as || "div";
  return (
    <Component className="container mx-auto flex flex-1 flex-col gap-6 py-6 px-4 md:px-6 lg:px-8">
      {children}
    </Component>
  );
};
