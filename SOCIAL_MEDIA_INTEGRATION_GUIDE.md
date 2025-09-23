# Social Media Integration Guide

## Overview

This guide provides comprehensive information about the enhanced social media connector system implemented in AgentDash. The system includes connectors for all major social media platforms, unified data types, and a sophisticated inbox management system.

## Architecture

### 1. Connector System

The connector system is built on a modular architecture with the following components:

#### Base Connector (`connectors/social-media/base-connector.ts`)
- **Purpose**: Provides the foundation for all social media connectors
- **Features**:
  - Authentication management
  - Rate limiting and retry logic
  - Error handling
  - Request/response processing
  - Token management

#### Platform-Specific Connectors

##### LinkedIn Connector (`enhanced-linkedin-connector.ts`)
- **Endpoints Covered**:
  - Profile management (get, update, search)
  - Content posting (personal and company pages)
  - Connections management
  - Messaging system
  - Notifications
  - Analytics and insights
  - Company page management
  - Comments and engagement
  - Search functionality

##### Twitter/X Connector (`twitter-connector.ts`)
- **Endpoints Covered**:
  - Tweet posting and management
  - User timeline and profile
  - Search and trending topics
  - Media upload
  - Analytics
  - Direct messaging
  - Lists and bookmarks

##### Facebook/Instagram Connector (`facebook-connector.ts`)
- **Endpoints Covered**:
  - Page management
  - Content posting (Facebook and Instagram)
  - Media upload and management
  - Analytics and insights
  - User management
  - Comments and engagement
  - Stories and live content

### 2. Unified Data Types (`unified-data-types.ts`)

The system uses unified data structures that work across all platforms:

#### Core Types
- **UnifiedPost**: Standardized post structure
- **UnifiedUser**: User profile information
- **UnifiedComment**: Comment structure
- **UnifiedMessage**: Direct message structure
- **UnifiedNotification**: Notification structure
- **UnifiedConversation**: Conversation management
- **UnifiedAnalytics**: Analytics data

#### Category Views
- **CategoryView**: For categorical viewing of content
- **PlatformView**: Individual platform views
- **InboxView**: Inbox-specific views

### 3. Universal Inbox System (`universal-inbox.ts`)

#### Features
- **Multi-platform aggregation**: Combines messages, notifications, and interactions from all platforms
- **Advanced filtering**: Filter by platform, type, priority, date, tags, etc.
- **Real-time updates**: Live notifications and updates
- **Bulk operations**: Mark as read, archive, delete multiple items
- **Search functionality**: Full-text search across all content
- **Custom inboxes**: Create custom inbox views with specific filters
- **Analytics**: Inbox statistics and trends

#### Inbox Types
1. **Universal Inbox**: All platforms combined
2. **Platform-specific**: Individual platform inboxes
3. **Category-based**: Filtered by content type or category
4. **Custom**: User-defined filters and criteria

### 4. Connector Factory (`connector-factory.ts`)

#### Features
- **Dynamic connector creation**: Create connectors for any supported platform
- **Connection management**: Track connection status and health
- **Platform capabilities**: Query platform-specific features
- **Usage statistics**: Monitor API usage and performance

## Implementation Details

### 1. Authentication Flow

Each platform connector implements OAuth 2.0 authentication:

```typescript
// Example authentication flow
const connector = new LinkedInConnector(config)
const authResult = await connector.authenticate({
  clientId: 'your_client_id',
  clientSecret: 'your_client_secret',
  redirectUri: 'https://yourapp.com/callback',
  authorizationCode: 'auth_code_from_callback'
})
```

### 2. Content Posting

Unified content posting across platforms:

```typescript
// Post to single platform
const result = await connector.postContent({
  text: 'Hello world!',
  media: [{
    type: 'image',
    url: 'https://example.com/image.jpg',
    altText: 'Description'
  }],
  hashtags: ['#socialmedia', '#ai'],
  visibility: 'public'
})

// Post to multiple platforms
const results = await socialMediaAPI.postToMultiplePlatforms(
  ['linkedin', 'twitter', 'facebook'],
  content
)
```

### 3. Analytics Integration

Unified analytics across platforms:

```typescript
// Get analytics for specific platform
const analytics = await connector.getAnalytics({
  start: new Date('2024-01-01'),
  end: new Date('2024-01-31'),
  granularity: 'day'
})

// Get unified analytics across all platforms
const unifiedAnalytics = await socialMediaAPI.getUnifiedAnalytics(timeframe)
```

### 4. Inbox Management

```typescript
// Add item to inbox
const item = await universalInboxManager.addItem({
  type: 'message',
  platform: 'linkedin',
  data: messageData,
  priority: 'high',
  isRead: false,
  isImportant: true,
  tags: ['urgent', 'client']
})

// Search inbox
const results = await universalInboxManager.searchItems({
  query: 'urgent',
  platforms: ['linkedin', 'twitter'],
  types: ['message', 'notification'],
  filters: [{
    field: 'priority',
    operator: 'in',
    value: ['high', 'urgent'],
    isActive: true
  }]
})
```

## UI Components

### 1. Social Media Connector Manager (`social-media-connector-manager.tsx`)

**Features**:
- Platform connection management
- Credential configuration
- Connection status monitoring
- Cross-platform posting interface
- Analytics dashboard
- Post scheduling

**Tabs**:
- **Connect Platforms**: Manage platform connections
- **Cross-Platform Posting**: Post to multiple platforms
- **Analytics**: View unified analytics
- **Scheduling**: Schedule posts for later

### 2. Universal Inbox (`universal-inbox.tsx`)

