"use client"

/**
 * Compliance Integration Service
 * Combines Office 365 Management Activity API with LinkedIn APIs for comprehensive compliance monitoring
 * Based on Microsoft Office 365 Management Activity API and LinkedIn Share API documentation
 */

import { Office365ManagementApi, ActivityRecord } from './office365-management-api'
import { LinkedInShareApi, LinkedInShareResponse } from './linkedin-share-api'
import { LinkedInProfileApi } from './linkedin-profile-api'

// Compliance Integration Types
export interface ComplianceViolation {
  id: string
  type: 'automation_detected' | 'mass_operations' | 'policy_violation' | 'suspicious_activity' | 'data_exfiltration'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  userId: string
  platform: 'linkedin' | 'office365' | 'cross_platform'
  timestamp: Date
  evidence: {
    linkedinActivity?: any
    office365Activity?: ActivityRecord
    correlationData?: any
  }
  remediation: {
    status: 'pending' | 'in_progress' | 'resolved' | 'escalated'
    actions: string[]
    assignedTo?: string
    notes?: string
  }
}

export interface ComplianceReport {
  id: string
  userId: string
  reportType: 'daily' | 'weekly' | 'monthly' | 'ad_hoc'
  period: {
    start: Date
    end: Date
  }
  summary: {
    totalLinkedInActivities: number
    totalOffice365Activities: number
    violationsDetected: number
    suspiciousPatterns: number
    riskScore: number // 0-100
  }
  violations: ComplianceViolation[]
  recommendations: string[]
  generatedAt: Date
}

export interface LinkedInOffice365Correlation {
  linkedinActivity: {
    type: string
    timestamp: Date
    userId: string
    content?: string
    platform: 'linkedin'
  }
  office365Activity: ActivityRecord
  correlationStrength: number // 0-1
  timeDifference: number // milliseconds
  riskLevel: 'low' | 'medium' | 'high'
}

// Compliance Integration Service
export class ComplianceIntegrationService {
  private office365Api: Office365ManagementApi
  private linkedInShareApi: LinkedInShareApi
  private linkedInProfileApi: LinkedInProfileApi

  constructor(
    office365Config: {
      tenantId: string
      clientId: string
      clientSecret: string
    },
    linkedInAccessToken: string
  ) {
    this.office365Api = new Office365ManagementApi(office365Config)
    this.linkedInShareApi = new LinkedInShareApi(linkedInAccessToken)
    this.linkedInProfileApi = new LinkedInProfileApi(linkedInAccessToken)
  }

  /**
   * Monitor LinkedIn activities against Office 365 audit logs for compliance
   */
  async monitorLinkedInCompliance(
    userId: string,
    timeRange: { start: Date; end: Date }
  ): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    try {
      // Get LinkedIn activities (this would need to be implemented based on your LinkedIn data)
      const linkedInActivities = await this.getLinkedInActivities(userId, timeRange)
      
      // Get Office 365 audit logs for the same time period
      const office365Activities = await this.office365Api.getLinkedInRelatedActivity({
        startTime: timeRange.start.toISOString(),
        endTime: timeRange.end.toISOString()
      })

      // Correlate activities
      const correlations = await this.correlateActivities(linkedInActivities, office365Activities)

      // Detect violations
      violations.push(...await this.detectAutomationViolations(correlations))
      violations.push(...await this.detectMassOperationViolations(correlations))
      violations.push(...await this.detectPolicyViolations(correlations))
      violations.push(...await this.detectSuspiciousActivityViolations(correlations))

    } catch (error) {
      console.error('Error monitoring LinkedIn compliance:', error)
    }

