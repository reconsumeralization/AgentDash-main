/**
 * Network Intelligence Module
 * Advanced LinkedIn network analysis for business relationships and stakeholder identification
 */

import {
  INetworkIntelligence,
  NetworkAnalysis,
  StakeholderSuggestions,
  InfluencerMap,
  RelationshipDelta,
  BusinessContext,
  RelationshipNode,
  ConflictAlert
} from './types'
import type { LinkedInProfile, LinkedInConnection } from '../connectors/linkedin/linkedin-connector'
import { LinkedInConnector } from '../connectors/linkedin/linkedin-connector'

export class NetworkIntelligence implements INetworkIntelligence {
  private linkedInConnector: LinkedInConnector
  private relationshipCache = new Map<string, NetworkAnalysis>()
  private cacheTimeout = 1000 * 60 * 30 // 30 minutes

  constructor(linkedInConnector: LinkedInConnector) {
    this.linkedInConnector = linkedInConnector
  }

  async analyzeParticipantNetwork(profiles: LinkedInProfile[]): Promise<NetworkAnalysis> {
    const cacheKey = this.generateCacheKey(profiles, 'network_analysis')

    // Check cache first
    const cached = this.relationshipCache.get(cacheKey)
    if (cached && this.isCacheValid(cached.generatedAt)) {
      return cached
    }

    const analysis: NetworkAnalysis = {
      connectionStrength: 0,
      mutualConnections: [],
      industryOverlap: [],
      potentialConflicts: [],
      networkReach: 0,
      keyInfluencers: [],
      relationshipMap: [],
      generatedAt: new Date()
    }

    if (profiles.length === 0) {
      return analysis
    }

    // Analyze mutual connections between all profile pairs
    const mutualConnections = await this.findMutualConnections(profiles)

    // Calculate connection strength based on mutual connections
    analysis.connectionStrength = this.calculateConnectionStrength(profiles, mutualConnections)

    // Identify industry overlaps
    analysis.industryOverlap = this.identifyIndustryOverlaps(profiles)

    // Detect potential conflicts
    analysis.potentialConflicts = await this.detectConflicts(profiles)

    // Calculate network reach
    analysis.networkReach = this.calculateNetworkReach(profiles, mutualConnections)

    // Identify key influencers
    analysis.keyInfluencers = this.identifyKeyInfluencers(profiles)

    // Build relationship map
    analysis.relationshipMap = this.buildRelationshipMap(profiles, mutualConnections)

    // Cache the result
    this.relationshipCache.set(cacheKey, { ...analysis, generatedAt: new Date() })

    return analysis
  }

  async suggestKeyStakeholders(
    dealType: string,
    industry: string
  ): Promise<StakeholderSuggestions> {
    const suggestions: StakeholderSuggestions = {
      primary: [],
      secondary: [],
      influencers: [],
      gatekeepers: [],
      endUsers: [],
      confidence: 0,
      reasoning: []
    }

    try {
      // Get relevant profiles based on deal type and industry
      const relevantProfiles = await this.findRelevantProfiles(dealType, industry)

      // Categorize stakeholders
      for (const profile of relevantProfiles) {
        const category = this.categorizeStakeholder(profile, dealType, industry)

        switch (category) {
          case 'primary':
            suggestions.primary.push(profile)
            break
          case 'secondary':
            suggestions.secondary.push(profile)
            break
          case 'influencer':
            suggestions.influencers.push(profile)
            break
          case 'gatekeeper':
            suggestions.gatekeepers.push(profile)
            break
          case 'endUser':
            suggestions.endUsers.push(profile)
            break
        }
      }

      // Calculate confidence and reasoning
      suggestions.confidence = this.calculateSuggestionConfidence(suggestions)
      suggestions.reasoning = this.generateSuggestionReasoning(suggestions, dealType, industry)

      // Sort by relevance
      this.sortStakeholdersByRelevance(suggestions)

    } catch (error) {
      console.error('Error suggesting stakeholders:', error)
      suggestions.reasoning.push('Error occurred during stakeholder analysis')
    }

    return suggestions
  }

