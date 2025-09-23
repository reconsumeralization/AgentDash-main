"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SocialMediaDashboard } from '@/components/social-media-dashboard'
import { LinkedInManager } from '@/components/linkedin-manager'
import { TribeManager } from '@/components/tribe-manager'
import { ContentCalendarComponent } from '@/components/content-calendar'
import { SocialMediaConnectorManager } from '@/components/social-media-connector-manager'
import { UniversalInbox } from '@/components/universal-inbox'
import { SocialMediaSetupWizard } from '@/components/social-media-setup-wizard'
import { CredentialManager } from '@/components/credential-manager'
import { SocialMediaHelpCenter } from '@/components/social-media-help-center'
import { ContextualThemeProvider } from '@/components/contextual-theme-provider'
import { ContextualChat } from '@/components/contextual-chat'
import { useContextSurfacer, ContextSurfacerProvider } from '@/lib'
import { getSocialSkin, type SocialPlatform, type SocialSkinClasses } from '@/lib/social-skins'
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar,
  Linkedin,
  Globe,
  Settings,
  Bell,
  Zap,
  Target,
  TrendingUp,
  Activity,
  Network,
  Building2,
  Hash,
  AtSign,
  Image,
  Video,
  Link,
  Share2,
  Heart,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Edit,
  Trash2,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Copy,
  ExternalLink,
  Bookmark,
  Flag,
  Archive,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Grid3X3,
  List,
  Map,
  Layers,
  Star,
  Award,
  Trophy,
  Crown,
  Shield,
  User,
  UserCheck,
  UserX,
  UserPlus,
  MessageCircle,
  Reply,
  ThumbsUp,
  Share,
  BookmarkPlus,
  BookmarkMinus,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  Globe2,
  Hash as HashIcon,
  AtSign as AtSignIcon,
  Image as ImageIcon,
  Video as VideoIcon,
  Link as LinkIcon,
  FileText,
  Send,
  Zap as ZapIcon,
  Bell as BellIcon,
  BellOff,
  Star as StarIcon,
  Award as AwardIcon,
  Trophy as TrophyIcon,
  Key,
  HelpCircle,
  Activity as ActivityIcon,
  Network as NetworkIcon,
  Building2 as Building2Icon,
  MapPin,
  Tag,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  Trash2 as Trash2Icon,
  MoreHorizontal as MoreHorizontalIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Filter as FilterIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Copy as CopyIcon,
  ExternalLink as ExternalLinkIcon,
  Bookmark as BookmarkIcon,
  Flag as FlagIcon,
  Archive as ArchiveIcon,
  RefreshCw as RefreshCwIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ChevronUp as ChevronUpIcon,
  ChevronDown as ChevronDownIcon,
  Grid3X3 as Grid3X3Icon,
  List as ListIcon,
  Map as MapIcon,
  Layers as LayersIcon
} from "lucide-react"
import { cn } from "@/lib"

// Create skin context
const SkinContext = React.createContext<{
  skin: SocialSkinClasses
  platform: SocialPlatform
  setPlatform: (platform: SocialPlatform) => void
} | null>(null)

function useSkin() {
  const context = React.useContext(SkinContext)
  if (!context) {
    throw new Error('useSkin must be used within a SkinProvider')
  }
  return context
}

function SkinProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatform] = useState<SocialPlatform>('linkedin')
  const skin = getSocialSkin(platform)

  return (
    <SkinContext.Provider value={{ skin, platform, setPlatform }}>
      {children}
    </SkinContext.Provider>
  )
}

