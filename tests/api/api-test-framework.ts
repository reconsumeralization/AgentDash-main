/**
 * API Testing Framework
 * Comprehensive API testing utilities and helpers
 */

import { TestDataGenerator, TestHelpers, TestAssertions } from '../test-utils'
import axios, { AxiosResponse, AxiosError } from 'axios'

// API Test Configuration
interface ApiTestConfig {
  baseUrl: string
  timeout: number
  retries: number
  headers: Record<string, string>
  auth?: {
    type: 'bearer' | 'basic' | 'api-key'
    token?: string
    username?: string
    password?: string
    apiKey?: string
  }
}

// Test Result Interface
interface ApiTestResult {
  testName: string
  success: boolean
  duration: number
  statusCode?: number
  responseTime?: number
  error?: string
  response?: any
  request?: any
}

// API Test Suite
class ApiTestSuite {
  private config: ApiTestConfig
  private results: ApiTestResult[] = []

  constructor(config: ApiTestConfig) {
    this.config = config
  }

  // HTTP Methods
  async get(endpoint: string, params?: Record<string, any>): Promise<AxiosResponse> {
    return this.makeRequest('GET', endpoint, { params })
  }

  async post(endpoint: string, data?: any): Promise<AxiosResponse> {
    return this.makeRequest('POST', endpoint, { data })
  }

  async put(endpoint: string, data?: any): Promise<AxiosResponse> {
    return this.makeRequest('PUT', endpoint, { data })
  }

  async patch(endpoint: string, data?: any): Promise<AxiosResponse> {
    return this.makeRequest('PATCH', endpoint, { data })
  }

  async delete(endpoint: string): Promise<AxiosResponse> {
    return this.makeRequest('DELETE', endpoint)
  }

  // Core request method
  private async makeRequest(
    method: string,
    endpoint: string,
    options: any = {}
  ): Promise<AxiosResponse> {
    const url = `${this.config.baseUrl}${endpoint}`
    const requestConfig = {
      method,
      url,
      timeout: this.config.timeout,
      headers: { ...this.config.headers, ...options.headers },
      ...options
    }

    // Add authentication
    if (this.config.auth) {
      requestConfig.headers = this.addAuthHeaders(requestConfig.headers)
    }

    return axios(requestConfig)
  }

  private addAuthHeaders(headers: Record<string, string>): Record<string, string> {
    const { auth } = this.config

    switch (auth?.type) {
      case 'bearer':
        headers.Authorization = `Bearer ${auth.token}`
        break
      case 'basic':
        const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
        headers.Authorization = `Basic ${credentials}`
        break
      case 'api-key':
        headers['X-API-Key'] = auth.apiKey || ''
        break
    }

    return headers
  }

  // Test execution methods
  async runTest(
    testName: string,
    testFn: () => Promise<any>
  ): Promise<ApiTestResult> {
    const startTime = Date.now()
    let result: ApiTestResult = {
      testName,
      success: false,
      duration: 0
    }

    try {
      const response = await testFn()
      const duration = Date.now() - startTime

      result = {
        testName,
        success: true,
        duration,
        statusCode: response.status,
        responseTime: duration,
        response: response.data,
        request: {
          method: response.config.method,
          url: response.config.url,
          headers: response.config.headers
        }
      }
    } catch (error) {
      const duration = Date.now() - startTime
      const axiosError = error as AxiosError

      result = {
        testName,
        success: false,
        duration,
        statusCode: axiosError.response?.status,
        error: axiosError.message,
        request: {
          method: axiosError.config?.method,
          url: axiosError.config?.url,
          headers: axiosError.config?.headers
        }
      }
    }

    this.results.push(result)
    return result
  }

  // Assertion helpers
  assertStatus(response: AxiosResponse, expectedStatus: number): void {
    TestAssertions.assertInRange(
      response.status,
      expectedStatus,
      expectedStatus,
      `Expected status ${expectedStatus}, got ${response.status}`
    )
  }

  assertResponseTime(response: AxiosResponse, maxTime: number): void {
    const responseTime = response.headers['x-response-time'] || 0
    TestAssertions.assertInRange(
      responseTime,
      0,
      maxTime,
      `Response time ${responseTime}ms exceeds maximum ${maxTime}ms`
    )
  }

  assertResponseStructure(response: AxiosResponse, structure: any): void {
    const data = response.data
    this.validateStructure(data, structure)
  }