  async identifyInfluencers(context: BusinessContext): Promise<InfluencerMap> {
    const influencerMap: InfluencerMap = {
      nodes: [],
      edges: [],
      centrality: {},
      clusters: []
    }

    try {
      // Get relevant network data
      const networkData = await this.getNetworkData(context)

      // Build influencer nodes
      influencerMap.nodes = networkData.profiles.map((profile: LinkedInProfile) => ({
        profileId: profile.id || '',
        name: profile.name || '',
        influence: this.calculateInfluenceScore(profile, networkData),
        connections: networkData.connections.filter((c: LinkedInConnection) => c.id === profile.id).length,
        activity: this.calculateActivityScore(profile),
        expertise: this.extractExpertiseAreas(profile)
      }))

      // Build relationship edges
      influencerMap.edges = this.buildInfluenceEdges(networkData)

      // Calculate centrality measures
      influencerMap.centrality = this.calculateCentrality(influencerMap.nodes, influencerMap.edges)

      // Identify clusters
      influencerMap.clusters = this.identifyClusters(influencerMap.nodes, influencerMap.edges)

    } catch (error) {
      console.error('Error identifying influencers:', error)
    }

    return influencerMap
  }

  async trackRelationshipChanges(roomId: string): Promise<RelationshipDelta[]> {
    const changes: RelationshipDelta[] = []

    try {
      // Get current network state
      const currentState = await this.getCurrentNetworkState(roomId)

      // Get previous state (from database/cache)
      const previousState = await this.getPreviousNetworkState(roomId)

      // Compare states to identify changes
      changes.push(...this.compareNetworkStates(previousState, currentState))

      // Store current state for future comparison
      await this.storeNetworkState(roomId, currentState)

    } catch (error) {
      console.error('Error tracking relationship changes:', error)
    }

    return changes
  }

  getNetworkHealthScore(roomId: string): number {
    // Calculate overall network health based on various metrics
    let score = 50 // Base score

    // Factors affecting health:
    // - Connection density
    // - Diversity of relationships
    // - Recent activity
    // - Potential conflicts
    // - Influencer presence

    // This would be a comprehensive calculation based on real network data
    return Math.min(Math.max(score, 0), 100)
  }

  // Private helper methods
  private async findMutualConnections(profiles: LinkedInProfile[]): Promise<LinkedInConnection[]> {
    const mutualConnections: LinkedInConnection[] = []

    // For each pair of profiles, find their mutual connections
    for (let i = 0; i < profiles.length; i++) {
      for (let j = i + 1; j < profiles.length; j++) {
        const profile1 = profiles[i]
        const profile2 = profiles[j]

        try {
          // In a real implementation, this would use LinkedIn API
          // For now, simulate mutual connections
          const mutuals = await this.simulateMutualConnections(profile1, profile2)
          mutualConnections.push(...mutuals)
        } catch (error) {
          console.warn(`Failed to find mutual connections between ${profile1.name} and ${profile2.name}:`, error)
        }
      }
    }

    return mutualConnections
  }

  private calculateConnectionStrength(
    profiles: LinkedInProfile[],
    mutualConnections: LinkedInConnection[]
  ): number {
    if (profiles.length <= 1) return 100

    const totalPossibleConnections = (profiles.length * (profiles.length - 1)) / 2
    const actualConnections = mutualConnections.length

    return Math.min((actualConnections / totalPossibleConnections) * 100, 100)
  }

  private identifyIndustryOverlaps(profiles: LinkedInProfile[]): string[] {
    const industries = new Map<string, number>()

    profiles.forEach(profile => {
      const industry = profile.industry || 'Unknown'
      industries.set(industry, (industries.get(industry) || 0) + 1)
    })

    // Return industries with multiple participants
    return Array.from(industries.entries())
      .filter(([_, count]) => count > 1)
      .map(([industry, _]) => industry)
  }

