# 🔌 Comprehensive API Endpoints Documentation

This document provides a complete overview of all API endpoints built for the AgentDash application, including their HTTP methods, request/response schemas, and usage examples.

## 📋 Table of Contents

1. [Agents API](#agents-api)
2. [Workflows API](#workflows-api)
3. [Integrations API](#integrations-api)
4. [Dashboard Analytics API](#dashboard-analytics-api)
5. [Advanced Search API](#advanced-search-api)
6. [Data Export/Import API](#data-export-import-api)
7. [Data Transformation API](#data-transformation-api)
8. [Notifications API](#notifications-api)
9. [File Management API](#file-management-api)
10. [AI Selection API](#ai-selection-api)
11. [Authentication & Users API](#authentication--users-api)

---

## 🤖 Agents API

### Base URL: `/api/agents/gui`

#### 1. GET - List Agents
```http
GET /api/agents/gui?action=list&userId={userId}
```

**Parameters:**
- `action` (string): "list"
- `userId` (string): User identifier

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "id": "agent-123",
      "name": "Code Review Agent",
      "type": "context",
      "model": "gpt-4o",
      "capabilities": ["code-analysis", "review"],
      "usage_count": 45,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 2. GET - Agent Statistics
```http
GET /api/agents/gui?action=stats&userId={userId}
```

**Response:**
```json
{
  "success": true,
  "stats": [
    {
      "type": "context",
      "count": 5,
      "avg_usage": 23.4,
      "last_active": "2024-01-01T00:00:00Z"
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 3. GET - Agent Performance
```http
GET /api/agents/gui?action=performance&userId={userId}
```

**Response:**
```json
{
  "success": true,
  "performance": {
    "totalExecutions": 1250,
    "avgExecutionTime": 2.3,
    "totalTokens": 45000,
    "successRate": 0.96
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 4. GET - Agent Details
```http
GET /api/agents/gui?action=details&userId={userId}&agentId={agentId}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "agent-123",
    "name": "Code Review Agent",
    "type": "context",
    "system_prompt": "You are a code review expert...",
    "capabilities": ["code-analysis"],
    "executions": [
      {
        "success": true,
        "execution_time": 2.1,
        "tokens_used": 450
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 5. GET - Marketplace Agents
```http
GET /api/agents/gui?action=marketplace
```

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "id": "market-agent-123",
      "name": "Advanced Code Generator",
      "description": "Generates high-quality code...",
      "type": "code-generation",
      "capabilities": ["react", "typescript"],
      "usage_count": 1250,
      "rating": 4.8
    }
  ],
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 6. POST - Create Agent
```http
POST /api/agents/gui
```

**Request Body:**
```json
{
  "action": "create",
  "userId": "user-123",
  "name": "My Custom Agent",
  "type": "context",
  "systemPrompt": "You are a helpful assistant...",
  "capabilities": ["chat", "analysis"],
  "aspirationAlignment": ["career", "skill"]
}
```

**Response:**
```json
{
  "success": true,
  "agent": {
    "id": "agent-new-123",
    "name": "My Custom Agent",
    "type": "context",
    "model": "gpt-4o",
    "usage_count": 0,
    "is_active": true
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 7. POST - Execute Agent
```http
POST /api/agents/gui
```

**Request Body:**
```json
{
  "action": "execute",
  "userId": "user-123",
  "agentId": "agent-123",
  "input": "Please analyze this code for potential improvements...",
  "context": {
    "fileType": "typescript",
    "project": "web-app"
  }
}
```

**Response:**
```json
{
  "success": true,
  "result": "The code looks good but could be optimized...",
  "agent": {
    "id": "agent-123",
    "name": "Code Review Agent"
  },
  "execution": {
    "cost": 0.0023,
    "latency": 1250,
    "confidence": 0.92
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## ⚡ Workflows API

### Base URL: `/api/workflows/gui`

#### 1. GET - List Workflows
```http
GET /api/workflows/gui?action=list&userId={userId}
```

**Response:**
```json
{
  "success": true,
  "workflows": [
    {
      "id": "workflow-123",
      "name": "Data Processing Pipeline",
      "description": "Automated data processing workflow",
      "steps": [...],
      "usage_count": 25,
      "is_template": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1,
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 2. GET - Workflow Statistics
```http
GET /api/workflows/gui?action=stats&userId={userId}
```

#### 3. GET - Workflow Details
```http
GET /api/workflows/gui?action=details&userId={userId}&workflowId={workflowId}
```

#### 4. GET - Workflow Templates
```http
GET /api/workflows/gui?action=templates
```

#### 5. GET - Workflow Executions
```http
GET /api/workflows/gui?action=executions&userId={userId}&workflowId={workflowId}
```

#### 6. POST - Create Workflow
```http
POST /api/workflows/gui
```

**Request Body:**
```json
{
  "action": "create",
  "userId": "user-123",
  "name": "Data Processing Workflow",
  "description": "Automated data processing pipeline",
  "steps": [
    {
      "id": "step-1",
      "type": "data_ingestion",
      "config": { "source": "api", "format": "json" }
    },
    {
      "id": "step-2",
      "type": "transformation",
      "config": { "operation": "filter", "condition": "status == 'active'" }
    }
  ],
  "aspirationFocus": ["project", "skill"],
  "isTemplate": false
}
```

#### 7. POST - Execute Workflow
```http
POST /api/workflows/gui
```

**Request Body:**
```json
{
  "action": "execute",
  "userId": "user-123",
  "workflowId": "workflow-123",
  "input": {
    "data": [...],
    "parameters": { "batch_size": 100 }
  }
}
```

---

## 🔗 Integrations API

### Base URL: `/api/integrations/manage`

#### 1. GET - Health Check
```http
GET /api/integrations/manage?type=health
```

**Response:**
```json
{
  "success": true,
  "health": {
    "github": "healthy",
    "slack": "healthy",
    "openai": "healthy"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 2. GET - Analytics
```http
GET /api/integrations/manage?type=analytics
```

#### 3. POST - Create Integration Instance
```http
POST /api/integrations/manage
```

**Request Body:**
```json
{
  "action": "create_instance",
  "definitionId": "github",
  "name": "GitHub Integration",
  "credentials": {
    "token": "ghp_1234567890abcdef",
    "webhookSecret": "webhook-secret-123"
  },
  "config": {
    "repositories": ["my-repo"],
    "events": ["push", "pull_request"]
  }
}
```

#### 4. POST - Execute Action
```http
POST /api/integrations/manage
```

**Request Body:**
```json
{
  "action": "execute_action",
  "instanceId": "integration-123",
  "action": "get_repository_info",
  "parameters": {
    "owner": "my-org",
    "repo": "my-repo"
  }
}
```

#### 5. POST - Create Workflow
```http
POST /api/integrations/manage
```

**Request Body:**
```json
{
  "action": "create_workflow",
  "name": "GitHub PR Workflow",
  "description": "Handle GitHub PR events",
  "trigger": {
    "integrationId": "github-integration-123",
    "event": "pull_request.opened"
  },
  "actions": [
    {
      "integrationId": "slack-integration-123",
      "action": "send_message",
      "parameters": {
        "channel": "#dev-notifications",
        "text": "New PR opened: {{pull_request.title}}"
      }
    }
  ],
  "enabled": true
}
```

---

## 📊 Dashboard Analytics API

### Base URL: `/api/dashboard/analytics`

#### 1. GET - Overview Metrics
```http
GET /api/dashboard/analytics?userId={userId}&timeframe=7d&metric=overview
```

**Response:**
```json
{
  "success": true,
  "overview": {
    "user": {
      "name": "John Doe",
      "memberSince": "2024-01-01T00:00:00Z",
      "accountAge": 30
    },
    "aspirations": {
      "total": 5,
      "avgProgress": 65.2
    },
    "connections": {
      "total": 23,
      "avgCompatibility": 78.5
    },
    "agents": {
      "total": 3,
      "totalUsage": 145
    },
    "workflows": {
      "total": 7,
      "totalUsage": 89
    },
    "ai": {
      "modelUsage": { "gpt-4": 120, "claude": 89 },
      "totalTokens": 15420,
      "totalCost": 23.45
    }
  },
  "recentActivity": [...],
  "timeframe": { "start": "2024-01-01", "end": "2024-01-08" },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 2. GET - Agent Metrics
```http
GET /api/dashboard/analytics?userId={userId}&timeframe=30d&metric=agents
```

#### 3. GET - Workflow Metrics
```http
GET /api/dashboard/analytics?userId={userId}&timeframe=7d&metric=workflows
```

#### 4. GET - Aspiration Metrics
```http
GET /api/dashboard/analytics?userId={userId}&timeframe=90d&metric=aspirations
```

#### 5. GET - Connection Metrics
```http
GET /api/dashboard/analytics?userId={userId}&timeframe=30d&metric=connections
```

#### 6. GET - AI Usage Metrics
```http
GET /api/dashboard/analytics?userId={userId}&timeframe=7d&metric=ai_usage
```

---

## 🔍 Advanced Search API

### Base URL: `/api/search/advanced`

#### 1. GET - Search All Content
```http
GET /api/search/advanced?q={query}&userId={userId}&type=all&limit=20&offset=0
```

**Response:**
```json
{
  "success": true,
  "query": "machine learning",
  "type": "all",
  "results": [
    {
      "_type": "aspirations",
      "id": "asp-123",
      "title": "Master Machine Learning",
      "category": "skill",
      "priority": "high"
    },
    {
      "_type": "agents",
      "id": "agent-456",
      "name": "ML Analysis Agent",
      "type": "analysis",
      "capabilities": ["ml-analysis"]
    }
  ],
  "total": 45,
  "facets": {
    "categories": { "skill": 12, "project": 8 },
    "types": { "aspirations": 20, "agents": 15, "workflows": 10 }
  },
  "metadata": {
    "limit": 20,
    "offset": 0,
    "executionTime": 150,
    "searchId": "search-123"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

#### 2. GET - Filtered Search
```http
GET /api/search/advanced?q={query}&userId={userId}&type=aspirations&limit=10
```

#### 3. POST - Advanced Filtered Search
```http
POST /api/search/advanced
```

**Request Body:**
```json
{
  "query": "artificial intelligence",
  "userId": "user-123",
  "filters": {
    "categories": ["skill", "project"],
    "priorities": ["high", "critical"],
    "dateRange": {
      "start": "2024-01-01",
      "end": "2024-01-31"
    }
  },
  "sort": {
    "field": "created_at",
    "direction": "desc"
  },
  "facets": ["categories", "priorities", "types"]
}
```

---

## 📤 Data Export/Import API

### Base URL: `/api/data/export`

#### 1. GET - Export User Data
```http
GET /api/data/export?userId={userId}&type=user_data&format=json
```

**Response:** JSON file download with complete user data

#### 2. GET - Export Aspirations
```http
GET /api/data/export?userId={userId}&type=aspirations&format=csv
```

#### 3. GET - Export Connections
```http
GET /api/data/export?userId={userId}&type=connections&format=json
```

#### 4. GET - Export Agents
```http
GET /api/data/export?userId={userId}&type=agents&format=json
```

#### 5. GET - Export Workflows
```http
GET /api/data/export?userId={userId}&type=workflows&format=json
```

#### 6. GET - Export Analytics
```http
GET /api/data/export?userId={userId}&type=analytics&format=json
```

#### 7. POST - Import Aspirations
```http
POST /api/data/export
```

**Request Body:**
```json
{
  "action": "import_aspirations",
  "userId": "user-123",
  "aspirations": [
    {
      "title": "Learn React",
      "description": "Master React development",
      "category": "skill",
      "priority": "high",
      "status": "active",
      "target_date": "2024-12-31"
    }
  ]
}
```

#### 8. POST - Bulk Import
```http
POST /api/data/export
```

**Request Body:**
```json
{
  "action": "bulk_import",
  "userId": "user-123",
  "data": [...],
  "type": "aspirations"
}
```

#### 9. POST - Validate Import Data
```http
POST /api/data/export
```

**Request Body:**
```json
{
  "action": "validate_import",
  "data": [...],
  "type": "aspirations"
}
```

**Response:**
```json
{
  "success": true,
  "validation": {
    "isValid": true,
    "errors": [],
    "warnings": [],
    "summary": {
      "total": 10,
      "valid": 9,
      "invalid": 1
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

---

## 🔄 Data Transformation API

### Base URL: `/api/data/transform`

#### 1. GET - List Pipelines
```http
GET /api/data/transform?action=pipelines
```

#### 2. GET - Get Pipeline
```http
GET /api/data/transform?action=pipeline&pipelineId={pipelineId}
```

#### 3. GET - Execute Pipeline
```http
GET /api/data/transform?action=execute&pipelineId={pipelineId}
```

#### 4. POST - Execute Query
```http
POST /api/data/transform
```

**Request Body:**
```json
{
  "action": "query",
  "queryOptions": {
    "table": "users",
    "select": "id, name, created_at",
    "filters": {
      "created_at": {
        "operator": "gte",
        "value": "2024-01-01"
      }
    },
    "orderBy": { "column": "created_at", "ascending": false },
    "limit": 100
  },
  "format": "json"
}
```

#### 5. POST - Execute Transformation
```http
POST /api/data/transform
```

**Request Body:**
```json
{
  "action": "transform",
  "transformationRule": {
    "id": "user-stats-transform",
    "name": "User Statistics",
    "transformations": [
      {
        "type": "aggregate",
        "config": {
          "totalUsers": "count",
          "avgCreatedDate": "avg"
        }
      }
    ]
  },
  "input": [...]
}
```

#### 6. POST - Create Pipeline
```http
POST /api/data/transform
```

**Request Body:**
```json
{
  "action": "create_pipeline",
  "pipeline": {
    "id": "user-analytics-pipeline",
    "name": "User Analytics Pipeline",
    "description": "Process user data for analytics",
    "steps": [
      {
        "source": { "table": "users" },
        "transformations": [
          { "type": "filter", "config": { "condition": "active == true" } },
          { "type": "aggregate", "config": { "userCount": "count" } }
        ],
        "output": { "format": "json" }
      }
    ],
    "triggers": {
      "schedule": "0 0 * * *",
      "manual": true
    }
  }
}
```

#### 7. POST - Bulk Transform
```http
POST /api/data/transform
```

**Request Body:**
```json
{
  "action": "bulk_transform",
  "transformations": [
    {
      "id": "transform-1",
      "transformations": [
        { "type": "map", "config": { "name": "name.toUpperCase()" } }
      ]
    },
    {
      "id": "transform-2",
      "transformations": [
        { "type": "filter", "config": { "condition": "age > 18" } }
      ]
    }
  ],
  "input": [...]
}
```

---

## 📡 Notifications API

### Base URL: `/api/notifications/realtime`

#### 1. GET - Poll Notifications
```http
GET /api/notifications/realtime?action=poll&userId={userId}&since={timestamp}
```

#### 2. GET - Get Stats
```http
GET /api/notifications/realtime?action=stats&userId={userId}
```

#### 3. GET - Get Unread Count
```http
GET /api/notifications/realtime?action=unread&userId={userId}
```

#### 4. POST - Send Notification
```http
POST /api/notifications/realtime
```

**Request Body:**
```json
{
  "action": "send",
  "userId": "user-123",
  "type": "info",
  "title": "Workflow Completed",
  "message": "Your data processing workflow has finished successfully",
  "data": {
    "workflowId": "workflow-123",
    "executionTime": 45.2,
    "recordsProcessed": 1250
  },
  "priority": "medium"
}
```

#### 5. POST - Mark as Read
```http
POST /api/notifications/realtime
```

**Request Body:**
```json
{
  "action": "mark_read",
  "userId": "user-123",
  "notificationId": "notification-123"
}
```

#### 6. POST - Mark All as Read
```http
POST /api/notifications/realtime
```

**Request Body:**
```json
{
  "action": "mark_all_read",
  "userId": "user-123"
}
```

#### 7. POST - Delete Notification
```http
POST /api/notifications/realtime
```

**Request Body:**
```json
{
  "action": "delete",
  "userId": "user-123",
  "notificationId": "notification-123"
}
```

#### 8. POST - Broadcast Notification
```http
POST /api/notifications/realtime
```

**Request Body:**
```json
{
  "action": "broadcast",
  "type": "announcement",
  "title": "System Maintenance",
  "message": "Scheduled maintenance in 30 minutes",
  "targetUsers": ["user-123", "user-456"],
  "priority": "high"
}
```

---

## 📁 File Management API

### Base URL: `/api/files`

#### 1. POST - Upload File
```http
POST /api/files/upload
```

**Request Body (FormData):**
```
file: [File]
folder: "documents" (optional)
```

#### 2. GET - List Files
```http
GET /api/files/list
```

#### 3. GET - Get File Content
```http
GET /api/files/content?url={fileUrl}
```

#### 4. DELETE - Delete File
```http
DELETE /api/files/delete
```

**Request Body:**
```json
{
  "url": "https://blob-url/file.pdf"
}
```

---

## 🤖 AI Selection API

### Base URL: `/api/ai/select`

#### 1. POST - Select and Execute AI
```http
POST /api/ai/select
```

**Request Body:**
```json
{
  "task": "Analyze this code for performance improvements",
  "requirements": {
    "type": "code-generation",
    "complexity": "medium",
    "contextLength": 2000,
    "speed": "balanced",
    "cost": "balanced"
  },
  "execute": true,
  "specialization": "Code Analysis",
  "name": "Performance Analyzer"
}
```

#### 2. GET - Get Analytics
```http
GET /api/ai/select
```

---

## 📊 Additional APIs

### Document Processing API
- `POST /api/documents/process` - Process documents with AI analysis
- `GET /api/documents/process` - Get supported formats

### Sentiment Analysis API
- `GET /api/sentiment-heatmap` - Get sentiment analysis data

### Transcript Insights API
- `GET /api/transcript-insights` - Get meeting transcript analysis

### Tribes API
- `GET /api/tribes` - Get tribes and communities

---

## 🎯 Error Response Format

All APIs return consistent error responses:

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req-12345"
}
```

## 🔐 Authentication

All API endpoints require proper authentication via:
- JWT tokens in Authorization header
- Supabase session tokens
- API keys for external integrations

## 📈 Rate Limiting

- **Standard endpoints**: 30 requests/minute
- **Resource-intensive endpoints**: 10-15 requests/minute
- **File operations**: 5-10 requests/minute

## 🔄 Response Metadata

All successful responses include:
```json
{
  "success": true,
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "req-12345",
  "executionTime": 125
}
```

This documentation provides a complete reference for all API endpoints, their request/response schemas, and usage patterns.