  private validateStructure(data: any, structure: any, path: string = ''): void {
    for (const [key, expectedType] of Object.entries(structure)) {
      const currentPath = path ? `${path}.${key}` : key
      
      if (!(key in data)) {
        throw new Error(`Missing property: ${currentPath}`)
      }

      const actualValue = data[key]
      const expectedValue = expectedType

      if (typeof expectedValue === 'object' && expectedValue !== null) {
        this.validateStructure(actualValue, expectedValue, currentPath)
      } else if (typeof expectedValue === 'string') {
        if (typeof actualValue !== expectedValue) {
          throw new Error(`Type mismatch at ${currentPath}: expected ${expectedValue}, got ${typeof actualValue}`)
        }
      }
    }
  }

  // Test data helpers
  generateTestUser() {
    return {
      id: TestDataGenerator.randomUUID(),
      email: TestDataGenerator.randomEmail(),
      firstName: TestDataGenerator.randomString(8),
      lastName: TestDataGenerator.randomString(10),
      createdAt: new Date().toISOString()
    }
  }

  generateTestCampaign() {
    return {
      id: TestDataGenerator.randomUUID(),
      name: `Test Campaign ${TestDataGenerator.randomString(6)}`,
      objectiveType: 'BRAND_AWARENESS',
      budget: {
        amount: Math.floor(Math.random() * 1000) + 100,
        currencyCode: 'USD',
        type: 'DAILY'
      },
      status: 'DRAFT',
      targetAudience: {
        locations: ['US'],
        industries: ['Technology'],
        jobTitles: ['Software Engineer']
      }
    }
  }

  // Performance testing
  async benchmarkEndpoint(
    endpoint: string,
    method: string = 'GET',
    iterations: number = 10
  ): Promise<{ averageTime: number; minTime: number; maxTime: number; times: number[] }> {
    const times: number[] = []

    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now()
      
      try {
        await this.makeRequest(method, endpoint)
        const duration = Date.now() - startTime
        times.push(duration)
      } catch (error) {
        // Still record the time even if request fails
        const duration = Date.now() - startTime
        times.push(duration)
      }

      // Small delay between requests
      await TestHelpers.wait(100)
    }

    return {
      averageTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      minTime: Math.min(...times),
      maxTime: Math.max(...times),
      times
    }
  }

  // Load testing
  async loadTest(
    endpoint: string,
    method: string = 'GET',
    concurrentUsers: number = 10,
    duration: number = 30000
  ): Promise<{ totalRequests: number; successfulRequests: number; failedRequests: number; averageResponseTime: number }> {
    const startTime = Date.now()
    const results: Array<{ success: boolean; responseTime: number }> = []
    const promises: Promise<void>[] = []

    for (let i = 0; i < concurrentUsers; i++) {
      const userPromise = this.simulateUser(endpoint, method, startTime, duration, results)
      promises.push(userPromise)
    }

    await Promise.all(promises)

    const successfulRequests = results.filter(r => r.success).length
    const failedRequests = results.length - successfulRequests
    const averageResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length

    return {
      totalRequests: results.length,
      successfulRequests,
      failedRequests,
      averageResponseTime
    }
  }

  private async simulateUser(
    endpoint: string,
    method: string,
    startTime: number,
    duration: number,
    results: Array<{ success: boolean; responseTime: number }>
  ): Promise<void> {
    while (Date.now() - startTime < duration) {
      const requestStart = Date.now()
      
      try {
        await this.makeRequest(method, endpoint)
        const responseTime = Date.now() - requestStart
        results.push({ success: true, responseTime })
      } catch (error) {
        const responseTime = Date.now() - requestStart
        results.push({ success: false, responseTime })
      }

      // Random delay between requests (100-500ms)
      await TestHelpers.wait(Math.random() * 400 + 100)
    }
  }

  // Security testing
  async testSecurityHeaders(endpoint: string): Promise<{ [key: string]: boolean }> {
    const response = await this.get(endpoint)
    const headers = response.headers

    const securityHeaders = {
      'X-Content-Type-Options': headers['x-content-type-options'] === 'nosniff',
      'X-Frame-Options': !!headers['x-frame-options'],
      'X-XSS-Protection': !!headers['x-xss-protection'],
      'Strict-Transport-Security': !!headers['strict-transport-security'],
      'Content-Security-Policy': !!headers['content-security-policy'],
      'Referrer-Policy': !!headers['referrer-policy']
    }

    return securityHeaders
  }

  async testSQLInjection(endpoint: string): Promise<boolean> {
    const sqlPayloads = [
      "' OR '1'='1",
      "'; DROP TABLE users; --",
      "' UNION SELECT * FROM users --",
      "1' OR '1'='1' --"
    ]

    for (const payload of sqlPayloads) {
      try {
        const response = await this.get(`${endpoint}?search=${encodeURIComponent(payload)}`)
        
        // Check for SQL error indicators
        const responseText = JSON.stringify(response.data).toLowerCase()
        if (responseText.includes('sql') || responseText.includes('database') || responseText.includes('mysql')) {
          return false // Potential SQL injection vulnerability
        }
      } catch (error) {
        // Request failed, which might indicate vulnerability
        return false
      }
    }

    return true // No SQL injection vulnerabilities detected
  }

  // Rate limiting testing
  async testRateLimit(endpoint: string, maxRequests: number = 100): Promise<{ rateLimited: boolean; limit: number }> {
    const requests: Promise<AxiosResponse>[] = []

    // Send burst of requests
    for (let i = 0; i < maxRequests; i++) {
      requests.push(this.get(endpoint))
    }

    const responses = await Promise.allSettled(requests)
    const rateLimitedResponses = responses.filter(
      result => result.status === 'fulfilled' && result.value.status === 429
    )

    return {
      rateLimited: rateLimitedResponses.length > 0,
      limit: maxRequests - rateLimitedResponses.length
    }
  }

  // Get test results
  getResults(): ApiTestResult[] {
    return this.results
  }

  getSummary(): { total: number; passed: number; failed: number; averageDuration: number } {
    const total = this.results.length
    const passed = this.results.filter(r => r.success).length
    const failed = total - passed
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total

    return { total, passed, failed, averageDuration }
  }

  // Clear results
  clearResults(): void {
    this.results = []
  }
}

