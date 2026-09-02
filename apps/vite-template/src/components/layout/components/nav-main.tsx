import * as React from "react"
import { Link } from "@tanstack/react-router"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon } from "lucide-react"

export interface NavSubItem {
  title: string
  url: string
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  badge?: string | number
}

export interface NavItem {
  title: string
  url?: string
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  isActive?: boolean
  badge?: string | number
  items?: NavSubItem[]
}

export interface NavGroup {
  title?: string
  items: NavItem[]
}

interface NavMainProps {
  groups?: NavGroup[]
  items?: NavItem[]
  label?: string
}

function renderIcon(
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
) {
  if (!icon) return null
  if (typeof icon === "function") {
    const Icon = icon
    return <Icon className="size-4" />
  }
  return icon
}

function NavItemComponent({ item }: { item: NavItem }) {
  const hasSubItems = Boolean(item.items && item.items.length > 0)

  if (hasSubItems) {
    return (
      <Collapsible
        defaultOpen={item.isActive}
        className="group/collapsible"
        render={<SidebarMenuItem />}
      >
        <CollapsibleTrigger
          render={<SidebarMenuButton tooltip={item.title} />}
        >
          {renderIcon(item.icon)}
          <span>{item.title}</span>
          {item.badge && (
            <span className="ml-auto rounded-full bg-sidebar-accent px-1.5 py-0.5 text-xs text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
              {item.badge}
            </span>
          )}
          <ChevronRightIcon className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => {
              const isExternal = subItem.url.startsWith("http")
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    render={
                      isExternal ? (
                        <a href={subItem.url} target="_blank" rel="noreferrer" />
                      ) : (
                        <Link to={subItem.url} />
                      )
                    }
                  >
                    {renderIcon(subItem.icon)}
                    <span>{subItem.title}</span>
                    {subItem.badge && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {subItem.badge}
                      </span>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  const isExternal = item.url?.startsWith("http")
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        isActive={item.isActive}
        render={
          isExternal ? (
            <a href={item.url} target="_blank" rel="noreferrer" />
          ) : (
            <Link to={item.url ?? "#"} />
          )
        }
      >
        {renderIcon(item.icon)}
        <span>{item.title}</span>
        {item.badge && (
          <span className="ml-auto rounded-full bg-sidebar-accent px-1.5 py-0.5 text-xs text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden">
            {item.badge}
          </span>
        )}
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

export function NavMain({ groups, items, label }: NavMainProps) {
  const normalizedGroups: NavGroup[] = groups ?? (items ? [{ title: label, items }] : [])

  return (
    <>
      {normalizedGroups.map((group, index) => (
        <SidebarGroup key={group.title ?? index}>
          {group.title && <SidebarGroupLabel>{group.title}</SidebarGroupLabel>}
          <SidebarMenu>
            {group.items.map((item) => (
              <NavItemComponent key={item.title} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

