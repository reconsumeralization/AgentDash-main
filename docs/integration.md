# AgentDash Integration Guide

This comprehensive guide covers integrating AgentDash with various platforms, services, and enterprise systems.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Social Media Integrations](#social-media-integrations)
- [CRM Integrations](#crm-integrations)
- [Analytics Integrations](#analytics-integrations)
- [Webhook Integrations](#webhook-integrations)
- [Custom Integrations](#custom-integrations)
- [Enterprise Integrations](#enterprise-integrations)
- [Security & Compliance](#security--compliance)
- [Testing & Validation](#testing--validation)
- [Troubleshooting](#troubleshooting)

## Overview

AgentDash provides flexible integration capabilities to connect with external systems, APIs, and services. Our integration framework supports:

- **Social Media Platforms**: LinkedIn, Twitter, Instagram, Facebook, YouTube
- **CRM Systems**: Salesforce, HubSpot, Pipedrive, Microsoft Dynamics
- **Analytics Tools**: Google Analytics, Mixpanel, Amplitude, Custom Analytics
- **Communication Platforms**: Slack, Microsoft Teams, Discord
- **Database Systems**: PostgreSQL, MySQL, MongoDB, Redis
- **Cloud Services**: AWS, Google Cloud, Microsoft Azure
- **Custom APIs**: REST, GraphQL, WebSocket connections

## Quick Start

### 1. Authentication Setup

First, configure authentication for your integrations:

```typescript
import { AgentDashClient } from '@agentdash/sdk'

const client = new AgentDashClient({
  apiKey: process.env.AGENTDASH_API_KEY,
  baseUrl: process.env.AGENTDASH_BASE_URL
})
```

### 2. Create Integration

```typescript
const integration = await client.integrations.create({
  name: 'LinkedIn Integration',
  type: 'social_media',
  platform: 'linkedin',
  configuration: {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI,
    scopes: ['profile', 'email', 'w_member_social']
  }
})
```

### 3. Test Connection

```typescript
const testResult = await client.integrations.test(integration.id)
if (testResult.success) {
  console.log('Integration connected successfully')
} else {
  console.error('Integration failed:', testResult.error)
}
```

---

## Social Media Integrations

### LinkedIn Integration

#### Setup

1. **Create LinkedIn App**
   - Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
   - Create a new app
   - Configure OAuth 2.0 settings
   - Add required scopes

2. **Configure AgentDash**
   ```typescript
   const linkedinConfig = {
     clientId: 'your_linkedin_client_id',
     clientSecret: 'your_linkedin_client_secret',
     redirectUri: 'https://your-app.com/auth/linkedin/callback',
     scopes: [
       'profile',           // Basic profile info
       'email',            // Email address
       'w_member_social',  // Post on behalf of user
       'rw_ads',           // Campaign management (requires approval)
       'r_ads_reporting'   // Analytics (requires approval)
     ]
   }
   ```

3. **Handle OAuth Flow**
   ```typescript
   // Redirect to LinkedIn for authorization
   const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
     `response_type=code&` +
     `client_id=${clientId}&` +
     `redirect_uri=${redirectUri}&` +
     `scope=${scopes.join(' ')}&` +
     `state=${state}`
   
   // Handle callback
   app.get('/auth/linkedin/callback', async (req, res) => {
     const { code, state } = req.query
     
     const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
       method: 'POST',
       headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
       body: new URLSearchParams({
         grant_type: 'authorization_code',
         code: code,
         client_id: clientId,
         client_secret: clientSecret,
         redirect_uri: redirectUri
       })
     })
     
     const tokens = await tokenResponse.json()
     // Store tokens securely
   })
   ```

#### Usage Examples

```typescript
// Get user profile
const profile = await linkedinApi.getProfile()

// Create a post
const post = await linkedinApi.createPost({
  content: {
    text: 'Excited to share our latest product update! #innovation',
    hashtags: ['innovation', 'product']
  }
})

// Get analytics
const analytics = await linkedinApi.getAnalytics({
  timeRange: '30d',
  metrics: ['impressions', 'clicks', 'engagement']
})
```

### Twitter Integration

#### Setup

1. **Create Twitter App**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Create a new app
   - Generate API keys and tokens
   - Configure OAuth 2.0 settings

2. **Configure AgentDash**
   ```typescript
   const twitterConfig = {
     clientId: 'your_twitter_client_id',
     clientSecret: 'your_twitter_client_secret',
     bearerToken: 'your_twitter_bearer_token',
     scopes: ['tweet.read', 'tweet.write', 'users.read', 'follows.read']
   }
   ```

#### Usage Examples

```typescript
// Post a tweet
const tweet = await twitterApi.createTweet({
  text: 'Hello from AgentDash! 🚀 #automation'
})

// Get user timeline
const timeline = await twitterApi.getTimeline({
  userId: 'user_id',
  maxResults: 100
})

// Get tweet analytics
const analytics = await twitterApi.getTweetAnalytics(tweet.id)
```

### Instagram Integration

#### Setup

1. **Create Facebook App**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create a new app
   - Add Instagram Basic Display product
   - Configure OAuth settings

2. **Configure AgentDash**
   ```typescript
   const instagramConfig = {
     appId: 'your_facebook_app_id',
     appSecret: 'your_facebook_app_secret',
     redirectUri: 'https://your-app.com/auth/instagram/callback',
     scopes: ['user_profile', 'user_media']
   }
   ```

---

## CRM Integrations

### Salesforce Integration

#### Setup

1. **Create Connected App**
   - Go to Salesforce Setup → App Manager
   - Create a new Connected App
   - Configure OAuth settings
   - Add required scopes

2. **Configure AgentDash**
   ```typescript
   const salesforceConfig = {
     clientId: 'your_salesforce_client_id',
     clientSecret: 'your_salesforce_client_secret',
     username: 'your_salesforce_username',
     password: 'your_salesforce_password',
     securityToken: 'your_salesforce_security_token',
     loginUrl: 'https://login.salesforce.com' // or sandbox URL
   }
   ```

#### Usage Examples

```typescript
// Create lead
const lead = await salesforceApi.createLead({
  FirstName: 'John',
  LastName: 'Doe',
  Email: 'john.doe@example.com',
  Company: 'Acme Corp',
  LeadSource: 'Social Media'
})

// Update opportunity
const opportunity = await salesforceApi.updateOpportunity('opp_id', {
  StageName: 'Closed Won',
  Amount: 50000
})

// Get account information
const account = await salesforceApi.getAccount('acc_id')
```

### HubSpot Integration

#### Setup

1. **Create Private App**
   - Go to HubSpot Settings → Integrations → Private Apps
   - Create a new private app
   - Configure scopes and permissions

2. **Configure AgentDash**
   ```typescript
   const hubspotConfig = {
     accessToken: 'your_hubspot_access_token',
     baseUrl: 'https://api.hubapi.com'
   }
   ```

#### Usage Examples

```typescript
// Create contact
const contact = await hubspotApi.createContact({
  properties: {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe@example.com',
    company: 'Acme Corp'
  }
})

// Create deal
const deal = await hubspotApi.createDeal({
  properties: {
    dealname: 'New Deal',
    amount: '50000',
    dealstage: 'qualifiedtobuy'
  }
})

// Get contacts
const contacts = await hubspotApi.getContacts({
  limit: 100,
  properties: ['firstname', 'lastname', 'email']
})
```

---

## Analytics Integrations

### Google Analytics Integration

#### Setup

1. **Create Service Account**
   - Go to Google Cloud Console
   - Create a new service account
   - Download JSON key file
   - Add to Google Analytics account

2. **Configure AgentDash**
   ```typescript
   const googleAnalyticsConfig = {
     serviceAccountKey: 'path/to/service-account-key.json',
     propertyId: 'your_ga4_property_id',
     measurementId: 'your_measurement_id'
   }
   ```

#### Usage Examples

```typescript
// Get page views
const pageViews = await googleAnalyticsApi.getPageViews({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  dimensions: ['pagePath', 'source'],
  metrics: ['sessions', 'pageviews']
})

// Track custom event
await googleAnalyticsApi.trackEvent({
  eventName: 'social_media_post',
  parameters: {
    platform: 'linkedin',
    post_type: 'text',
    engagement_rate: 0.05
  }
})
```

### Mixpanel Integration

#### Setup

1. **Get Project Credentials**
   - Go to Mixpanel Project Settings
   - Copy Project Token and API Secret

2. **Configure AgentDash**
   ```typescript
   const mixpanelConfig = {
     projectToken: 'your_mixpanel_project_token',
     apiSecret: 'your_mixpanel_api_secret'
   }
   ```

#### Usage Examples

```typescript
// Track event
await mixpanelApi.track('Social Media Post Created', {
  platform: 'linkedin',
  content_type: 'text',
  user_id: 'user_123'
})

// Get funnel data
const funnel = await mixpanelApi.getFunnel({
  fromDate: '2024-01-01',
  toDate: '2024-01-31',
  funnelSteps: [
    { event: 'Page View' },
    { event: 'Sign Up' },
    { event: 'First Post' }
  ]
})
```

---

## Webhook Integrations

### Setting Up Webhooks

#### Create Webhook

```typescript
const webhook = await client.webhooks.create({
  name: 'Social Media Post Analytics',
  url: 'https://your-app.com/webhooks/post-analytics',
  events: ['post.published', 'post.updated'],
  secret: 'your_webhook_secret',
  headers: {
    'X-Custom-Header': 'value'
  }
})
```

#### Handle Webhook Events

```typescript
// Express.js webhook handler
app.post('/webhooks/post-analytics', (req, res) => {
  const signature = req.headers['x-webhook-signature']
  const payload = req.body
  
  // Verify webhook signature
  if (!verifyWebhookSignature(signature, payload, webhookSecret)) {
    return res.status(401).send('Invalid signature')
  }
  
  const { event, data } = payload
  
  switch (event) {
    case 'post.published':
      handlePostPublished(data)
      break
    case 'post.updated':
      handlePostUpdated(data)
      break
  }
  
  res.status(200).send('OK')
})

function verifyWebhookSignature(signature, payload, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex')
  
  return signature === `sha256=${expectedSignature}`
}
```

### Webhook Events

#### Social Media Events

```typescript
// Post published
{
  event: 'post.published',
  timestamp: '2024-01-01T15:00:00Z',
  data: {
    postId: 'post_123',
    platform: 'linkedin',
    accountId: 'acc_123',
    content: { text: 'Post content' },
    publishedAt: '2024-01-01T15:00:00Z'
  }
}

// Post engagement updated
{
  event: 'post.engagement_updated',
  timestamp: '2024-01-01T16:00:00Z',
  data: {
    postId: 'post_123',
    platform: 'linkedin',
    engagement: {
      likes: 45,
      comments: 12,
      shares: 8
    }
  }
}
```

#### Agent Events

```typescript
// Agent action completed
{
  event: 'agent.action_completed',
  timestamp: '2024-01-01T15:00:00Z',
  data: {
    agentId: 'agent_123',
    action: 'create_post',
    status: 'success',
    result: {
      postId: 'post_456',
      platform: 'linkedin'
    }
  }
}
```

---

## Custom Integrations

### REST API Integration

#### Generic REST Client

```typescript
class RestApiClient {
  constructor(config) {
    this.baseUrl = config.baseUrl
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.accessToken}`
    }
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: { ...this.headers, ...options.headers }
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }
    
    return response.json()
  }
  
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }
  
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}
```

#### Custom Integration Example

```typescript
class CustomApiIntegration {
  constructor(config) {
    this.client = new RestApiClient(config)
  }
  
  async createRecord(data) {
    return this.client.post('/records', data)
  }
  
  async updateRecord(id, data) {
    return this.client.post(`/records/${id}`, data)
  }
  
  async getRecords(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.client.get(`/records?${params}`)
  }
}

// Register custom integration
const customIntegration = new CustomApiIntegration({
  baseUrl: 'https://api.custom-service.com',
  accessToken: 'your_access_token'
})

await client.integrations.register('custom_api', customIntegration)
```

### GraphQL Integration

#### GraphQL Client

```typescript
class GraphQLClient {
  constructor(config) {
    this.endpoint = config.endpoint
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.accessToken}`
    }
  }
  
  async query(query, variables = {}) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables })
    })
    
    const result = await response.json()
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${result.errors.map(e => e.message).join(', ')}`)
    }
    
    return result.data
  }
}
```

#### GraphQL Integration Example

```typescript
const graphqlClient = new GraphQLClient({
  endpoint: 'https://api.example.com/graphql',
  accessToken: 'your_access_token'
})

const GET_USERS = `
  query GetUsers($limit: Int!) {
    users(limit: $limit) {
      id
      name
      email
    }
  }
`

const users = await graphqlClient.query(GET_USERS, { limit: 100 })
```

---

## Enterprise Integrations

### SSO Integration

#### SAML Integration

```typescript
const samlConfig = {
  entityId: 'your_entity_id',
  ssoUrl: 'https://your-idp.com/sso',
  x509Certificate: 'your_x509_certificate',
  nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress'
}

const samlIntegration = await client.integrations.create({
  name: 'SAML SSO',
  type: 'sso',
  protocol: 'saml',
  configuration: samlConfig
})
```

#### OIDC Integration

```typescript
const oidcConfig = {
  issuer: 'https://your-oidc-provider.com',
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  scopes: ['openid', 'profile', 'email']
}

const oidcIntegration = await client.integrations.create({
  name: 'OIDC SSO',
  type: 'sso',
  protocol: 'oidc',
  configuration: oidcConfig
})
```

### LDAP Integration

```typescript
const ldapConfig = {
  server: 'ldap://your-ldap-server.com:389',
  baseDN: 'dc=example,dc=com',
  bindDN: 'cn=admin,dc=example,dc=com',
  bindPassword: 'your_bind_password',
  userSearchBase: 'ou=users,dc=example,dc=com',
  userSearchFilter: '(uid={{username}})'
}

const ldapIntegration = await client.integrations.create({
  name: 'LDAP Authentication',
  type: 'ldap',
  configuration: ldapConfig
})
```

### Active Directory Integration

```typescript
const adConfig = {
  server: 'your-ad-server.com',
  domain: 'your-domain.com',
  username: 'service_account',
  password: 'service_account_password',
  baseDN: 'DC=your-domain,DC=com'
}

const adIntegration = await client.integrations.create({
  name: 'Active Directory',
  type: 'active_directory',
  configuration: adConfig
})
```

---

## Security & Compliance

### Data Encryption

```typescript
// Encrypt sensitive data
const encryptedData = await client.security.encrypt({
  data: sensitiveData,
  keyId: 'your_encryption_key_id'
})

// Decrypt data
const decryptedData = await client.security.decrypt({
  encryptedData: encryptedData,
  keyId: 'your_encryption_key_id'
})
```

### Audit Logging

```typescript
// Log integration events
await client.audit.log({
  event: 'integration.created',
  userId: 'user_123',
  resourceId: 'integration_456',
  metadata: {
    integrationType: 'linkedin',
    scopes: ['profile', 'email']
  }
})
```

### Compliance Controls

```typescript
// GDPR compliance
await client.compliance.handleDataRequest({
  userId: 'user_123',
  requestType: 'data_export',
  callback: async (userData) => {
    // Process user data export
    return userData
  }
})

// Data deletion
await client.compliance.deleteUserData({
  userId: 'user_123',
  reason: 'user_request'
})
```

---

## Testing & Validation

### Integration Testing

```typescript
// Test integration connection
const testResult = await client.integrations.test(integrationId, {
  testType: 'connection',
  validateCredentials: true,
  testPermissions: true
})

// Test specific functionality
const functionalityTest = await client.integrations.test(integrationId, {
  testType: 'functionality',
  testCases: [
    'create_post',
    'get_analytics',
    'update_profile'
  ]
})
```

### Mock Integrations

```typescript
// Create mock integration for testing
const mockIntegration = await client.integrations.createMock({
  name: 'Mock LinkedIn',
  type: 'social_media',
  platform: 'linkedin',
  mockData: {
    profile: { id: 'mock_user', name: 'Mock User' },
    posts: [{ id: 'mock_post', text: 'Mock post' }]
  }
})
```

### Validation Rules

```typescript
// Define validation rules
const validationRules = {
  required: ['clientId', 'clientSecret'],
  optional: ['redirectUri', 'scopes'],
  patterns: {
    clientId: /^[a-zA-Z0-9_-]+$/,
    redirectUri: /^https?:\/\/.+/
  }
}

// Validate integration configuration
const validation = await client.integrations.validate(configuration, validationRules)
```

---

## Troubleshooting

### Common Issues

#### Authentication Errors

```typescript
// Check token validity
const tokenStatus = await client.auth.validateToken(token)
if (!tokenStatus.valid) {
  console.error('Token invalid:', tokenStatus.error)
}

// Refresh expired tokens
const newToken = await client.auth.refreshToken(refreshToken)
```

#### Rate Limiting

```typescript
// Handle rate limiting
try {
  const result = await apiCall()
} catch (error) {
  if (error.status === 429) {
    const retryAfter = error.headers['retry-after']
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000))
    // Retry the request
  }
}
```

#### Connection Issues

```typescript
// Test connectivity
const connectivity = await client.network.testConnectivity({
  host: 'api.linkedin.com',
  port: 443,
  timeout: 5000
})

