"use client"

import * as React from "react"
import { NavSecondary } from "@/components/Layout/NavSecondary"
import { SideBarData, SideBarDataType } from "@/components/Layout/SideBarData"
import { IconBrandApple } from "@tabler/icons-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { UserButton, useUser } from "@clerk/clerk-react"
import { useTheme } from "../ThemeProvider/ThemeProvider"
import { dark } from "@clerk/themes"

type SideBarAgregados = {
  onTabChange: (tab: string) => void;
  activeTab: string;
  data: SideBarDataType;
}


export function AppSidebar({
  onTabChange,
  activeTab,
  data,
  ...props }: React.ComponentProps<typeof Sidebar> & SideBarAgregados) {

  const { user } = useUser();
  const { theme } = useTheme();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconBrandApple className="!size-5" />
                <span className="text-base font-semibold">IConnect</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <SidebarGroup key={group.title}>
            {group.items.length > 0 && (
              <>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          onClick={() => onTabChange(item.url)}
                          isActive={activeTab === item.url}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </>
            )}
          </SidebarGroup>
        ))}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors group-data-[collapsible=icon]:justify-center">

              {/* 1. El Botón Redondo (Avatar) */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  baseTheme: theme === "dark" ? dark : undefined,
                  elements: {
                    userButtonAvatarBox: "w-8 h-8",
                    userButtonPopoverCard: "border-border"
                  }
                }}
              />

              {/* 2. Texto (Nombre y Email) */}
              {/* Ocultamos esto si el sidebar está colapsado (group-data-[collapsible=icon]:hidden) */}
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">
                  {user?.fullName || user?.username || "Usuario"}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </span>
              </div>

            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