**Features**:
- Multi-platform message aggregation
- Advanced filtering and search
- Bulk operations
- Real-time updates
- Custom inbox views
- Detailed item views

**Layout**:
- **Sidebar**: Inbox list and statistics
- **Main Area**: Item list with filtering
- **Detail Panel**: Individual item details

## Configuration

### 1. Platform Configuration

Each platform requires specific configuration:

```typescript
// LinkedIn configuration
const linkedinConfig = {
  platform: 'linkedin',
  scopes: ['r_liteprofile', 'r_emailaddress', 'w_member_social'],
  companyId: 'your_company_id', // Optional
  organizationId: 'your_org_id' // Optional
}

// Twitter configuration
const twitterConfig = {
  platform: 'twitter',
  bearerToken: 'your_bearer_token',
  apiKey: 'your_api_key',
  apiSecret: 'your_api_secret'
}

// Facebook configuration
const facebookConfig = {
  platform: 'facebook',
  appId: 'your_app_id',
  appSecret: 'your_app_secret',
  pageId: 'your_page_id',
  instagramAccountId: 'your_instagram_id'
}
```

### 2. Inbox Configuration

```typescript
// Create custom inbox
const customInbox = universalInboxManager.createInbox({
  name: 'Client Communications',
  description: 'All client-related messages and notifications',
  type: 'custom',
  platforms: ['linkedin', 'email'],
  filters: [
    {
      field: 'tags',
      operator: 'contains',
      value: 'client',
      isActive: true
    }
  ],
  sortBy: 'date',
  sortOrder: 'desc',
  isActive: true,
  settings: {
    autoMarkAsRead: false,
    showNotifications: true,
    groupByPlatform: true,
    showEngagementMetrics: true
  }
})
```

## API Endpoints

### 1. Connector Management

```typescript
// Connect to platform
POST /api/social-media/connect
{
  "platform": "linkedin",
  "credentials": {
    "clientId": "string",
    "clientSecret": "string",
    "redirectUri": "string"
  }
}

// Disconnect from platform
DELETE /api/social-media/disconnect/{platform}

// Get connection status
GET /api/social-media/status
```

### 2. Content Management

```typescript
// Post content
POST /api/social-media/post
{
  "platforms": ["linkedin", "twitter"],
  "content": {
    "text": "string",
    "media": [],
    "hashtags": [],
    "visibility": "public"
  }
}

// Schedule post
POST /api/social-media/schedule
{
  "platforms": ["linkedin"],
  "content": {...},
  "scheduleTime": "2024-01-01T10:00:00Z"
}
```

### 3. Analytics

```typescript
// Get platform analytics
GET /api/social-media/analytics/{platform}?start=2024-01-01&end=2024-01-31

// Get unified analytics
GET /api/social-media/analytics/unified?start=2024-01-01&end=2024-01-31
```

### 4. Inbox Management

```typescript
// Get inbox items
GET /api/social-media/inbox/{inboxId}?limit=50&offset=0

// Search inbox
POST /api/social-media/inbox/search
{
  "query": "string",
  "platforms": ["linkedin"],
  "filters": [...],
  "sortBy": "date",
  "sortOrder": "desc"
}

// Mark as read
PUT /api/social-media/inbox/items/{itemId}/read

// Bulk operations
POST /api/social-media/inbox/bulk
{
  "action": "mark-read",
  "itemIds": ["id1", "id2"]
}
```

## Security Considerations

### 1. Credential Management
- All credentials are encrypted at rest
- Tokens are stored securely with expiration handling
- Regular token refresh for long-lived sessions

### 2. Rate Limiting
- Platform-specific rate limit handling
- Exponential backoff for failed requests
- Request queuing during rate limit periods

### 3. Data Privacy
- GDPR compliance for user data
- Platform-specific privacy settings
- Data retention policies

## Monitoring and Analytics

### 1. Connection Health
- Real-time connection status monitoring
- Automatic reconnection for failed connections
- Health check endpoints

### 2. Performance Metrics
- API response times
- Success/failure rates
- Rate limit utilization
- Error tracking and alerting

### 3. Usage Analytics
- Platform usage statistics
- Feature adoption rates
- User engagement metrics

## Troubleshooting

### 1. Common Issues

#### Authentication Failures
- Check credential validity
- Verify redirect URIs
- Ensure proper scopes are requested

#### Rate Limiting
- Monitor API usage
- Implement proper backoff strategies
- Consider upgrading API tiers

#### Data Sync Issues
- Check connection status
- Verify platform permissions
- Review error logs

### 2. Debug Tools

```typescript
// Enable debug logging
const connector = new LinkedInConnector({
  ...config,
  debug: true
})

// Check connection health
const health = await connector.getHealthStatus()

// Get usage statistics
const stats = await connector.getUsageStats()
```

## Future Enhancements

### 1. Additional Platforms
- TikTok API integration
- YouTube Data API
- Pinterest API
- Reddit API
- Discord API
- Slack API

### 2. Advanced Features
- AI-powered content suggestions
- Automated response system
- Advanced analytics and reporting
- Team collaboration features
- Workflow automation

### 3. Enterprise Features
- Multi-tenant support
- Advanced security controls
- Custom integrations
- White-label options
- Enterprise SSO

## Support and Resources

### 1. Documentation
- Platform-specific API documentation
- Integration examples
- Best practices guide
- Troubleshooting guide

### 2. Community
- GitHub repository
- Discord community
- Stack Overflow tags
- Developer forums

### 3. Support Channels
- Email support
- Live chat
- Video calls
- Documentation portal

This comprehensive social media integration system provides a robust foundation for managing multiple social media platforms with unified data types, advanced inbox management, and extensive API coverage for all major platforms.