// LinkedIn API Test Suite
class LinkedInApiTestSuite extends ApiTestSuite {
  constructor(accessToken: string) {
    super({
      baseUrl: 'https://api.linkedin.com/v2',
      timeout: 30000,
      retries: 3,
      headers: {
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      auth: {
        type: 'bearer',
        token: accessToken
      }
    })
  }

  async testProfileAccess(): Promise<ApiTestResult> {
    return this.runTest('LinkedIn Profile Access', async () => {
      const response = await this.get('/people/~')
      this.assertStatus(response, 200)
      this.assertResponseStructure(response, {
        id: 'string',
        firstName: 'object',
        lastName: 'object',
        headline: 'object'
      })
      return response
    })
  }

  async testCampaignCreation(): Promise<ApiTestResult> {
    return this.runTest('LinkedIn Campaign Creation', async () => {
      const campaign = this.generateTestCampaign()
      const response = await this.post('/adCampaignsV2', campaign)
      this.assertStatus(response, 201)
      return response
    })
  }

  async testLeadGeneration(): Promise<ApiTestResult> {
    return this.runTest('LinkedIn Lead Generation', async () => {
      const response = await this.get('/leadGenForms')
      this.assertStatus(response, 200)
      return response
    })
  }
}

// Office 365 API Test Suite
class Office365ApiTestSuite extends ApiTestSuite {
  constructor(accessToken: string) {
    super({
      baseUrl: 'https://graph.microsoft.com/v1.0',
      timeout: 30000,
      retries: 3,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        type: 'bearer',
        token: accessToken
      }
    })
  }

  async testUserAccess(): Promise<ApiTestResult> {
    return this.runTest('Office 365 User Access', async () => {
      const response = await this.get('/me')
      this.assertStatus(response, 200)
      this.assertResponseStructure(response, {
        id: 'string',
        displayName: 'string',
        mail: 'string',
        userPrincipalName: 'string'
      })
      return response
    })
  }

  async testCalendarAccess(): Promise<ApiTestResult> {
    return this.runTest('Office 365 Calendar Access', async () => {
      const response = await this.get('/me/calendar/events')
      this.assertStatus(response, 200)
      return response
    })
  }

  async testFilesAccess(): Promise<ApiTestResult> {
    return this.runTest('Office 365 Files Access', async () => {
      const response = await this.get('/me/drive/root/children')
      this.assertStatus(response, 200)
      return response
    })
  }
}

// Export test suites
export {
  ApiTestSuite,
  LinkedInApiTestSuite,
  Office365ApiTestSuite,
  ApiTestConfig,
  ApiTestResult
}
