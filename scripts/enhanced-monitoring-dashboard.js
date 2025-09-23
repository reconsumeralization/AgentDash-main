/**
 * Enhanced Monitoring Dashboard - Real-time test monitoring with analytics
 * Provides advanced metrics, error tracking, and predictive insights
 */

const express = require('express')
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')
const { EnhancedErrorAnalyzer } = require('./enhanced-error-analyzer')
const { IntelligentAutoFixer } = require('./intelligent-auto-fixer')

class EnhancedMonitoringDashboard {
  constructor(options = {}) {
    this.options = {
      port: options.port || 3001,
      updateInterval: options.updateInterval || 30000, // 30 seconds
      historySize: options.historySize || 100,
      ...options
    }

    this.app = express()
    this.errorAnalyzer = new EnhancedErrorAnalyzer()
    this.autoFixer = new IntelligentAutoFixer()
    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      totalErrors: 0,
      totalFixes: 0,
      successfulFixes: 0,
      startTime: new Date().toISOString(),
      lastUpdate: new Date().toISOString()
    }
    this.history = []
    this.currentStatus = 'idle'
    this.isMonitoring = false
    this.monitoringInterval = null

    this.setupRoutes()
  }

  setupRoutes() {
    this.app.use(express.json())
    this.app.use(express.static('public'))

    // API Routes
    this.app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: Date.now() - new Date(this.metrics.startTime).getTime(),
        version: '2.0.0'
      })
    })

    this.app.get('/api/metrics', (req, res) => {
      res.json({
        ...this.metrics,
        successRate: this.metrics.totalRuns > 0 ? 
          (this.metrics.successfulRuns / this.metrics.totalRuns) * 100 : 0,
        fixSuccessRate: this.metrics.totalFixes > 0 ? 
          (this.metrics.successfulFixes / this.metrics.totalFixes) * 100 : 0,
        currentStatus: this.currentStatus,
        isMonitoring: this.isMonitoring
      })
    })

    this.app.get('/api/errors', (req, res) => {
      const errorReport = this.errorAnalyzer.generateReport()
      res.json(errorReport)
    })

    this.app.get('/api/fixes', (req, res) => {
      const fixHistory = this.autoFixer.getFixHistory()
      res.json({
        totalFixes: fixHistory.length,
        recentFixes: this.autoFixer.getRecentFixes(20),
        successRates: this.autoFixer.successRate
      })
    })

    this.app.get('/api/history', (req, res) => {
      const limit = parseInt(req.query.limit) || 50
      res.json(this.history.slice(-limit))
    })

    this.app.post('/api/start-monitoring', (req, res) => {
      this.startMonitoring()
      res.json({ status: 'monitoring started' })
    })

    this.app.post('/api/stop-monitoring', (req, res) => {
      this.stopMonitoring()
      res.json({ status: 'monitoring stopped' })
    })

    this.app.post('/api/run-test', async (req, res) => {
      try {
        const result = await this.runSingleTest()
        res.json(result)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    this.app.post('/api/apply-fixes', async (req, res) => {
      try {
        const result = await this.applyAutoFixes()
        res.json(result)
      } catch (error) {
        res.status(500).json({ error: error.message })
      }
    })

    // Dashboard HTML
    this.app.get('/', (req, res) => {
      res.send(this.generateDashboardHTML())
    })

    // WebSocket for real-time updates
    this.setupWebSocket()
  }

  setupWebSocket() {
    const { Server } = require('ws')
    const server = require('http').createServer(this.app)
    this.wss = new Server({ server })

    this.wss.on('connection', (ws) => {
      console.log('Client connected to monitoring dashboard')
      
      // Send current metrics
      ws.send(JSON.stringify({
        type: 'metrics',
        data: this.metrics
      }))

      ws.on('close', () => {
        console.log('Client disconnected from monitoring dashboard')
      })
    })

    this.server = server
  }

  async runSingleTest() {
    const startTime = new Date()
    this.currentStatus = 'testing'
    
    try {
      // Run TypeScript check
      const tscOutput = execSync('npx tsc --noEmit', { 
        encoding: 'utf8', 
        stdio: 'pipe' 
      })
      
      const result = {
        success: true,
        duration: Date.now() - startTime.getTime(),
        timestamp: new Date().toISOString(),
        errors: [],
        fixes: []
      }

      this.metrics.totalRuns++
      this.metrics.successfulRuns++
      this.currentStatus = 'success'

      return result
    } catch (error) {
      const result = {
        success: false,
        duration: Date.now() - startTime.getTime(),
        timestamp: new Date().toISOString(),
        errors: [],
        fixes: []
      }

      // Parse and analyze errors
      const errors = this.parseErrors(error.stdout || error.message)
      result.errors = errors

      // Update metrics
      this.metrics.totalRuns++
      this.metrics.failedRuns++
      this.metrics.totalErrors += errors.length
      this.currentStatus = 'failed'

      // Add to history
      this.history.push(result)
      if (this.history.length > this.options.historySize) {
        this.history.shift()
      }

      return result
    }
  }

  async applyAutoFixes() {
    const startTime = new Date()
    this.currentStatus = 'fixing'
    
    try {
      // Get current errors
      const testResult = await this.runSingleTest()
      if (testResult.success) {
        return { success: true, message: 'No errors to fix' }
      }

      const fixes = []
      for (const error of testResult.errors) {
        if (error.fixable && error.suggestions) {
          const suggestion = error.suggestions[0] // Take first suggestion
          const fixResult = await this.autoFixer.applyFix(error, suggestion)
          fixes.push(fixResult)
          
          this.metrics.totalFixes++
          if (fixResult.success) {
            this.metrics.successfulFixes++
          }
        }
      }

      this.currentStatus = 'idle'
      return {
        success: true,
        duration: Date.now() - startTime.getTime(),
        fixes: fixes.length,
        successfulFixes: fixes.filter(f => f.success).length
      }
    } catch (error) {
      this.currentStatus = 'error'
      throw error
    }
  }

  parseErrors(output) {
    const errors = []
    const lines = output.split('\n')

    for (const line of lines) {
      if (line.trim() === '') continue

      // Try to extract file path and line number
      const fileMatch = line.match(/([^(]+)\((\d+),\d+\)/)
      const filePath = fileMatch ? fileMatch[1].trim() : null
      const lineNumber = fileMatch ? parseInt(fileMatch[2]) : null

      // Analyze the error
      const analysis = this.errorAnalyzer.analyzeError(line, filePath, lineNumber)
      if (analysis.category !== 'unknown') {
        errors.push(analysis)
      }
    }

    return errors
  }

  startMonitoring() {
    if (this.isMonitoring) return

    this.isMonitoring = true
    this.log('Starting enhanced monitoring...', 'info')

    this.monitoringInterval = setInterval(async () => {
      try {
        const result = await this.runSingleTest()
        this.broadcastUpdate('test-result', result)
        
        // Auto-fix if enabled and errors are found
        if (!result.success && result.errors.length > 0) {
          const fixResult = await this.applyAutoFixes()
          this.broadcastUpdate('fix-result', fixResult)
        }
      } catch (error) {
        this.log(`Monitoring error: ${error.message}`, 'error')
      }
    }, this.options.updateInterval)
  }

  stopMonitoring() {
    if (!this.isMonitoring) return

    this.isMonitoring = false
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
    
    this.log('Stopped enhanced monitoring', 'info')
  }

  broadcastUpdate(type, data) {
    const message = JSON.stringify({ type, data, timestamp: new Date().toISOString() })
    
    this.wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(message)
      }
    })
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Test Monitoring Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f1f5f9; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { color: #3b82f6; margin-bottom: 10px; }
        .header p { color: #94a3b8; }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #1e293b; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6; }
        .metric-card h3 { color: #3b82f6; margin-bottom: 10px; }
        .metric-value { font-size: 2em; font-weight: bold; color: #f1f5f9; }
        .metric-label { color: #94a3b8; margin-top: 5px; }
        .status-indicator { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; }
        .status-success { background: #10b981; }
        .status-error { background: #ef4444; }
        .status-warning { background: #f59e0b; }
        .status-idle { background: #6b7280; }
        .controls { display: flex; gap: 10px; margin-bottom: 30px; }
        .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; }
        .btn-primary { background: #3b82f6; color: white; }
        .btn-danger { background: #ef4444; color: white; }
        .btn-success { background: #10b981; color: white; }
        .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .chart-container { background: #1e293b; border-radius: 8px; padding: 20px; }
        .error-list { background: #1e293b; border-radius: 8px; padding: 20px; }
        .error-item { padding: 10px; border-bottom: 1px solid #334155; }
        .error-item:last-child { border-bottom: none; }
        .error-category { color: #3b82f6; font-weight: 500; }
        .error-description { color: #94a3b8; margin-top: 5px; }
        .fix-item { padding: 10px; border-bottom: 1px solid #334155; }
        .fix-success { border-left: 4px solid #10b981; }
        .fix-failed { border-left: 4px solid #ef4444; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Enhanced Test Monitoring Dashboard</h1>
            <p>Real-time test monitoring with intelligent error analysis and auto-fixing</p>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>Test Runs</h3>
                <div class="metric-value" id="total-runs">0</div>
                <div class="metric-label">Total Runs</div>
            </div>
            <div class="metric-card">
                <h3>Success Rate</h3>
                <div class="metric-value" id="success-rate">0%</div>
                <div class="metric-label">Successful Runs</div>
            </div>
            <div class="metric-card">
                <h3>Errors</h3>
                <div class="metric-value" id="total-errors">0</div>
                <div class="metric-label">Total Errors</div>
            </div>
            <div class="metric-card">
                <h3>Fixes</h3>
                <div class="metric-value" id="total-fixes">0</div>
                <div class="metric-label">Auto-Fixes Applied</div>
            </div>
            <div class="metric-card">
                <h3>Status</h3>
                <div class="metric-value">
                    <span class="status-indicator" id="status-indicator"></span>
                    <span id="current-status">Idle</span>
                </div>
                <div class="metric-label">Current Status</div>
            </div>
        </div>

        <div class="controls">
            <button class="btn btn-primary" onclick="startMonitoring()">Start Monitoring</button>
            <button class="btn btn-danger" onclick="stopMonitoring()">Stop Monitoring</button>
            <button class="btn btn-success" onclick="runTest()">Run Test</button>
            <button class="btn btn-primary" onclick="applyFixes()">Apply Fixes</button>
        </div>

        <div class="charts">
            <div class="chart-container">
                <h3>Success Rate Trend</h3>
                <canvas id="success-chart"></canvas>
            </div>
            <div class="chart-container">
                <h3>Error Categories</h3>
                <canvas id="error-chart"></canvas>
            </div>
        </div>

        <div class="error-list">
            <h3>Recent Errors</h3>
            <div id="error-list">No errors</div>
        </div>
    </div>

    <script>
        let ws;
        let successChart;
        let errorChart;

        // Initialize WebSocket connection
        function initWebSocket() {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            ws = new WebSocket(\`\${protocol}//\${window.location.host}\`);
            
            ws.onopen = () => console.log('Connected to monitoring dashboard');
            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);
                handleWebSocketMessage(message);
            };
            ws.onclose = () => {
                console.log('Disconnected from monitoring dashboard');
                setTimeout(initWebSocket, 5000); // Reconnect after 5 seconds
            };
        }

        function handleWebSocketMessage(message) {
            switch (message.type) {
                case 'metrics':
                    updateMetrics(message.data);
                    break;
                case 'test-result':
                    updateTestResult(message.data);
                    break;
                case 'fix-result':
                    updateFixResult(message.data);
                    break;
            }
        }

        function updateMetrics(metrics) {
            document.getElementById('total-runs').textContent = metrics.totalRuns;
            document.getElementById('success-rate').textContent = metrics.successRate.toFixed(1) + '%';
            document.getElementById('total-errors').textContent = metrics.totalErrors;
            document.getElementById('total-fixes').textContent = metrics.totalFixes;
            
            const statusElement = document.getElementById('current-status');
            const indicatorElement = document.getElementById('status-indicator');
            
            statusElement.textContent = metrics.currentStatus;
            indicatorElement.className = 'status-indicator status-' + metrics.currentStatus;
        }

        function updateTestResult(result) {
            // Update charts and error list
            updateErrorList(result.errors);
        }

        function updateFixResult(result) {
            console.log('Fix result:', result);
        }

        function updateErrorList(errors) {
            const errorList = document.getElementById('error-list');
            if (errors.length === 0) {
                errorList.innerHTML = '<div class="error-item">No errors</div>';
                return;
            }

            errorList.innerHTML = errors.slice(0, 10).map(error => \`
                <div class="error-item">
                    <div class="error-category">\${error.category}</div>
                    <div class="error-description">\${error.description}</div>
                </div>
            \`).join('');
        }

        // API calls
        async function startMonitoring() {
            await fetch('/api/start-monitoring', { method: 'POST' });
        }

        async function stopMonitoring() {
            await fetch('/api/stop-monitoring', { method: 'POST' });
        }

        async function runTest() {
            const response = await fetch('/api/run-test', { method: 'POST' });
            const result = await response.json();
            updateTestResult(result);
        }

        async function applyFixes() {
            const response = await fetch('/api/apply-fixes', { method: 'POST' });
            const result = await response.json();
            console.log('Fix result:', result);
        }

        // Initialize charts
        function initCharts() {
            const successCtx = document.getElementById('success-chart').getContext('2d');
            successChart = new Chart(successCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Success Rate',
                        data: [],
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100
                        }
                    }
                }
            });

            const errorCtx = document.getElementById('error-chart').getContext('2d');
            errorChart = new Chart(errorCtx, {
                type: 'doughnut',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: [
                            '#ef4444',
                            '#f59e0b',
                            '#10b981',
                            '#3b82f6',
                            '#8b5cf6'
                        ]
                    }]
                },
                options: {
                    responsive: true
                }
            });
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', () => {
            initWebSocket();
            initCharts();
            
            // Load initial data
            fetch('/api/metrics').then(r => r.json()).then(updateMetrics);
            fetch('/api/errors').then(r => r.json()).then(data => updateErrorList(data.topErrors));
        });
    </script>
</body>
</html>
    `
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      fix: '\x1b[35m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  start() {
    this.server.listen(this.options.port, () => {
      this.log(`Enhanced Monitoring Dashboard running on port ${this.options.port}`, 'success')
      this.log(`Dashboard available at http://localhost:${this.options.port}`, 'info')
    })
  }

  stop() {
    this.stopMonitoring()
    if (this.server) {
      this.server.close()
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2)
  const options = {}

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
        options.port = parseInt(args[++i])
        break
      case '--update-interval':
        options.updateInterval = parseInt(args[++i])
        break
      case '--history-size':
        options.historySize = parseInt(args[++i])
        break
      case '--help':
        console.log(`
Enhanced Monitoring Dashboard

Usage: node scripts/enhanced-monitoring-dashboard.js [options]

Options:
  --port <number>           Port to run the dashboard on (default: 3001)
  --update-interval <ms>    Update interval in milliseconds (default: 30000)
  --history-size <number>   Number of history entries to keep (default: 100)
  --help                   Show this help message
        `)
        process.exit(0)
        break
    }
  }

  const dashboard = new EnhancedMonitoringDashboard(options)
  dashboard.start()

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    dashboard.stop()
    process.exit(0)
  })
}

module.exports = { EnhancedMonitoringDashboard }