function SocialMediaPageContent() {
  const { adaptiveState } = useContextSurfacer()
  const { skin, platform, setPlatform } = useSkin()
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <ContextualThemeProvider>
      <div className="min-h-screen bg-background">
        <div className="flex flex-col h-screen">
          {/* Header */}
          <div className={cn(skin.heroBar, "border-b")}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-white">
                <div className="flex items-center gap-3">
                  <div className={cn(skin.heroIcon, "text-lg font-semibold")}>
                    {platform === 'linkedin' ? 'in' : 
                     platform === 'twitter' ? '𝕏' :
                     platform === 'facebook' ? 'f' :
                     platform === 'instagram' ? '📷' :
                     platform === 'youtube' ? '▶' : 'in'}
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-white/70">
                      {platform.charAt(0).toUpperCase() + platform.slice(1)} Extended
                    </p>
                    <h1 className="text-2xl font-semibold leading-tight">Social Media Management</h1>
                    <p className="text-sm text-white/80">Manage your social presence across all platforms</p>
                  </div>
                </div>
                <Badge className={skin.heroBadge}>
                  Active · {platform.charAt(0).toUpperCase() + platform.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className={skin.heroGhostButton}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </Button>
                <Button size="sm" className={skin.heroPrimaryButton}>
                  <Plus className="h-4 w-4 mr-2" />
                  Compose
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={cn(skin.surfaceMuted, "flex-1 overflow-auto")}>
              <div className="p-6">
              {/* Platform Selector */}
              <div className="mb-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Platform:</span>
                  <div className="flex gap-1">
                    {(['linkedin', 'twitter', 'facebook', 'instagram', 'youtube'] as SocialPlatform[]).map((p) => (
                      <Button
                        key={p}
                        variant={platform === p ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPlatform(p)}
                        className={cn(
                          "text-xs",
                          platform === p ? skin.primaryButton : "border-muted-foreground/20"
                        )}
                      >
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-8 mb-6">
                  <TabsTrigger value="dashboard" className={cn(skin.tabTrigger, "flex items-center gap-2")}>
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="setup" className={cn(skin.tabTrigger, "flex items-center gap-2")}>
                    <Zap className="h-4 w-4" />
                    Setup
                  </TabsTrigger>
                  <TabsTrigger value="connectors" className={cn(skin.tabTrigger, "flex items-center gap-2")}>
                    <Settings className="h-4 w-4" />
                    Connectors
                  </TabsTrigger>
                  <TabsTrigger value="credentials" className={cn(skin.tabTrigger, "flex items-center gap-2")}>
                    <Key className="h-4 w-4" />
                    Credentials
                  </TabsTrigger>
                  <TabsTrigger value="inbox" className={cn(skin.tabTrigger, "flex items-center gap-2")}>
                    <MessageSquare className="h-4 w-4" />
                    Inbox
                  </TabsTrigger>
                  <TabsTrigger value="help" className={cn(skin.tabTrigger, "flex items-center gap-2")}>
                    <HelpCircle className="h-4 w-4" />
                    Help
                  </TabsTrigger>
                  <TabsTrigger value="linkedin" className={cn(skin.tabTrigger, "flex items-center gap-2")}>
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </TabsTrigger>
                  <TabsTrigger value="tribes" className={cn(skin.tabTrigger, "flex items-center gap-2")}>
                    <Users className="h-4 w-4" />
                    Tribes
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="space-y-6">
                  <SocialMediaDashboard />
                </TabsContent>

                <TabsContent value="setup" className="space-y-6">
                  <SocialMediaSetupWizard />
                </TabsContent>

                <TabsContent value="connectors" className="space-y-6">
                  <SocialMediaConnectorManager />
                </TabsContent>

                <TabsContent value="credentials" className="space-y-6">
                  <CredentialManager />
                </TabsContent>

                <TabsContent value="inbox" className="space-y-6">
                  <UniversalInbox />
                </TabsContent>

                <TabsContent value="help" className="space-y-6">
                  <SocialMediaHelpCenter />
                </TabsContent>

                <TabsContent value="linkedin" className="space-y-6">
                  <LinkedInManager />
                </TabsContent>

                <TabsContent value="tribes" className="space-y-6">
                  <TribeManager />
                </TabsContent>

                <TabsContent value="calendar" className="space-y-6">
                  <ContentCalendarComponent />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Contextual Chat Integration */}
          <ContextualChat 
            position="bottom-right"
            persistent={true}
          />
        </div>
      </div>
    </ContextualThemeProvider>
  )
}

export default function SocialMediaPage() {
  return (
    <ContextSurfacerProvider
      initialUseCaseContext={{
        domain: 'linkedin',
        scenario: 'social-media-management',
        complexity: 'moderate',
        timeConstraint: 'hours',
        dataSensitivity: 'internal',
        collaboration: 'team',
        socialMediaContext: {
          platforms: ['linkedin', 'twitter', 'facebook'],
          primaryPlatform: 'linkedin',
          contentType: 'mixed',
          engagementGoal: 'engagement',
          audienceType: 'professional',
          campaignActive: true,
          tribeInvolvement: true
        }
      }}
    >
      <SkinProvider>
        <SocialMediaPageContent />
      </SkinProvider>
    </ContextSurfacerProvider>
  )
}