  private async detectConflicts(profiles: LinkedInProfile[]): Promise<ConflictAlert[]> {
    const conflicts: ConflictAlert[] = []

    // Check for competing organizations
    const organizations = profiles.map(p => p.currentRole).filter(Boolean)
    const uniqueOrgs = new Set(organizations)

    if (uniqueOrgs.size !== organizations.length) {
      conflicts.push({
        type: 'competition',
        severity: 'medium',
        description: 'Multiple participants from the same organization',
        involvedParties: Array.from(uniqueOrgs).filter((org): org is string => org !== undefined),
        mitigation: ['Ensure clear communication protocols', 'Consider separate confidential channels']
      })
    }

    // Check for regulatory conflicts (e.g., legal professionals from competing firms)
    const legalProfessionals = profiles.filter(p =>
      p.headline?.toLowerCase().includes('attorney') ||
      p.headline?.toLowerCase().includes('lawyer')
    )

    if (legalProfessionals.length > 1) {
      const lawFirms = legalProfessionals
        .map(p => p.currentRole)
        .filter((firm): firm is string => firm !== undefined && firm !== null && firm !== '')
      if (new Set(lawFirms).size > 1) {
        conflicts.push({
          type: 'regulatory',
          severity: 'high',
          description: 'Legal professionals from competing firms may have conflicts',
          involvedParties: lawFirms,
          mitigation: ['Consult legal ethics guidelines', 'Consider neutral third-party involvement']
        })
      }
    }

    return conflicts
  }

  private calculateNetworkReach(
    profiles: LinkedInProfile[],
    mutualConnections: LinkedInConnection[]
  ): number {
    // Estimate network reach based on profile data
    let reach = 0

    profiles.forEach(profile => {
      // Base reach from profile connections
      reach += profile.connections || 0

      // Bonus for influential profiles
      if (profile.headline?.includes('CEO') || profile.headline?.includes('VP')) {
        reach += 1000
      }
    })

    // Deduplicate and adjust for mutual connections
    reach = Math.floor(reach * 0.7) // Account for overlap

    return reach
  }

  private identifyKeyInfluencers(profiles: LinkedInProfile[]): string[] {
    return profiles
      .filter(profile => {
        const headline = profile.headline?.toLowerCase() || ''
        return (
          headline.includes('ceo') ||
          headline.includes('founder') ||
          headline.includes('president') ||
          headline.includes('vp') ||
          headline.includes('director') ||
          (profile.connections || 0) > 500
        )
      })
      .map(profile => profile.id || '')
      .filter(Boolean)
  }

  private buildRelationshipMap(
    profiles: LinkedInProfile[],
    mutualConnections: LinkedInConnection[]
  ): RelationshipNode[] {
    return profiles.map(profile => ({
      profileId: profile.id || '',
      name: profile.name || '',
      strength: this.calculateProfileStrength(profile),
      connections: mutualConnections
        .filter(conn => conn.id === profile.id)
        .map(conn => conn.id),
      influence: this.calculateInfluenceScore(profile, { connections: mutualConnections })
    }))
  }

  private async findRelevantProfiles(dealType: string, industry: string): Promise<LinkedInProfile[]> {
    // In a real implementation, this would search LinkedIn for relevant profiles
    // For now, return mock data
    return [
      {
        id: "profile-1",
        name: "Sarah Johnson",
        headline: "CEO at TechCorp",
        location: "San Francisco, CA",
        connections: 1200,
        profileViews: 4800,
        postsThisWeek: 2,
        engagementRate: 0.18,
        topSkills: ["Leadership", "Strategy"],
        recentActivity: ["Shared article on AI governance"],
        industry: "Technology",
        currentRole: "CEO",
        company: "TechCorp"
      },
      {
        id: "profile-2",
        name: "Michael Chen",
        headline: "VP Engineering at InnovateLabs",
        location: "Austin, TX",
        connections: 800,
        profileViews: 3200,
        postsThisWeek: 1,
        engagementRate: 0.12,
        topSkills: ["Engineering Leadership", "Product Strategy"],
        recentActivity: ["Commented on industry trend"],
        industry: "Technology",
        currentRole: "VP Engineering",
        company: "InnovateLabs"
      }
    ].filter(profile => profile.industry === industry)
  }

