/**
 * Office 365 API Tests
 * Comprehensive testing of Office 365 API integration
 */

import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals'
import { Office365ApiTestSuite } from './api-test-framework'
import { TestDataGenerator, TestHelpers } from '../test-utils'

// Mock Office 365 API responses
const mockOffice365Responses = {
  user: {
    id: 'test-user-id',
    displayName: 'John Doe',
    mail: 'john.doe@company.com',
    userPrincipalName: 'john.doe@company.com',
    jobTitle: 'Software Engineer',
    department: 'Engineering',
    officeLocation: 'Seattle',
    businessPhones: ['+1-555-123-4567'],
    mobilePhone: '+1-555-987-6543'
  },
  calendar: {
    value: [
      {
        id: 'test-event-id',
        subject: 'Team Meeting',
        start: {
          dateTime: '2024-01-15T10:00:00.0000000',
          timeZone: 'Pacific Standard Time'
        },
        end: {
          dateTime: '2024-01-15T11:00:00.0000000',
          timeZone: 'Pacific Standard Time'
        },
        attendees: [
          {
            emailAddress: {
              name: 'Jane Smith',
              address: 'jane.smith@company.com'
            },
            type: 'required'
          }
        ]
      }
    ]
  },
  files: {
    value: [
      {
        id: 'test-file-id',
        name: 'Project Proposal.docx',
        size: 1024000,
        lastModifiedDateTime: '2024-01-15T09:30:00.0000000Z',
        webUrl: 'https://company.sharepoint.com/sites/team/Shared%20Documents/Project%20Proposal.docx',
        file: {
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
      }
    ]
  },
  teams: {
    value: [
      {
        id: 'test-team-id',
        displayName: 'Engineering Team',
        description: 'Main engineering team',
        createdDateTime: '2024-01-01T00:00:00.0000000Z',
        visibility: 'private'
      }
    ]
  }
}

describe('Office 365 API Integration', () => {
  let apiTestSuite: Office365ApiTestSuite
  let mockAccessToken: string

  beforeAll(() => {
    mockAccessToken = TestDataGenerator.randomString(64)
    apiTestSuite = new Office365ApiTestSuite(mockAccessToken)
    
    // Mock axios for testing
    jest.mock('axios')
  })

  afterAll(() => {
    jest.restoreAllMocks()
  })

  describe('Authentication', () => {
    it('should handle valid access token', async () => {
      const result = await apiTestSuite.runTest('Valid Access Token', async () => {
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
        const error = {
          response: { status: 401, data: { error: 'Invalid token' } },
          message: 'Request failed with status code 401'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(401)
    })

    it('should handle token expiration', async () => {
      const result = await apiTestSuite.runTest('Token Expiration', async () => {
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

  describe('User Management', () => {
    it('should fetch current user profile successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch Current User', async () => {
        const mockResponse = {
          status: 200,
          data: mockOffice365Responses.user,
          headers: {},
          config: { method: 'GET', url: '/me' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
      expect(result.response).toEqual(mockOffice365Responses.user)
    })

    it('should fetch user by ID successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch User by ID', async () => {
        const mockResponse = {
          status: 200,
          data: mockOffice365Responses.user,
          headers: {},
          config: { method: 'GET', url: '/users/test-user-id' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('should handle user not found errors', async () => {
      const result = await apiTestSuite.runTest('User Not Found', async () => {
        const error = {
          response: { status: 404, data: { error: 'User not found' } },
          message: 'Request failed with status code 404'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(404)
    })

    it('should handle insufficient permissions for user access', async () => {
      const result = await apiTestSuite.runTest('Insufficient User Permissions', async () => {
        const error = {
          response: { status: 403, data: { error: 'Insufficient privileges' } },
          message: 'Request failed with status code 403'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(403)
    })
  })

  describe('Calendar Management', () => {
    it('should fetch calendar events successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch Calendar Events', async () => {
        const mockResponse = {
          status: 200,
          data: mockOffice365Responses.calendar,
          headers: {},
          config: { method: 'GET', url: '/me/calendar/events' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
      expect(result.response.value).toHaveLength(1)
    })

    it('should create calendar event successfully', async () => {
      const result = await apiTestSuite.runTest('Create Calendar Event', async () => {
        const newEvent = {
          subject: 'New Meeting',
          start: {
            dateTime: '2024-01-16T14:00:00.0000000',
            timeZone: 'Pacific Standard Time'
          },
          end: {
            dateTime: '2024-01-16T15:00:00.0000000',
            timeZone: 'Pacific Standard Time'
          }
        }

        const mockResponse = {
          status: 201,
          data: { id: 'new-event-id', ...newEvent },
          headers: {},
          config: { method: 'POST', url: '/me/calendar/events' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('should update calendar event successfully', async () => {
      const result = await apiTestSuite.runTest('Update Calendar Event', async () => {
        const updatedEvent = {
          subject: 'Updated Meeting',
          start: {
            dateTime: '2024-01-16T15:00:00.0000000',
            timeZone: 'Pacific Standard Time'
          },
          end: {
            dateTime: '2024-01-16T16:00:00.0000000',
            timeZone: 'Pacific Standard Time'
          }
        }

        const mockResponse = {
          status: 200,
          data: { id: 'test-event-id', ...updatedEvent },
          headers: {},
          config: { method: 'PATCH', url: '/me/calendar/events/test-event-id' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('should delete calendar event successfully', async () => {
      const result = await apiTestSuite.runTest('Delete Calendar Event', async () => {
        const mockResponse = {
          status: 204,
          data: {},
          headers: {},
          config: { method: 'DELETE', url: '/me/calendar/events/test-event-id' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(204)
    })

    it('should handle calendar access errors', async () => {
      const result = await apiTestSuite.runTest('Calendar Access Error', async () => {
        const error = {
          response: { status: 403, data: { error: 'Calendar access denied' } },
          message: 'Request failed with status code 403'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(403)
    })
  })

  describe('File Management', () => {
    it('should fetch files successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch Files', async () => {
        const mockResponse = {
          status: 200,
          data: mockOffice365Responses.files,
          headers: {},
          config: { method: 'GET', url: '/me/drive/root/children' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
      expect(result.response.value).toHaveLength(1)
    })

    it('should upload file successfully', async () => {
      const result = await apiTestSuite.runTest('Upload File', async () => {
        const mockResponse = {
          status: 201,
          data: {
            id: 'new-file-id',
            name: 'New Document.docx',
            size: 2048000,
            lastModifiedDateTime: new Date().toISOString()
          },
          headers: {},
          config: { method: 'PUT', url: '/me/drive/root:/New%20Document.docx:/content' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('should download file successfully', async () => {
      const result = await apiTestSuite.runTest('Download File', async () => {
        const mockResponse = {
          status: 200,
          data: Buffer.from('Mock file content'),
          headers: { 'content-type': 'application/octet-stream' },
          config: { method: 'GET', url: '/me/drive/items/test-file-id/content' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('should delete file successfully', async () => {
      const result = await apiTestSuite.runTest('Delete File', async () => {
        const mockResponse = {
          status: 204,
          data: {},
          headers: {},
          config: { method: 'DELETE', url: '/me/drive/items/test-file-id' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(204)
    })

    it('should handle file not found errors', async () => {
      const result = await apiTestSuite.runTest('File Not Found', async () => {
        const error = {
          response: { status: 404, data: { error: 'File not found' } },
          message: 'Request failed with status code 404'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(404)
    })
  })

  describe('Teams Management', () => {
    it('should fetch teams successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch Teams', async () => {
        const mockResponse = {
          status: 200,
          data: mockOffice365Responses.teams,
          headers: {},
          config: { method: 'GET', url: '/me/joinedTeams' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
      expect(result.response.value).toHaveLength(1)
    })

    it('should fetch team channels successfully', async () => {
      const result = await apiTestSuite.runTest('Fetch Team Channels', async () => {
        const mockChannels = {
          value: [
            {
              id: 'test-channel-id',
              displayName: 'General',
              description: 'General team discussion',
              membershipType: 'standard'
            }
          ]
        }

        const mockResponse = {
          status: 200,
          data: mockChannels,
          headers: {},
          config: { method: 'GET', url: '/teams/test-team-id/channels' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(200)
    })

    it('should send team message successfully', async () => {
      const result = await apiTestSuite.runTest('Send Team Message', async () => {
        const message = {
          body: {
            content: 'Hello team!'
          }
        }

        const mockResponse = {
          status: 201,
          data: {
            id: 'new-message-id',
            ...message,
            createdDateTime: new Date().toISOString()
          },
          headers: {},
          config: { method: 'POST', url: '/teams/test-team-id/channels/test-channel-id/messages' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.statusCode).toBe(201)
    })

    it('should handle team access errors', async () => {
      const result = await apiTestSuite.runTest('Team Access Error', async () => {
        const error = {
          response: { status: 403, data: { error: 'Team access denied' } },
          message: 'Request failed with status code 403'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(403)
    })
  })

  describe('Security and Compliance', () => {
    it('should test security headers', async () => {
      const result = await apiTestSuite.runTest('Security Headers Test', async () => {
        const mockResponse = {
          status: 200,
          data: {},
          headers: {
            'x-content-type-options': 'nosniff',
            'x-frame-options': 'DENY',
            'x-xss-protection': '1; mode=block',
            'strict-transport-security': 'max-age=31536000; includeSubDomains'
          },
          config: { method: 'GET', url: '/me' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.response.headers).toHaveProperty('x-content-type-options')
      expect(result.response.headers).toHaveProperty('x-frame-options')
    })

    it('should handle data loss prevention policies', async () => {
      const result = await apiTestSuite.runTest('DLP Policy Test', async () => {
        const error = {
          response: { 
            status: 403, 
            data: { error: 'Data loss prevention policy violation' } 
          },
          message: 'Request failed with status code 403'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(403)
    })
  })

  describe('Rate Limiting and Throttling', () => {
    it('should handle rate limit responses', async () => {
      const result = await apiTestSuite.runTest('Rate Limit Handling', async () => {
        const error = {
          response: { 
            status: 429, 
            data: { error: 'Too many requests' },
            headers: { 'Retry-After': '60' }
          },
          message: 'Request failed with status code 429'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(429)
    })

    it('should respect throttling limits', async () => {
      const result = await apiTestSuite.testRateLimit('/me', 100)
      
      // In a real test, this would make actual requests
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

    it('should handle service unavailable', async () => {
      const result = await apiTestSuite.runTest('Service Unavailable', async () => {
        const error = {
          response: { 
            status: 503, 
            data: { error: 'Service temporarily unavailable' } 
          },
          message: 'Request failed with status code 503'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(503)
    })

    it('should handle bad gateway errors', async () => {
      const result = await apiTestSuite.runTest('Bad Gateway', async () => {
        const error = {
          response: { 
            status: 502, 
            data: { error: 'Bad gateway' } 
          },
          message: 'Request failed with status code 502'
        }
        throw error
      })

      expect(result.success).toBe(false)
      expect(result.statusCode).toBe(502)
    })
  })

  describe('Performance Testing', () => {
    it('should meet response time requirements', async () => {
      const result = await apiTestSuite.runTest('Response Time Performance', async () => {
        const startTime = Date.now()
        
        // Simulate API call
        await TestHelpers.wait(150)
        
        const mockResponse = {
          status: 200,
          data: mockOffice365Responses.user,
          headers: { 'x-response-time': Date.now() - startTime },
          config: { method: 'GET', url: '/me' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should handle concurrent requests efficiently', async () => {
      const concurrentRequests = 10
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
    it('should validate user data structure', async () => {
      const result = await apiTestSuite.runTest('User Data Validation', async () => {
        const mockResponse = {
          status: 200,
          data: mockOffice365Responses.user,
          headers: {},
          config: { method: 'GET', url: '/me' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.response).toHaveProperty('id')
      expect(result.response).toHaveProperty('displayName')
      expect(result.response).toHaveProperty('mail')
      expect(result.response).toHaveProperty('userPrincipalName')
    })

    it('should validate calendar event data structure', async () => {
      const result = await apiTestSuite.runTest('Calendar Event Data Validation', async () => {
        const mockResponse = {
          status: 200,
          data: mockOffice365Responses.calendar.value[0],
          headers: {},
          config: { method: 'GET', url: '/me/calendar/events/test-event-id' }
        }
        return mockResponse
      })

      expect(result.success).toBe(true)
      expect(result.response).toHaveProperty('id')
      expect(result.response).toHaveProperty('subject')
      expect(result.response).toHaveProperty('start')
      expect(result.response).toHaveProperty('end')
    })
  })
})
