import { cn } from './utils'

export type SocialPlatform = 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube'

export interface SocialSkinClasses {
  surface: string
  surfaceMuted: string
  heroBar: string
  heroIcon: string
  heroBadge: string
  heroGhostButton: string
  heroPrimaryButton: string
  heroSearchInput: string
  card: string
  cardMuted: string
  primaryButton: string
  ghostButton: string
  badge: string
  tabTrigger: string
  iconAccent: string
  chatCard: string
  chatHeader: string
  chatGhostButton: string
  chatAgentBubble: string
  chatUserBubble: string
  chatSystemBubble: string
  chatQuickAction: string
}

const createSurface = (base: string, extras?: string) => cn(base, extras)

const SKINS: Record<SocialPlatform, SocialSkinClasses> = {
  linkedin: {
    surface: createSurface('overflow-hidden rounded-3xl border border-[#d0d7de] bg-[#f3f2ef] shadow-sm'),
    surfaceMuted: 'bg-[#f3f2ef]',
    heroBar: 'bg-[#0A66C2] px-6 py-5 text-white',
    heroIcon: 'flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#0A66C2]',
    heroBadge: 'border-white/40 bg-white/15 px-3 py-1 text-white',
    heroGhostButton: 'text-white hover:bg-white/15',
    heroPrimaryButton: 'rounded-full bg-white text-[#0A66C2] hover:bg-white/90',
    heroSearchInput: 'h-10 rounded-full border-none bg-white/20 pl-10 text-sm text-white placeholder:text-white/70 focus-visible:ring-white focus-visible:ring-offset-0',
    card: 'rounded-2xl border border-[#d0d7de]/70 bg-white shadow-sm',
    cardMuted: 'rounded-lg border-2 border-dashed border-[#d0d7de]/70 bg-[#f8fafc]',
    primaryButton: 'rounded-full bg-[#0A66C2] px-4 text-white hover:bg-[#074a8c]',
    ghostButton: 'text-[#0A66C2] hover:bg-[#0A66C2]/10',
    badge: 'border-[#0A66C2]/40 text-[#0A66C2]',
    tabTrigger: 'rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition data-[state=active]:border-[#0A66C2] data-[state=active]:text-[#0A66C2] data-[state=active]:font-semibold',
    iconAccent: 'text-[#0A66C2]',
    chatCard: 'border border-[#d0d7de]/70 bg-white shadow-xl',
    chatHeader: 'flex flex-row items-center justify-between border-b border-white/20 bg-[#0A66C2] px-4 py-3 text-white',
    chatGhostButton: 'text-white hover:bg-white/15',
    chatAgentBubble: 'border border-[#0A66C2]/20 bg-white text-[#0A66C2]',
    chatUserBubble: 'bg-[#0A66C2] text-white ml-auto',
    chatSystemBubble: 'bg-[#E3EAF4] text-[#0A66C2]',
    chatQuickAction: 'rounded-full border border-[#0A66C2]/40 text-[#0A66C2] hover:border-[#0A66C2] hover:text-[#0A66C2]'
  },
  twitter: {
    surface: createSurface('overflow-hidden rounded-3xl border border-[#c8dde9] bg-[#f5f8fa] shadow-sm'),
    surfaceMuted: 'bg-[#f5f8fa]',
    heroBar: 'bg-[#1D9BF0] px-6 py-5 text-white',
    heroIcon: 'flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#1D9BF0]',
    heroBadge: 'border-white/40 bg-white/15 px-3 py-1 text-white',
    heroGhostButton: 'text-white hover:bg-white/15',
    heroPrimaryButton: 'rounded-full bg-white text-[#1D9BF0] hover:bg-white/90',
    heroSearchInput: 'h-10 rounded-full border-none bg-white/20 pl-10 text-sm text-white placeholder:text-white/70 focus-visible:ring-white focus-visible:ring-offset-0',
    card: 'rounded-2xl border border-[#c8dde9] bg-white shadow-sm',
    cardMuted: 'rounded-lg border-2 border-dashed border-[#c8dde9] bg-[#e3f3ff]',
    primaryButton: 'rounded-full bg-[#1D9BF0] px-4 text-white hover:bg-[#0f78c7]',
    ghostButton: 'text-[#1D9BF0] hover:bg-[#1D9BF0]/10',
    badge: 'border-[#1D9BF0]/40 text-[#1D9BF0]',
    tabTrigger: 'rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition data-[state=active]:border-[#1D9BF0] data-[state=active]:text-[#1D9BF0] data-[state=active]:font-semibold',
    iconAccent: 'text-[#1D9BF0]',
    chatCard: 'border border-[#c8dde9] bg-white shadow-xl',
    chatHeader: 'flex flex-row items-center justify-between border-b border-white/20 bg-[#1D9BF0] px-4 py-3 text-white',
    chatGhostButton: 'text-white hover:bg-white/15',
    chatAgentBubble: 'border border-[#1D9BF0]/20 bg-white text-[#1D9BF0]',
    chatUserBubble: 'bg-[#1D9BF0] text-white ml-auto',
    chatSystemBubble: 'bg-[#d7ecff] text-[#1D9BF0]',
    chatQuickAction: 'rounded-full border border-[#1D9BF0]/40 text-[#1D9BF0] hover:border-[#1D9BF0] hover:text-[#1D9BF0]'
  },
  facebook: {
    surface: createSurface('overflow-hidden rounded-3xl border border-[#c7d5ee] bg-[#edf1fb] shadow-sm'),
    surfaceMuted: 'bg-[#edf1fb]',
    heroBar: 'bg-[#1877F2] px-6 py-5 text-white',
    heroIcon: 'flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#1877F2]',
    heroBadge: 'border-white/40 bg-white/15 px-3 py-1 text-white',
    heroGhostButton: 'text-white hover:bg-white/15',
    heroPrimaryButton: 'rounded-full bg-white text-[#1877F2] hover:bg-white/90',
    heroSearchInput: 'h-10 rounded-full border-none bg-white/20 pl-10 text-sm text-white placeholder:text-white/70 focus-visible:ring-white focus-visible:ring-offset-0',
    card: 'rounded-2xl border border-[#c7d5ee] bg-white shadow-sm',
    cardMuted: 'rounded-lg border-2 border-dashed border-[#c7d5ee] bg-[#e3ebff]',
    primaryButton: 'rounded-full bg-[#1877F2] px-4 text-white hover:bg-[#125ad1]',
    ghostButton: 'text-[#1877F2] hover:bg-[#1877F2]/10',
    badge: 'border-[#1877F2]/40 text-[#1877F2]',
    tabTrigger: 'rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition data-[state=active]:border-[#1877F2] data-[state=active]:text-[#1877F2] data-[state=active]:font-semibold',
    iconAccent: 'text-[#1877F2]',
    chatCard: 'border border-[#c7d5ee] bg-white shadow-xl',
    chatHeader: 'flex flex-row items-center justify-between border-b border-white/20 bg-[#1877F2] px-4 py-3 text-white',
    chatGhostButton: 'text-white hover:bg-white/15',
    chatAgentBubble: 'border border-[#1877F2]/20 bg-white text-[#1877F2]',
    chatUserBubble: 'bg-[#1877F2] text-white ml-auto',
    chatSystemBubble: 'bg-[#dee7ff] text-[#1877F2]',
    chatQuickAction: 'rounded-full border border-[#1877F2]/40 text-[#1877F2] hover:border-[#1877F2] hover:text-[#1877F2]'
  },
  instagram: {
    surface: createSurface('overflow-hidden rounded-3xl border border-[#f3d4ff] bg-[#fdf5ff] shadow-sm'),
    surfaceMuted: 'bg-[#fdf5ff]',
    heroBar: 'bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-6 py-5 text-white',
    heroIcon: 'flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#dd2a7b]',
    heroBadge: 'border-white/40 bg-white/20 px-3 py-1 text-white',
    heroGhostButton: 'text-white hover:bg-white/15',
    heroPrimaryButton: 'rounded-full bg-white text-[#dd2a7b] hover:bg-white/90',
    heroSearchInput: 'h-10 rounded-full border-none bg-white/20 pl-10 text-sm text-white placeholder:text-white/70 focus-visible:ring-white focus-visible:ring-offset-0',
    card: 'rounded-2xl border border-[#f3d4ff] bg-white/95 shadow-sm backdrop-blur',
    cardMuted: 'rounded-lg border-2 border-dashed border-[#f3d4ff] bg-[#fae8ff]',
    primaryButton: 'rounded-full bg-[#dd2a7b] px-4 text-white hover:bg-[#bf1f68]',
    ghostButton: 'text-[#dd2a7b] hover:bg-[#dd2a7b]/10',
    badge: 'border-[#dd2a7b]/40 text-[#dd2a7b]',
    tabTrigger: 'rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition data-[state=active]:border-[#dd2a7b] data-[state=active]:text-[#dd2a7b] data-[state=active]:font-semibold',
    iconAccent: 'text-[#dd2a7b]',
    chatCard: 'border border-[#f3d4ff] bg-white/95 shadow-xl backdrop-blur',
    chatHeader: 'flex flex-row items-center justify-between border-b border-white/20 bg-gradient-to-r from-[#f58529] via-[#dd2a7b] to-[#8134af] px-4 py-3 text-white',
    chatGhostButton: 'text-white hover:bg-white/15',
    chatAgentBubble: 'border border-[#dd2a7b]/10 bg-white text-[#dd2a7b]',
    chatUserBubble: 'bg-[#dd2a7b] text-white ml-auto',
    chatSystemBubble: 'bg-[#fbe7ff] text-[#dd2a7b]',
    chatQuickAction: 'rounded-full border border-[#dd2a7b]/30 text-[#dd2a7b] hover:border-[#dd2a7b] hover:text-[#dd2a7b]'
  },
  youtube: {
    surface: createSurface('overflow-hidden rounded-3xl border border-[#f2d6d6] bg-[#fdf5f5] shadow-sm'),
    surfaceMuted: 'bg-[#fdf5f5]',
    heroBar: 'bg-[#FF0000] px-6 py-5 text-white',
    heroIcon: 'flex h-10 w-10 items-center justify-center rounded-lg bg-white text-xl font-bold text-[#FF0000]',
    heroBadge: 'border-white/40 bg-white/15 px-3 py-1 text-white',
    heroGhostButton: 'text-white hover:bg-white/15',
    heroPrimaryButton: 'rounded-full bg-white text-[#FF0000] hover:bg-white/90',
    heroSearchInput: 'h-10 rounded-full border-none bg-white/20 pl-10 text-sm text-white placeholder:text-white/70 focus-visible:ring-white focus-visible:ring-offset-0',
    card: 'rounded-2xl border border-[#f2d6d6] bg-white shadow-sm',
    cardMuted: 'rounded-lg border-2 border-dashed border-[#f2d6d6] bg-[#ffecec]',
    primaryButton: 'rounded-full bg-[#FF0000] px-4 text-white hover:bg-[#cc0000]',
    ghostButton: 'text-[#FF0000] hover:bg-[#FF0000]/10',
    badge: 'border-[#FF0000]/40 text-[#FF0000]',
    tabTrigger: 'rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-muted-foreground transition data-[state=active]:border-[#FF0000] data-[state=active]:text-[#FF0000] data-[state=active]:font-semibold',
    iconAccent: 'text-[#FF0000]',
    chatCard: 'border border-[#f2d6d6] bg-white shadow-xl',
    chatHeader: 'flex flex-row items-center justify-between border-b border-white/20 bg-[#FF0000] px-4 py-3 text-white',
    chatGhostButton: 'text-white hover:bg-white/15',
    chatAgentBubble: 'border border-[#FF0000]/20 bg-white text-[#FF0000]',
    chatUserBubble: 'bg-[#FF0000] text-white ml-auto',
    chatSystemBubble: 'bg-[#ffe2e2] text-[#FF0000]',
    chatQuickAction: 'rounded-full border border-[#FF0000]/40 text-[#FF0000] hover:border-[#FF0000] hover:text-[#FF0000]'
  }
}

export function getSocialSkin(platform?: string | null): SocialSkinClasses {
  if (!platform) return SKINS.linkedin
  const normalized = platform.toLowerCase() as SocialPlatform
  return SKINS[normalized] ?? SKINS.linkedin
}
