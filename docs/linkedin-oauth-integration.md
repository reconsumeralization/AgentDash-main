# LinkedIn OAuth Integration Guide

## Overview

This guide provides comprehensive instructions for integrating LinkedIn OAuth 2.0 authentication into the AgentDash application.

## 🔑 Your LinkedIn App Credentials

Based on your provided credentials:

### Application Details
- **Client ID**: `your-linkedin-client-id`
- **Primary Client Secret**: `your-linkedin-client-secret`
- **Token Duration**: 2 months (5,184,000 seconds)

### OAuth 2.0 Scopes
Your application has the following scopes configured:

- `openid` - OpenID Connect authentication
- `profile` - Basic profile information
- `w_member_social` - Member social actions
- `email` - Email address access

## Setup Instructions

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your-linkedin-client-id
```

### 2. OAuth Configuration

```typescript
import { LinkedInOAuthClient, DEFAULT_LINKEDIN_CONFIG } from '@/lib/linkedin-oauth'

// Use your provided credentials
const config = {
  clientId: 'your-linkedin-client-id',
  clientSecret: 'your-linkedin-client-secret',
  redirectUri: 'http://localhost:3000/auth/linkedin/callback',
  scopes: ['openid', 'profile', 'w_member_social', 'email']
}

const linkedinClient = new LinkedInOAuthClient(config)
```

### 3. Authentication Flow

#### Step 1: Generate Authorization URL

```typescript
const authUrl = linkedinClient.generateAuthUrl({
  state: 'random-state-string',
  scope: ['openid', 'profile', 'w_member_social', 'email']
})

// Redirect user to authUrl
window.location.href = authUrl
```

#### Step 2: Handle Callback

```typescript
// In your callback route handler
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code) {
    return new Response('Authorization code not found', { status: 400 })
  }
  
  try {
    const tokens = await linkedinClient.exchangeCodeForTokens(code)
    // Store tokens securely
    return Response.redirect('/dashboard')
  } catch (error) {
    console.error('Token exchange failed:', error)
    return new Response('Authentication failed', { status: 500 })
  }
}
```

#### Step 3: Access LinkedIn API

```typescript
// Get user profile
const profile = await linkedinClient.getProfile(tokens.accessToken)

// Get user connections
const connections = await linkedinClient.getConnections(tokens.accessToken)

// Post content
const postResult = await linkedinClient.createPost(tokens.accessToken, {
  text: 'Hello from AgentDash!',
  visibility: 'PUBLIC'
})
```

## API Endpoints

### Authentication Endpoints

- `GET /auth/linkedin` - Initiate OAuth flow
- `GET /auth/linkedin/callback` - Handle OAuth callback
- `POST /auth/linkedin/refresh` - Refresh access token
- `POST /auth/linkedin/revoke` - Revoke access token

### LinkedIn API Endpoints

- `GET /api/linkedin/profile` - Get user profile
- `GET /api/linkedin/connections` - Get user connections
- `POST /api/linkedin/posts` - Create a post
- `GET /api/linkedin/posts` - Get user posts
- `GET /api/linkedin/analytics` - Get analytics data

## Error Handling

### Common Error Codes

- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Invalid or expired token
- `403 Forbidden` - Insufficient permissions
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

### Error Handling Example

```typescript
try {
  const result = await linkedinClient.apiCall('/v2/people/~', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })
} catch (error) {
  if (error.status === 401) {
    // Token expired, refresh or re-authenticate
    await refreshToken()
  } else if (error.status === 429) {
    // Rate limited, wait and retry
    await new Promise(resolve => setTimeout(resolve, 60000))
  } else {
    // Handle other errors
    console.error('LinkedIn API error:', error)
  }
}
```

## Security Considerations

### Token Management

1. **Store tokens securely** - Use encrypted storage
2. **Implement token refresh** - Handle token expiration
3. **Validate state parameter** - Prevent CSRF attacks
4. **Use HTTPS** - Always use secure connections

### Rate Limiting

LinkedIn API has rate limits:
- **Profile API**: 100 requests per day
- **Connections API**: 500 requests per day
- **Posts API**: 100 requests per day

### Best Practices

1. **Minimize API calls** - Cache data when possible
2. **Handle errors gracefully** - Provide fallback options
3. **Respect user privacy** - Only request necessary permissions
4. **Monitor usage** - Track API usage and errors

## Testing

### Unit Tests

```typescript
import { LinkedInOAuthClient } from '@/lib/linkedin-oauth'

