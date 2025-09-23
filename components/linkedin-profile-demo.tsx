"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  useLinkedInProfile, 
  ProfilePermission,
  LinkedInProfileUtils 
} from '@/lib/linkedin-profile-api'
import { useLinkedInApi } from '@/hooks'
import { 
  User, 
  MapPin, 
  Briefcase, 
  ExternalLink, 
  Star,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface LinkedInProfileDemoProps {
  accessToken?: string
  className?: string
}

export function LinkedInProfileDemo({ accessToken, className }: LinkedInProfileDemoProps) {
  const [personId, setPersonId] = useState('')
  const [selectedPermission, setSelectedPermission] = useState<ProfilePermission>(ProfilePermission.LITE_PROFILE)
  
  const {
    profile,
    loading,
    error,
    fetchCurrentProfile,
    fetchMemberProfile,
    fetchMultipleProfiles,
    getDisplayName,
    getHeadline,
    getLocationDisplayName,
    getPublicProfileUrl,
    isLocationMigrated
  } = useLinkedInProfile(accessToken)

  const linkedInApi = useLinkedInApi({ preferredLocale: 'en_US' })

  // Auto-fetch current profile on mount if access token is available
  useEffect(() => {
    if (accessToken) {
      fetchCurrentProfile()
    }
  }, [accessToken, fetchCurrentProfile])

  const handleFetchCurrentProfile = () => {
    fetchCurrentProfile()
  }

  const handleFetchMemberProfile = () => {
    if (personId.trim()) {
      fetchMemberProfile(personId.trim())
    }
  }

  const handleFetchMultipleProfiles = async () => {
    const ids = personId.split(',').map(id => id.trim()).filter(id => id)
    if (ids.length > 0) {
      const profiles = await fetchMultipleProfiles(ids)
      console.log('Multiple profiles:', profiles)
    }
  }

  const getPermissionDescription = (permission: ProfilePermission): string => {
    switch (permission) {
      case ProfilePermission.LITE_PROFILE:
        return 'Name and photo for the authenticated user'
      case ProfilePermission.BASIC_PROFILE:
        return 'Name, photo, headline, and vanity name for the authenticated user'
      case ProfilePermission.COMPLIANCE:
        return 'Private permission for compliance monitoring and archiving'
      default:
        return 'Unknown permission'
    }
  }

  const getCompletenessScore = (): number => {
    if (!profile) return 0
    return LinkedInProfileUtils.getCompletenessScore(profile)
  }

  const getCompletenessColor = (score: number): string => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletenessBadge = (score: number): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'destructive'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            LinkedIn Profile API Demo
          </CardTitle>
          <CardDescription>
            Demonstration of LinkedIn Profile API integration based on the official documentation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* API Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">API Controls</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Access Token</label>
                <Input
                  value={accessToken || ''}
                  placeholder="Enter LinkedIn access token"
                  disabled
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-600">
                  {accessToken ? 'Token provided' : 'No access token available'}
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Permission Level</label>
                <select
                  value={selectedPermission}
                  onChange={(e) => setSelectedPermission(e.target.value as ProfilePermission)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value={ProfilePermission.LITE_PROFILE}>Lite Profile</option>
                  <option value={ProfilePermission.BASIC_PROFILE}>Basic Profile</option>
                  <option value={ProfilePermission.COMPLIANCE}>Compliance</option>
                </select>
                <p className="text-xs text-gray-600">
                  {getPermissionDescription(selectedPermission)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleFetchCurrentProfile}
                disabled={!accessToken || loading}
                className="flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <User className="h-4 w-4" />}
                Get Current Profile
              </Button>
              
              <div className="flex gap-2">
                <Input
                  value={personId}
                  onChange={(e) => setPersonId(e.target.value)}
                  placeholder="Enter Person ID(s) separated by commas"
                  className="min-w-[200px]"
                />
                <Button 
                  onClick={handleFetchMemberProfile}
                  disabled={!personId.trim() || loading}
                  variant="outline"
                >
                  Get Profile
                </Button>
                <Button 
                  onClick={handleFetchMultipleProfiles}
                  disabled={!personId.trim() || loading}
                  variant="outline"
                >
                  Get Multiple
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error.message}</p>
            </div>
          )}

          {/* Profile Display */}
          {profile && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Profile Information</h3>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Profile Picture */}
                    <Avatar className="h-20 w-20">
                      <AvatarImage 
                        src={profile.profilePicture?.displayImage ? 
                          `https://media.licdn.com/dms/image/${profile.profilePicture.displayImage.split(':').pop()}` : 
                          undefined
                        } 
                        alt={getDisplayName()}
                      />
                      <AvatarFallback>
                        {getDisplayName().split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Profile Details */}
                    <div className="flex-1 space-y-3">
                      <div>
                        <h4 className="text-xl font-semibold">{getDisplayName()}</h4>
                        {getHeadline() && (
                          <p className="text-gray-600 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            {getHeadline()}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          {getLocationDisplayName()}
                        </span>
                        {isLocationMigrated && (
                          <Badge variant="outline" className="text-xs">
                            Bing Geo
                          </Badge>
                        )}
                      </div>

                      {profile.vanityName && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                          <a 
                            href={getPublicProfileUrl()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {getPublicProfileUrl()}
                          </a>
                        </div>
                      )}

                      {/* Profile Completeness */}
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Profile Completeness:</span>
                        <Badge variant={getCompletenessBadge(getCompletenessScore())}>
                          {getCompletenessScore()}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Raw Profile Data */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Raw Profile Data</CardTitle>
                  <CardDescription>
                    Complete profile object returned from LinkedIn API
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                    {JSON.stringify(profile, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Profile Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profile Analysis</CardTitle>
                  <CardDescription>
                    Analysis of profile completeness and available data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Person ID</p>
                      <p className="font-mono text-xs">{profile.id}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Vanity Name</p>
                      <p className="font-semibold">{profile.vanityName || 'Not set'}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Has Profile Picture</p>
                      <div className="flex justify-center">
                        {profile.profilePicture?.displayImage ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">Location Type</p>
                      <p className="font-semibold">
                        {profile.geoLocation ? 'Geo Location' : 
                         profile.location ? 'Legacy Location' : 'Not set'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* API Documentation Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">API Documentation Reference</CardTitle>
              <CardDescription>
                Based on LinkedIn Profile API documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <strong>Current Member Profile:</strong> GET https://api.linkedin.com/v2/me
                </p>
                <p>
                  <strong>Other Member Profile:</strong> GET https://api.linkedin.com/v2/people/(id:{'{person ID}'})
                </p>
                <p>
                  <strong>Multiple Profiles:</strong> GET https://api.linkedin.com/v2/people?ids=List((id:{'{Person ID1}'}),(id:{'{Person ID2}'}))
                </p>
                <p>
                  <strong>Field Projections:</strong> Add ?projection=(id,firstName,lastName) to request specific fields
                </p>
                <p>
                  <strong>Geo Location:</strong> Add ?projection=(geoLocation(geo~,autoGenerated)) for location data
                </p>
              </div>
              <div className="mt-4">
                <a 
                  href="https://learn.microsoft.com/en-us/linkedin/shared/integrations/people/profile-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View Full LinkedIn Profile API Documentation →
                </a>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
