#!/usr/bin/env node

/**
 * DefConect Demo Health Check
 * Verifies that all demo endpoints are working properly
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3003'; // Adjust port as needed

const endpoints = [
  { path: '/', description: 'Root redirect to dashboard' },
  { path: '/dashboard', description: 'Main dashboard' },
  { path: '/networking', description: 'Networking page with aspiration matching' },
  { path: '/agents', description: 'Agents page' },
  { path: '/workflows', description: 'Workflows page' },
  { path: '/api/aspirations', description: 'Aspirations API endpoint' },
  { path: '/api/matching', description: 'Aspiration matching API', method: 'POST', body: JSON.stringify({ aspirations: [], limit: 5 }) },
];

function makeRequest(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint.path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: endpoint.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DefConect-Demo-Health-Check/1.0'
      }
    };

    if (endpoint.body) {
      options.headers['Content-Length'] = Buffer.byteLength(endpoint.body);
    }

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          endpoint: endpoint.path,
          status: res.statusCode,
          description: endpoint.description,
          success: res.statusCode >= 200 && res.statusCode < 400,
          data: data.length > 200 ? data.substring(0, 200) + '...' : data
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        endpoint: endpoint.path,
        status: 'ERROR',
        description: endpoint.description,
        success: false,
        error: err.message
      });
    });

    if (endpoint.body) {
      req.write(endpoint.body);
    }

    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        endpoint: endpoint.path,
        status: 'TIMEOUT',
        description: endpoint.description,
        success: false,
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

async function runHealthCheck() {
  console.log('🚀 DefConect Demo Health Check');
  console.log('================================\n');

  console.log(`Checking endpoints at: ${BASE_URL}\n`);

  const results = [];
  let passed = 0;
  let failed = 0;

  for (const endpoint of endpoints) {
    console.log(`🔍 Testing: ${endpoint.path} - ${endpoint.description}`);

    try {
      const result = await makeRequest(endpoint);
      results.push(result);

      if (result.success) {
        console.log(`   ✅ ${result.status} - OK`);
        passed++;
      } else {
        console.log(`   ❌ ${result.status} - FAILED${result.error ? ` (${result.error})` : ''}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR - ${error.message}`);
      failed++;
    }

    console.log('');
  }

  // Summary
  console.log('📊 SUMMARY');
  console.log('==========');
  console.log(`Total endpoints: ${endpoints.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed === 0) {
    console.log('\n🎉 All demo endpoints are healthy!');
    console.log('Brian can safely proceed with the demonstration.');
  } else {
    console.log('\n⚠️  Some endpoints failed. Please check the server logs.');
    console.log('Failed endpoints:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.endpoint}: ${r.status}${r.error ? ` (${r.error})` : ''}`);
    });
  }

  console.log('\n🔗 Demo URLs:');
  console.log(`   Dashboard: ${BASE_URL}/dashboard`);
  console.log(`   Networking: ${BASE_URL}/networking`);
  console.log(`   Agents: ${BASE_URL}/agents`);
  console.log(`   Workflows: ${BASE_URL}/workflows`);

  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3003,
      path: '/',
      method: 'HEAD'
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

async function main() {
  console.log('⏳ Checking if server is running...\n');

  const isRunning = await checkServerRunning();

  if (!isRunning) {
    console.log('❌ Server is not running!');
    console.log('Please start the development server first:');
    console.log('   npm run dev');
    console.log('');
    console.log('Then run this health check:');
    console.log('   npm run demo-check');
    process.exit(1);
  }

  await runHealthCheck();
}

main().catch(console.error);
