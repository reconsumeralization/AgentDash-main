# AgentDash API Documentation

This document provides comprehensive API documentation for the AgentDash platform.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Social Media APIs](#social-media-apis)
- [Agent Management APIs](#agent-management-apis)
- [Analytics APIs](#analytics-apis)
- [Integration APIs](#integration-apis)
- [Webhook APIs](#webhook-apis)

## Authentication

AgentDash uses JWT-based authentication with Clerk integration.

### Authentication Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Getting an Access Token

```javascript
// Client-side authentication
const { getToken } = useAuth()
const token = await getToken()

// Use in API calls
const response = await fetch('/api/social-media/accounts', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Base URL

All API endpoints are relative to your deployment URL:

- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Standard endpoints**: 100 requests per minute per user
- **Analytics endpoints**: 50 requests per minute per user
- **Webhook endpoints**: 200 requests per minute per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Error Handling

All API errors follow a consistent format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "platform",
      "reason": "Platform must be one of: linkedin, twitter, instagram"
    }
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "requestId": "req_123456789"
}
```

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMITED` | Rate limit exceeded |
| `INTERNAL_ERROR` | Server error |

---

## Social Media APIs

### Accounts

#### Get Social Media Accounts

```http
GET /api/social-media/accounts
```

**Response:**
```json
{
  "accounts": [
    {
      "id": "acc_123",
      "platform": "linkedin",
      "username": "john_doe",
      "displayName": "John Doe",
      "followers": 1500,
      "isConnected": true,
      "lastSync": "2024-01-01T10:00:00Z",
      "permissions": ["read", "write"]
    }
  ]
}
```

#### Connect Social Media Account

```http
POST /api/social-media/accounts/connect
```

**Request:**
```json
{
  "platform": "linkedin",
  "authCode": "auth_code_from_oauth"
}
```

**Response:**
```json
{
  "account": {
    "id": "acc_123",
    "platform": "linkedin",
    "username": "john_doe",
    "displayName": "John Doe",
    "isConnected": true
  }
}
```

#### Disconnect Social Media Account

```http
DELETE /api/social-media/accounts/{accountId}
```

### Posts

#### Create Post

```http
POST /api/social-media/posts
```

**Request:**
```json
{
  "platform": "linkedin",
  "content": {
    "text": "Excited to share our latest product update! #innovation",
    "hashtags": ["innovation", "product"],
    "mentions": ["@linkedin"],
    "media": [
      {
        "type": "image",
        "url": "https://example.com/image.jpg"
      }
    ]
  },
  "scheduledAt": "2024-01-01T15:00:00Z",
  "tribes": ["tech_innovators"]
}
```

**Response:**
```json
{
  "post": {
    "id": "post_123",
    "platform": "linkedin",
    "content": {
      "text": "Excited to share our latest product update! #innovation",
      "hashtags": ["innovation", "product"],
      "mentions": ["@linkedin"]
    },
    "status": "scheduled",
    "scheduledAt": "2024-01-01T15:00:00Z",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

#### Get Posts

```http
GET /api/social-media/posts?platform=linkedin&status=published&limit=20
```

**Query Parameters:**
- `platform`: Filter by platform (linkedin, twitter, instagram)
- `status`: Filter by status (draft, scheduled, published, failed)
- `limit`: Number of posts to return (default: 20, max: 100)
- `offset`: Offset for pagination (default: 0)

#### Update Post

```http
PUT /api/social-media/posts/{postId}
```

**Request:**
```json
{
  "content": {
    "text": "Updated post content"
  },
  "scheduledAt": "2024-01-01T16:00:00Z"
}
```

#### Delete Post

```http
DELETE /api/social-media/posts/{postId}
```

### Analytics

#### Get Post Analytics

```http
GET /api/social-media/analytics/posts/{postId}
```

**Response:**
```json
{
  "analytics": {
    "postId": "post_123",
    "platform": "linkedin",
    "metrics": {
      "impressions": 1250,
      "likes": 45,
      "comments": 12,
      "shares": 8,
      "clicks": 23
    },
    "engagement": {
      "rate": 0.056,
      "total": 65
    },
    "demographics": {
      "ageGroups": {
        "18-24": 0.15,
        "25-34": 0.45,
        "35-44": 0.30,
        "45+": 0.10
      },
      "industries": {
        "Technology": 0.40,
        "Marketing": 0.25,
        "Sales": 0.20,
        "Other": 0.15
      }
    },
    "timeRange": {
      "start": "2024-01-01T15:00:00Z",
      "end": "2024-01-08T15:00:00Z"
    }
  }
}
```

#### Get Account Analytics

```http
GET /api/social-media/analytics/accounts/{accountId}?period=30d
```

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d, 1y)
- `metrics`: Comma-separated list of metrics

---

## Agent Management APIs

### Agents

#### Get Agents

```http
GET /api/agents
```

**Response:**
```json
{
  "agents": [
    {
      "id": "agent_123",
      "name": "LinkedIn Growth Agent",
      "type": "social_media",
      "status": "active",
      "capabilities": ["posting", "analytics", "engagement"],
      "configuration": {
        "platforms": ["linkedin"],
        "postingFrequency": "daily",
        "contentTypes": ["text", "image"]
      },
      "createdAt": "2024-01-01T10:00:00Z",
      "lastActive": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### Create Agent

```http
POST /api/agents
```

**Request:**
```json
{
  "name": "Content Creation Agent",
  "type": "content_creation",
  "configuration": {
    "platforms": ["linkedin", "twitter"],
    "contentTypes": ["text", "image", "video"],
    "postingSchedule": {
      "frequency": "daily",
      "times": ["09:00", "15:00", "18:00"]
    },
    "contentSources": ["rss", "ai_generated", "user_input"]
  }
}
```

#### Update Agent

```http
PUT /api/agents/{agentId}
```

#### Delete Agent

```http
DELETE /api/agents/{agentId}
```

### Agent Actions

#### Execute Agent Action

```http
POST /api/agents/{agentId}/actions
```

**Request:**
```json
{
  "action": "create_post",
  "parameters": {
    "platform": "linkedin",
    "content": "AI-generated post content",
    "scheduledAt": "2024-01-01T15:00:00Z"
  }
}
```

---

## Analytics APIs

### Dashboard Analytics

#### Get Dashboard Overview

```http
GET /api/dashboard/analytics/overview?period=30d
```

**Response:**
```json
{
  "overview": {
    "totalPosts": 245,
    "totalEngagement": 12500,
    "totalFollowers": 8500,
    "growthRate": 0.15,
    "topPerformingPosts": [
      {
        "id": "post_123",
        "platform": "linkedin",
        "content": "Excited to share...",
        "engagement": 450,
        "engagementRate": 0.08
      }
    ],
    "platformBreakdown": {
      "linkedin": {
        "posts": 120,
        "engagement": 8500,
        "followers": 4500
      },
      "twitter": {
        "posts": 125,
        "engagement": 4000,
        "followers": 4000
      }
    }
  }
}
```

#### Get Performance Trends

```http
GET /api/dashboard/analytics/trends?metric=engagement&period=30d&granularity=daily
```

**Query Parameters:**
- `metric`: Metric to track (engagement, followers, posts, reach)
- `period`: Time period (7d, 30d, 90d, 1y)
- `granularity`: Data granularity (hourly, daily, weekly, monthly)

---

## Integration APIs

### Connectors

#### Get Connectors

```http
GET /api/integrations/connectors
```

**Response:**
```json
{
  "connectors": [
    {
      "id": "conn_123",
      "name": "LinkedIn API",
      "type": "social_media",
      "status": "connected",
      "configuration": {
        "clientId": "***",
        "scopes": ["profile", "email", "w_member_social"],
        "lastSync": "2024-01-01T10:00:00Z"
      },
      "capabilities": ["read_profile", "write_posts", "read_analytics"]
    }
  ]
}
```

#### Configure Connector

```http
POST /api/integrations/connectors/{connectorId}/configure
```

**Request:**
```json
{
  "configuration": {
    "clientId": "your_client_id",
    "clientSecret": "your_client_secret",
    "redirectUri": "https://your-app.com/callback",
    "scopes": ["profile", "email", "w_member_social"]
  }
}
```

### Webhooks

#### Create Webhook

```http
POST /api/integrations/webhooks
```

**Request:**
```json
{
  "name": "Post Analytics Webhook",
  "url": "https://your-app.com/webhooks/post-analytics",
  "events": ["post.published", "post.updated"],
  "secret": "webhook_secret_key"
}
```

**Response:**
```json
{
  "webhook": {
    "id": "webhook_123",
    "name": "Post Analytics Webhook",
    "url": "https://your-app.com/webhooks/post-analytics",
    "events": ["post.published", "post.updated"],
    "status": "active",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

#### Get Webhooks

```http
GET /api/integrations/webhooks
```

#### Update Webhook

```http
PUT /api/integrations/webhooks/{webhookId}
```

#### Delete Webhook

```http
DELETE /api/integrations/webhooks/{webhookId}
```

---

## Webhook Events

### Post Events

#### post.published
Triggered when a post is successfully published.

```json
{
  "event": "post.published",
  "timestamp": "2024-01-01T15:00:00Z",
  "data": {
    "postId": "post_123",
    "platform": "linkedin",
    "accountId": "acc_123",
    "content": {
      "text": "Post content"
    },
    "publishedAt": "2024-01-01T15:00:00Z"
  }
}
```

#### post.updated
Triggered when a post is updated.

#### post.deleted
Triggered when a post is deleted.

### Account Events

#### account.connected
Triggered when a social media account is connected.

#### account.disconnected
Triggered when a social media account is disconnected.

#### account.sync_completed
Triggered when account data sync is completed.

### Agent Events

#### agent.created
Triggered when a new agent is created.

#### agent.updated
Triggered when an agent configuration is updated.

#### agent.action_completed
Triggered when an agent action is completed.

---

## SDK Examples

### JavaScript/TypeScript

```javascript
import { AgentDashClient } from '@agentdash/sdk'

const client = new AgentDashClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.agentdash.com'
})

// Create a post
const post = await client.socialMedia.posts.create({
  platform: 'linkedin',
  content: {
    text: 'Hello from AgentDash!',
    hashtags: ['agentdash', 'automation']
  }
})

// Get analytics
const analytics = await client.socialMedia.analytics.getPostAnalytics(post.id)
```

### Python

```python
from agentdash import AgentDashClient

client = AgentDashClient(
    api_key='your_api_key',
    base_url='https://api.agentdash.com'
)

# Create a post
post = client.social_media.posts.create(
    platform='linkedin',
    content={
        'text': 'Hello from AgentDash!',
        'hashtags': ['agentdash', 'automation']
    }
)

# Get analytics
analytics = client.social_media.analytics.get_post_analytics(post.id)
```

---

## Testing

### Postman Collection

Import our Postman collection for easy API testing:

[Download Postman Collection](https://docs.agentdash.com/postman/AgentDash-API.postman_collection.json)

### cURL Examples

#### Create a LinkedIn Post

```bash
curl -X POST https://api.agentdash.com/api/social-media/posts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "linkedin",
    "content": {
      "text": "Excited to share our latest update! #innovation",
      "hashtags": ["innovation", "product"]
    }
  }'
```

#### Get Post Analytics

```bash
curl -X GET https://api.agentdash.com/api/social-media/analytics/posts/POST_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Support

### Documentation
- [Getting Started Guide](getting-started.md)
- [Component Library](components.md)
- [Integration Guide](integration.md)

### Community
- [GitHub Issues](https://github.com/agentdash/agentdash/issues)
- [Discord Community](https://discord.gg/agentdash)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/agentdash)

### Professional Support
For enterprise support and custom integrations:
- **Email**: api-support@agentdash.com
- **Phone**: +1 (555) 123-4567
- **Hours**: Monday-Friday, 9 AM - 6 PM PST

---

**Last Updated**: 2024-01-01
**API Version**: v1.0.0
**SDK Version**: v1.2.0
