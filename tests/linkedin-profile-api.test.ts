/**
 * LinkedIn Profile API Tests
 * Comprehensive test suite for LinkedIn Profile API functionality
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { 
  LinkedInProfileApi, 
  LinkedInProfileUtils,
  ProfilePermission 
} from '@/lib/linkedin-profile-api'
import {
  mockLinkedInProfile,
  mockApiError,
  LinkedInApiTestUtils,
  mockFetch
} from './__mocks__/linkedin-api-mock'

// Mock fetch globally
global.fetch = mockFetch

describe('LinkedInProfileApi', () => {
  let profileApi: LinkedInProfileApi
  const mockAccessToken = 'mock_access_token_123'

  beforeEach(() => {
    profileApi = new LinkedInProfileApi(mockAccessToken)
    LinkedInApiTestUtils.resetFetchMock()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should initialize with access token', () => {
      const api = new LinkedInProfileApi('test_token')
      expect(api).toBeInstanceOf(LinkedInProfileApi)
    })
  })

  describe('getCurrentMemberProfile', () => {
    it('should fetch current member profile successfully', async () => {
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

      const profile = await profileApi.getCurrentMemberProfile()

      expect(profile).toEqual(mockLinkedInProfile)
      LinkedInApiTestUtils.verifyFetchCall(
        'https://api.linkedin.com/v2/me',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'X-RestLi-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
          }
        }
      )
    })

    it('should fetch current member profile with projection', async () => {
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')
      const projection = '(id,firstName,lastName)'

      await profileApi.getCurrentMemberProfile(projection)

      LinkedInApiTestUtils.verifyFetchCall(
        'https://api.linkedin.com/v2/me?projection=(id,firstName,lastName)',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'X-RestLi-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
          }
        }
      )
    })

    it('should handle API errors', async () => {
      LinkedInApiTestUtils.setupErrorFetch('unauthorized')

      await expect(profileApi.getCurrentMemberProfile())
        .rejects
        .toThrow('LinkedIn API error: 401 Unauthorized')
    })
  })

  describe('getMemberProfile', () => {
    it('should fetch member profile by ID successfully', async () => {
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')
      const personId = 'test_person_id'

      const profile = await profileApi.getMemberProfile(personId)

      expect(profile).toEqual(mockLinkedInProfile)
      LinkedInApiTestUtils.verifyFetchCall(
        'https://api.linkedin.com/v2/people/(id:test_person_id)',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'X-RestLi-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
          }
        }
      )
    })

    it('should fetch member profile with projection', async () => {
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')
      const personId = 'test_person_id'
      const projection = '(id,firstName,lastName,headline)'

      await profileApi.getMemberProfile(personId, projection)

      LinkedInApiTestUtils.verifyFetchCall(
        'https://api.linkedin.com/v2/people/(id:test_person_id)?projection=(id,firstName,lastName,headline)',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'X-RestLi-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
          }
        }
      )
    })
  })

  describe('getMultipleMemberProfiles', () => {
    it('should fetch multiple member profiles successfully', async () => {
      const mockResponse = {
        results: {
          'id1': mockLinkedInProfile,
          'id2': { ...mockLinkedInProfile, id: 'id2' }
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse)
      })

      const personIds = ['id1', 'id2']
      const profiles = await profileApi.getMultipleMemberProfiles(personIds)

      expect(profiles).toHaveLength(2)
      expect(profiles[0].id).toBe('yrZCpj2Z12')
      expect(profiles[1].id).toBe('id2')

      LinkedInApiTestUtils.verifyFetchCall(
        'https://api.linkedin.com/v2/people?ids=List((id:id1),(id:id2))',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'X-RestLi-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
          }
        }
      )
    })

    it('should handle single profile response', async () => {
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

      const personIds = ['single_id']
      const profiles = await profileApi.getMultipleMemberProfiles(personIds)

      expect(profiles).toHaveLength(1)
      expect(profiles[0]).toEqual(mockLinkedInProfile)
    })
  })

  describe('getProfileWithGeoLocation', () => {
    it('should fetch profile with geo location for current member', async () => {
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')

      await profileApi.getProfileWithGeoLocation()

      LinkedInApiTestUtils.verifyFetchCall(
        'https://api.linkedin.com/v2/me?projection=(geoLocation(geo~,autoGenerated))',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'X-RestLi-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
          }
        }
      )
    })

    it('should fetch profile with geo location for specific member', async () => {
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')
      const personId = 'test_person_id'

      await profileApi.getProfileWithGeoLocation(personId)

      LinkedInApiTestUtils.verifyFetchCall(
        'https://api.linkedin.com/v2/people/(id:test_person_id)?projection=(geoLocation(geo~,autoGenerated))',
        {
          headers: {
            'Authorization': `Bearer ${mockAccessToken}`,
            'X-RestLi-Protocol-Version': '2.0.0',
            'Content-Type': 'application/json'
          }
        }
      )
    })
  })

  describe('Utility Methods', () => {
    beforeEach(() => {
      LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')
    })

    it('should get public profile URL', () => {
      const vanityName = 'johndoe'
      const url = profileApi.getPublicProfileUrl(vanityName)
      expect(url).toBe('https://www.linkedin.com/in/johndoe')
    })

    it('should extract person ID from profile', async () => {
      const profile = await profileApi.getCurrentMemberProfile()
      const personId = profileApi.extractPersonId(profile)
      expect(personId).toBe('yrZCpj2Z12')
    })

    it('should get display name with default locale', async () => {
      const profile = await profileApi.getCurrentMemberProfile()
      const displayName = profileApi.getDisplayName(profile)
      expect(displayName).toBe('John Doe')
    })

    it('should get display name with specific locale', async () => {
      const profile = await profileApi.getCurrentMemberProfile()
      const displayName = profileApi.getDisplayName(profile, 'es_ES')
      expect(displayName).toBe('Juan Pérez')
    })

    it('should get headline with default locale', async () => {
      const profile = await profileApi.getCurrentMemberProfile()
      const headline = profileApi.getHeadline(profile)
      expect(headline).toBe('Senior Software Engineer at Tech Corp')
    })

    it('should get headline with specific locale', async () => {
      const profile = await profileApi.getCurrentMemberProfile()
      const headline = profileApi.getHeadline(profile, 'es_ES')
      expect(headline).toBe('Ingeniero de Software Senior en Tech Corp')
    })

    it('should get location display name from geo location', async () => {
      const profile = await profileApi.getCurrentMemberProfile()
      const location = profileApi.getLocationDisplayName(profile)
      expect(location).toBe('San Francisco Bay Area')
    })

    it('should get location display name from legacy location', async () => {
      const profileWithoutGeo = {
        ...mockLinkedInProfile,
        geoLocation: undefined,
        location: {
          postalCode: '94105',
          countryCode: 'us'
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(profileWithoutGeo)
      })

      const profile = await profileApi.getCurrentMemberProfile()
      const location = profileApi.getLocationDisplayName(profile)
      expect(location).toBe('94105')
    })

    it('should return default location when no location data', async () => {
      const profileWithoutLocation = {
        ...mockLinkedInProfile,
        geoLocation: undefined,
        location: undefined
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(profileWithoutLocation)
      })

      const profile = await profileApi.getCurrentMemberProfile()
      const location = profileApi.getLocationDisplayName(profile)
      expect(location).toBe('Location not available')
    })

    it('should check if location is migrated', async () => {
      const profile = await profileApi.getCurrentMemberProfile()
      const isMigrated = profileApi.isLocationMigrated(profile)
      expect(isMigrated).toBe(true)
    })

    it('should return false for non-migrated location', async () => {
      const profileWithoutMigration = {
        ...mockLinkedInProfile,
        geoLocation: {
          ...mockLinkedInProfile.geoLocation!,
          autoGenerated: true
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(profileWithoutMigration)
      })

      const profile = await profileApi.getCurrentMemberProfile()
      const isMigrated = profileApi.isLocationMigrated(profile)
      expect(isMigrated).toBe(false)
    })
  })
})

describe('LinkedInProfileUtils', () => {
  describe('hasPermission', () => {
    it('should return true for lite profile permission', () => {
      const hasPermission = LinkedInProfileUtils.hasPermission(
        mockLinkedInProfile,
        ProfilePermission.LITE_PROFILE
      )
      expect(hasPermission).toBe(true)
    })

    it('should return true for basic profile permission', () => {
      const hasPermission = LinkedInProfileUtils.hasPermission(
        mockLinkedInProfile,
        ProfilePermission.BASIC_PROFILE
      )
      expect(hasPermission).toBe(true)
    })

    it('should return false for compliance permission', () => {
      const hasPermission = LinkedInProfileUtils.hasPermission(
        mockLinkedInProfile,
        ProfilePermission.COMPLIANCE
      )
      expect(hasPermission).toBe(false)
    })

    it('should return false for incomplete profile', () => {
      const incompleteProfile = {
        ...mockLinkedInProfile,
        headline: undefined
      }

      const hasPermission = LinkedInProfileUtils.hasPermission(
        incompleteProfile,
        ProfilePermission.BASIC_PROFILE
      )
      expect(hasPermission).toBe(false)
    })
  })

  describe('getCompletenessScore', () => {
    it('should calculate completeness score for complete profile', () => {
      const score = LinkedInProfileUtils.getCompletenessScore(mockLinkedInProfile)
      expect(score).toBe(100) // All fields present
    })

    it('should calculate completeness score for partial profile', () => {
      const partialProfile = {
        ...mockLinkedInProfile,
        headline: undefined,
        profilePicture: undefined
      }

      const score = LinkedInProfileUtils.getCompletenessScore(partialProfile)
      expect(score).toBe(60) // Basic info + location = 60 points
    })

    it('should return 0 for empty profile', () => {
      const emptyProfile = {
        id: 'test',
        firstName: {} as any,
        localizedFirstName: '',
        lastName: {} as any,
        localizedLastName: ''
      }

      const score = LinkedInProfileUtils.getCompletenessScore(emptyProfile)
      expect(score).toBe(0)
    })
  })

  describe('formatProfileForDisplay', () => {
    it('should format profile for display with default locale', () => {
      const formatted = LinkedInProfileUtils.formatProfileForDisplay(mockLinkedInProfile)
      
      expect(formatted.name).toBe('John Doe')
      expect(formatted.headline).toBe('Senior Software Engineer at Tech Corp')
      expect(formatted.location).toBe('San Francisco Bay Area')
      expect(formatted.profileUrl).toBe('https://www.linkedin.com/in/johndoe')
      expect(formatted.completenessScore).toBe(100)
    })

    it('should format profile for display with specific locale', () => {
      const formatted = LinkedInProfileUtils.formatProfileForDisplay(mockLinkedInProfile, 'es_ES')
      
      expect(formatted.name).toBe('Juan Pérez')
      expect(formatted.headline).toBe('Ingeniero de Software Senior en Tech Corp')
    })
  })
})

describe('Error Handling', () => {
  let profileApi: LinkedInProfileApi

  beforeEach(() => {
    profileApi = new LinkedInProfileApi('mock_token')
    LinkedInApiTestUtils.resetFetchMock()
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(profileApi.getCurrentMemberProfile())
      .rejects
      .toThrow('Network error')
  })

  it('should handle malformed JSON responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.reject(new Error('Invalid JSON'))
    })

    await expect(profileApi.getCurrentMemberProfile())
      .rejects
      .toThrow('Invalid JSON')
  })

  it('should handle 500 server errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: () => Promise.resolve(mockApiError)
    })

    await expect(profileApi.getCurrentMemberProfile())
      .rejects
      .toThrow('LinkedIn API error: 500 Internal Server Error')
  })
})
