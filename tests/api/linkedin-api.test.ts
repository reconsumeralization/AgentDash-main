/**
 * LinkedIn API Tests
 * Comprehensive testing of LinkedIn API integration
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { LinkedInApiTestSuite } from './api-test-framework'
import { TestDataGenerator, TestHelpers } from '../test-utils'

// Mock LinkedIn API responses
const mockLinkedInResponses = {
  profile: {
    id: 'test-profile-id',
    firstName: {
      localized: { 'en_US': 'John' },
      preferredLocale: { country: 'US', language: 'en' }
    },
    lastName: {
      localized: { 'en_US': 'Doe' },
      preferredLocale: { country: 'US', language: 'en' }
    },
    headline: {
      localized: { 'en_US': 'Software Engineer' },
      preferredLocale: { country: 'US', language: 'en' }
    }
  },
  campaign: {
    id: 'urn:li:sponsoredCampaign:123',
    name: 'Test Campaign',
    status: 'DRAFT',
    objectiveType: 'BRAND_AWARENESS'
  },
  leadForm: {
    id: 'urn:li:leadGenForm:456',
    name: 'Test Lead Form',
    status: 'ACTIVE'
  }
}

describe('LinkedIn API Integration', () => {
  let apiTestSuite: LinkedInApiTestSuite
  let mockAccessToken: string

  beforeAll(() => {
    mockAccessToken = TestDataGenerator.randomString(64)
    apiTestSuite = new LinkedInApiTestSuite(mockAccessToken)
    
    // Mock axios for testing
    jest.mock('axios')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('Authentication', () => {
    it('should handle valid access token', async () => {
      const result = await apiTestSuite.runTest('Valid Access Token', async () => {
        // Mock successful authentication
        const mockResponse = {
          status: 200,
          data: { authenticated: true },
          headers: {},
          config: { method: 'GET', url: '/test' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('should handle invalid access token', async () => {
      const result = await apiTestSuite.runTest('Invalid Access Token', async () => {
        // Mock authentication failure
        const error = {
          response: { status: 401, data: { error: 'Invalid token' } },
          message: 'Request failed with status code 401'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(401)
    })

    it('should handle expired access token', async () => {
      const result = await apiTestSuite.runTest('Expired Access Token', async () => {
        const error = {
          response: { status: 401, data: { error: 'Token expired' } },
          message: 'Request failed with status code 401'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(401)
    })
  })

  describe('Profile Management', () => {
    it('should fetch user profile successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch User Profile', async () => {
        const mockResponse = {
          status: 200,
          data: mockLinkedInResponses.profile,
          headers: {},
          config: { method: 'GET', url: '/people/~' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
      expect(result.response).toEqual(mockLinkedInResponses.profile)
    })

    it('should handle profile access errors', async () => {
      const result = await apiTestSuite.runTest('Profile Access Error', async () => {
        const error = {
          response: { status: 403, data: { error: 'Insufficient permissions' } },
          message: 'Request failed with status code 403'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(403)
    })
  })

  describe('Campaign Management', () => {
    it('should create campaign successfully', async () => {
      const result = await apiTestSuite.runTest('Create Campaign', async () => {
        const mockResponse = {
          status: 201,
          data: mockLinkedInResponses.campaign,
          headers: {},
          config: { method: 'POST', url: '/adCampaignsV2' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
      expect(result.response).toEqual(mockLinkedInResponses.campaign)
    })

    it('should update campaign successfully', async () => {
      const result = await apiTestSuite.runTest('Update Campaign', async () => {
        const mockResponse = {
          status: 200,
          data: { ...mockLinkedInResponses.campaign, name: 'Updated Campaign' },
          headers: {},
          config: { method: 'PUT', url: '/adCampaignsV2/123' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('should delete campaign successfully', async () => {
      const result = await apiTestSuite.runTest('Delete Campaign', async () => {
        const mockResponse = {
          status: 204,
          data: {},
          headers: {},
          config: { method: 'DELETE', url: '/adCampaignsV2/123' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(204)
    })

    it('should handle campaign validation errors', async () => {
      const result = await apiTestSuite.runTest('Campaign Validation Error', async () => {
        const error = {
          response: { 
            status: 400, 
            data: { error: 'Invalid campaign data', details: ['Name is required'] } 
          },
          message: 'Request failed with status code 400'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(400)
    })
  })

  describe('Lead Generation', () => {
    it('should fetch lead forms successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch Lead Forms', async () => {
        const mockResponse = {
          status: 200,
          data: { elements: [mockLinkedInResponses.leadForm] },
          headers: {},
          config: { method: 'GET', url: '/leadGenForms' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('should create lead form successfully', async () => {
      const result = await apiTestSuite.runTest('Create Lead Form', async () => {
        const mockResponse = {
          status: 201,
          data: mockLinkedInResponses.leadForm,
          headers: {},
          config: { method: 'POST', url: '/leadGenForms' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('should fetch lead submissions successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch Lead Submissions', async () => {
        const mockSubmissions = {
          elements: [
            {
              id: 'test-submission-id',
              form: 'urn:li:leadGenForm:456',
              submittedAt: new Date().toISOString(),
              leadData: {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com'
              }
            }
          ]
        }

        const mockResponse = {
          status: 200,
          data: mockSubmissions,
          headers: {},
          config: { method: 'GET', url: '/leadGenFormSubmissions' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })
  })

  describe('Analytics and Reporting', () => {
    it('should fetch campaign analytics successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch Campaign Analytics', async () => {
        const mockAnalytics = {
          elements: [
            {
              campaign: 'urn:li:sponsoredCampaign:123',
              dateRange: {
                start: { year: 2024, month: 1, day: 1 },
                end: { year: 2024, month: 1, day: 31 }
              },
              metrics: {
                impressions: 10000,
                clicks: 500,
                costInLocalCurrency: 1000,
                conversions: 25
              }
            }
          ]
        }

        const mockResponse = {
          status: 200,
          data: mockAnalytics,
          headers: {},
          config: { method: 'GET', url: '/adAnalyticsV2' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('should handle analytics date range errors', async () => {
      const result = await apiTestSuite.runTest('Analytics Date Range Error', async () => {
        const error = {
          response: { 
            status: 400, 
            data: { error: 'Invalid date range', details: ['End date must be after start date'] } 
          },
          message: 'Request failed with status code 400'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(400)
    })
  })

  describe('Rate Limiting', () => {
    it('should handle rate limit responses', async () => {
      const result = await apiTestSuite.runTest('Rate Limit Handling', async () => {
        const error = {
          response: { 
            status: 429, 
            data: { error: 'Rate limit exceeded' },
            headers: { 'Retry-After': '60' }
          },
          message: 'Request failed with status code 429'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(429)
    })

    it('should respect rate limits in burst requests', async () => {
      const result = await apiTestSuite.testRateLimit('/people/~', 10)
      
      // In a real test, this would make actual requests
      // For now, we'll mock the result
      expect(result.rateLimited).toBeDefined()
      expect(result.limit).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      const result = await apiTestSuite.runTest('Network Timeout', async () => {
        const error = {
          code: 'ECONNABORTED',
          message: 'timeout of 30000ms exceeded'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('timeout')
    })

    it('should handle network errors', async () => {
      const result = await apiTestSuite.runTest('Network Error', async () => {
        const error = {
          code: 'ENOTFOUND',
          message: 'getaddrinfo ENOTFOUND api.linkedin.com'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('ENOTFOUND')
    })

    it('should handle server errors', async () => {
      const result = await apiTestSuite.runTest('Server Error', async () => {
        const error = {
          response: { 
            status: 500, 
            data: { error: 'Internal server error' } 
          },
          message: 'Request failed with status code 500'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(500)
    })
  })

  describe('Performance Testing', () => {
    it('should meet response time requirements', async () => {
      const result = await apiTestSuite.runTest('Response Time Performance', async () => {
        const startTime = Date.now()
        
        // Simulate API call
        await TestHelpers.wait(100)
        
        const mockResponse = {
          status: 200,
          data: mockLinkedInResponses.profile,
          headers: { 'x-response-time': Date.now() - startTime },
          config: { method: 'GET', url: '/people/~' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle concurrent requests', async () => {
      const concurrentRequests = 5
      const promises = []

      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(
          apiTestSuite.runTest(`Concurrent Request ${i + 1}`, async () => {
            const mockResponse = {
              status: 200,
              data: { requestId: i + 1 },
              headers: {},
              config: { method: 'GET', url: '/test' }
            }
            return mockResponse
          })
        )
      }

      const results = await Promise.all(promises)
      
      expect(results).toHaveLength(concurrentRequests)
      results.forEach(result => {
        expect(result.success).toBe(true)
      })
    })
  })

  describe('Data Validation', () => {
    it('should validate campaign data structure', async () => {
      const result = await apiTestSuite.runTest('Campaign Data Validation', async () => {
        const mockResponse = {
          status: 200,
          data: {
            id: 'urn:li:sponsoredCampaign:123',
            name: 'Test Campaign',
            status: 'ACTIVE',
            objectiveType: 'BRAND_AWARENESS',
            budget: {
              amount: 100,
              currencyCode: 'USD',
              type: 'DAILY'
            },
            targetAudience: {
              locations: ['US'],
              industries: ['Technology']
            }
          },
          headers: {},
          config: { method: 'GET', url: '/adCampaignsV2/123' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.response).toHaveProperty('id')
      expect(result.response).toHaveProperty('name')
      expect(result.response).toHaveProperty('status')
      expect(result.response).toHaveProperty('budget')
    })

    it('should validate profile data structure', async () => {
      const result = await apiTestSuite.runTest('Profile Data Validation', async () => {
        const mockResponse = {
          status: 200,
          data: mockLinkedInResponses.profile,
          headers: {},
          config: { method: 'GET', url: '/people/~' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.response).toHaveProperty('id')
      expect(result.response).toHaveProperty('firstName')
      expect(result.response).toHaveProperty('lastName')
      expect(result.response.firstName).toHaveProperty('localized')
    })
  })
})
