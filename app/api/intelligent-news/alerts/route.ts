/**
 * API endpoint for intelligent indicator alerts
 * Manages real-time alerts for significant changes in leading indicators
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { errorHandler, ErrorCategory } from '@/lib/error-handling'
import type { LeadingIndicator, SynthesizedInsight } from '@/lib/intelligent-news-synthesis'

interface IndicatorAlert {
  id: string
  type: 'trend' | 'threshold' | 'anomaly' | 'prediction'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  indicator: LeadingIndicator
  insight?: SynthesizedInsight
  timestamp: Date
  acknowledged: boolean
  dismissed: boolean
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const severity = searchParams.get('severity')
    const type = searchParams.get('type')
    const acknowledged = searchParams.get('acknowledged')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build query
    let query = supabase
      .from('indicator_alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (severity) {
      query = query.eq('severity', severity)
    }
    if (type) {
      query = query.eq('type', type)
    }
    if (acknowledged !== null) {
      query = query.eq('acknowledged', acknowledged === 'true')
    }

    const { data: alerts, error } = await query

    if (error) throw error

    return NextResponse.json({
      success: true,
      alerts: alerts || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    await errorHandler.logError(
      error instanceof Error ? error : new Error('Failed to fetch indicator alerts'),
      { category: ErrorCategory.API }
    )

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, alertId, alert } = body

    switch (action) {
      case 'acknowledge':
        if (!alertId) {
          return NextResponse.json({
            success: false,
            error: 'Alert ID is required',
            timestamp: new Date().toISOString()
          }, { status: 400 })
        }

        const { error: ackError } = await supabase
          .from('indicator_alerts')
          .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
          .eq('id', alertId)

        if (ackError) throw ackError

        return NextResponse.json({
          success: true,
          message: 'Alert acknowledged',
          timestamp: new Date().toISOString()
        })

      case 'dismiss':
        if (!alertId) {
          return NextResponse.json({
            success: false,
            error: 'Alert ID is required',
            timestamp: new Date().toISOString()
          }, { status: 400 })
        }

        const { error: dismissError } = await supabase
          .from('indicator_alerts')
          .update({ dismissed: true, dismissed_at: new Date().toISOString() })
          .eq('id', alertId)

        if (dismissError) throw dismissError

        return NextResponse.json({
          success: true,
          message: 'Alert dismissed',
          timestamp: new Date().toISOString()
        })

      case 'create':
        if (!alert) {
          return NextResponse.json({
            success: false,
            error: 'Alert data is required',
            timestamp: new Date().toISOString()
          }, { status: 400 })
        }

        const { error: createError } = await supabase
          .from('indicator_alerts')
          .insert({
            id: alert.id,
            type: alert.type,
            severity: alert.severity,
            title: alert.title,
            description: alert.description,
            indicator_data: alert.indicator,
            insight_data: alert.insight,
            acknowledged: false,
            dismissed: false,
            created_at: new Date().toISOString()
          })

        if (createError) throw createError

        return NextResponse.json({
          success: true,
          message: 'Alert created',
          timestamp: new Date().toISOString()
        })

      case 'bulk_acknowledge':
        const { alertIds } = body
        if (!alertIds || !Array.isArray(alertIds)) {
          return NextResponse.json({
            success: false,
            error: 'Alert IDs array is required',
            timestamp: new Date().toISOString()
          }, { status: 400 })
        }

        const { error: bulkAckError } = await supabase
          .from('indicator_alerts')
          .update({ 
            acknowledged: true, 
            acknowledged_at: new Date().toISOString() 
          })
          .in('id', alertIds)

        if (bulkAckError) throw bulkAckError

        return NextResponse.json({
          success: true,
          message: `${alertIds.length} alerts acknowledged`,
          timestamp: new Date().toISOString()
        })

      case 'bulk_dismiss':
        const { alertIds: dismissIds } = body
        if (!dismissIds || !Array.isArray(dismissIds)) {
          return NextResponse.json({
            success: false,
            error: 'Alert IDs array is required',
            timestamp: new Date().toISOString()
          }, { status: 400 })
        }

        const { error: bulkDismissError } = await supabase
          .from('indicator_alerts')
          .update({ 
            dismissed: true, 
            dismissed_at: new Date().toISOString() 
          })
          .in('id', dismissIds)

        if (bulkDismissError) throw bulkDismissError

        return NextResponse.json({
          success: true,
          message: `${dismissIds.length} alerts dismissed`,
          timestamp: new Date().toISOString()
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          timestamp: new Date().toISOString()
        }, { status: 400 })
    }

  } catch (error) {
    await errorHandler.logError(
      error instanceof Error ? error : new Error('Unknown error'),
      {
        category: ErrorCategory.API,
        severity: 'error' as any
      }
    )

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

/**
 * Generate alerts based on indicator changes
 */
