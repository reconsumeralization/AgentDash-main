/**
 * Intelligent Indicator Alerts
 * Real-time notifications for significant changes in leading indicators
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  X,
  Settings,
  Zap,
  Activity
} from 'lucide-react'
import { cn } from '@/lib'
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

interface IntelligentIndicatorAlertsProps {
  className?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function IntelligentIndicatorAlerts({ 
  className,
  autoRefresh = true,
  refreshInterval = 60000 // 1 minute
}: IntelligentIndicatorAlertsProps) {
  const [alerts, setAlerts] = useState<IndicatorAlert[]>([])
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    enabled: true,
    severityThreshold: 'medium',
    types: ['trend', 'threshold', 'anomaly', 'prediction'],
    soundEnabled: true
  })

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    if (!settings.enabled) return

    try {
      setLoading(true)
      const response = await fetch('/api/intelligent-news/alerts')
      if (!response.ok) return

      const data = await response.json()
      if (data.success) {
        setAlerts(data.alerts || [])
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    } finally {
      setLoading(false)
    }
  }, [settings.enabled])

  // Auto-refresh alerts
  useEffect(() => {
    fetchAlerts()
    
    if (autoRefresh) {
      const interval = setInterval(fetchAlerts, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, settings.enabled, fetchAlerts])

  // Acknowledge alert
  const acknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/intelligent-news/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge', alertId })
      })

      if (response.ok) {
        setAlerts(prev => prev.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        ))
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error)
    }
  }

  // Dismiss alert
  const dismissAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/intelligent-news/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'dismiss', alertId })
      })

      if (response.ok) {
        setAlerts(prev => prev.filter(alert => alert.id !== alertId))
      }
    } catch (error) {
      console.error('Failed to dismiss alert:', error)
    }
  }

  // Get alert icon
  const getAlertIcon = (type: string, severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="h-4 w-4 text-red-500" />
    if (severity === 'high') return <TrendingUp className="h-4 w-4 text-orange-500" />
    if (type === 'prediction') return <Zap className="h-4 w-4 text-blue-500" />
    if (type === 'anomaly') return <Activity className="h-4 w-4 text-yellow-500" />
    return <Info className="h-4 w-4 text-gray-500" />
  }

  // Get alert variant
  const getAlertVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'default'
      case 'medium': return 'default'
      default: return 'default'
    }
  }

  // Filter alerts by settings
  const filteredAlerts = alerts.filter(alert => {
    if (alert.dismissed) return false
    if (!settings.types.includes(alert.type)) return false
    
    const severityLevels = ['low', 'medium', 'high', 'critical']
    const alertLevel = severityLevels.indexOf(alert.severity)
    const thresholdLevel = severityLevels.indexOf(settings.severityThreshold)
    
    return alertLevel >= thresholdLevel
  })

  const unacknowledgedCount = filteredAlerts.filter(alert => !alert.acknowledged).length

  if (!settings.enabled) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Intelligent Indicator Alerts</span>
          </CardTitle>
          <CardDescription>
            Alerts are currently disabled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => setSettings(prev => ({ ...prev, enabled: true }))}
            className="w-full"
          >
            Enable Alerts
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <CardTitle>Intelligent Indicator Alerts</CardTitle>
              {unacknowledgedCount > 0 && (
                <Badge variant="destructive">{unacknowledgedCount}</Badge>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSettings(prev => ({ ...prev, enabled: false }))}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Real-time notifications for significant changes in leading indicators
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Alerts */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No active alerts</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Alert 
              key={alert.id} 
              variant={getAlertVariant(alert.severity)}
              className={cn(
                "relative",
                !alert.acknowledged && "border-l-4 border-l-blue-500"
              )}
            >
              <div className="flex items-start space-x-3">
                {getAlertIcon(alert.type, alert.severity)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <AlertTitle className="flex items-center space-x-2">
                      <span>{alert.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {alert.type}
                      </Badge>
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {alert.severity}
                      </Badge>
                    </AlertTitle>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-muted-foreground">
                        {alert.timestamp.toLocaleTimeString()}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <AlertDescription>
                    {alert.description}
                  </AlertDescription>

                  {/* Indicator Details */}
                  <div className="bg-muted/50 p-3 rounded-md">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{alert.indicator.name}</span>
                        <span className="text-muted-foreground ml-2">
                          {alert.indicator.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{alert.indicator.value.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground">
                          {(alert.indicator.confidence * 100).toFixed(0)}% confidence
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {!alert.acknowledged && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="h-7"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Acknowledge
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => dismissAlert(alert.id)}
                        className="h-7"
                      >
                        Dismiss
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))
        )}
      </div>

      {/* Settings Panel */}
      {settings.enabled && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alert Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Severity Threshold</label>
                <select
                  value={settings.severityThreshold}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    severityThreshold: e.target.value as any 
                  }))}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Sound Notifications</label>
                <select
                  value={settings.soundEnabled ? 'enabled' : 'disabled'}
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    soundEnabled: e.target.value === 'enabled' 
                  }))}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="enabled">Enabled</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Alert Types</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {['trend', 'threshold', 'anomaly', 'prediction'].map((type) => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.types.includes(type)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSettings(prev => ({
                            ...prev,
                            types: [...prev.types, type]
                          }))
                        } else {
                          setSettings(prev => ({
                            ...prev,
                            types: prev.types.filter(t => t !== type)
                          }))
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
