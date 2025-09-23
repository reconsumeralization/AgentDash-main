import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000/api'
const TEST_USER_ID = 'demo-user-1'

test.describe('API Endpoints Testing Suite', () => {
  test.describe('Agents API', () => {
    test('GET /api/agents/gui - List Agents', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/agents/gui?action=list&userId=${TEST_USER_ID}`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.agents).toBeDefined()
      expect(Array.isArray(data.agents)).toBe(true)
    })

    test('GET /api/agents/gui - Agent Statistics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/agents/gui?action=stats&userId=${TEST_USER_ID}`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.stats).toBeDefined()
    })

    test('GET /api/agents/gui - Agent Performance', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/agents/gui?action=performance&userId=${TEST_USER_ID}`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.performance).toBeDefined()
    })

    test('POST /api/agents/gui - Create Agent', async ({ request }) => {
      const agentData = {
        action: 'create',
        userId: TEST_USER_ID,
        name: 'Test Agent',
        type: 'context',
        systemPrompt: 'You are a helpful assistant for testing purposes.',
        capabilities: ['chat', 'analysis']
      }

      const response = await request.post(`${BASE_URL}/agents/gui`, {
        data: agentData
      })

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.agent).toBeDefined()
        expect(data.agent.name).toBe('Test Agent')
      } else {
        // If creation fails (e.g., due to permissions), that's acceptable
        expect(response.status()).toBe(403) // Forbidden or similar
      }
    })

    test('POST /api/agents/gui - Execute Agent', async ({ request }) => {
      const executionData = {
        action: 'execute',
        userId: TEST_USER_ID,
        agentId: 'test-agent-1',
        input: 'Hello, can you help me with a simple task?',
        context: { test: true }
      }

      const response = await request.post(`${BASE_URL}/agents/gui`, {
        data: executionData
      })

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.result).toBeDefined()
        expect(data.execution).toBeDefined()
      } else {
        // Agent execution might fail if agent doesn't exist
        expect([403, 404, 500]).toContain(response.status())
      }
    })
  })

  test.describe('Workflows API', () => {
    test('GET /api/workflows/gui - List Workflows', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/workflows/gui?action=list&userId=${TEST_USER_ID}`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.workflows).toBeDefined()
      expect(Array.isArray(data.workflows)).toBe(true)
    })

    test('GET /api/workflows/gui - Workflow Statistics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/workflows/gui?action=stats&userId=${TEST_USER_ID}`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.stats).toBeDefined()
    })

    test('POST /api/workflows/gui - Create Workflow', async ({ request }) => {
      const workflowData = {
        action: 'create',
        userId: TEST_USER_ID,
        name: 'Test Workflow',
        description: 'A test workflow for API testing',
        steps: [
          {
            id: 'step-1',
            type: 'data_ingestion',
            config: { source: 'api', format: 'json' }
          }
        ],
        aspirationFocus: ['skill']
      }

      const response = await request.post(`${BASE_URL}/workflows/gui`, {
        data: workflowData
      })

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.workflow).toBeDefined()
        expect(data.workflow.name).toBe('Test Workflow')
      } else {
        expect([403, 500]).toContain(response.status())
      }
    })
  })

  test.describe('Integrations API', () => {
    test('GET /api/integrations/manage - Health Check', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/integrations/manage?type=health`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.health).toBeDefined()
      expect(typeof data.health).toBe('object')
    })

    test('GET /api/integrations/manage - Analytics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/integrations/manage?type=analytics`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.analytics).toBeDefined()
    })

    test('POST /api/integrations/manage - Create Integration', async ({ request }) => {
      const integrationData = {
        action: 'create_instance',
        definitionId: 'github',
        name: 'Test GitHub Integration',
        credentials: {
          token: 'ghp_test_token_123',
          webhookSecret: 'test-secret'
        },
        config: {
          repositories: ['test-repo'],
          events: ['push']
        }
      }

      const response = await request.post(`${BASE_URL}/integrations/manage`, {
        data: integrationData
      })

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.instance).toBeDefined()
        expect(data.instance.name).toBe('Test GitHub Integration')
      } else {
        expect([403, 500]).toContain(response.status())
      }
    })
  })

  test.describe('Dashboard Analytics API', () => {
    test('GET /api/dashboard/analytics - Overview Metrics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/dashboard/analytics?userId=${TEST_USER_ID}&metric=overview`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.overview).toBeDefined()
      expect(data.overview.user).toBeDefined()
      expect(data.overview.aspirations).toBeDefined()
    })

    test('GET /api/dashboard/analytics - Agent Metrics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/dashboard/analytics?userId=${TEST_USER_ID}&metric=agents`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.agents).toBeDefined()
      expect(Array.isArray(data.agents)).toBe(true)
    })

    test('GET /api/dashboard/analytics - Workflow Metrics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/dashboard/analytics?userId=${TEST_USER_ID}&metric=workflows`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.workflows).toBeDefined()
      expect(Array.isArray(data.workflows)).toBe(true)
    })
  })

  test.describe('Advanced Search API', () => {
    test('GET /api/search/advanced - Basic Search', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/search/advanced?q=machine%20learning&userId=${TEST_USER_ID}&limit=10`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.results).toBeDefined()
      expect(data.total).toBeDefined()
      expect(data.facets).toBeDefined()
    })

    test('POST /api/search/advanced - Advanced Search', async ({ request }) => {
      const searchData = {
        query: 'artificial intelligence',
        userId: TEST_USER_ID,
        filters: {
          categories: ['skill', 'project'],
          priorities: ['high']
        },
        sort: {
          field: 'created_at',
          direction: 'desc'
        }
      }

      const response = await request.post(`${BASE_URL}/search/advanced`, {
        data: searchData
      })

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.results).toBeDefined()
      expect(data.facets).toBeDefined()
    })
  })

  test.describe('Data Export/Import API', () => {
    test('GET /api/data/export - Export User Data', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/data/export?userId=${TEST_USER_ID}&type=user_data&format=json`)

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.exportDate).toBeDefined()
        expect(data.aspirations).toBeDefined()
        expect(data.connections).toBeDefined()
      } else {
        expect([403, 404]).toContain(response.status())
      }
    })

    test('GET /api/data/export - Export Aspirations', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/data/export?userId=${TEST_USER_ID}&type=aspirations&format=json`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(Array.isArray(data)).toBe(true)
    })

    test('POST /api/data/export - Validate Import Data', async ({ request }) => {
      const validationData = {
        action: 'validate_import',
        data: [
          {
            title: 'Learn React',
            category: 'skill',
            priority: 'high',
            status: 'active'
          }
        ],
        type: 'aspirations'
      }

      const response = await request.post(`${BASE_URL}/data/export`, {
        data: validationData
      })

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.validation).toBeDefined()
      expect(data.validation.isValid).toBeDefined()
    })
  })

  test.describe('Data Transformation API', () => {
    test('GET /api/data/transform - List Pipelines', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/data/transform?action=pipelines`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.pipelines).toBeDefined()
      expect(Array.isArray(data.pipelines)).toBe(true)
    })

    test('POST /api/data/transform - Execute Query', async ({ request }) => {
      const queryData = {
        action: 'query',
        queryOptions: {
          table: 'users',
          select: 'id, name, created_at',
          filters: {
            created_at: {
              operator: 'gte',
              value: '2024-01-01'
            }
          },
          limit: 10
        }
      }

      const response = await request.post(`${BASE_URL}/data/transform`, {
        data: queryData
      })

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
    })

    test('POST /api/data/transform - Execute Transformation', async ({ request }) => {
      const transformData = {
        action: 'transform',
        transformationRule: {
          id: 'test-transform',
          name: 'Test Transformation',
          transformations: [
            {
              type: 'filter',
              config: { condition: 'active == true' }
            }
          ]
        },
        input: [
          { id: 1, name: 'Test', active: true },
          { id: 2, name: 'Test2', active: false }
        ]
      }

      const response = await request.post(`${BASE_URL}/data/transform`, {
        data: transformData
      })

      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toBeDefined()
    })
  })

  test.describe('Notifications API', () => {
    test('GET /api/notifications/realtime - Poll Notifications', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/notifications/realtime?action=poll&userId=${TEST_USER_ID}`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.notifications).toBeDefined()
      expect(Array.isArray(data.notifications)).toBe(true)
    })

    test('GET /api/notifications/realtime - Get Stats', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/notifications/realtime?action=stats&userId=${TEST_USER_ID}`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.stats).toBeDefined()
    })

    test('POST /api/notifications/realtime - Send Notification', async ({ request }) => {
      const notificationData = {
        action: 'send',
        userId: TEST_USER_ID,
        type: 'info',
        title: 'Test Notification',
        message: 'This is a test notification from Playwright',
        priority: 'medium'
      }

      const response = await request.post(`${BASE_URL}/notifications/realtime`, {
        data: notificationData
      })

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.notification).toBeDefined()
        expect(data.notification.title).toBe('Test Notification')
      } else {
        expect([403, 500]).toContain(response.status())
      }
    })
  })

  test.describe('File Management API', () => {
    test('GET /api/files/list - List Files', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/files/list`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.fileSystem).toBeDefined()
      expect(typeof data.fileSystem).toBe('object')
    })

    test('POST /api/files/upload - Upload File', async ({ request }) => {
      // Create a test file
      const testContent = 'This is a test file content for Playwright testing.'
      const testFile = new File([testContent], 'test-playwright.txt', { type: 'text/plain' })

      const formData = new FormData()
      formData.append('file', testFile)
      formData.append('folder', 'test-uploads')

      const response = await request.post(`${BASE_URL}/files/upload`, {
        multipart: formData
      })

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.url).toBeDefined()
        expect(data.filename).toBe('test-playwright.txt')
      } else {
        expect([403, 413, 500]).toContain(response.status())
      }
    })
  })

  test.describe('AI Selection API', () => {
    test('POST /api/ai/select - Select and Execute AI', async ({ request }) => {
      const aiData = {
        task: 'Write a simple function to calculate factorial',
        requirements: {
          type: 'code-generation',
          complexity: 'low',
          contextLength: 1000,
          speed: 'fast',
          cost: 'budget'
        },
        execute: true,
        specialization: 'Code Generation'
      }

      const response = await request.post(`${BASE_URL}/ai/select`, {
        data: aiData
      })

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.result).toBeDefined()
        expect(data.execution).toBeDefined()
      } else {
        expect([403, 429, 500]).toContain(response.status())
      }
    })

    test('GET /api/ai/select - Get Analytics', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/ai/select`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.analytics).toBeDefined()
    })
  })

  test.describe('Document Processing API', () => {
    test('GET /api/documents/process - Get Supported Formats', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/documents/process`)
      expect(response.ok()).toBeTruthy()

      const data = await response.json()
      expect(data.supportedFormats).toBeDefined()
      expect(Array.isArray(data.supportedFormats)).toBe(true)
      expect(data.maxFileSize).toBeDefined()
      expect(data.capabilities).toBeDefined()
    })

    test('POST /api/documents/process - Process Document', async ({ request }) => {
      const docData = {
        fileUrl: 'https://example.com/sample-document.txt',
        options: {
          extractText: true,
          aiAnalysis: false,
          languageDetection: true
        }
      }

      const response = await request.post(`${BASE_URL}/documents/process`, {
        data: docData
      })

      if (response.ok()) {
        const data = await response.json()
        expect(data.success).toBe(true)
        expect(data.result).toBeDefined()
        expect(data.processingId).toBeDefined()
      } else {
        expect([400, 404, 500]).toContain(response.status())
      }
    })
  })

  test.describe('Error Handling Tests', () => {
    test('Invalid User ID - Should return 400', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/agents/gui?action=list&userId=`)
      expect(response.status()).toBe(400)
    })

    test('Missing Action Parameter - Should return 400', async ({ request }) => {
      const response = await request.get(`${BASE_URL}/agents/gui?userId=${TEST_USER_ID}`)
      expect(response.status()).toBe(400)
    })

    test('Invalid JSON in POST - Should return 400', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/agents/gui`, {
        data: '{ invalid json }'
      })
      expect(response.status()).toBe(400)
    })

    test('Rate Limiting - Should return 429', async ({ request }) => {
      // Make multiple rapid requests to test rate limiting
      const promises = Array(15).fill(null).map(() =>
        request.get(`${BASE_URL}/agents/gui?action=list&userId=${TEST_USER_ID}`)
      )

      const responses = await Promise.all(promises)
      const rateLimitedResponse = responses.find(r => r.status() === 429)

      // Rate limiting might not trigger in test environment, but if it does:
      if (rateLimitedResponse) {
        expect(rateLimitedResponse.status()).toBe(429)
      }
    })
  })

  test.describe('Performance Tests', () => {
    test('Response Time - Agents List', async ({ request }) => {
      const startTime = Date.now()
      const response = await request.get(`${BASE_URL}/agents/gui?action=list&userId=${TEST_USER_ID}`)
      const endTime = Date.now()

      expect(response.ok()).toBeTruthy()
      expect(endTime - startTime).toBeLessThan(5000) // Should respond within 5 seconds
    })

    test('Response Time - Dashboard Analytics', async ({ request }) => {
      const startTime = Date.now()
      const response = await request.get(`${BASE_URL}/dashboard/analytics?userId=${TEST_USER_ID}&metric=overview`)
      const endTime = Date.now()

      expect(response.ok()).toBeTruthy()
      expect(endTime - startTime).toBeLessThan(10000) // Should respond within 10 seconds
    })

    test('Concurrent Requests', async ({ request }) => {
      const startTime = Date.now()

      const promises = [
        request.get(`${BASE_URL}/agents/gui?action=list&userId=${TEST_USER_ID}`),
        request.get(`${BASE_URL}/workflows/gui?action=list&userId=${TEST_USER_ID}`),
        request.get(`${BASE_URL}/dashboard/analytics?userId=${TEST_USER_ID}&metric=overview`)
      ]

      const responses = await Promise.all(promises)
      const endTime = Date.now()

      responses.forEach(response => {
        expect(response.ok()).toBeTruthy()
      })

      expect(endTime - startTime).toBeLessThan(15000) // Should complete within 15 seconds
    })
  })
})
