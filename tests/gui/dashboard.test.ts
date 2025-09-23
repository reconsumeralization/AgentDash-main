/**
 * Dashboard GUI Tests
 * Comprehensive testing of dashboard functionality
 */

import { test, expect } from '@playwright/test'
import { DashboardTests } from './gui-test-framework'

test.describe('Dashboard Tests', () => {
  let dashboardTests: DashboardTests

  test.beforeEach(async ({ page }) => {
    dashboardTests = new DashboardTests({
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      locale: 'en-US',
      timezone: 'America/New_York'
    })
    
    await dashboardTests.setup()
  })

  test.afterEach(async () => {
    await dashboardTests.teardown()
  })

  test('should load dashboard successfully', async () => {
    await dashboardTests.testDashboardLoad()
  })

  test('should display all dashboard widgets', async () => {
    await dashboardTests.testDashboardWidgets()
  })

  test('should navigate between dashboard sections', async () => {
    await dashboardTests.testDashboardNavigation()
  })

  test('should display user statistics', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="user-stats"]')
    await dashboardTests.assertElementVisible('[data-testid="campaign-count"]')
    await dashboardTests.assertElementVisible('[data-testid="lead-count"]')
    await dashboardTests.assertElementVisible('[data-testid="conversion-rate"]')
  })

  test('should display recent activity feed', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="recent-activity"]')
    await dashboardTests.assertElementVisible('[data-testid="activity-list"]')
  })

  test('should display performance charts', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="performance-chart"]')
    await dashboardTests.assertElementVisible('[data-testid="chart-legend"]')
  })

  test('should handle dashboard refresh', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Click refresh button
    await dashboardTests.page!.click('[data-testid="refresh-dashboard"]')
    await dashboardTests.waitForPageLoad()
    
    // Verify dashboard is still visible
    await dashboardTests.assertElementVisible('[data-testid="dashboard"]')
  })

  test('should display notifications', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="notifications"]')
  })

  test('should handle notification interactions', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Click on notification
    await dashboardTests.page!.click('[data-testid="notification-item"]:first-child')
    
    // Verify notification details are shown
    await dashboardTests.assertElementVisible('[data-testid="notification-details"]')
  })

  test('should display quick actions', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="quick-actions"]')
    await dashboardTests.assertElementVisible('[data-testid="create-campaign"]')
    await dashboardTests.assertElementVisible('[data-testid="view-analytics"]')
    await dashboardTests.assertElementVisible('[data-testid="manage-leads"]')
  })

  test('should handle quick action clicks', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Click create campaign quick action
    await dashboardTests.page!.click('[data-testid="create-campaign"]')
    await dashboardTests.waitForPageLoad()
    
    // Verify navigation to campaign creation
    await dashboardTests.assertUrlContains('/campaigns/new')
  })

  test('should display system status', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="system-status"]')
    await dashboardTests.assertElementVisible('[data-testid="linkedin-status"]')
    await dashboardTests.assertElementVisible('[data-testid="office365-status"]')
  })

  test('should handle system status indicators', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Check that status indicators are visible
    const linkedinStatus = await dashboardTests.page!.locator('[data-testid="linkedin-status"]')
    const office365Status = await dashboardTests.page!.locator('[data-testid="office365-status"]')
    
    await expect(linkedinStatus).toBeVisible()
    await expect(office365Status).toBeVisible()
  })

  test('should display dashboard in mobile viewport', async () => {
    await dashboardTests.setMobileViewport()
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Verify mobile layout
    await dashboardTests.assertElementVisible('[data-testid="mobile-dashboard"]')
    await dashboardTests.assertElementVisible('[data-testid="mobile-nav"]')
  })

  test('should display dashboard in tablet viewport', async () => {
    await dashboardTests.setTabletViewport()
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Verify tablet layout
    await dashboardTests.assertElementVisible('[data-testid="tablet-dashboard"]')
  })

  test('should handle dashboard search', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Use search functionality
    await dashboardTests.page!.fill('[data-testid="dashboard-search"]', 'campaign')
    await dashboardTests.page!.press('[data-testid="dashboard-search"]', 'Enter')
    
    await dashboardTests.waitForPageLoad()
    await dashboardTests.assertElementVisible('[data-testid="search-results"]')
  })

  test('should display dashboard filters', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="dashboard-filters"]')
    await dashboardTests.assertElementVisible('[data-testid="date-filter"]')
    await dashboardTests.assertElementVisible('[data-testid="campaign-filter"]')
  })

  test('should handle filter interactions', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Apply date filter
    await dashboardTests.page!.click('[data-testid="date-filter"]')
    await dashboardTests.page!.click('[data-testid="last-7-days"]')
    
    await dashboardTests.waitForPageLoad()
    
    // Verify filter is applied
    await dashboardTests.assertElementVisible('[data-testid="filter-active"]')
  })

  test('should display dashboard export options', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="export-options"]')
    await dashboardTests.assertElementVisible('[data-testid="export-pdf"]')
    await dashboardTests.assertElementVisible('[data-testid="export-excel"]')
  })

  test('should handle dashboard export', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Click export PDF
    const downloadPromise = dashboardTests.page!.waitForEvent('download')
    await dashboardTests.page!.click('[data-testid="export-pdf"]')
    const download = await downloadPromise
    
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  test('should display dashboard help', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    await dashboardTests.assertElementVisible('[data-testid="help-button"]')
    
    // Click help button
    await dashboardTests.page!.click('[data-testid="help-button"]')
    
    // Verify help content is shown
    await dashboardTests.assertElementVisible('[data-testid="help-content"]')
  })

  test('should handle dashboard keyboard shortcuts', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Test keyboard shortcut for refresh
    await dashboardTests.page!.keyboard.press('F5')
    await dashboardTests.waitForPageLoad()
    
    // Verify dashboard is still visible
    await dashboardTests.assertElementVisible('[data-testid="dashboard"]')
  })

  test('should display dashboard loading states', async () => {
    await dashboardTests.navigateTo('/dashboard')
    
    // Check for loading indicators
    await dashboardTests.assertElementVisible('[data-testid="loading-spinner"]')
    
    await dashboardTests.waitForPageLoad()
    
    // Verify loading is complete
    await dashboardTests.assertElementHidden('[data-testid="loading-spinner"]')
  })

  test('should handle dashboard error states', async () => {
    // Navigate to dashboard with network issues simulated
    await dashboardTests.page!.route('**/api/dashboard/**', route => route.abort())
    
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Verify error state is displayed
    await dashboardTests.assertElementVisible('[data-testid="error-message"]')
    await dashboardTests.assertElementVisible('[data-testid="retry-button"]')
  })

  test('should handle dashboard retry functionality', async () => {
    // Simulate network error
    await dashboardTests.page!.route('**/api/dashboard/**', route => route.abort())
    
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Click retry button
    await dashboardTests.page!.click('[data-testid="retry-button"]')
    
    // Restore network
    await dashboardTests.page!.unroute('**/api/dashboard/**')
    
    await dashboardTests.waitForPageLoad()
    
    // Verify dashboard loads successfully
    await dashboardTests.assertElementVisible('[data-testid="dashboard"]')
  })

  test('should display dashboard accessibility features', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Check accessibility
    const accessibilityIssues = await dashboardTests.checkAccessibility()
    expect(accessibilityIssues).toHaveLength(0)
  })

  test('should handle dashboard performance requirements', async () => {
    await dashboardTests.navigateTo('/dashboard')
    
    // Measure page load time
    const loadTime = await dashboardTests.measurePageLoadTime('/dashboard')
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    
    // Measure widget render time
    const widgetRenderTime = await dashboardTests.measureElementRenderTime('[data-testid="stats-widget"]')
    expect(widgetRenderTime).toBeLessThan(1000) // Should render within 1 second
  })

  test('should display dashboard in different themes', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Test light theme
    await dashboardTests.page!.click('[data-testid="theme-toggle"]')
    await dashboardTests.assertElementVisible('[data-testid="light-theme"]')
    
    // Test dark theme
    await dashboardTests.page!.click('[data-testid="theme-toggle"]')
    await dashboardTests.assertElementVisible('[data-testid="dark-theme"]')
  })

  test('should handle dashboard data updates', async () => {
    await dashboardTests.navigateTo('/dashboard')
    await dashboardTests.waitForPageLoad()
    
    // Simulate data update
    await dashboardTests.page!.click('[data-testid="refresh-data"]')
    
    // Verify data is updated
    await dashboardTests.assertElementVisible('[data-testid="data-updated"]')
  })
})
