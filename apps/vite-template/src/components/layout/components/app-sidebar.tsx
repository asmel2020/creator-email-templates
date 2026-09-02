import * as React from "react"
import { NavMain, type NavGroup } from "@/components/layout/components/nav-main"
import { NavUser } from "@/components/layout/components/nav-user"
import { NavLogo } from "@/components/layout/components/nav-logo"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  TerminalSquareIcon,
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
  LayoutDashboardIcon,
  ActivityIcon,
} from "lucide-react"

// Sample data with unified groups (sessions/sections)
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navGroups: [
    {
      title: "Platform",
      items: [
        {
          title: "Dashboard",
          url: "/",
          icon: <LayoutDashboardIcon />,
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: <ActivityIcon />,
          badge: "New",
        },
        {
          title: "Playground",
          url: "#",
          icon: <TerminalSquareIcon />,
          isActive: true,
          items: [
            {
              title: "History",
              url: "#",
            },
            {
              title: "Starred",
              url: "#",
            },
            {
              title: "Settings",
              url: "#",
            },
          ],
        },
        {
          title: "Models",
          url: "#",
          icon: <BotIcon />,
          items: [
            {
              title: "Genesis",
              url: "#",
            },
            {
              title: "Explorer",
              url: "#",
            },
            {
              title: "Quantum",
              url: "#",
            },
          ],
        },
        {
          title: "Documentation",
          url: "#",
          icon: <BookOpenIcon />,
          items: [
            {
              title: "Introduction",
              url: "#",
            },
            {
              title: "Get Started",
              url: "#",
            },
            {
              title: "Tutorials",
              url: "#",
            },
            {
              title: "Changelog",
              url: "#",
            },
          ],
        },
        {
          title: "Settings",
          url: "#",
          icon: <Settings2Icon />,
          items: [
            {
              title: "General",
              url: "#",
            },
            {
              title: "Team",
              url: "#",
            },
            {
              title: "Billing",
              url: "#",
            },
            {
              title: "Limits",
              url: "#",
            },
          ],
        },
      ],
    },
    {
      title: "Projects",
      items: [
        {
          title: "Design Engineering",
          url: "#",
          icon: <FrameIcon />,
        },
        {
          title: "Sales & Marketing",
          url: "#",
          icon: <PieChartIcon />,
        },
        {
          title: "Travel",
          url: "#",
          icon: <MapIcon />,
        },
      ],
    },
  ] satisfies NavGroup[],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavLogo />
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={data.navGroups} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

