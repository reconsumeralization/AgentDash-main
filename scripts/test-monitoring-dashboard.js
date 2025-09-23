#!/usr/bin/env node

/**
 * Test Monitoring Dashboard
 * Provides real-time monitoring of test runs and system health
 */

const fs = require('fs')
const path = require('path')
const http = require('http')
const { execSync } = require('child_process')

class TestMonitoringDashboard {
  constructor(options = {}) {
    this.port = options.port || 3001
    this.reportsDir = path.join(process.cwd(), 'test-reports')
    this.isRunning = false
    this.metrics = {
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
      averageRunTime: 0,
      lastRunTime: null,
      uptime: 0,
      issues: [],
      fixes: []
    }
    this.startTime = Date.now()
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString()
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    }

    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`)
  }

  start() {
    this.log(`Starting Test Monitoring Dashboard on port ${this.port}`, 'info')
    
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res)
    })

    server.listen(this.port, () => {
      this.log(`Dashboard available at http://localhost:${this.port}`, 'success')
      this.isRunning = true
      
      // Start monitoring loop
      this.startMonitoringLoop()
    })

    // Graceful shutdown
    process.on('SIGINT', () => {
      this.log('Shutting down monitoring dashboard...', 'warning')
      this.isRunning = false
      server.close(() => {
        this.log('Dashboard stopped', 'info')
        process.exit(0)
      })
    })
  }

  handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${this.port}`)
    
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    switch (url.pathname) {
      case '/':
        this.serveDashboard(res)
        break
      case '/api/metrics':
        this.serveMetrics(res)
        break
      case '/api/reports':
        this.serveReports(res)
        break
      case '/api/health':
        this.serveHealth(res)
        break
      case '/api/trigger-test':
        this.triggerTest(res)
        break
      default:
        res.writeHead(404)
        res.end('Not Found')
    }
  }

  serveDashboard(res) {
    const html = this.generateDashboardHTML()
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(html)
  }

  serveMetrics(res) {
    this.updateMetrics()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(this.metrics))
  }

  serveReports(res) {
    const reports = this.loadReports()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(reports))
  }

  serveHealth(res) {
    const health = {
      status: this.isRunning ? 'healthy' : 'stopped',
      uptime: Date.now() - this.startTime,
      lastUpdate: new Date().toISOString()
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(health))
  }

  async triggerTest(res) {
    this.log('Triggering test run from dashboard...', 'info')
    
    try {
      // Run tests in background
      const testProcess = require('child_process').spawn('node', ['scripts/enhanced-test-runner.js'], {
        detached: true,
        stdio: 'pipe'
      })

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        status: 'triggered', 
        message: 'Test run started',
        pid: testProcess.pid 
      }))
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ 
        status: 'error', 
        message: error.message 
      }))
    }
  }

  generateDashboardHTML() {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AgentDash Test Monitoring Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { 
            background: rgba(255,255,255,0.95); 
            padding: 20px; 
            border-radius: 10px; 
            margin-bottom: 20px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .header h1 { color: #2d3748; margin-bottom: 10px; }
        .status-bar { display: flex; gap: 20px; margin-bottom: 20px; }
        .status-card { 
            background: rgba(255,255,255,0.9); 
            padding: 20px; 
            border-radius: 8px; 
            flex: 1;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .status-card h3 { margin-bottom: 10px; color: #4a5568; }
        .status-card .value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .success { color: #38a169; }
        .error { color: #e53e3e; }
        .warning { color: #d69e2e; }
        .info { color: #3182ce; }
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin-bottom: 20px;
        }
        .metric-card { 
            background: rgba(255,255,255,0.9); 
            padding: 20px; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .metric-card h3 { margin-bottom: 15px; color: #4a5568; }
        .metric-list { list-style: none; }
        .metric-list li { 
            padding: 8px 0; 
            border-bottom: 1px solid #e2e8f0; 
            display: flex; 
            justify-content: space-between;
        }
        .metric-list li:last-child { border-bottom: none; }
        .controls { 
            background: rgba(255,255,255,0.9); 
            padding: 20px; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .btn { 
            background: #3182ce; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            cursor: pointer; 
            margin-right: 10px;
            font-size: 14px;
        }
        .btn:hover { background: #2c5aa0; }
        .btn-success { background: #38a169; }
        .btn-success:hover { background: #2f855a; }
        .btn-warning { background: #d69e2e; }
        .btn-warning:hover { background: #b7791f; }
        .log { 
            background: #1a202c; 
            color: #e2e8f0; 
            padding: 20px; 
            border-radius: 8px; 
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 12px;
            max-height: 300px;
            overflow-y: auto;
            margin-top: 20px;
        }
        .auto-refresh { 
            position: fixed; 
            top: 20px; 
            right: 20px; 
            background: rgba(255,255,255,0.9); 
            padding: 10px; 
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .refresh-indicator { 
            display: inline-block; 
            width: 12px; 
            height: 12px; 
            border-radius: 50%; 
            background: #38a169; 
            margin-right: 8px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 AgentDash Test Monitoring Dashboard</h1>
            <p>Real-time monitoring of test runs and system health</p>
        </div>

        <div class="auto-refresh">
            <span class="refresh-indicator"></span>
            Auto-refresh: <span id="refreshStatus">ON</span>
        </div>

        <div class="status-bar">
            <div class="status-card">
                <h3>System Status</h3>
                <div class="value info" id="systemStatus">Loading...</div>
                <div>Uptime: <span id="uptime">-</span></div>
            </div>
            <div class="status-card">
                <h3>Total Runs</h3>
                <div class="value info" id="totalRuns">-</div>
                <div>Success Rate: <span id="successRate">-</span></div>
            </div>
            <div class="status-card">
                <h3>Last Run</h3>
                <div class="value info" id="lastRun">-</div>
                <div>Duration: <span id="lastDuration">-</span></div>
            </div>
        </div>

        <div class="metrics-grid">
            <div class="metric-card">
                <h3>📊 Test Results</h3>
                <ul class="metric-list" id="testResults">
                    <li>Loading...</li>
                </ul>
            </div>
            <div class="metric-card">
                <h3>🔧 Recent Issues</h3>
                <ul class="metric-list" id="recentIssues">
                    <li>Loading...</li>
                </ul>
            </div>
            <div class="metric-card">
                <h3>✅ Applied Fixes</h3>
                <ul class="metric-list" id="appliedFixes">
                    <li>Loading...</li>
                </ul>
            </div>
        </div>

        <div class="controls">
            <h3>🎮 Test Controls</h3>
            <button class="btn btn-success" onclick="triggerTest()">Run Tests Now</button>
            <button class="btn" onclick="refreshData()">Refresh Data</button>
            <button class="btn btn-warning" onclick="toggleAutoRefresh()">Toggle Auto-refresh</button>
            <button class="btn" onclick="clearLogs()">Clear Logs</button>
        </div>

        <div class="log" id="logOutput">
            <div>🚀 Dashboard started at ${new Date().toLocaleString()}</div>
        </div>
    </div>

    <script>
        let autoRefreshInterval;
        let autoRefreshEnabled = true;

        function startAutoRefresh() {
            if (autoRefreshInterval) clearInterval(autoRefreshInterval);
            autoRefreshInterval = setInterval(refreshData, 5000);
        }

        function stopAutoRefresh() {
            if (autoRefreshInterval) {
                clearInterval(autoRefreshInterval);
                autoRefreshInterval = null;
            }
        }

        function toggleAutoRefresh() {
            autoRefreshEnabled = !autoRefreshEnabled;
            const status = document.getElementById('refreshStatus');
            status.textContent = autoRefreshEnabled ? 'ON' : 'OFF';
            
            if (autoRefreshEnabled) {
                startAutoRefresh();
            } else {
                stopAutoRefresh();
            }
        }

        async function refreshData() {
            try {
                const [metricsResponse, reportsResponse] = await Promise.all([
                    fetch('/api/metrics'),
                    fetch('/api/reports')
                ]);

                const metrics = await metricsResponse.json();
                const reports = await reportsResponse.json();

                updateDashboard(metrics, reports);
                addLog('📊 Data refreshed');
            } catch (error) {
                addLog('❌ Error refreshing data: ' + error.message);
            }
        }

        function updateDashboard(metrics, reports) {
            // Update status bar
            document.getElementById('systemStatus').textContent = metrics.uptime > 0 ? 'Running' : 'Stopped';
            document.getElementById('uptime').textContent = formatDuration(metrics.uptime);
            document.getElementById('totalRuns').textContent = metrics.totalRuns;
            document.getElementById('successRate').textContent = 
                metrics.totalRuns > 0 ? ((metrics.successfulRuns / metrics.totalRuns) * 100).toFixed(1) + '%' : '0%';
            document.getElementById('lastRun').textContent = 
                metrics.lastRunTime ? new Date(metrics.lastRunTime).toLocaleString() : 'Never';
            document.getElementById('lastDuration').textContent = 
                metrics.averageRunTime ? (metrics.averageRunTime / 1000).toFixed(1) + 's' : '-';

            // Update test results
            const testResults = document.getElementById('testResults');
            testResults.innerHTML = \`
                <li>Total Tests: <span class="info">\${metrics.totalRuns}</span></li>
                <li>Successful: <span class="success">\${metrics.successfulRuns}</span></li>
                <li>Failed: <span class="error">\${metrics.failedRuns}</span></li>
                <li>Average Time: <span class="info">\${(metrics.averageRunTime / 1000).toFixed(1)}s</span></li>
            \`;

            // Update recent issues
            const recentIssues = document.getElementById('recentIssues');
            if (metrics.issues && metrics.issues.length > 0) {
                recentIssues.innerHTML = metrics.issues.slice(0, 5).map(issue => 
                    \`<li><span class="warning">\${issue.type}</span>: \${issue.message}</li>\`
                ).join('');
            } else {
                recentIssues.innerHTML = '<li>No recent issues</li>';
            }

            // Update applied fixes
            const appliedFixes = document.getElementById('appliedFixes');
            if (metrics.fixes && metrics.fixes.length > 0) {
                appliedFixes.innerHTML = metrics.fixes.slice(0, 5).map(fix => 
                    \`<li><span class="success">\${fix.type}</span>: \${fix.description}</li>\`
                ).join('');
            } else {
                appliedFixes.innerHTML = '<li>No recent fixes</li>';
            }
        }

        async function triggerTest() {
            try {
                addLog('🚀 Triggering test run...');
                const response = await fetch('/api/trigger-test', { method: 'POST' });
                const result = await response.json();
                
                if (result.status === 'triggered') {
                    addLog('✅ Test run started (PID: ' + result.pid + ')');
                } else {
                    addLog('❌ Failed to start test run: ' + result.message);
                }
            } catch (error) {
                addLog('❌ Error triggering test: ' + error.message);
            }
        }

        function addLog(message) {
            const log = document.getElementById('logOutput');
            const timestamp = new Date().toLocaleTimeString();
            log.innerHTML += \`<div>[\${timestamp}] \${message}</div>\`;
            log.scrollTop = log.scrollHeight;
        }

        function clearLogs() {
            document.getElementById('logOutput').innerHTML = '';
            addLog('📝 Logs cleared');
        }

        function formatDuration(ms) {
            if (!ms) return '0s';
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            if (hours > 0) return \`\${hours}h \${minutes % 60}m\`;
            if (minutes > 0) return \`\${minutes}m \${seconds % 60}s\`;
            return \`\${seconds}s\`;
        }

        // Initialize dashboard
        document.addEventListener('DOMContentLoaded', function() {
            startAutoRefresh();
            refreshData();
            addLog('🎯 Dashboard initialized');
        });
    </script>
</body>
</html>
    `
  }

  updateMetrics() {
    const reports = this.loadReports()
    
    this.metrics.totalRuns = reports.length
    this.metrics.successfulRuns = reports.filter(r => r.summary && r.summary.totalFailed === 0).length
    this.metrics.failedRuns = reports.filter(r => r.summary && r.summary.totalFailed > 0).length
    this.metrics.averageRunTime = reports.length > 0 ? 
      reports.reduce((sum, r) => sum + (r.duration || 0), 0) / reports.length : 0
    this.metrics.lastRunTime = reports.length > 0 ? reports[reports.length - 1].timestamp : null
    this.metrics.uptime = Date.now() - this.startTime
    
    // Aggregate issues and fixes from reports
    this.metrics.issues = reports.flatMap(r => r.issues || [])
    this.metrics.fixes = reports.flatMap(r => r.fixes || [])
  }

  loadReports() {
    if (!fs.existsSync(this.reportsDir)) {
      return []
    }

    const files = fs.readdirSync(this.reportsDir)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(this.reportsDir, f))
      .sort((a, b) => fs.statSync(b).mtime - fs.statSync(a).mtime)

    return files.map(file => {
      try {
        const content = fs.readFileSync(file, 'utf8')
        return JSON.parse(content)
      } catch (error) {
        return null
      }
    }).filter(report => report !== null)
  }

  startMonitoringLoop() {
    setInterval(() => {
      if (this.isRunning) {
        this.updateMetrics()
        this.log(`Monitoring: ${this.metrics.totalRuns} total runs, ${this.metrics.successfulRuns} successful`)
      }
    }, 30000) // Update every 30 seconds
  }
}

// CLI interface
const args = process.argv.slice(2)
const options = {}

if (args.includes('--port')) {
  const index = args.indexOf('--port')
  options.port = parseInt(args[index + 1]) || 3001
}

const dashboard = new TestMonitoringDashboard(options)
dashboard.start()
