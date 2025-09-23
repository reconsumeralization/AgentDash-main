import { test, expect } from '@playwright/test'

test.describe('API Dashboard UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the API dashboard
    await page.goto('/api-dashboard')

    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should load API dashboard successfully', async ({ page }) => {
    // Check if the main heading is visible
    await expect(page.getByText('API Testing Dashboard')).toBeVisible()

    // Check if the description is visible
    await expect(page.getByText('Test all API endpoints interactively')).toBeVisible()

    // Check if tabs are present
    await expect(page.getByText('API Endpoints')).toBeVisible()
    await expect(page.getByText('Test Results')).toBeVisible()
    await expect(page.getByText('Analytics')).toBeVisible()
  })

  test('should display all API categories', async ({ page }) => {
    const categories = [
      'Agents',
      'Workflows',
      'Integrations',
      'Analytics',
      'Search',
      'Data',
      'Transform',
      'Notifications',
      'Files',
      'AI',
      'Documents'
    ]

    for (const category of categories) {
      await expect(page.getByText(category)).toBeVisible()
    }
  })

  test('should show category endpoint counts', async ({ page }) => {
    // Check that each category shows a badge with endpoint count
    const badges = page.locator('[data-testid="category-badge"]')
    await expect(badges).toHaveCount(await page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').count())
  })

  test('should allow user ID input', async ({ page }) => {
    const userIdInput = page.locator('input[placeholder="demo-user-1"]')
    await expect(userIdInput).toBeVisible()

    // Change user ID
    await userIdInput.fill('test-user-123')
    await expect(userIdInput).toHaveValue('test-user-123')
  })

  test('should show connected status', async ({ page }) => {
    await expect(page.getByText('Connected')).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
    // Start on endpoints tab
    await expect(page.getByText('API Endpoints')).toBeVisible()

    // Switch to test results
    await page.getByText('Test Results').click()
    await expect(page.getByText('Test Results')).toHaveClass(/data-state="active"/)

    // Switch to analytics
    await page.getByText('Analytics').click()
    await expect(page.getByText('Analytics')).toHaveClass(/data-state="active"/)
  })

  test('should display endpoint details on click', async ({ page }) => {
    // Click on an endpoint in the Agents category
    const agentsCard = page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').first()
    const firstEndpoint = agentsCard.locator('div[role="button"]').first()
    await firstEndpoint.click()

    // Check if endpoint details are shown
    const endpointDetails = page.locator('[data-testid="endpoint-details"]')
    await expect(endpointDetails).toBeVisible()
  })

  test('should test endpoint functionality', async ({ page }) => {
    // Mock the fetch API to capture requests
    const requests: any[] = []
    await page.route('**/api/**', (route) => {
      requests.push({
        url: route.request().url(),
        method: route.request().method(),
        headers: route.request().headers()
      })
      route.continue()
    })

    // Click on the first endpoint's test button
    const agentsCard = page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').first()
    const testButton = agentsCard.locator('button').first()
    await testButton.click()

    // Wait for the request to be made
    await page.waitForTimeout(1000)

    // Check that a request was made
    expect(requests.length).toBeGreaterThan(0)
    expect(requests[0].url).toContain('/api/agents/gui')
  })

  test('should show test results', async ({ page }) => {
    // Switch to test results tab
    await page.getByText('Test Results').click()

    // The results area should be visible
    const resultsArea = page.locator('[data-testid="test-results"]')
    await expect(resultsArea).toBeVisible()
  })

  test('should display analytics data', async ({ page }) => {
    // Switch to analytics tab
    await page.getByText('Analytics').click()

    // Check for analytics cards
    const totalEndpointsCard = page.getByText('Total Endpoints').locator('..').locator('..')
    await expect(totalEndpointsCard).toBeVisible()

    const testsRunCard = page.getByText('Tests Run').locator('..').locator('..')
    await expect(testsRunCard).toBeVisible()

    const successRateCard = page.getByText('Success Rate').locator('..').locator('..')
    await expect(successRateCard).toBeVisible()

    const avgResponseTimeCard = page.getByText('Avg Response Time').locator('..').locator('..')
    await expect(avgResponseTimeCard).toBeVisible()
  })

  test('should allow JSON editing in request body', async ({ page }) => {
    // Click on an endpoint that has a request body
    const agentsCard = page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').first()
    const endpointWithBody = agentsCard.locator('div[role="button"]').nth(2) // Usually create endpoints have bodies
    await endpointWithBody.click()

    // Look for textarea with JSON content
    const jsonTextarea = page.locator('textarea')
    const isVisible = await jsonTextarea.isVisible()

    if (isVisible) {
      // Get initial value
      const initialValue = await jsonTextarea.inputValue()
      expect(initialValue).toContain('{')

      // Modify the JSON
      const modifiedValue = initialValue.replace('Test Agent', 'Modified Test Agent')
      await jsonTextarea.fill(modifiedValue)

      // Check that the value was updated
      await expect(jsonTextarea).toHaveValue(modifiedValue)
    }
  })

  test('should handle endpoint testing errors gracefully', async ({ page }) => {
    // Mock a failed API response
    await page.route('**/api/agents/gui**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Internal server error'
        })
      })
    })

    // Click on test button
    const agentsCard = page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').first()
    const testButton = agentsCard.locator('button').first()
    await testButton.click()

    // Wait for error to be displayed
    await page.waitForTimeout(1000)

    // Switch to test results to see the error
    await page.getByText('Test Results').click()

    // Should show error in results
    await expect(page.getByText('Internal server error')).toBeVisible()
  })

  test('should maintain state between tab switches', async ({ page }) => {
    // Set a user ID
    const userIdInput = page.locator('input[placeholder="demo-user-1"]')
    await userIdInput.fill('persistent-user-123')

    // Switch to different tabs
    await page.getByText('Test Results').click()
    await page.getByText('Analytics').click()
    await page.getByText('API Endpoints').click()

    // Check that user ID is still set
    await expect(userIdInput).toHaveValue('persistent-user-123')
  })

  test('should show loading states during API calls', async ({ page }) => {
    // Mock slow API response
    await page.route('**/api/agents/gui**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000))
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          agents: [],
          total: 0,
          timestamp: new Date().toISOString()
        })
      })
    })

    // Click test button
    const agentsCard = page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').first()
    const testButton = agentsCard.locator('button').first()
    await testButton.click()

    // Should show loading state
    await expect(page.getByText('Testing...')).toBeVisible()
  })

  test('should validate JSON input', async ({ page }) => {
    // Click on an endpoint with JSON input
    const agentsCard = page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').first()
    const createEndpoint = agentsCard.locator('div[role="button"]').filter({ hasText: 'Create Agent' }).first()
    await createEndpoint.click()

    // Find JSON textarea
    const jsonTextarea = page.locator('textarea')
    if (await jsonTextarea.isVisible()) {
      // Enter invalid JSON
      await jsonTextarea.fill('{ invalid json content }')

      // The component should handle this gracefully (no crash)
      // This test ensures the app doesn't break with invalid JSON
      await expect(page.getByText('API Testing Dashboard')).toBeVisible()
    }
  })

  test('should display response data correctly', async ({ page }) => {
    // Mock a successful API response with detailed data
    await page.route('**/api/agents/gui**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          agents: [
            {
              id: 'agent-1',
              name: 'Test Agent',
              type: 'context',
              usage_count: 5,
              is_active: true,
              created_at: '2024-01-01T00:00:00Z'
            }
          ],
          total: 1,
          timestamp: new Date().toISOString()
        })
      })
    })

    // Click test button
    const agentsCard = page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').first()
    const testButton = agentsCard.locator('button').first()
    await testButton.click()

    // Wait for response
    await page.waitForTimeout(1000)

    // Switch to test results
    await page.getByText('Test Results').click()

    // Should display the response data
    await expect(page.getByText('Test Agent')).toBeVisible()
    await expect(page.getByText('success')).toBeVisible()
  })

  test('should handle large response data', async ({ page }) => {
    // Create large mock response
    const largeAgents = Array.from({ length: 100 }, (_, i) => ({
      id: `agent-${i}`,
      name: `Test Agent ${i}`,
      type: 'context',
      usage_count: Math.floor(Math.random() * 100),
      is_active: Math.random() > 0.5,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }))

    await page.route('**/api/agents/gui**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          agents: largeAgents,
          total: largeAgents.length,
          timestamp: new Date().toISOString()
        })
      })
    })

    // Click test button
    const agentsCard = page.locator('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4 > div').first()
    const testButton = agentsCard.locator('button').first()
    await testButton.click()

    // Wait for response
    await page.waitForTimeout(2000)

    // Switch to test results
    await page.getByText('Test Results').click()

    // Should handle large data without crashing
    await expect(page.getByText('100')).toBeVisible() // Total count
    await expect(page.getByText('API Testing Dashboard')).toBeVisible()
  })
})