  private categorizeStakeholder(
    profile: LinkedInProfile,
    dealType: string,
    industry: string
  ): 'primary' | 'secondary' | 'influencer' | 'gatekeeper' | 'endUser' {
    const headline = profile.headline?.toLowerCase() || ''

    // Primary stakeholders (decision makers)
    if (headline.includes('ceo') || headline.includes('founder') || headline.includes('president')) {
      return 'primary'
    }

    // Influencers (technical leaders, advisors)
    if (headline.includes('vp') || headline.includes('director') || headline.includes('chief')) {
      return 'influencer'
    }

    // Gatekeepers (legal, finance, procurement)
    if (headline.includes('legal') || headline.includes('finance') || headline.includes('procurement')) {
      return 'gatekeeper'
    }

    // End users (technical staff, users)
    if (headline.includes('engineer') || headline.includes('developer') || headline.includes('manager')) {
      return 'endUser'
    }

    return 'secondary'
  }

  private calculateSuggestionConfidence(suggestions: StakeholderSuggestions): number {
    const totalSuggestions = suggestions.primary.length +
                           suggestions.secondary.length +
                           suggestions.influencers.length +
                           suggestions.gatekeepers.length +
                           suggestions.endUsers.length

    // Confidence based on number and diversity of suggestions
    let confidence = 50

    if (totalSuggestions > 5) confidence += 20
    if (suggestions.primary.length > 0) confidence += 15
    if (suggestions.influencers.length > 0) confidence += 10
    if (suggestions.gatekeepers.length > 0) confidence += 5

    return Math.min(confidence, 95)
  }

  private generateSuggestionReasoning(
    suggestions: StakeholderSuggestions,
    dealType: string,
    industry: string
  ): string[] {
    const reasoning = []

    if (suggestions.primary.length > 0) {
      reasoning.push(`Identified ${suggestions.primary.length} primary decision-makers in ${industry}`)
    }

    if (suggestions.influencers.length > 0) {
      reasoning.push(`${suggestions.influencers.length} key influencers with technical expertise`)
    }

    if (suggestions.gatekeepers.length > 0) {
      reasoning.push(`Found ${suggestions.gatekeepers.length} gatekeepers for regulatory/compliance roles`)
    }

    reasoning.push(`Analysis based on ${dealType} requirements and ${industry} industry standards`)

    return reasoning
  }

  private sortStakeholdersByRelevance(suggestions: StakeholderSuggestions): void {
    const sortByConnections = (a: LinkedInProfile, b: LinkedInProfile) =>
      (b.connections || 0) - (a.connections || 0)

    suggestions.primary.sort(sortByConnections)
    suggestions.secondary.sort(sortByConnections)
    suggestions.influencers.sort(sortByConnections)
    suggestions.gatekeepers.sort(sortByConnections)
    suggestions.endUsers.sort(sortByConnections)
  }

  private async getNetworkData(context: BusinessContext): Promise<any> {
    // Mock network data - in real implementation would fetch from LinkedIn
    return {
      profiles: [],
      connections: []
    }
  }

  private calculateInfluenceScore(profile: LinkedInProfile, networkData: any): number {
    let score = 0

    // Base score from connections
    score += Math.min((profile.connections || 0) / 10, 50)

    // Bonus for senior titles
    const headline = profile.headline?.toLowerCase() || ''
    if (headline.includes('ceo') || headline.includes('founder')) score += 30
    else if (headline.includes('vp') || headline.includes('director')) score += 20
    else if (headline.includes('manager') || headline.includes('lead')) score += 10

    return Math.min(score, 100)
  }

