import { NextRequest, NextResponse } from 'next/server'
import { StatefulFuzzingEngine, AIPlatformFuzzingEngine, FuzzingConfiguration } from '@/lib'

// Global fuzzing engine instance
let fuzzingEngine: StatefulFuzzingEngine | null = null

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, config } = body

    switch (action) {
      case 'start':
        return await startFuzzing(config)
      case 'stop':
        return await stopFuzzing()
      case 'status':
        return await getFuzzingStatus()
      case 'results':
        return await getFuzzingResults()
      case 'export':
        return await exportStateModel()
      case 'import':
        return await importStateModel(body.model)
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Fuzzing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'status':
        return await getFuzzingStatus()
      case 'results':
        return await getFuzzingResults()
      case 'export':
        return await exportStateModel()
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Fuzzing API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function startFuzzing(config: FuzzingConfiguration) {
  try {
    // Stop existing fuzzing if running
    if (fuzzingEngine) {
      fuzzingEngine.stopFuzzing()
    }

    // Create new fuzzing engine
    fuzzingEngine = new AIPlatformFuzzingEngine(config)

    // Start fuzzing in background
    fuzzingEngine.startFuzzing().catch(error => {
      console.error('Fuzzing error:', error)
    })

    return NextResponse.json({
      success: true,
      message: 'Fuzzing started successfully',
      config: config
    })
  } catch (error) {
    console.error('Failed to start fuzzing:', error)
    return NextResponse.json(
      { error: 'Failed to start fuzzing' },
      { status: 500 }
    )
  }
}

async function stopFuzzing() {
  try {
    if (fuzzingEngine) {
      fuzzingEngine.stopFuzzing()
      return NextResponse.json({
        success: true,
        message: 'Fuzzing stopped successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'No fuzzing session active' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Failed to stop fuzzing:', error)
    return NextResponse.json(
      { error: 'Failed to stop fuzzing' },
      { status: 500 }
    )
  }
}

async function getFuzzingStatus() {
  try {
    if (!fuzzingEngine) {
      return NextResponse.json({
        isRunning: false,
        message: 'No fuzzing session active'
      })
    }

    const results = fuzzingEngine.getResults()
    
    return NextResponse.json({
      isRunning: results.totalExecutions > 0,
      status: 'active',
      results: {
        totalExecutions: results.totalExecutions,
        executionsPerSecond: results.executionsPerSecond,
        codeCoverage: results.codeCoverage,
        stateCoverage: results.stateCoverage,
        bugsFound: results.bugsFound,
        crashes: results.crashes,
        timeouts: results.timeouts,
        errors: results.errors
      }
    })
  } catch (error) {
    console.error('Failed to get fuzzing status:', error)
    return NextResponse.json(
      { error: 'Failed to get fuzzing status' },
      { status: 500 }
    )
  }
}

async function getFuzzingResults() {
  try {
    if (!fuzzingEngine) {
      return NextResponse.json(
        { error: 'No fuzzing session active' },
        { status: 400 }
      )
    }

    const results = fuzzingEngine.getResults()
    
    return NextResponse.json({
      success: true,
      results: results
    })
  } catch (error) {
    console.error('Failed to get fuzzing results:', error)
    return NextResponse.json(
      { error: 'Failed to get fuzzing results' },
      { status: 500 }
    )
  }
}

async function exportStateModel() {
  try {
    if (!fuzzingEngine) {
      return NextResponse.json(
        { error: 'No fuzzing session active' },
        { status: 400 }
      )
    }

    const stateModel = fuzzingEngine.exportStateModel()
    
    return NextResponse.json({
      success: true,
      stateModel: stateModel
    })
  } catch (error) {
    console.error('Failed to export state model:', error)
    return NextResponse.json(
      { error: 'Failed to export state model' },
      { status: 500 }
    )
  }
}

async function importStateModel(modelJson: string) {
  try {
    if (!fuzzingEngine) {
      return NextResponse.json(
        { error: 'No fuzzing session active' },
        { status: 400 }
      )
    }

    fuzzingEngine.importStateModel(modelJson)
    
    return NextResponse.json({
      success: true,
      message: 'State model imported successfully'
    })
  } catch (error) {
    console.error('Failed to import state model:', error)
    return NextResponse.json(
      { error: 'Failed to import state model' },
      { status: 500 }
    )
  }
}
