import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Command } from "lucide-react"

interface NavLogoProps {
  title?: string
  subtitle?: string
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  to?: string
}

export function NavLogo({
  title = "Acme Inc",
  subtitle = "Enterprise",
  icon: Icon = Command,
  to = "/",
}: NavLogoProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" render={<Link to={to} />}>
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {typeof Icon === "function" ? (
              <Icon className="size-4" />
            ) : React.isValidElement(Icon) ? (
              Icon
            ) : (
              <Command className="size-4" />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{title}</span>
            <span className="truncate text-xs text-muted-foreground">{subtitle}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
