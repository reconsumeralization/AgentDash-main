/**
 * Office 365 Management API Tests
 * Comprehensive test suite for Office 365 Management API functionality
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { 
  Office365ManagementApi, 
  Office365Utils,
  ActivityRecordType,
  WorkloadType 
} from '@/lib/office365-management-api'
import {
  mockServiceHealthStatus,
  mockActivityRecord,
  mockSubscription,
  LinkedInApiTestUtils,
  mockFetch
} from './__mocks__/linkedin-api-mock'

// Mock fetch globally
global.fetch = mockFetch

describe('Office365ManagementApi', () => {
  let managementApi: Office365ManagementApi
  const mockConfig = {
    tenantId: 'test-tenant-id',
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret'
  }

  beforeEach(() => {
    managementApi = new Office365ManagementApi(mockConfig)
    LinkedInApiTestUtils.resetFetchMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with configuration', () => {
      const api = new Office365ManagementApi(mockConfig)
      expect(api).toBeInstanceOf(Office365ManagementApi)
    })
  })

  describe('Authentication', () => {
    it('should authenticate and cache token', async () => {
      const mockTokenResponse = {
        token_type: 'Bearer',
        expires_in: 3600,
        access_token: 'mock_access_token',
        scope: 'https://manage.office.com/.default'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockTokenResponse)
      })

      const token = await managementApi.authenticate()

      expect(token).toBe('mock_access_token')
      LinkedInApiTestUtils.verifyFetchCall(
        `https://login.microsoftonline.com/${mockConfig.tenantId}/oauth2/v2.0/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: expect.stringContaining('grant_type=client_credentials')
        }
      )
    })

    it('should return cached token if still valid', async () => {
      const mockTokenResponse = {
        token_type: 'Bearer',
        expires_in: 3600,
        access_token: 'cached_token',
        scope: 'https://manage.office.com/.default'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockTokenResponse)
      })

      // First call
      const token1 = await managementApi.authenticate()
      expect(token1).toBe('cached_token')

      // Second call should use cached token
      const token2 = await managementApi.authenticate()
      expect(token2).toBe('cached_token')
      expect(mockFetch).toHaveBeenCalledTimes(1) // Only called once
    })

    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({
          error: {
            code: 'invalid_client',
            message: 'Invalid client credentials'
          }
        })
      })

      await expect(managementApi.authenticate())
        .rejects
        .toThrow('Authentication failed: Invalid client credentials')
    })
  })

  describe('Service Communications API', () => {
    beforeEach(async () => {
      // Mock authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          token_type: 'Bearer',
          expires_in: 3600,
          access_token: 'mock_token',
          scope: 'https://manage.office.com/.default'
        })
      })
    })

    describe('getServiceHealthStatus', () => {
      it('should get service health status successfully', async () => {
        LinkedInApiTestUtils.setupSuccessfulFetch('serviceHealth')

        const healthStatus = await managementApi.getServiceHealthStatus()

        expect(healthStatus).toEqual(mockServiceHealthStatus)
        LinkedInApiTestUtils.verifyFetchCall(
          'https://manage.office.com/api/v1.0/ServiceComms/CurrentStatus',
          {
            headers: {
              'Authorization': 'Bearer mock_token',
              'Content-Type': 'application/json'
            }
          }
        )
      })
    })

    describe('getServiceHealthStatusForService', () => {
      it('should get service health status for specific service', async () => {
        LinkedInApiTestUtils.setupSuccessfulFetch('serviceHealth')
        const serviceName = 'Exchange'

        const healthStatus = await managementApi.getServiceHealthStatusForService(serviceName)

        expect(healthStatus).toEqual(mockServiceHealthStatus)
        LinkedInApiTestUtils.verifyFetchCall(
          'https://manage.office.com/api/v1.0/ServiceComms/CurrentStatus?$filter=featureName eq \'Exchange\'',
          {
            headers: {
              'Authorization': 'Bearer mock_token',
              'Content-Type': 'application/json'
            }
          }
        )
      })
    })

    describe('getServiceHealthHistory', () => {
      it('should get service health history without date range', async () => {
        LinkedInApiTestUtils.setupSuccessfulFetch('serviceHealth')

        const history = await managementApi.getServiceHealthHistory()

        expect(history).toEqual(mockServiceHealthStatus)
        LinkedInApiTestUtils.verifyFetchCall(
          'https://manage.office.com/api/v1.0/ServiceComms/History',
          {
            headers: {
              'Authorization': 'Bearer mock_token',
              'Content-Type': 'application/json'
            }
          }
        )
      })

      it('should get service health history with date range', async () => {
        LinkedInApiTestUtils.setupSuccessfulFetch('serviceHealth')
        const dateRange = {
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z'
        }

        const history = await managementApi.getServiceHealthHistory(dateRange)

        expect(history).toEqual(mockServiceHealthStatus)
        LinkedInApiTestUtils.verifyFetchCall(
          'https://manage.office.com/api/v1.0/ServiceComms/History?$filter=startTime ge 2024-01-01T00:00:00Z and endTime le 2024-01-31T23:59:59Z',
          {
            headers: {
              'Authorization': 'Bearer mock_token',
              'Content-Type': 'application/json'
            }
          }
        )
      })
    })
  })

  describe('Management Activity API', () => {
    beforeEach(async () => {
      // Mock authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          token_type: 'Bearer',
          expires_in: 3600,
          access_token: 'mock_token',
          scope: 'https://manage.office.com/.default'
        })
      })
    })

    describe('getActivityRecords', () => {
      it('should get activity records successfully', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const records = await managementApi.getActivityRecords('Audit.General')

        expect(records).toEqual([mockActivityRecord])
        expect(mockFetch).toHaveBeenCalledTimes(2) // Initial call + content fetch
      })

      it('should get activity records with options', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const options = {
          startTime: '2024-01-01T00:00:00Z',
          endTime: '2024-01-31T23:59:59Z',
          top: 100,
          skip: 0
        }

        await managementApi.getActivityRecords('Audit.General', options)

        LinkedInApiTestUtils.verifyFetchCall(
          'https://manage.office.com/api/v1.0/activity/feed/subscriptions/content?contentType=Audit.General&startTime=2024-01-01T00:00:00Z&endTime=2024-01-31T23:59:59Z&$skip=0&$top=100',
          {
            headers: {
              'Authorization': 'Bearer mock_token',
              'Content-Type': 'application/json'
            }
          }
        )
      })
    })

    describe('getActivityRecordsByWorkload', () => {
      it('should get activity records by workload', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const records = await managementApi.getActivityRecordsByWorkload(WorkloadType.EXCHANGE)

        expect(records).toEqual([mockActivityRecord])
      })
    })

    describe('getActivityRecordsByType', () => {
      it('should get activity records by type', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const records = await managementApi.getActivityRecordsByType(ActivityRecordType.AZURE_ACTIVE_DIRECTORY)

        expect(records).toEqual([mockActivityRecord])
      })
    })

    describe('getUserActivity', () => {
      it('should get user activity', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const records = await managementApi.getUserActivity('user@domain.com')

        expect(records).toEqual([mockActivityRecord])
      })
    })

    describe('getAdminActivity', () => {
      it('should get admin activity', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const records = await managementApi.getAdminActivity()

        expect(records).toEqual([mockActivityRecord])
      })
    })

    describe('getFailedOperations', () => {
      it('should get failed operations', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const records = await managementApi.getFailedOperations()

        expect(records).toEqual([mockActivityRecord])
      })
    })

    describe('getOperationsByIP', () => {
      it('should get operations by IP address', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const records = await managementApi.getOperationsByIP('192.168.1.100')

        expect(records).toEqual([mockActivityRecord])
      })
    })
  })

  describe('Subscription Management', () => {
    beforeEach(async () => {
      // Mock authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          token_type: 'Bearer',
          expires_in: 3600,
          access_token: 'mock_token',
          scope: 'https://manage.office.com/.default'
        })
      })
    })

    describe('getSubscriptions', () => {
      it('should get subscriptions successfully', async () => {
        LinkedInApiTestUtils.setupSuccessfulFetch('subscriptions')

        const subscriptions = await managementApi.getSubscriptions()

        expect(subscriptions).toEqual([mockSubscription])
        LinkedInApiTestUtils.verifyFetchCall(
          'https://manage.office.com/api/v1.0/activity/feed/subscriptions/list',
          {
            headers: {
              'Authorization': 'Bearer mock_token',
              'Content-Type': 'application/json'
            }
          }
        )
      })
    })

    describe('createSubscription', () => {
      it('should create subscription successfully', async () => {
        LinkedInApiTestUtils.setupSuccessfulFetch('subscriptions')
        const subscription = {
          contentType: 'Audit.General',
          webhook: {
            address: 'https://webhook.example.com/callback',
            authId: 'auth-123',
            expiration: '2024-12-31T23:59:59Z'
          }
        }

        const result = await managementApi.createSubscription(subscription)

        expect(result).toEqual(mockSubscription)
        LinkedInApiTestUtils.verifyFetchCall(
          'https://manage.office.com/api/v1.0/activity/feed/subscriptions/start',
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer mock_token',
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(subscription)
          }
        )
      })
    })

    describe('stopSubscription', () => {
      it('should stop subscription successfully', async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200
        })

        await managementApi.stopSubscription('Audit.General')

        LinkedInApiTestUtils.verifyFetchCall(
          'https://manage.office.com/api/v1.0/activity/feed/subscriptions/stop?contentType=Audit.General',
          {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer mock_token',
              'Content-Type': 'application/json'
            }
          }
        )
      })
    })
  })

  describe('Analytics and Reporting', () => {
    beforeEach(async () => {
      // Mock authentication
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({
          token_type: 'Bearer',
          expires_in: 3600,
          access_token: 'mock_token',
          scope: 'https://manage.office.com/.default'
        })
      })
    })

    describe('getActivitySummary', () => {
      it('should get activity summary successfully', async () => {
        const mockResponse = [{
          contentUri: 'https://manage.office.com/api/v1.0/activity/feed/audit/123',
          contentType: 'Audit.General',
          contentId: '123',
          contentCreated: '2024-01-01T00:00:00Z',
          contentExpiration: '2024-01-08T00:00:00Z'
        }]

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
          })
          .mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve([mockActivityRecord])
          })

        const summary = await managementApi.getActivitySummary()

        expect(summary).toEqual({
          totalRecords: 1,
          byWorkload: {
            'AzureActiveDirectory': 1
          },
          byOperation: {
            'UserLoggedIn': 1
          },
          byUser: {
            'user@domain.com': 1
          },
          byIP: {
            '192.168.1.100': 1
          },
          successRate: 100
        })
      })
    })
  })
})

describe('Office365Utils', () => {
  describe('formatActivityRecord', () => {
    it('should format activity record for display', () => {
      const formatted = Office365Utils.formatActivityRecord(mockActivityRecord)

      expect(formatted).toEqual({
        id: 'activity-record-123',
        operation: 'UserLoggedIn',
        user: 'user@domain.com',
        timestamp: new Date('2024-01-01T10:00:00Z').toLocaleString(),
        status: 'Success',
        workload: 'AzureActiveDirectory',
        ipAddress: '192.168.1.100'
      })
    })
  })

  describe('getWorkloadDisplayName', () => {
    it('should return display name for known workload', () => {
      const displayName = Office365Utils.getWorkloadDisplayName('Exchange')
      expect(displayName).toBe('Exchange Online')
    })

    it('should return workload name for unknown workload', () => {
      const displayName = Office365Utils.getWorkloadDisplayName('UnknownWorkload')
      expect(displayName).toBe('UnknownWorkload')
    })

    it('should return display names for all common workloads', () => {
      const workloads = [
        'Exchange',
        'SharePoint',
        'AzureActiveDirectory',
        'General',
        'DLP',
        'PowerBI',
        'MicrosoftTeams',
        'MicrosoftStream',
        'Yammer',
        'MicrosoftForms',
        'ToDo',
        'MicrosoftLaunchpad',
        'Microsoft365Insights',
        'Microsoft365InsightsLearn',
        'Microsoft365InsightsLearnEdu'
      ]

      workloads.forEach(workload => {
        const displayName = Office365Utils.getWorkloadDisplayName(workload)
        expect(displayName).not.toBe(workload) // Should have a display name
        expect(displayName.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getRecordTypeDisplayName', () => {
    it('should return display name for known record type', () => {
      const displayName = Office365Utils.getRecordTypeDisplayName(ActivityRecordType.AZURE_ACTIVE_DIRECTORY)
      expect(displayName).toBe('Azure Active Directory')
    })

    it('should return display name for unknown record type', () => {
      const displayName = Office365Utils.getRecordTypeDisplayName(999 as ActivityRecordType)
      expect(displayName).toBe('Unknown (999)')
    })
  })

  describe('getServiceStatusColor', () => {
    it('should return correct color for service operational', () => {
      const color = Office365Utils.getServiceStatusColor('ServiceOperational')
      expect(color).toBe('text-green-600')
    })

    it('should return correct color for service degradation', () => {
      const color = Office365Utils.getServiceStatusColor('ServiceDegradation')
      expect(color).toBe('text-yellow-600')
    })

    it('should return correct color for service interruption', () => {
      const color = Office365Utils.getServiceStatusColor('ServiceInterruption')
      expect(color).toBe('text-red-600')
    })

    it('should return correct color for service restored', () => {
      const color = Office365Utils.getServiceStatusColor('ServiceRestored')
      expect(color).toBe('text-blue-600')
    })

    it('should return default color for unknown status', () => {
      const color = Office365Utils.getServiceStatusColor('UnknownStatus')
      expect(color).toBe('text-gray-600')
    })
  })

  describe('getServiceStatusBadgeVariant', () => {
    it('should return correct badge variant for service operational', () => {
      const variant = Office365Utils.getServiceStatusBadgeVariant('ServiceOperational')
      expect(variant).toBe('default')
    })

    it('should return correct badge variant for service degradation', () => {
      const variant = Office365Utils.getServiceStatusBadgeVariant('ServiceDegradation')
      expect(variant).toBe('secondary')
    })

    it('should return correct badge variant for service interruption', () => {
      const variant = Office365Utils.getServiceStatusBadgeVariant('ServiceInterruption')
      expect(variant).toBe('destructive')
    })

    it('should return correct badge variant for service restored', () => {
      const variant = Office365Utils.getServiceStatusBadgeVariant('ServiceRestored')
      expect(variant).toBe('outline')
    })

    it('should return default badge variant for unknown status', () => {
      const variant = Office365Utils.getServiceStatusBadgeVariant('UnknownStatus')
      expect(variant).toBe('secondary')
    })
  })
})

describe('Error Handling', () => {
  let managementApi: Office365ManagementApi

  beforeEach(() => {
    managementApi = new Office365ManagementApi({
      tenantId: 'test-tenant-id',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    })
    LinkedInApiTestUtils.resetFetchMock()
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(managementApi.authenticate())
      .rejects
      .toThrow('Network error')
  })

  it('should handle malformed JSON responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON'))
    })

    await expect(managementApi.authenticate())
      .rejects
      .toThrow('Invalid JSON')
  })

  it('should handle 500 server errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error'
        }
      })
    })

    await expect(managementApi.authenticate())
      .rejects
      .toThrow('Authentication failed: Internal server error')
  })
})