async function generateAlerts(
  indicators: LeadingIndicator[],
  previousIndicators: LeadingIndicator[]
): Promise<IndicatorAlert[]> {
  const alerts: IndicatorAlert[] = []

  for (const current of indicators) {
    const previous = previousIndicators.find(p => p.id === current.id)
    
    if (!previous) {
      // New indicator
      alerts.push({
        id: `new-indicator-${current.id}`,
        type: 'trend',
        severity: 'medium',
        title: `New Leading Indicator: ${current.name}`,
        description: `A new leading indicator "${current.name}" has been detected with a value of ${current.value.toFixed(1)}.`,
        indicator: current,
        timestamp: new Date(),
        acknowledged: false,
        dismissed: false
      })
      continue
    }

    // Check for significant changes
    const valueChange = Math.abs(current.value - previous.value)
    const valueChangePercent = (valueChange / previous.value) * 100

    // Threshold alerts
    if (valueChangePercent > 50) {
      alerts.push({
        id: `threshold-${current.id}-${Date.now()}`,
        type: 'threshold',
        severity: valueChangePercent > 100 ? 'critical' : 'high',
        title: `Significant Change in ${current.name}`,
        description: `${current.name} changed by ${valueChangePercent.toFixed(1)}% from ${previous.value.toFixed(1)} to ${current.value.toFixed(1)}.`,
        indicator: current,
        timestamp: new Date(),
        acknowledged: false,
        dismissed: false
      })
    }

    // Trend alerts
    if (current.trend !== previous.trend) {
      alerts.push({
        id: `trend-${current.id}-${Date.now()}`,
        type: 'trend',
        severity: 'medium',
        title: `Trend Change in ${current.name}`,
        description: `${current.name} trend changed from ${previous.trend} to ${current.trend}.`,
        indicator: current,
        timestamp: new Date(),
        acknowledged: false,
        dismissed: false
      })
    }

    // Confidence alerts
    const confidenceChange = Math.abs(current.confidence - previous.confidence)
    if (confidenceChange > 0.2) {
      alerts.push({
        id: `confidence-${current.id}-${Date.now()}`,
        type: 'anomaly',
        severity: confidenceChange > 0.4 ? 'high' : 'medium',
        title: `Confidence Change in ${current.name}`,
        description: `${current.name} confidence changed by ${(confidenceChange * 100).toFixed(1)}% from ${(previous.confidence * 100).toFixed(1)}% to ${(current.confidence * 100).toFixed(1)}%.`,
        indicator: current,
        timestamp: new Date(),
        acknowledged: false,
        dismissed: false
      })
    }

    // Critical value alerts
    if (current.value > 0.9 && previous.value <= 0.9) {
      alerts.push({
        id: `critical-${current.id}-${Date.now()}`,
        type: 'threshold',
        severity: 'critical',
        title: `Critical Level Reached: ${current.name}`,
        description: `${current.name} has reached a critical level of ${current.value.toFixed(1)}.`,
        indicator: current,
        timestamp: new Date(),
        acknowledged: false,
        dismissed: false
      })
    }
  }

  return alerts
}
