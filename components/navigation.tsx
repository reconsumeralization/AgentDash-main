"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib"
import { Button } from "@/components/ui"
import {
  MessageSquare,
  Home,
  Bot,
  GitBranch,
  Network,
  Users,
  Code,
  HelpCircle,
  Palette,
  Brain,
  Puzzle,
  Sparkles,
  Lightbulb,
  Target,
  TrendingUp,
  Zap,
  BarChart3,
  Eye,
  Globe,
  Linkedin,
  Calendar,
  Hash,
  Shield
} from "lucide-react"
import { ThemeSwitcher } from "@/components/theme"

const navigationItems = [
  {
    name: "Chat",
    href: "/",
    icon: MessageSquare,
    description: "Agent command center"
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and quick actions"
  },
  {
    name: "Agents",
    href: "/agents",
    icon: Bot,
    description: "AI agent management"
  },
  {
    name: "Workflows",
    href: "/workflows",
    icon: GitBranch,
    description: "Automated workflows"
  },
  {
    name: "Integrations",
    href: "/integrations",
    icon: Network,
    description: "External connections"
  },
  {
    name: "Guidance",
    href: "/guidance",
    icon: Brain,
    description: "Enterprise code generation"
  },
  {
    name: "MCP Extensions",
    href: "/mcp-extensions",
    icon: Puzzle,
    description: "Native MCP extensions for Gemini"
  },
  {
    name: "Guidance Chat",
    href: "/guidance-chat",
    icon: Brain,
    description: "AI-powered chat with file system"
  },
  {
    name: "Smart Suggestions",
    href: "/smart-suggestions",
    icon: Sparkles,
    description: "AI-powered smart suggestions"
  },
  {
    name: "Code Insights",
    href: "/code-insights",
    icon: Lightbulb,
    description: "Intelligent code analysis and insights"
  },
  {
    name: "Performance Analytics",
    href: "/performance-analytics",
    icon: TrendingUp,
    description: "AI-driven performance optimization"
  },
  {
    name: "Algorithmic Tools",
    href: "/algorithmic-tools",
    icon: Target,
    description: "Advanced algorithmic problem solving"
  },
  {
    name: "Context Surfacer",
    href: "/context-surfacer",
    icon: Eye,
    description: "Intelligent GUI context adaptation"
  },
  {
    name: "Social Media",
    href: "/social-media",
    icon: Globe,
    description: "Social media management and tribes"
  },
  {
    name: "LinkedIn Manager",
    href: "/social-media?tab=linkedin",
    icon: Linkedin,
    description: "Professional networking and content"
  },
  {
    name: "Tribe Manager",
    href: "/social-media?tab=tribes",
    icon: Users,
    description: "Community and tribe management"
  },
          {
            name: "Content Calendar",
            href: "/social-media?tab=calendar",
            icon: Calendar,
            description: "Content planning and scheduling"
          },
  {
    name: "AI Platform",
    href: "/ai-platform",
    icon: Brain,
    description: "AI-powered social networking & project management"
  },
  {
    name: "Security Fuzzing",
    href: "/fuzzing",
    icon: Shield,
    description: "AFL* stateful fuzzing for security testing"
  },
  {
    name: "Security Intelligence",
    href: "/security-intelligence",
    icon: Shield,
    description: "MSRC CVRF API integration for vulnerability intelligence"
  },
  {
    name: "Networking",
    href: "/networking",
    icon: Users,
    description: "Professional connections"
  },
  {
    name: "Help",
    href: "/help/fileflex",
    icon: HelpCircle,
    description: "Help center"
  },
  {
    name: "Templates",
    href: "/templates",
    icon: Code,
    description: "Guidance templates"
  },
  {
    name: "Themes",
    href: "/themes",
    icon: Palette,
    description: "Theme customization"
  },
  {
    name: "TypeScript Demo",
    href: "/typescript-demo",
    icon: Code,
    description: "TypeScript best practices"
  }
]

interface NavigationProps {
  className?: string
}

export function Navigation({ className }: NavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("flex flex-wrap items-center gap-1", className)}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className={cn(
                "flex items-center gap-2 transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{item.name}</span>
            </Button>
          </Link>
        )
      })}
      <div className="ml-auto">
        <ThemeSwitcher compact />
      </div>
    </nav>
  )
}

interface SidebarNavigationProps {
  className?: string
}

export function SidebarNavigation({ className }: SidebarNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={cn("space-y-2", className)}>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

        return (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-accent-foreground")} />
              <div className="flex-1">
                <div className={cn("font-medium", isActive ? "text-primary-foreground" : "text-foreground")}>
                  {item.name}
                </div>
                <div className={cn("text-xs", isActive ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {item.description}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}

interface BreadcrumbNavigationProps {
  className?: string
}

export function BreadcrumbNavigation({ className }: BreadcrumbNavigationProps) {
  const pathname = usePathname()

  const getBreadcrumbs = () => {
    const segments = pathname?.split('/').filter(Boolean) || []
    const breadcrumbs = [{ name: 'Home', href: '/' }]

    let currentPath = ''
    segments.forEach((segment) => {
      currentPath += `/${segment}`
      const navItem = navigationItems.find(item => item.href === currentPath)
      if (navItem) {
        breadcrumbs.push({
          name: navItem.name,
          href: currentPath
        })
      } else {
        breadcrumbs.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav className={cn("flex items-center space-x-2 text-sm", className)}>
      {breadcrumbs.map((crumb, index) => (
        <div key={crumb.href} className="flex items-center">
          {index > 0 && <span className="text-muted-foreground mx-2">/</span>}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium">{crumb.name}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