describe('LinkedInOAuthClient', () => {
  let client: LinkedInOAuthClient
  
  beforeEach(() => {
    client = new LinkedInOAuthClient({
      clientId: 'test-client-id',
      clientSecret: 'test-client-secret',
      redirectUri: 'http://localhost:3000/callback'
    })
  })
  
  test('should generate valid auth URL', () => {
    const authUrl = client.generateAuthUrl()
    expect(authUrl).toContain('linkedin.com/oauth/v2/authorization')
    expect(authUrl).toContain('client_id=test-client-id')
  })
  
  test('should exchange code for tokens', async () => {
    const mockTokens = { access_token: 'test-token', expires_in: 3600 }
    jest.spyOn(client, 'exchangeCodeForTokens').mockResolvedValue(mockTokens)
    
    const result = await client.exchangeCodeForTokens('test-code')
    expect(result).toEqual(mockTokens)
  })
})
```

### Integration Tests

```typescript
describe('LinkedIn Integration', () => {
  test('should complete OAuth flow', async () => {
    // Test the complete OAuth flow
    const authUrl = await getAuthUrl()
    expect(authUrl).toBeDefined()
    
    // Simulate callback
    const tokens = await handleCallback('test-code')
    expect(tokens.access_token).toBeDefined()
    
    // Test API access
    const profile = await getProfile(tokens.access_token)
    expect(profile.id).toBeDefined()
  })
})
```

## Troubleshooting

### Common Issues

1. **Invalid redirect URI** - Ensure redirect URI matches LinkedIn app settings
2. **Scope permissions** - Verify requested scopes are approved
3. **Token expiration** - Implement token refresh logic
4. **Rate limiting** - Implement exponential backoff

### Debug Mode

Enable debug logging:

```typescript
const client = new LinkedInOAuthClient({
  ...config,
  debug: true
})
```

### Support Resources

- [LinkedIn Developer Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [OAuth 2.0 Specification](https://tools.ietf.org/html/rfc6749)
- [LinkedIn API Reference](https://docs.microsoft.com/en-us/linkedin/shared/api-guide/)

## Migration Guide

### From v1 to v2

If migrating from LinkedIn API v1 to v2:

1. **Update endpoints** - Change API URLs
2. **Update scopes** - Use new scope format
3. **Update response handling** - Handle new response format
4. **Test thoroughly** - Verify all functionality works

### Breaking Changes

- API endpoints changed from v1 to v2
- Response format modifications
- New authentication requirements
- Updated rate limits

## Performance Optimization

### Caching Strategy

```typescript
// Cache profile data
const profileCache = new Map()

async function getCachedProfile(userId: string) {
  if (profileCache.has(userId)) {
    return profileCache.get(userId)
  }
  
  const profile = await linkedinClient.getProfile(userId)
  profileCache.set(userId, profile)
  return profile
}
```

### Batch Requests

```typescript
// Batch multiple API calls
const batchRequests = [
  { method: 'GET', url: '/v2/people/~' },
  { method: 'GET', url: '/v2/people/~/connections' }
]

const results = await linkedinClient.batchRequest(batchRequests)
```

## Monitoring and Analytics

### Usage Tracking

```typescript
// Track API usage
const usageTracker = {
  trackApiCall: (endpoint: string, success: boolean) => {
    // Log to analytics service
    analytics.track('linkedin_api_call', {
      endpoint,
      success,
      timestamp: new Date().toISOString()
    })
  }
}
```

### Error Monitoring

```typescript
// Monitor errors
const errorMonitor = {
  reportError: (error: Error, context: any) => {
    // Send to error tracking service
    errorTracker.captureException(error, {
      tags: { service: 'linkedin-oauth' },
      extra: context
    })
  }
}
```

## Conclusion

This guide provides comprehensive instructions for integrating LinkedIn OAuth 2.0 into your application. Follow the security best practices and implement proper error handling for a robust integration.

For additional support, refer to the LinkedIn Developer Documentation or contact the development team.
