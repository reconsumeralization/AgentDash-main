import { NextRequest, NextResponse } from 'next/server'
import { MSRCCVRFClient, SecurityIntelligenceService } from '@/lib'

// Global MSRC client instance
let msrcClient: MSRCCVRFClient | null = null
let intelligenceService: SecurityIntelligenceService | null = null

// Initialize clients
function initializeClients() {
  if (!msrcClient) {
    msrcClient = new MSRCCVRFClient({
      baseUrl: 'https://api.msrc.microsoft.com/cvrf/v3.0',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000
    })
  }
  
  if (!intelligenceService) {
    intelligenceService = new SecurityIntelligenceService(msrcClient)
  }
}

export async function GET(request: NextRequest) {
  try {
    initializeClients()
    
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const timeframe = searchParams.get('timeframe') || '30d'
    const severity = searchParams.get('severity')
    const cveId = searchParams.get('cve')

    switch (action) {
      case 'updates':
        return await getSecurityUpdates(timeframe, severity || undefined)
      case 'recent':
        return await getRecentUpdates(parseInt(timeframe.replace('d', '')))
      case 'critical':
        return await getCriticalVulnerabilities()
      case 'cve':
        if (!cveId) {
          return NextResponse.json({ error: 'CVE ID required' }, { status: 400 })
        }
        return await searchByCVE(cveId)
      case 'analysis':
        return await getVulnerabilityAnalysis(timeframe)
      case 'campaigns':
        return await generateFuzzingCampaigns()
      case 'monitor':
        return await monitorAndTriggerFuzzing()
      case 'cache-stats':
        return await getCacheStats()
      case 'clear-cache':
        return await clearCache()
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Security Intelligence API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeClients()
    
    const body = await request.json()
    const { action, config } = body

    switch (action) {
      case 'generate-campaigns':
        return await generateCustomFuzzingCampaigns(config)
      case 'analyze-patterns':
        return await analyzeCustomPatterns(config)
      case 'trigger-fuzzing':
        return await triggerImmediateFuzzing(config)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Security Intelligence API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getSecurityUpdates(timeframe: string, severity?: string) {
  try {
    if (!msrcClient) throw new Error('MSRC client not initialized')

    const days = parseInt(timeframe.replace('d', ''))
    let updates = await msrcClient.getRecentUpdates(days)

    if (severity) {
      updates = updates.filter(update => 
        update.severity.toLowerCase() === severity.toLowerCase()
      )
    }

    return NextResponse.json({
      success: true,
      data: updates,
      count: updates.length,
      timeframe,
      severity: severity || 'all'
    })
  } catch (error) {
    console.error('Failed to get security updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security updates' },
      { status: 500 }
    )
  }
}

async function getRecentUpdates(days: number) {
  try {
    if (!msrcClient) throw new Error('MSRC client not initialized')

    const updates = await msrcClient.getRecentUpdates(days)
    
    return NextResponse.json({
      success: true,
      data: updates,
      count: updates.length,
      timeframe: `${days} days`
    })
  } catch (error) {
    console.error('Failed to get recent updates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent updates' },
      { status: 500 }
    )
  }
}

async function getCriticalVulnerabilities() {
  try {
    if (!msrcClient) throw new Error('MSRC client not initialized')

    const updates = await msrcClient.getHighSeverityVulnerabilities()
    
    return NextResponse.json({
      success: true,
      data: updates,
      count: updates.length,
      severity: 'Critical and Important'
    })
  } catch (error) {
    console.error('Failed to get critical vulnerabilities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch critical vulnerabilities' },
      { status: 500 }
    )
  }
}

async function searchByCVE(cveId: string) {
  try {
    if (!msrcClient) throw new Error('MSRC client not initialized')

    const updates = await msrcClient.searchByCVE(cveId)
    
    return NextResponse.json({
      success: true,
      data: updates,
      count: updates.length,
      cveId
    })
  } catch (error) {
    console.error(`Failed to search for CVE ${cveId}:`, error)
    return NextResponse.json(
      { error: `Failed to search for CVE ${cveId}` },
      { status: 500 }
    )
  }
}

async function getVulnerabilityAnalysis(timeframe: string) {
  try {
    if (!msrcClient) throw new Error('MSRC client not initialized')

    const days = parseInt(timeframe.replace('d', ''))
    const updates = await msrcClient.getRecentUpdates(days)
    const analysis = await msrcClient.analyzeVulnerabilityPatterns(updates)
    
    return NextResponse.json({
      success: true,
      data: analysis,
      timeframe,
      totalVulnerabilities: updates.length
    })
  } catch (error) {
    console.error('Failed to get vulnerability analysis:', error)
    return NextResponse.json(
      { error: 'Failed to analyze vulnerabilities' },
      { status: 500 }
    )
  }
}

async function generateFuzzingCampaigns() {
  try {
    if (!intelligenceService) throw new Error('Intelligence service not initialized')

    const campaigns = await intelligenceService.generateIntelligentFuzzingCampaigns()
    
    return NextResponse.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    })
  } catch (error) {
    console.error('Failed to generate fuzzing campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to generate fuzzing campaigns' },
      { status: 500 }
    )
  }
}

