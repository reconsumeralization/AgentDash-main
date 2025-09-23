/**
 * Communication Module
 * Handles stakeholder communication, information flow, and collaboration
 */

export interface Stakeholder {
  id: string
  name: string
  email: string
  company: string
  role: 'founder' | 'investor' | 'advisor' | 'integrator'
  communicationPreferences: {
    email: boolean
    slack: boolean
    weeklyDigest: boolean
    urgentAlerts: boolean
  }
  lastContact: Date
  responseTime: number // average hours
}

export interface CommunicationChannel {
  id: string
  type: 'email' | 'slack' | 'teams' | 'meeting' | 'document'
  name: string
  participants: string[] // stakeholder IDs
  purpose: string
  cadence: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'ad-hoc'
  lastActivity: Date
}

export interface CommunicationItem {
  id: string
  type: 'update' | 'decision' | 'question' | 'issue' | 'milestone'
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  stakeholders: string[]
  channel: string
  createdAt: Date
  requiresResponse: boolean
  responseDeadline?: Date
}

export interface CommunicationModuleInterface {
  // Stakeholder Management
  addStakeholder(stakeholder: Omit<Stakeholder, 'id'>): Promise<string>
  updateStakeholder(id: string, updates: Partial<Stakeholder>): Promise<void>
  getStakeholder(id: string): Promise<Stakeholder | null>

  // Communication Channels
  createChannel(channel: Omit<CommunicationChannel, 'id'>): Promise<string>
  getChannels(): Promise<CommunicationChannel[]>

  // Message Handling
  sendCommunication(item: Omit<CommunicationItem, 'id' | 'createdAt'>): Promise<string>
  getPendingResponses(): Promise<CommunicationItem[]>
  markResponded(itemId: string, stakeholderId: string): Promise<void>

  // Analytics
  getCommunicationMetrics(): Promise<{
    totalStakeholders: number
    activeChannels: number
    responseRate: number
    averageResponseTime: number
  }>
}

// Data Flow: Communication Module → All Other Modules
// - Broadcasts updates to stakeholders
// - Collects feedback and requirements
// - Coordinates cross-module decisions
// - Tracks progress and blockers

export class CommunicationModule implements CommunicationModuleInterface {
  private stakeholders = new Map<string, Stakeholder>()
  private channels = new Map<string, CommunicationChannel>()
  private communications = new Map<string, CommunicationItem>()

  async addStakeholder(stakeholder: Omit<Stakeholder, 'id'>): Promise<string> {
    const id = `stakeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.stakeholders.set(id, { ...stakeholder, id })
    return id
  }

  async updateStakeholder(id: string, updates: Partial<Stakeholder>): Promise<void> {
    const existing = this.stakeholders.get(id)
    if (existing) {
      this.stakeholders.set(id, { ...existing, ...updates })
    }
  }

  async getStakeholder(id: string): Promise<Stakeholder | null> {
    return this.stakeholders.get(id) || null
  }

  async createChannel(channel: Omit<CommunicationChannel, 'id'>): Promise<string> {
    const id = `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.channels.set(id, { ...channel, id, lastActivity: new Date() })
    return id
  }

  async getChannels(): Promise<CommunicationChannel[]> {
    return Array.from(this.channels.values())
  }

  async sendCommunication(item: Omit<CommunicationItem, 'id' | 'createdAt'>): Promise<string> {
    const id = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.communications.set(id, { ...item, id, createdAt: new Date() })

    // Update channel activity
    const channel = this.channels.get(item.channel)
    if (channel) {
      channel.lastActivity = new Date()
    }

    return id
  }

  async getPendingResponses(): Promise<CommunicationItem[]> {
    return Array.from(this.communications.values())
      .filter(item => item.requiresResponse && item.responseDeadline && item.responseDeadline > new Date())
  }

  async markResponded(itemId: string, stakeholderId: string): Promise<void> {
    // Implementation would update response tracking
    console.log(`Marked response for ${itemId} by ${stakeholderId}`)
  }

  async getCommunicationMetrics(): Promise<{
    totalStakeholders: number
    activeChannels: number
    responseRate: number
    averageResponseTime: number
  }> {
    return {
      totalStakeholders: this.stakeholders.size,
      activeChannels: this.channels.size,
      responseRate: 0.85, // Mock data
      averageResponseTime: 24 // hours
    }
  }
}