  private calculateActivityScore(profile: LinkedInProfile): number {
    // Mock activity calculation
    return Math.floor(Math.random() * 100)
  }

  private extractExpertiseAreas(profile: LinkedInProfile): string[] {
    const areas = []

    const headline = profile.headline?.toLowerCase() || ''
    if (headline.includes('engineer') || headline.includes('developer')) areas.push('Technical')
    if (headline.includes('sales') || headline.includes('business')) areas.push('Business Development')
    if (headline.includes('legal')) areas.push('Legal')
    if (headline.includes('finance')) areas.push('Finance')

    return areas.length > 0 ? areas : ['General Business']
  }

  private buildInfluenceEdges(networkData: any): any[] {
    // Mock edge building
    return []
  }

  private calculateCentrality(nodes: any[], edges: any[]): Record<string, number> {
    // Simplified centrality calculation
    const centrality: Record<string, number> = {}

    nodes.forEach(node => {
      centrality[node.profileId] = node.influence
    })

    return centrality
  }

  private identifyClusters(nodes: any[], edges: any[]): any[] {
    // Mock clustering - in real implementation would use graph algorithms
    return [{
      id: 'cluster-1',
      name: 'Technology Leaders',
      members: nodes.slice(0, 3).map(n => n.profileId),
      theme: 'Technology',
      influence: 85
    }]
  }

  private async getCurrentNetworkState(roomId: string): Promise<any> {
    // Mock current state
    return { profiles: [], connections: [], timestamp: new Date() }
  }

  private async getPreviousNetworkState(roomId: string): Promise<any> {
    // Mock previous state
    return { profiles: [], connections: [], timestamp: new Date(Date.now() - 86400000) }
  }

  private compareNetworkStates(previous: any, current: any): RelationshipDelta[] {
    const changes: RelationshipDelta[] = []

    // Mock comparison logic
    // In real implementation, would compare profiles and connections

    return changes
  }

  private async storeNetworkState(roomId: string, state: any): Promise<void> {
    // Store current state for future comparison
    console.log(`Storing network state for room ${roomId}`)
  }

  private calculateProfileStrength(profile: LinkedInProfile): number {
    let strength = 50

    // Adjust based on title seniority
    const headline = profile.headline?.toLowerCase() || ''
    if (headline.includes('ceo') || headline.includes('founder')) strength += 30
    else if (headline.includes('vp') || headline.includes('director')) strength += 20
    else if (headline.includes('manager')) strength += 10

    // Adjust based on network size
    strength += Math.min((profile.connections || 0) / 20, 20)

    return Math.min(strength, 100)
  }

  private async simulateMutualConnections(
    profile1: LinkedInProfile,
    profile2: LinkedInProfile
  ): Promise<LinkedInConnection[]> {
    // Simulate finding mutual connections
    // In real implementation, this would use LinkedIn API
    const mutualCount = Math.floor(Math.random() * 5) + 1

    return Array.from({ length: mutualCount }, (_, i) => ({
      id: `mutual-${i}`,
      profileId: `mutual-profile-${i}`,
      name: `Mutual Connection ${i + 1}`,
      headline: 'Professional',
      company: 'Various Companies',
      location: 'Various Locations',
      connectedAt: new Date(),
      connectionDegree: 2,
      tags: ['mutual'],
      lastInteraction: undefined,
      interactionCount: 0,
      sharedInterests: ['Professional Networking']
    }))
  }

  private generateCacheKey(profiles: LinkedInProfile[], operation: string): string {
    const profileIds = profiles.map(p => p.id).sort().join(',')
    return `${operation}:${profileIds}`
  }

  private isCacheValid(generatedAt: Date): boolean {
    return Date.now() - generatedAt.getTime() < this.cacheTimeout
  }
}