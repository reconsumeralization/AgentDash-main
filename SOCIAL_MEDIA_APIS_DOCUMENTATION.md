# Social Media APIs Integration Documentation

## Overview

This document provides comprehensive information about integrating major social media platform APIs into AgentDash's social media management system. Each platform has unique authentication methods, endpoints, and rate limits that need to be considered for proper integration.

## Table of Contents

1. [LinkedIn API](#linkedin-api)
2. [Twitter/X API](#twitterx-api)
3. [Facebook Graph API](#facebook-graph-api)
4. [Instagram Graph API](#instagram-graph-api)
5. [TikTok API](#tiktok-api)
6. [YouTube Data API](#youtube-data-api)
7. [Pinterest API](#pinterest-api)
8. [Reddit API](#reddit-api)
9. [Integration Architecture](#integration-architecture)
10. [Security & Compliance](#security--compliance)

---

## LinkedIn API

### Overview
LinkedIn's API provides access to professional networking features, content sharing, and company data.

### Authentication
- **Method**: OAuth 2.0
- **Token Lifespan**: 60 days (refreshable)
- **Required Scopes**:
  - `r_liteprofile` - Basic profile information
  - `r_emailaddress` - Email address
  - `w_member_social` - Post content on behalf of member
  - `rw_organization_admin` - Manage organization pages
  - `r_organization_social` - Read organization content

### Key Endpoints

#### Profile Management
```http
GET /v2/people/~?projection=(id,firstName,lastName,profilePicture(displayImage~:playableStreams))
```

#### Content Sharing
```http
POST /v2/shares
Content-Type: application/json

{
  "author": "urn:li:person:{personId}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {
        "text": "Your post content here"
      },
      "shareMediaCategory": "NONE"
    }
  },
  "visibility": {
    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
  }
}
```

#### Company Pages
```http
GET /v2/organizationalEntityAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED
```

### Rate Limits
- **Profile API**: 100 requests per day
- **Share API**: 150 requests per day
- **Company API**: 500 requests per day

### Business Verification
- Requires LinkedIn Marketing Developer Platform approval
- Business verification process can take 2-4 weeks
- Must provide business documentation and use case

---

## Twitter/X API

### Overview
Twitter's API (now X API) provides access to tweets, user data, and real-time streaming capabilities.

### Authentication
- **Method**: OAuth 2.0 Bearer Token / OAuth 1.0a
- **Token Types**:
  - App-only Bearer Token (read-only)
  - User Access Token (read/write)

### Key Endpoints

#### Post Tweet
```http
POST /2/tweets
Content-Type: application/json
Authorization: Bearer {bearer_token}

{
  "text": "Your tweet content here"
}
```

#### Get User Timeline
```http
GET /2/users/{user_id}/tweets?max_results=10&tweet.fields=created_at,public_metrics
```

#### Get User Information
```http
GET /2/users/by/username/{username}?user.fields=public_metrics,verified
```

### Rate Limits (v2 API)
- **Tweet Creation**: 300 requests per 15-minute window
- **User Lookup**: 75 requests per 15-minute window
- **Timeline**: 75 requests per 15-minute window

### API Tiers
- **Free Tier**: Limited functionality, basic endpoints
- **Basic Tier**: $100/month, enhanced features
- **Pro Tier**: $5,000/month, full API access

---

## Facebook Graph API

### Overview
Facebook's Graph API provides access to Facebook Pages, user data, and content management.

### Authentication
- **Method**: OAuth 2.0
- **Token Types**:
  - User Access Token
  - Page Access Token
  - App Access Token

### Key Endpoints

#### Get Page Information
```http
GET /{page-id}?fields=name,fan_count,about,website
```

#### Post to Page
```http
POST /{page-id}/feed
Content-Type: application/json

{
  "message": "Your post content here",
  "access_token": "{page_access_token}"
}
```

#### Get Page Insights
```http
GET /{page-id}/insights?metric=page_impressions,page_reach&period=day
```

### Required Permissions
- `pages_manage_posts` - Post content to pages
- `pages_read_engagement` - Read page insights
- `pages_show_list` - Access user's pages

### Business Verification
- Required for advanced features
- Must verify business identity
- Process can take several days to weeks

---

## Instagram Graph API

### Overview
Instagram's Graph API allows businesses to manage their Instagram presence programmatically.

### Authentication
- **Method**: OAuth 2.0 (via Facebook)
- **Requirements**: Must be connected to Facebook Page
- **Account Types**: Business or Creator accounts only

### Key Endpoints

#### Get User Profile
```http
GET /{instagram-user-id}?fields=id,username,account_type,media_count
```

#### Create Media Container
```http
POST /{instagram-user-id}/media
Content-Type: application/json

{
  "image_url": "https://example.com/image.jpg",
  "caption": "Your caption here",
  "access_token": "{access_token}"
}
```

#### Publish Media
```http
POST /{instagram-user-id}/media_publish
Content-Type: application/json

{
  "creation_id": "{creation_id}",
  "access_token": "{access_token}"
}
```

### Rate Limits
- **Media Creation**: 25 requests per hour
- **Profile Access**: 200 requests per hour
- **Insights**: 200 requests per hour

---

## TikTok API

### Overview
TikTok's API provides access to user data, video management, and analytics.

### Authentication
- **Method**: OAuth 2.0
- **Scopes**:
  - `user.info.basic` - Basic user information
  - `video.list` - Access user's videos
  - `video.publish` - Publish videos

### Key Endpoints

#### Get User Information
```http
GET /user/info/?fields=open_id,union_id,avatar_url,display_name
```

#### Get User Videos
```http
GET /video/list/?fields=id,title,cover_image_url,create_time
```

#### Publish Video
```http
POST /video/publish/
Content-Type: application/json

{
  "video": {
    "title": "Video Title",
    "description": "Video Description",
    "privacy_level": "MUTUAL_FOLLOW_FRIEND",
    "disable_duet": false,
    "disable_comment": false,
    "disable_stitch": false,
    "video_url": "https://example.com/video.mp4"
  }
}
```

### Rate Limits
- **User Info**: 1,000 requests per day
- **Video List**: 1,000 requests per day
- **Video Publish**: 10 requests per day

---

## YouTube Data API

### Overview
YouTube's Data API provides access to video management, channel data, and analytics.

### Authentication
- **Method**: OAuth 2.0 / API Key
- **Scopes**:
  - `https://www.googleapis.com/auth/youtube` - Full access
  - `https://www.googleapis.com/auth/youtube.readonly` - Read-only access

### Key Endpoints

#### Get Channel Information
```http
GET /youtube/v3/channels?part=snippet,statistics&mine=true
```

#### Upload Video
```http
POST /youtube/v3/videos?part=snippet,status
Content-Type: application/json

{
  "snippet": {
    "title": "Video Title",
    "description": "Video Description",
    "tags": ["tag1", "tag2"],
    "categoryId": "22"
  },
  "status": {
    "privacyStatus": "public"
  }
}
```

#### Get Video Analytics
```http
GET /youtube/v3/videos?part=statistics&id={video_id}
```

### Quota Limits
- **Default**: 10,000 units per day
- **Video Upload**: 1,600 units per request
- **Channel Info**: 1 unit per request

---

## Pinterest API

### Overview
Pinterest's API provides access to boards, pins, and user data.

### Authentication
- **Method**: OAuth 2.0
- **Scopes**:
  - `boards:read` - Read boards
  - `boards:write` - Create/update boards
  - `pins:read` - Read pins
  - `pins:write` - Create pins

### Key Endpoints

#### Get User Boards
```http
GET /v5/boards?page_size=25
```

#### Create Pin
```http
POST /v5/pins
Content-Type: application/json

{
  "board_id": "{board_id}",
  "title": "Pin Title",
  "description": "Pin Description",
  "media_source": {
    "source_type": "image_url",
    "url": "https://example.com/image.jpg"
  }
}
```

### Rate Limits
- **Read Operations**: 1,000 requests per hour
- **Write Operations**: 100 requests per hour

---

## Reddit API

### Overview
Reddit's API provides access to posts, comments, and subreddit data.

### Authentication
- **Method**: OAuth 2.0
- **Scopes**:
  - `identity` - Access user identity
  - `submit` - Submit posts and comments
  - `read` - Read posts and comments

### Key Endpoints

#### Get User Information
```http
GET /api/v1/me
```

#### Submit Post
```http
POST /api/submit
Content-Type: application/x-www-form-urlencoded

{
  "sr": "subreddit_name",
  "kind": "text",
  "title": "Post Title",
  "text": "Post content"
}
```

### Rate Limits
- **60 requests per minute** for most endpoints
- **1 request per second** for posting

---

## Integration Architecture

### Connector Pattern
```typescript
interface SocialMediaConnector {
  platform: string
  authenticate(credentials: AuthCredentials): Promise<AuthResult>
  postContent(content: ContentData): Promise<PostResult>
  getAnalytics(timeframe: TimeFrame): Promise<AnalyticsData>
  getUserInfo(): Promise<UserInfo>
  refreshToken(): Promise<TokenResult>
}
```

### Unified API Interface
```typescript
interface SocialMediaAPI {
  // Authentication
  connect(platform: string, credentials: AuthCredentials): Promise<void>
  disconnect(platform: string): Promise<void>
  
  // Content Management
  post(platform: string, content: ContentData): Promise<PostResult>
  schedule(platform: string, content: ContentData, scheduleTime: Date): Promise<void>
  
  // Analytics
  getMetrics(platform: string, timeframe: TimeFrame): Promise<Metrics>
  getEngagement(platform: string, postId: string): Promise<EngagementData>
  
  // User Management
  getProfile(platform: string): Promise<Profile>
  updateProfile(platform: string, updates: ProfileUpdates): Promise<void>
}
```

### Error Handling
```typescript
interface APIError {
  platform: string
  code: string
  message: string
  retryable: boolean
  rateLimitInfo?: {
    limit: number
    remaining: number
    resetTime: Date
  }
}
```

---

## Security & Compliance

### Data Protection
- **Encryption**: All API credentials encrypted at rest
- **Token Management**: Secure token storage and rotation
- **Access Control**: Role-based access to platform connections

### Compliance Requirements
- **GDPR**: User consent for data processing
- **CCPA**: California privacy rights compliance
- **Platform Terms**: Adherence to each platform's terms of service

### Rate Limit Management
- **Exponential Backoff**: Automatic retry with increasing delays
- **Queue System**: Request queuing during rate limit periods
- **Monitoring**: Real-time rate limit tracking and alerts

### Audit Logging
- **API Calls**: Log all API requests and responses
- **User Actions**: Track user interactions with social media features
- **Error Tracking**: Comprehensive error logging and monitoring

---

## Implementation Checklist

### Phase 1: Core Infrastructure
- [ ] Create base connector interface
- [ ] Implement authentication system
- [ ] Set up error handling framework
- [ ] Create rate limit management

### Phase 2: Platform Integration
- [ ] LinkedIn API connector
- [ ] Twitter/X API connector
- [ ] Facebook Graph API connector
- [ ] Instagram Graph API connector

### Phase 3: Extended Platforms
- [ ] TikTok API connector
- [ ] YouTube Data API connector
- [ ] Pinterest API connector
- [ ] Reddit API connector

### Phase 4: Advanced Features
- [ ] Unified posting interface
- [ ] Analytics aggregation
- [ ] Content scheduling
- [ ] Cross-platform campaigns

### Phase 5: Monitoring & Optimization
- [ ] Performance monitoring
- [ ] Usage analytics
- [ ] Cost optimization
- [ ] User feedback integration

---

## Resources

### Official Documentation
- [LinkedIn API Documentation](https://docs.microsoft.com/en-us/linkedin/)
- [Twitter API Documentation](https://developer.twitter.com/en/docs)
- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [TikTok API Documentation](https://developers.tiktok.com/doc)
- [YouTube Data API Documentation](https://developers.google.com/youtube/v3)
- [Pinterest API Documentation](https://developers.pinterest.com/docs/api/v5/)
- [Reddit API Documentation](https://www.reddit.com/dev/api/)

### Development Tools
- [Postman Collections](https://www.postman.com/templates/collections/social-media-api/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
- [API Testing Tools](https://httpie.io/)

### Community Resources
- [Stack Overflow](https://stackoverflow.com/questions/tagged/social-media-api)
- [GitHub Examples](https://github.com/topics/social-media-api)
- [Developer Forums](https://developers.facebook.com/community/)