    return violations
  }

  /**
   * Generate comprehensive compliance report
   */
  async generateComplianceReport(
    userId: string,
    reportType: 'daily' | 'weekly' | 'monthly' | 'ad_hoc',
    customPeriod?: { start: Date; end: Date }
  ): Promise<ComplianceReport> {
    const period = this.calculateReportPeriod(reportType, customPeriod)
    
    // Get all violations for the period
    const violations = await this.monitorLinkedInCompliance(userId, period)
    
    // Calculate summary metrics
    const summary = await this.calculateComplianceSummary(userId, period, violations)
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(violations, summary)

    return {
      id: `compliance_report_${userId}_${Date.now()}`,
      userId,
      reportType,
      period,
      summary,
      violations,
      recommendations,
      generatedAt: new Date()
    }
  }

  /**
   * Real-time compliance monitoring with webhook support
   */
  async setupRealTimeComplianceMonitoring(
    webhookUrl: string,
    contentTypes: string[] = ['Audit.General', 'DLP.All']
  ): Promise<void> {
    // Set up Office 365 Management Activity API subscriptions
    for (const contentType of contentTypes) {
      await this.office365Api.createSubscription(
        contentType,
        {
          address: webhookUrl,
          authId: `compliance_monitor_${Date.now()}`,
          expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        },
        process.env.OFFICE365_PUBLISHER_IDENTIFIER
      )
    }
  }

  /**
   * Process incoming webhook notifications for real-time compliance checking
   */
  async processWebhookNotification(notification: any): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    try {
      // Retrieve the content from the notification
      const content = await this.office365Api.retrieveContent(notification.contentUri)
      
      // Check for LinkedIn-related activities
      const linkedInRelatedContent = content.filter(record =>
        this.isLinkedInRelated(record)
      )

      // Analyze each LinkedIn-related activity
      for (const activity of linkedInRelatedContent) {
        const activityViolations = await this.analyzeActivityForViolations(activity)
        violations.push(...activityViolations)
      }

    } catch (error) {
      console.error('Error processing webhook notification:', error)
    }

    return violations
  }

  /**
   * Get compliance dashboard data
   */
  async getComplianceDashboard(userId: string): Promise<{
    riskScore: number
    activeViolations: ComplianceViolation[]
    recentActivities: any[]
    trends: {
      violationsOverTime: Array<{ date: string; count: number }>
      riskScoreOverTime: Array<{ date: string; score: number }>
    }
    recommendations: string[]
  }> {
    const last30Days = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    }

    const violations = await this.monitorLinkedInCompliance(userId, last30Days)
    const report = await this.generateComplianceReport(userId, 'ad_hoc', last30Days)

    return {
      riskScore: report.summary.riskScore,
      activeViolations: violations.filter(v => v.remediation.status !== 'resolved'),
      recentActivities: await this.getRecentLinkedInActivities(userId, 7), // Last 7 days
      trends: await this.calculateComplianceTrends(userId, last30Days),
      recommendations: report.recommendations
    }
  }

  // Private helper methods

  private async getLinkedInActivities(userId: string, timeRange: { start: Date; end: Date }): Promise<any[]> {
    // This would integrate with your LinkedIn activity tracking
    // For now, return mock data - implement based on your LinkedIn data storage
    return []
  }

  private async correlateActivities(
    linkedInActivities: any[],
    office365Activities: ActivityRecord[]
  ): Promise<LinkedInOffice365Correlation[]> {
    const correlations: LinkedInOffice365Correlation[] = []

    for (const linkedInActivity of linkedInActivities) {
      for (const office365Activity of office365Activities) {
        const timeDiff = Math.abs(
          new Date(linkedInActivity.timestamp).getTime() -
          new Date(office365Activity.CreationTime).getTime()
        )

        // Correlate activities within 1 hour
        if (timeDiff < 3600000 && linkedInActivity.userId === office365Activity.UserId) {
          correlations.push({
            linkedinActivity,
            office365Activity,
            correlationStrength: this.calculateCorrelationStrength(timeDiff),
            timeDifference: timeDiff,
            riskLevel: this.assessRiskLevel(linkedInActivity, office365Activity, timeDiff)
          })
        }
      }
    }

    return correlations
  }

  private calculateCorrelationStrength(timeDifference: number): number {
    // Stronger correlation for activities closer in time
    return Math.max(0, 1 - (timeDifference / 3600000)) // 0-1 scale
  }

  private assessRiskLevel(
    linkedInActivity: any,
    office365Activity: ActivityRecord,
    timeDifference: number
  ): 'low' | 'medium' | 'high' {
    let riskScore = 0

    // Time-based risk
    if (timeDifference < 60000) riskScore += 3 // Within 1 minute
    else if (timeDifference < 300000) riskScore += 2 // Within 5 minutes
    else if (timeDifference < 1800000) riskScore += 1 // Within 30 minutes

    // Activity-based risk
    if (office365Activity.ResultStatus !== 'Success') riskScore += 2
    if (linkedInActivity.type === 'mass_connection') riskScore += 2
    if (office365Activity.Operation.includes('Export') || office365Activity.Operation.includes('Download')) riskScore += 3

    if (riskScore >= 5) return 'high'
    if (riskScore >= 3) return 'medium'
    return 'low'
  }

  private async detectAutomationViolations(correlations: LinkedInOffice365Correlation[]): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    // Group by user and detect patterns
    const userActivities: Record<string, LinkedInOffice365Correlation[]> = {}
    correlations.forEach(corr => {
      if (!userActivities[corr.linkedinActivity.userId]) {
        userActivities[corr.linkedinActivity.userId] = []
      }
      userActivities[corr.linkedinActivity.userId].push(corr)
    })

    // Detect automation patterns
    for (const [userId, activities] of Object.entries(userActivities)) {
      if (activities.length > 20) { // High volume of correlated activities
        violations.push({
          id: `automation_${userId}_${Date.now()}`,
          type: 'automation_detected',
          severity: 'high',
          description: `Detected potential automation: ${activities.length} correlated LinkedIn/Office365 activities`,
          userId,
          platform: 'cross_platform',
          timestamp: new Date(),
          evidence: {
            linkedinActivity: activities.map(a => a.linkedinActivity),
            office365Activity: activities[0].office365Activity,
            correlationData: {
              totalCorrelations: activities.length,
              averageTimeDifference: activities.reduce((sum, a) => sum + a.timeDifference, 0) / activities.length
            }
          },
          remediation: {
            status: 'pending',
            actions: ['Review user activity patterns', 'Implement rate limiting', 'Consider additional monitoring']
          }
        })
      }
    }

    return violations
  }

  private async detectMassOperationViolations(correlations: LinkedInOffice365Correlation[]): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    // Detect mass operations (same operation repeated many times)
    const operationCounts: Record<string, number> = {}
    correlations.forEach(corr => {
      const key = `${corr.linkedinActivity.userId}_${corr.linkedinActivity.type}`
      operationCounts[key] = (operationCounts[key] || 0) + 1
    })

    for (const [key, count] of Object.entries(operationCounts)) {
      if (count > 50) { // Threshold for mass operations
        const [userId, operationType] = key.split('_')
        violations.push({
          id: `mass_ops_${userId}_${Date.now()}`,
          type: 'mass_operations',
          severity: count > 100 ? 'critical' : 'high',
          description: `Mass operation detected: ${count} ${operationType} operations`,
          userId,
          platform: 'linkedin',
          timestamp: new Date(),
          evidence: {
            linkedinActivity: { operationType, count },
            correlationData: { operationCount: count }
          },
          remediation: {
            status: 'pending',
            actions: ['Review operation patterns', 'Implement rate limiting', 'Audit user permissions']
          }
        })
      }
    }

    return violations
  }

  private async detectPolicyViolations(correlations: LinkedInOffice365Correlation[]): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    // Check for policy violations (e.g., data export, unauthorized access)
    for (const correlation of correlations) {
      const { office365Activity } = correlation
      
      if (office365Activity.Operation.includes('Export') || 
          office365Activity.Operation.includes('Download') ||
          office365Activity.Operation.includes('Copy')) {
        violations.push({
          id: `policy_${office365Activity.UserId}_${Date.now()}`,
          type: 'policy_violation',
          severity: 'medium',
          description: `Potential data export during LinkedIn activity: ${office365Activity.Operation}`,
          userId: office365Activity.UserId,
          platform: 'cross_platform',
          timestamp: new Date(office365Activity.CreationTime),
          evidence: {
            linkedinActivity: correlation.linkedinActivity,
            office365Activity,
            correlationData: {
              operation: office365Activity.Operation,
              correlationStrength: correlation.correlationStrength
            }
          },
          remediation: {
            status: 'pending',
            actions: ['Review data access policies', 'Audit exported data', 'Implement DLP rules']
          }
        })
      }
    }

    return violations
  }

  private async detectSuspiciousActivityViolations(correlations: LinkedInOffice365Correlation[]): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    // Detect suspicious activity patterns
    for (const correlation of correlations) {
      if (correlation.riskLevel === 'high') {
        violations.push({
          id: `suspicious_${correlation.linkedinActivity.userId}_${Date.now()}`,
          type: 'suspicious_activity',
          severity: 'high',
          description: `Suspicious activity pattern detected with high correlation`,
          userId: correlation.linkedinActivity.userId,
          platform: 'cross_platform',
          timestamp: new Date(),
          evidence: {
            linkedinActivity: correlation.linkedinActivity,
            office365Activity: correlation.office365Activity,
            correlationData: {
              correlationStrength: correlation.correlationStrength,
              timeDifference: correlation.timeDifference,
              riskLevel: correlation.riskLevel
            }
          },
          remediation: {
            status: 'pending',
            actions: ['Investigate activity patterns', 'Review user behavior', 'Consider additional monitoring']
          }
        })
      }
    }

    return violations
  }

  private isLinkedInRelated(record: ActivityRecord): boolean {
    return record.Operation.toLowerCase().includes('linkedin') ||
           record.Workload.toLowerCase().includes('linkedin') ||
           (record.ExtendedProperties && record.ExtendedProperties.some(prop =>
             prop.Value && prop.Value.toLowerCase().includes('linkedin')
           ))
  }

  private async analyzeActivityForViolations(activity: ActivityRecord): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = []

    // Analyze activity for specific violation patterns
    if (activity.ResultStatus !== 'Success') {
      violations.push({
        id: `failed_ops_${activity.UserId}_${Date.now()}`,
        type: 'suspicious_activity',
        severity: 'medium',
        description: `Failed LinkedIn-related operation: ${activity.Operation}`,
        userId: activity.UserId,
        platform: 'cross_platform',
        timestamp: new Date(activity.CreationTime),
        evidence: {
          office365Activity: activity
        },
        remediation: {
          status: 'pending',
          actions: ['Investigate failed operation', 'Check user permissions', 'Review error logs']
        }
      })
    }

    return violations
  }

  private calculateReportPeriod(
    reportType: string,
    customPeriod?: { start: Date; end: Date }
  ): { start: Date; end: Date } {
    if (customPeriod) return customPeriod

    const now = new Date()
    const end = new Date(now)
    let start = new Date(now)

    switch (reportType) {
      case 'daily':
        start.setDate(now.getDate() - 1)
        break
      case 'weekly':
        start.setDate(now.getDate() - 7)
        break
      case 'monthly':
        start.setMonth(now.getMonth() - 1)
        break
      default:
        start.setDate(now.getDate() - 1)
    }

    return { start, end }
  }

  private async calculateComplianceSummary(
    userId: string,
    period: { start: Date; end: Date },
    violations: ComplianceViolation[]
  ): Promise<ComplianceReport['summary']> {
    // Calculate risk score based on violations
    let riskScore = 0
    violations.forEach(violation => {
      switch (violation.severity) {
        case 'critical': riskScore += 25; break
        case 'high': riskScore += 15; break
        case 'medium': riskScore += 10; break
        case 'low': riskScore += 5; break
      }
    })

    // Get activity counts
    const linkedInActivities = await this.getLinkedInActivities(userId, period)
    const office365Activities = await this.office365Api.getLinkedInRelatedActivity({
      startTime: period.start.toISOString(),
      endTime: period.end.toISOString()
    })

    return {
      totalLinkedInActivities: linkedInActivities.length,
      totalOffice365Activities: office365Activities.length,
      violationsDetected: violations.length,
      suspiciousPatterns: violations.filter(v => v.type === 'suspicious_activity').length,
      riskScore: Math.min(100, riskScore)
    }
  }

  private generateRecommendations(violations: ComplianceViolation[], summary: ComplianceReport['summary']): string[] {
    const recommendations: string[] = []

    if (summary.riskScore > 70) {
      recommendations.push('High risk detected - consider immediate review of user activities')
    }

    if (summary.violationsDetected > 10) {
      recommendations.push('Multiple violations detected - implement additional monitoring')
    }

    const automationViolations = violations.filter(v => v.type === 'automation_detected').length
    if (automationViolations > 0) {
      recommendations.push('Automation detected - review and implement rate limiting policies')
    }

    const massOperationViolations = violations.filter(v => v.type === 'mass_operations').length
    if (massOperationViolations > 0) {
      recommendations.push('Mass operations detected - audit user permissions and activity patterns')
    }

    if (recommendations.length === 0) {
      recommendations.push('No immediate action required - continue monitoring')
    }

    return recommendations
  }

  private async getRecentLinkedInActivities(userId: string, days: number): Promise<any[]> {
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
    return this.getLinkedInActivities(userId, { start, end })
  }

  private async calculateComplianceTrends(
    userId: string,
    period: { start: Date; end: Date }
  ): Promise<ComplianceReport['trends']> {
    // Calculate trends over time (simplified implementation)
    const violationsOverTime: Array<{ date: string; count: number }> = []
    const riskScoreOverTime: Array<{ date: string; score: number }> = []

    // This would be implemented with actual time-series data
    // For now, return mock data
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      violationsOverTime.push({
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 5)
      })
      riskScoreOverTime.push({
        date: date.toISOString().split('T')[0],
        score: Math.floor(Math.random() * 100)
      })
    }

    return {
      violationsOverTime,
      riskScoreOverTime
    }
  }
}

// Export the service
export default ComplianceIntegrationService