if (!connectivity.success) {
  console.error('Connection failed:', connectivity.error)
}
```

### Debug Mode

```typescript
// Enable debug logging
const client = new AgentDashClient({
  apiKey: process.env.AGENTDASH_API_KEY,
  debug: true,
  logLevel: 'verbose'
})

// View integration logs
const logs = await client.integrations.getLogs(integrationId, {
  level: 'error',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
})
```

### Support Resources

- **Documentation**: [docs.agentdash.com](https://docs.agentdash.com)
- **API Reference**: [api.agentdash.com/docs](https://api.agentdash.com/docs)
- **Community Forum**: [community.agentdash.com](https://community.agentdash.com)
- **Support Email**: integrations@agentdash.com
- **Status Page**: [status.agentdash.com](https://status.agentdash.com)

---

## Best Practices

### Security

1. **Secure Credentials**: Store API keys and secrets in environment variables
2. **Use HTTPS**: Always use HTTPS for webhook endpoints
3. **Validate Webhooks**: Verify webhook signatures
4. **Rotate Keys**: Regularly rotate API keys and secrets
5. **Monitor Access**: Log and monitor integration access

### Performance

1. **Rate Limiting**: Respect API rate limits
2. **Caching**: Cache frequently accessed data
3. **Batch Operations**: Use batch APIs when available
4. **Async Processing**: Use async processing for long-running operations
5. **Error Handling**: Implement proper error handling and retry logic

### Monitoring

1. **Health Checks**: Implement health checks for integrations
2. **Metrics**: Track integration performance metrics
3. **Alerting**: Set up alerts for integration failures
4. **Logging**: Log all integration activities
5. **Testing**: Regularly test integration functionality

---

**Last Updated**: 2024-01-01
**Integration Guide Version**: v1.3.0
**SDK Version**: v2.1.0