async function generateCustomFuzzingCampaigns(config: any) {
  try {
    if (!intelligenceService) throw new Error('Intelligence service not initialized')

    // Custom campaign generation logic based on config
    const campaigns = await intelligenceService.generateIntelligentFuzzingCampaigns()
    
    // Filter or modify campaigns based on config
    const filteredCampaigns = campaigns.filter(campaign => {
      if (config.priority && campaign.priority !== config.priority) return false
      if (config.minDuration && campaign.estimatedDuration < config.minDuration) return false
      if (config.maxDuration && campaign.estimatedDuration > config.maxDuration) return false
      return true
    })
    
    return NextResponse.json({
      success: true,
      data: filteredCampaigns,
      count: filteredCampaigns.length,
      config
    })
  } catch (error) {
    console.error('Failed to generate custom fuzzing campaigns:', error)
    return NextResponse.json(
      { error: 'Failed to generate custom fuzzing campaigns' },
      { status: 500 }
    )
  }
}

async function analyzeCustomPatterns(config: any) {
  try {
    if (!msrcClient) throw new Error('MSRC client not initialized')

    const { timeframe, severity, products } = config
    const days = parseInt(timeframe.replace('d', ''))
    let updates = await msrcClient.getRecentUpdates(days)

    // Apply filters
    if (severity) {
      updates = updates.filter(update => 
        update.severity.toLowerCase() === severity.toLowerCase()
      )
    }

    if (products && products.length > 0) {
      updates = updates.filter(update => 
        products.some((product: string) => 
          update.document_title.toLowerCase().includes(product.toLowerCase())
        )
      )
    }

    const analysis = await msrcClient.analyzeVulnerabilityPatterns(updates)
    
    return NextResponse.json({
      success: true,
      data: analysis,
      config,
      filteredCount: updates.length
    })
  } catch (error) {
    console.error('Failed to analyze custom patterns:', error)
    return NextResponse.json(
      { error: 'Failed to analyze custom patterns' },
      { status: 500 }
    )
  }
}

async function triggerImmediateFuzzing(config: any) {
  try {
    if (!intelligenceService) throw new Error('Intelligence service not initialized')

    // Trigger immediate fuzzing based on config
    await intelligenceService.monitorAndTriggerFuzzing()
    
    return NextResponse.json({
      success: true,
      message: 'Immediate fuzzing triggered successfully',
      config
    })
  } catch (error) {
    console.error('Failed to trigger immediate fuzzing:', error)
    return NextResponse.json(
      { error: 'Failed to trigger immediate fuzzing' },
      { status: 500 }
    )
  }
}

async function monitorAndTriggerFuzzing() {
  try {
    if (!intelligenceService) throw new Error('Intelligence service not initialized')

    await intelligenceService.monitorAndTriggerFuzzing()
    
    return NextResponse.json({
      success: true,
      message: 'Monitoring and fuzzing trigger completed'
    })
  } catch (error) {
    console.error('Failed to monitor and trigger fuzzing:', error)
    return NextResponse.json(
      { error: 'Failed to monitor and trigger fuzzing' },
      { status: 500 }
    )
  }
}

async function getCacheStats() {
  try {
    if (!msrcClient) throw new Error('MSRC client not initialized')

    const stats = msrcClient.getCacheStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('Failed to get cache stats:', error)
    return NextResponse.json(
      { error: 'Failed to get cache statistics' },
      { status: 500 }
    )
  }
}

async function clearCache() {
  try {
    if (!msrcClient) throw new Error('MSRC client not initialized')

    msrcClient.clearCache()
    
    return NextResponse.json({
      success: true,
      message: 'Cache cleared successfully'
    })
  } catch (error) {
    console.error('Failed to clear cache:', error)
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    )
  }
}
