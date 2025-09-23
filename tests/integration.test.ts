/**
 * Integration Tests
 * End-to-end tests for API integrations and cross-component functionality
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { renderHook, act } from '@testing-library/react'
import { 
  useLinkedInProfile,
  useLinkedInOAuth,
  useOffice365ManagementApi 
} from '@/lib'
import {
  mockLinkedInProfile,
  mockOAuthResponse,
  mockServiceHealthStatus,
  mockActivityRecord,
  LinkedInApiTestUtils,
  mockFetch
} from './__mocks__/linkedin-api-mock'

// Mock fetch globally
global.fetch = mockFetch

describe('LinkedIn Integration Tests', () => {
  beforeEach(() => {
    LinkedInApiTestUtils.resetFetchMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('LinkedIn OAuth + Profile Integration', () => {
    it('should complete full OAuth flow and fetch profile', async () => {
      const { result } = renderHook(() => useLinkedInOAuth({
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['openid', 'profile', 'email']
      }))

      // Mock OAuth token exchange
      LinkedInApiTestUtils.setupSuccessfulFetch('oauthToken')
      
      // Mock profile fetch
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

      // Simulate OAuth callback
      await act(async () => {
        await result.current.handleCallback('test_code', 'test_state')
      })

      expect(result.current.isAuthenticated).toBe(true)
      expect(result.current.userProfile).toBeDefined()
      expect(result.current.userProfile?.localizedFirstName).toBe('John')
      expect(result.current.userProfile?.localizedLastName).toBe('Doe')
    })

    it('should handle OAuth errors gracefully', async () => {
      const { result } = renderHook(() => useLinkedInOAuth({
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['openid', 'profile', 'email']
      }))

      // Mock OAuth error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'access_denied',
          error_description: 'The user denied the request'
        })
      })

      await act(async () => {
        await result.current.handleCallback('invalid_code', 'test_state')
      })

      expect(result.current.isAuthenticated).toBe(false)
      expect(result.current.error).toBeDefined()
      expect(result.current.error?.message).toContain('The user denied the request')
    })

    it('should validate token and refresh profile', async () => {
      const { result } = renderHook(() => useLinkedInOAuth({
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['openid', 'profile', 'email']
      }))

      // Mock successful OAuth flow
      LinkedInApiTestUtils.setupSuccessfulFetch('oauthToken')
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

      // Complete OAuth flow
      await act(async () => {
        await result.current.handleCallback('test_code', 'test_state')
      })

      // Mock token validation
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

      // Validate token
      await act(async () => {
        const isValid = await result.current.validateCurrentToken()
        expect(isValid).toBe(true)
      })

      // Mock profile refresh
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

      // Refresh profile
      await act(async () => {
        await result.current.refreshProfile()
      })

      expect(result.current.userProfile).toBeDefined()
    })
  })

  describe('LinkedIn Profile API Integration', () => {
    it('should fetch and process profile data', async () => {
      const { result } = renderHook(() => useLinkedInProfile('test_access_token'))

      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

      await act(async () => {
        await result.current.fetchCurrentProfile()
      })

      expect(result.current.profile).toBeDefined()
      expect(result.current.profile?.id).toBe('yrZCpj2Z12')
      expect(result.current.getDisplayName()).toBe('John Doe')
      expect(result.current.getHeadline()).toBe('Senior Software Engineer at Tech Corp')
      expect(result.current.getLocationDisplayName()).toBe('San Francisco Bay Area')
    })

    it('should handle profile API errors', async () => {
      const { result } = renderHook(() => useLinkedInProfile('invalid_token'))

      LinkedInApiTestUtils.setupErrorFetch('unauthorized')

      await act(async () => {
        await result.current.fetchCurrentProfile()
      })

      expect(result.current.profile).toBeNull()
      expect(result.current.error).toBeDefined()
      expect(result.current.error?.message).toContain('LinkedIn API error')
    })

    it('should fetch multiple profiles', async () => {
      const { result } = renderHook(() => useLinkedInProfile('test_access_token'))

      const mockResponse = {
        results: {
          'id1': mockLinkedInProfile,
          'id2': { ...mockLinkedInProfile, id: 'id2', localizedFirstName: 'Jane' }
        }
      }

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve(mockResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([mockLinkedInProfile])
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: () => Promise.resolve([{ ...mockLinkedInProfile, id: 'id2', localizedFirstName: 'Jane' }])
        })

      await act(async () => {
        const profiles = await result.current.fetchMultipleProfiles(['id1', 'id2'])
        expect(profiles).toHaveLength(2)
        expect(profiles[0].localizedFirstName).toBe('John')
        expect(profiles[1].localizedFirstName).toBe('Jane')
      })
    })
  })
})

describe('Office 365 Integration Tests', () => {
  beforeEach(() => {
    LinkedInApiTestUtils.resetFetchMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Office 365 Management API Integration', () => {
    it('should authenticate and fetch service health', async () => {
      const { result } = renderHook(() => useOffice365ManagementApi({
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      }))

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

      // Mock service health response
      LinkedInApiTestUtils.setupSuccessfulFetch('serviceHealth')

      await act(async () => {
        await result.current.initializeApi({
          tenantId: 'test-tenant-id',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret'
        })
      })

      await act(async () => {
        const healthStatus = await result.current.getServiceHealthStatus()
        expect(healthStatus).toEqual(mockServiceHealthStatus)
      })
    })

    it('should fetch activity records and generate summary', async () => {
      const { result } = renderHook(() => useOffice365ManagementApi({
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      }))

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

      // Mock activity records response
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

      await act(async () => {
        await result.current.initializeApi({
          tenantId: 'test-tenant-id',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret'
        })
      })

      await act(async () => {
        const summary = await result.current.getActivitySummary()
        expect(summary).toBeDefined()
        expect(summary?.totalRecords).toBe(1)
        expect(summary?.successRate).toBe(100)
      })
    })

    it('should manage webhook subscriptions', async () => {
      const { result } = renderHook(() => useOffice365ManagementApi({
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      }))

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

      // Mock subscription responses
      LinkedInApiTestUtils.setupSuccessfulFetch('subscriptions')

      await act(async () => {
        await result.current.initializeApi({
          tenantId: 'test-tenant-id',
          clientId: 'test-client-id',
          clientSecret: 'test-client-secret'
        })
      })

      await act(async () => {
        const subscriptions = await result.current.getSubscriptions()
        expect(subscriptions).toBeDefined()
        expect(Array.isArray(subscriptions)).toBe(true)
      })
    })
  })
})

describe('Cross-Platform Integration Tests', () => {
  beforeEach(() => {
    LinkedInApiTestUtils.resetFetchMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handle multiple API integrations simultaneously', async () => {
    // LinkedIn OAuth
    const linkedInOAuth = renderHook(() => useLinkedInOAuth({
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      redirectUri: 'http://localhost:3000/callback',
      scopes: ['openid', 'profile', 'email']
    }))

    // LinkedIn Profile
    const linkedInProfile = renderHook(() => useLinkedInProfile('test_access_token'))

    // Office 365 Management
    const office365 = renderHook(() => useOffice365ManagementApi({
      tenantId: 'test-tenant-id',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    }))

    // Mock all successful responses
    LinkedInApiTestUtils.setupSuccessfulFetch('oauthToken')
    LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')
    LinkedInApiTestUtils.setupSuccessfulFetch('serviceHealth')

    // Mock Office 365 authentication
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

    // Execute all operations
    await act(async () => {
      // LinkedIn OAuth flow
      await linkedInOAuth.result.current.handleCallback('test_code', 'test_state')
      
      // LinkedIn Profile fetch
      await linkedInProfile.result.current.fetchCurrentProfile()
      
      // Office 365 initialization and service health
      await office365.result.current.initializeApi({
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      })
      await office365.result.current.getServiceHealthStatus()
    })

    // Verify all integrations are working
    expect(linkedInOAuth.result.current.isAuthenticated).toBe(true)
    expect(linkedInProfile.result.current.profile).toBeDefined()
    expect(office365.result.current.api).toBeDefined()
  })

  it('should handle mixed success and failure scenarios', async () => {
    const linkedInOAuth = renderHook(() => useLinkedInOAuth({
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      redirectUri: 'http://localhost:3000/callback',
      scopes: ['openid', 'profile', 'email']
    }))

    const office365 = renderHook(() => useOffice365ManagementApi({
      tenantId: 'test-tenant-id',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    }))

    // Mock LinkedIn success
    LinkedInApiTestUtils.setupSuccessfulFetch('oauthToken')
    LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

    // Mock Office 365 failure
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

    await act(async () => {
      // LinkedIn should succeed
      await linkedInOAuth.result.current.handleCallback('test_code', 'test_state')
      
      // Office 365 should fail
      await office365.result.current.initializeApi({
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      })
    })

    // Verify mixed results
    expect(linkedInOAuth.result.current.isAuthenticated).toBe(true)
    expect(linkedInOAuth.result.current.error).toBeNull()
    
    expect(office365.result.current.error).toBeDefined()
    expect(office365.result.current.error?.message).toContain('Invalid client credentials')
  })
})

describe('Error Recovery and Resilience Tests', () => {
  beforeEach(() => {
    LinkedInApiTestUtils.resetFetchMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should recover from temporary network failures', async () => {
    const { result } = renderHook(() => useLinkedInProfile('test_access_token'))

    // First call fails with network error
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await act(async () => {
      await result.current.fetchCurrentProfile()
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.error?.message).toBe('Network error')

    // Second call succeeds
    LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

    await act(async () => {
      await result.current.fetchCurrentProfile()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.profile).toBeDefined()
  })

  it('should handle rate limiting gracefully', async () => {
    const { result } = renderHook(() => useLinkedInProfile('test_access_token'))

    // Mock rate limit error
    LinkedInApiTestUtils.setupErrorFetch('rateLimit')

    await act(async () => {
      await result.current.fetchCurrentProfile()
    })

    expect(result.current.error).toBeDefined()
    expect(result.current.error?.message).toContain('LinkedIn API error')
  })

  it('should handle token expiration and refresh', async () => {
    const { result } = renderHook(() => useLinkedInOAuth({
      clientId: 'test_client_id',
      clientSecret: 'test_client_secret',
      redirectUri: 'http://localhost:3000/callback',
      scopes: ['openid', 'profile', 'email']
    }))

    // Mock successful OAuth flow
    LinkedInApiTestUtils.setupSuccessfulFetch('oauthToken')
    LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

    await act(async () => {
      await result.current.handleCallback('test_code', 'test_state')
    })

    // Mock token validation failure
    LinkedInApiTestUtils.setupErrorFetch('unauthorized')

    await act(async () => {
      const isValid = await result.current.validateCurrentToken()
      expect(isValid).toBe(false)
    })

    // Verify profile is cleared
    expect(result.current.userProfile).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })
})

describe('Performance and Load Tests', () => {
  beforeEach(() => {
    LinkedInApiTestUtils.resetFetchMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should handle concurrent API calls efficiently', async () => {
    const { result } = renderHook(() => useLinkedInProfile('test_access_token'))

    LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

    const startTime = Date.now()

    // Make multiple concurrent calls
    await act(async () => {
      const promises = Array.from({ length: 5 }, () => 
        result.current.fetchCurrentProfile()
      )
      await Promise.all(promises)
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    // Should complete within reasonable time (less than 5 seconds)
    expect(duration).toBeLessThan(5000)
    expect(result.current.profile).toBeDefined()
  })

  it('should handle large datasets efficiently', async () => {
    const { result } = renderHook(() => useOffice365ManagementApi({
      tenantId: 'test-tenant-id',
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret'
    }))

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

    // Mock large dataset
    const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
      ...mockActivityRecord,
      Id: `activity-record-${i}`,
      UserId: `user${i}@domain.com`
    }))

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
        json: () => Promise.resolve(largeDataset)
      })

    await act(async () => {
      await result.current.initializeApi({
        tenantId: 'test-tenant-id',
        clientId: 'test-client-id',
        clientSecret: 'test-client-secret'
      })
    })

    const startTime = Date.now()

    await act(async () => {
      const summary = await result.current.getActivitySummary()
      expect(summary?.totalRecords).toBe(1000)
    })

    const endTime = Date.now()
    const duration = endTime - startTime

    // Should handle large datasets efficiently
    expect(duration).toBeLessThan(10000) // Less than 10 seconds
  })
})
