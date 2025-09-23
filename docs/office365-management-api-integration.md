# Office 365 Management API Integration Guide

This guide covers the complete integration of Office 365 Management API functionality into the AgentDash codebase, based on the official [Office 365 Management APIs overview](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-apis-overview).

## 📚 Table of Contents

- [Overview](#overview)
- [API Components](#api-components)
- [Authentication](#authentication)
- [Service Communications API](#service-communications-api)
- [Management Activity API](#management-activity-api)
- [Implementation](#implementation)
- [Usage Examples](#usage-examples)
- [React Hooks](#react-hooks)
- [Type Definitions](#type-definitions)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)

## 🎯 Overview

The Office 365 Management API integration provides comprehensive access to Office 365 service communications and activity monitoring with full TypeScript support, React hooks, and utility functions. This implementation is based on the official Microsoft documentation and includes:

- **Service Communications API** - Monitor service health and communications
- **Management Activity API** - Access user, admin, system, and policy activity logs
- **Complete Type Definitions** - Full TypeScript support for all API objects
- **React Hooks** - Easy-to-use hooks for API management
- **Utility Functions** - Helper functions for common operations
- **Error Handling** - Comprehensive error handling and retry logic
- **Analytics** - Built-in analytics and reporting capabilities

## 🔧 API Components

Based on the [Office 365 Management APIs overview](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-apis-overview), the integration includes:

### 1. Service Communications API (Preview)
- **Purpose**: Provides service health information to tenant administrators and partners
- **Features**: Cohesive platform experience with REST APIs built consistently
- **Data**: Service health status, incident information, and communications

### 2. Management Activity API
- **Purpose**: Provides information about user, admin, system, and policy actions and events
- **Features**: Activity logs from Office 365 and Microsoft Entra
- **Data**: Audit logs, compliance data, and security events

## 🔐 Authentication

The Office 365 Management APIs use OAuth 2.0 with client credentials flow:

### Configuration

```typescript
import { Office365ManagementApi } from '@/lib/office365-management-api'

const config = {
  tenantId: 'your-tenant-id',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
}

const api = new Office365ManagementApi(config)
```

### Authentication Flow

```typescript
// Automatic authentication with token caching
const api = new Office365ManagementApi(config)
await api.authenticate() // Token is cached and automatically refreshed
```

## 📡 Service Communications API

### Get Service Health Status

```typescript
// Get current service health status
const healthStatus = await api.getServiceHealthStatus()

// Get health status for specific service
const exchangeHealth = await api.getServiceHealthStatusForService('Exchange')

// Get service health history
const history = await api.getServiceHealthHistory({
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})
```

### Service Health Data Structure

```typescript
interface ServiceHealthStatus {
  id: string
  title: string
  status: 'ServiceOperational' | 'ServiceDegradation' | 'ServiceInterruption' | 'ServiceRestored'
  impactDescription: string
  affectedServices: string[]
  lastUpdatedTime: string
  startTime?: string
  endTime?: string
  isResolved: boolean
  incidentType: 'Advisory' | 'Incident'
  classification: 'Advisory' | 'Incident'
  featureGroup: string
  featureName: string
}
```

## 📊 Management Activity API

### Get Activity Records

```typescript
// Get all activity records
const records = await api.getActivityRecords('Audit.General', {
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z',
  top: 100
})

// Get activity by workload
const exchangeActivity = await api.getActivityRecordsByWorkload(WorkloadType.EXCHANGE, {
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})

// Get activity by record type
const adminActivity = await api.getActivityRecordsByType(ActivityRecordType.AZURE_ACTIVE_DIRECTORY, {
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})
```

### Activity Record Data Structure

```typescript
interface ActivityRecord {
  CreationTime: string
  Id: string
  Operation: string
  OrganizationId: string
  RecordType: number
  ResultStatus: string
  UserKey: string
  UserType: number
  Version: number
  Workload: string
  ClientIP: string
  ObjectId: string
  UserId: string
  AzureActiveDirectoryEventType: number
  ExtendedProperties: Array<{
    Name: string
    Value: string
  }>
  ModifiedProperties: Array<{
    Name: string
    NewValue: string
    OldValue: string
  }>
  Actor: Array<{
    ID: string
    Type: string
  }>
  ActorContextId: string
  ActorIpAddress: string
  InterSystemsId: string
  IntraSystemsId: string
  SupportTicketId: string
  Target: Array<{
    ID: string
    Type: string
  }>
  TargetUpdatedProperties: Array<{
    Name: string
    NewValue: string
    OldValue: string
  }>
}
```

## 🏗️ Implementation

### Core API Client

```typescript
import { Office365ManagementApi } from '@/lib/office365-management-api'

const api = new Office365ManagementApi({
  tenantId: 'your-tenant-id',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
})

// Service Communications
const healthStatus = await api.getServiceHealthStatus()
const history = await api.getServiceHealthHistory()

// Management Activity
const records = await api.getActivityRecords('Audit.General')
const summary = await api.getActivitySummary()
```

### Advanced Operations

```typescript
// Get user-specific activity
const userActivity = await api.getUserActivity('user@domain.com', {
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})

// Get admin activity
const adminActivity = await api.getAdminActivity({
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})

// Get failed operations
const failedOps = await api.getFailedOperations({
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})

// Get operations by IP address
const ipActivity = await api.getOperationsByIP('192.168.1.100', {
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})
```

## 📖 Usage Examples

### Basic Service Health Monitoring

```typescript
import { useOffice365ManagementApi } from '@/lib/office365-management-api'

function ServiceHealthComponent() {
  const { getServiceHealthStatus, loading, error } = useOffice365ManagementApi({
    tenantId: 'your-tenant-id',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
  })

  const [healthStatus, setHealthStatus] = useState([])

  useEffect(() => {
    const fetchHealthStatus = async () => {
      const status = await getServiceHealthStatus()
      if (status) setHealthStatus(status)
    }
    fetchHealthStatus()
  }, [getServiceHealthStatus])

  if (loading) return <div>Loading service health...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {healthStatus.map(service => (
        <div key={service.id}>
          <h3>{service.title}</h3>
          <p>Status: {service.status}</p>
          <p>{service.impactDescription}</p>
        </div>
      ))}
    </div>
  )
}
```

### Activity Monitoring Dashboard

```typescript
function ActivityDashboard() {
  const { 
    getActivitySummary, 
    getActivityRecordsByWorkload,
    loading, 
    error 
  } = useOffice365ManagementApi(config)

  const [summary, setSummary] = useState(null)
  const [records, setRecords] = useState([])

  const handleGetSummary = async () => {
    const result = await getActivitySummary({
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2024-01-31T23:59:59Z'
    })
    if (result) setSummary(result)
  }

  const handleGetExchangeActivity = async () => {
    const result = await getActivityRecordsByWorkload(WorkloadType.EXCHANGE, {
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2024-01-31T23:59:59Z',
      top: 100
    })
    if (result) setRecords(result)
  }

  return (
    <div>
      <button onClick={handleGetSummary}>Get Activity Summary</button>
      <button onClick={handleGetExchangeActivity}>Get Exchange Activity</button>
      
      {summary && (
        <div>
          <h3>Activity Summary</h3>
          <p>Total Records: {summary.totalRecords}</p>
          <p>Success Rate: {summary.successRate.toFixed(1)}%</p>
          <p>Workloads: {Object.keys(summary.byWorkload).length}</p>
        </div>
      )}
      
      {records.length > 0 && (
        <div>
          <h3>Recent Activity ({records.length})</h3>
          {records.map(record => (
            <div key={record.Id}>
              <p>{record.Operation} - {record.UserId}</p>
              <p>Status: {record.ResultStatus}</p>
              <p>Time: {new Date(record.CreationTime).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

## 🎣 React Hooks

### useOffice365ManagementApi

The main hook for Office 365 Management API operations:

```typescript
const {
  api,                    // API client instance
  loading,                // Loading state
  error,                  // Error state
  initializeApi,          // Initialize API with config
  // Service Communications
  getServiceHealthStatus,
  getServiceHealthStatusForService,
  getServiceHealthHistory,
  // Management Activity
  getActivityRecords,
  getActivityRecordsByWorkload,
  getActivityRecordsByType,
  getUserActivity,
  getAdminActivity,
  getFailedOperations,
  getActivitySummary,
  // Subscriptions
  getSubscriptions,
  createSubscription,
  stopSubscription
} = useOffice365ManagementApi(config)
```

### Hook Usage Examples

```typescript
function Office365Dashboard() {
  const { 
    getServiceHealthStatus,
    getActivitySummary,
    loading,
    error 
  } = useOffice365ManagementApi({
    tenantId: 'your-tenant-id',
    clientId: 'your-client-id',
    clientSecret: 'your-client-secret'
  })

  const [healthStatus, setHealthStatus] = useState([])
  const [summary, setSummary] = useState(null)

  const handleRefresh = async () => {
    const [health, activitySummary] = await Promise.all([
      getServiceHealthStatus(),
      getActivitySummary()
    ])
    
    if (health) setHealthStatus(health)
    if (activitySummary) setSummary(activitySummary)
  }

  return (
    <div>
      <button onClick={handleRefresh} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Data'}
      </button>
      
      {error && <div>Error: {error.message}</div>}
      
      {/* Render health status and activity summary */}
    </div>
  )
}
```

## 🏷️ Type Definitions

### Core Configuration Types

```typescript
interface Office365Config {
  tenantId: string
  clientId: string
  clientSecret: string
  baseUrl?: string
}

interface Office365TokenResponse {
  token_type: string
  expires_in: number
  access_token: string
  scope: string
}
```

### Service Communications Types

```typescript
interface ServiceHealthStatus {
  id: string
  title: string
  status: 'ServiceOperational' | 'ServiceDegradation' | 'ServiceInterruption' | 'ServiceRestored'
  impactDescription: string
  affectedServices: string[]
  lastUpdatedTime: string
  startTime?: string
  endTime?: string
  isResolved: boolean
  incidentType: 'Advisory' | 'Incident'
  classification: 'Advisory' | 'Incident'
  featureGroup: string
  featureName: string
}
```

### Management Activity Types

```typescript
enum ActivityRecordType {
  AZURE_ACTIVE_DIRECTORY = 0,
  EXCHANGE_ADMIN = 1,
  EXCHANGE_MAILBOX = 2,
  SHAREPOINT = 3,
  GENERAL = 4,
  DLP = 5,
  // ... more record types
}

enum WorkloadType {
  EXCHANGE = 'Exchange',
  SHAREPOINT = 'SharePoint',
  AZURE_ACTIVE_DIRECTORY = 'AzureActiveDirectory',
  GENERAL = 'General',
  DLP = 'DLP',
  POWER_BI = 'PowerBI',
  MICROSOFT_TEAMS = 'MicrosoftTeams',
  // ... more workload types
}
```

### Filter and Pagination Types

```typescript
interface DateRange {
  startTime: string
  endTime: string
}

interface PaginationOptions {
  skip?: number
  top?: number
}

interface FilterOptions {
  contentType?: string
  startTime?: string
  endTime?: string
  recordType?: ActivityRecordType
  workload?: WorkloadType
}
```

## ✅ Best Practices

### 1. Authentication Management

Always use the built-in authentication with token caching:

```typescript
// ✅ Good - Automatic token management
const api = new Office365ManagementApi(config)
await api.getServiceHealthStatus() // Token is automatically managed

// ❌ Bad - Manual token management
const token = await getToken()
const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
```

### 2. Error Handling

Implement proper error handling for API calls:

```typescript
// ✅ Good
try {
  const healthStatus = await api.getServiceHealthStatus()
  // Handle success
} catch (error) {
  if (error.message.includes('401')) {
    // Handle authentication error
  } else if (error.message.includes('403')) {
    // Handle permission error
  } else {
    // Handle other errors
  }
}
```

### 3. Date Range Filtering

Use appropriate date ranges for activity queries:

```typescript
// ✅ Good - Reasonable date range
const records = await api.getActivityRecords('Audit.General', {
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z',
  top: 100
})

// ❌ Bad - Too broad date range
const records = await api.getActivityRecords('Audit.General', {
  startTime: '2020-01-01T00:00:00Z',
  endTime: '2024-12-31T23:59:59Z'
})
```

### 4. Pagination

Use pagination for large datasets:

```typescript
// ✅ Good - Use pagination
const records = await api.getActivityRecords('Audit.General', {
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z',
  top: 100,
  skip: 0
})

// ❌ Bad - No pagination for large datasets
const records = await api.getActivityRecords('Audit.General', {
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})
```

### 5. Caching

Implement caching for frequently accessed data:

```typescript
// ✅ Good - Cache service health status
const [healthStatus, setHealthStatus] = useState([])
const [lastFetch, setLastFetch] = useState(null)

const fetchHealthStatus = async () => {
  const now = Date.now()
  if (lastFetch && (now - lastFetch) < 300000) { // 5 minutes
    return // Use cached data
  }
  
  const status = await getServiceHealthStatus()
  if (status) {
    setHealthStatus(status)
    setLastFetch(now)
  }
}
```

## 🚨 Error Handling

### Common Error Scenarios

1. **Authentication Errors (401)**
   - Invalid or expired credentials
   - Missing or invalid tenant ID

2. **Permission Errors (403)**
   - Insufficient permissions for the API
   - Tenant not authorized for the API

3. **Rate Limiting (429)**
   - Too many API requests
   - Implement exponential backoff

4. **Service Unavailable (503)**
   - Office 365 service temporarily unavailable
   - Implement retry logic

### Error Handling Implementation

```typescript
import { useOffice365ManagementApi } from '@/lib/office365-management-api'

function Office365Component() {
  const { getServiceHealthStatus, loading, error } = useOffice365ManagementApi(config)

  const handleRetry = () => {
    getServiceHealthStatus()
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Data</h3>
        <p>{error.message}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    )
  }

  // ... rest of component
}
```

## 🔧 Advanced Features

### Webhook Subscriptions

Manage webhook subscriptions for real-time notifications:

```typescript
// Create subscription
const subscription = await api.createSubscription({
  contentType: 'Audit.General',
  webhook: {
    address: 'https://your-webhook-url.com/webhook',
    authId: 'your-auth-id',
    expiration: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }
})

// Get subscriptions
const subscriptions = await api.getSubscriptions()

// Stop subscription
await api.stopSubscription('Audit.General')
```

### Analytics and Reporting

Get insights from activity data:

```typescript
// Get activity summary
const summary = await api.getActivitySummary({
  startTime: '2024-01-01T00:00:00Z',
  endTime: '2024-01-31T23:59:59Z'
})

console.log('Total Records:', summary.totalRecords)
console.log('Success Rate:', summary.successRate)
console.log('Top Workloads:', summary.byWorkload)
console.log('Top Operations:', summary.byOperation)
console.log('Top Users:', summary.byUser)
console.log('Top IPs:', summary.byIP)
```

### Utility Functions

Use utility functions for common operations:

```typescript
import { Office365Utils } from '@/lib/office365-management-api'

// Format activity record
const formatted = Office365Utils.formatActivityRecord(record)

// Get workload display name
const displayName = Office365Utils.getWorkloadDisplayName('Exchange')

// Get record type display name
const typeName = Office365Utils.getRecordTypeDisplayName(ActivityRecordType.EXCHANGE_ADMIN)

// Get service status color
const color = Office365Utils.getServiceStatusColor('ServiceOperational')
```

## 📊 Demo Component

A complete demo component is available at `components/office365-management-demo.tsx` that demonstrates:

- Service health monitoring
- Activity record retrieval
- Analytics and reporting
- Webhook subscription management
- Error handling
- Real-time data updates

## 🔗 Related Documentation

- [Office 365 Management APIs Overview](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-apis-overview)
- [Office 365 Service Communications API](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-service-communications-api-reference)
- [Office 365 Management Activity API](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-reference)
- [Office 365 Management Activity API Schema](https://learn.microsoft.com/en-us/office/office-365-management-api/office-365-management-activity-api-schema)
- [React Hooks Guide](./hooks-and-providers-guide.md)

This integration provides a complete, type-safe, and production-ready solution for working with Office 365 Management APIs in your React applications, fully aligned with the official Microsoft documentation you referenced!
