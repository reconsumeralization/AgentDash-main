# AgentDash API Documentation

## Overview

AgentDash provides a comprehensive set of APIs for professional networking, file management, and AI agent rentals. All APIs follow RESTful conventions and return JSON responses.

## API Endpoints

### 🔐 Agent Access API

**Endpoint:** `POST /api/agents/access`

Access AI agents through authenticated rental tokens.

#### Request Body
```json
{
  "token": "agent_vision_ai_pro_1234567890abcdef",
  "agentId": "vision-ai-pro",
  "input": "Analyze this image for objects",
  "userAddress": "11111111111111111111111111111112"
}
```

#### Response
```json
{
  "success": true,
  "response": "Vision Analysis Result:\n\nAnalyzed input: \"Analyze this image for objects\"\n\nDetected: Multiple objects with high confidence\nProcessing time: 1.8s\nAccuracy: 98.5%",
  "usage": {
    "requestCount": 48,
    "remainingRequests": 952
  }
}
```

#### Error Responses
- `403`: Invalid token, expired, or usage limit exceeded
- `500`: Agent processing failed

---

### 📁 File Management APIs

#### 1. File Upload
**Endpoint:** `POST /api/files/upload`

Upload files to Vercel Blob storage with optional folder organization.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `file`: The file to upload
- `folder` (optional): Folder path for organization

**Response:**
```json
{
  "url": "https://blob.vercel-storage.com/folder/filename.jpg",
  "filename": "filename.jpg",
  "size": 1024000,
  "type": "image/jpeg",
  "path": "folder/filename.jpg",
  "uploadedAt": "2024-01-15T10:30:00.000Z"
}
```

#### 2. File Listing
**Endpoint:** `GET /api/files/list`

List all files organized by folder structure.

**Response:**
```json
{
  "fileSystem": {
    "root": [
      {
        "url": "https://blob.vercel-storage.com/file1.txt",
        "pathname": "file1.txt",
        "filename": "file1.txt",
        "folder": "root",
        "type": "document",
        "size": 1024,
        "uploadedAt": "2024-01-15T10:00:00.000Z"
      }
    ],
    "documents": [
      {
        "url": "https://blob.vercel-storage.com/documents/report.pdf",
        "pathname": "documents/report.pdf",
        "filename": "report.pdf",
        "folder": "documents",
        "type": "office",
        "size": 2048000,
        "uploadedAt": "2024-01-15T09:30:00.000Z"
      }
    ]
  }
}
```

#### 3. File Content Access
**Endpoint:** `GET /api/files/content?url={blob_url}`

Fetch file content from blob URL.

**Response:**
```json
{
  "content": "File content as string"
}
```

**Endpoint:** `PUT /api/files/content`

Update file content (currently returns success - re-upload would be needed for actual update).

**Request Body:**
```json
{
  "url": "https://blob.vercel-storage.com/file.txt",
  "content": "Updated file content"
}
```

#### 4. File Deletion
**Endpoint:** `DELETE /api/files/delete`

Delete files from Vercel Blob storage.

**Request Body:**
```json
{
  "url": "https://blob.vercel-storage.com/file-to-delete.txt"
}
```

---

### 🤖 Rental Management APIs

#### 1. Create Rental
**Endpoint:** `POST /api/rentals/create`

Create a new AI agent rental with Solana blockchain payment.

**Request Body:**
```json
{
  "agentId": "vision-ai-pro",
  "agentName": "Vision AI Pro",
  "renterAddress": "11111111111111111111111111111112",
  "duration": "1d",
  "cost": 0.8,
  "transactionSignature": "5KJp7z8X9Y2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H"
}
```

**Response:**
```json
{
  "success": true,
  "rental": {
    "id": "rental_1705312800000",
    "agentId": "vision-ai-pro",
    "agentName": "Vision AI Pro",
    "renterAddress": "11111111111111111111111111111112",
    "duration": "1d",
    "cost": 0.8,
    "startTime": "2024-01-15T10:00:00.000Z",
    "endTime": "2024-01-16T10:00:00.000Z",
    "status": "active",
    "accessToken": "agent_abc123def456_1705312800000",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

#### 2. Extend Rental
**Endpoint:** `POST /api/rentals/extend`

Extend an existing rental period with additional payment.

**Request Body:**
```json
{
  "rentalId": "rental_1705312800000",
  "additionalDuration": "1d",
  "additionalCost": 0.8,
  "transactionSignature": "6LKq8a9Z0B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H"
}
```

**Response:**
```json
{
  "success": true,
  "rental": {
    "id": "rental_1705312800000",
    "extendedAt": "2024-01-15T10:00:00.000Z",
    "additionalDuration": "1d",
    "additionalCost": 0.8,
    "newEndTime": "2024-01-17T10:00:00.000Z",
    "extensionTransaction": "6LKq8a9Z0B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H"
  }
}
```

#### 3. List Rentals
**Endpoint:** `GET /api/rentals/list?userAddress={solana_address}`

Get all active rentals for a user.

**Response:**
```json
{
  "success": true,
  "rentals": [
    {
      "id": "rental-1",
      "agentId": "vision-ai-pro",
      "agentName": "Vision AI Pro",
      "renterAddress": "11111111111111111111111111111112",
      "ownerAddress": "11111111111111111111111111111112",
      "startTime": "2024-01-15T08:00:00.000Z",
      "endTime": "2024-01-16T08:00:00.000Z",
      "duration": "1d",
      "cost": 0.8,
      "status": "active",
      "transactionSignature": "5KJp7z8X9Y2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4G5H",
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "usageStats": {
        "requests": 47,
        "responseTime": 1.8,
        "uptime": 99.9
      }
    }
  ]
}
```

## API Features

### 🔐 Authentication & Security
- **Agent Access**: Token-based authentication with usage limits
- **Blockchain Verification**: Solana transaction signature validation for rentals
- **Rate Limiting**: Built-in protection against abuse (to be implemented)

### 📊 Data Management
- **File Storage**: Vercel Blob integration for scalable file management
- **Rental Tracking**: Complete lifecycle management of AI agent rentals
- **Usage Analytics**: Request counting and performance metrics

### 🚀 Performance
- **Async Processing**: Non-blocking API calls with proper error handling
- **Efficient Storage**: Cloud-based file storage with CDN delivery
- **Real-time Updates**: Live usage statistics and rental status

## Error Handling

All APIs return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (missing/invalid parameters)
- `403`: Forbidden (authentication/authorization failed)
- `500`: Internal Server Error

## Rate Limiting

APIs include built-in rate limiting (to be fully implemented):
- Agent Access: 100 requests per minute per token
- File Operations: 50 operations per minute per user
- Rental Operations: 20 operations per hour per user

## Future Enhancements

### 🔄 Database Integration
- Replace mock data with PostgreSQL/MongoDB
- Implement proper user sessions and authentication
- Add comprehensive audit logging

### 🔒 Security Improvements
- JWT token implementation
- API key management
- CORS configuration
- Input sanitization and validation

### 📈 Analytics & Monitoring
- Request/response logging
- Performance monitoring
- Error tracking and alerting
- Usage analytics dashboard

### 🔗 Integration APIs
- Webhook support for external integrations
- GraphQL API for complex queries
- Real-time WebSocket connections
- OAuth integration for third-party services

## Development Notes

### Environment Variables Required
```env
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
DATABASE_URL=your_database_connection_string
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
JWT_SECRET=your_jwt_secret
```

### Testing
APIs include mock data for development. Replace with real implementations for production.

### Deployment
APIs are designed for Vercel deployment with automatic scaling and global CDN distribution.
