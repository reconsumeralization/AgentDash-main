/**
 * Campaign Management GUI Tests
 * Comprehensive testing of campaign functionality
 */

import { test, expect } from '@playwright/test'
import { CampaignTests } from './gui-test-framework'

test.describe('Campaign Management Tests', () => {
  let campaignTests: CampaignTests

  test.beforeEach(async ({ page }) => {
    campaignTests = new CampaignTests({
      baseUrl: 'http://localhost:3000',
      timeout: 30000,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      locale: 'en-US',
      timezone: 'America/New_York'
    })
    
    await campaignTests.setup()
  })

  test.afterEach(async () => {
    await campaignTests.teardown()
  })

  test('should display campaign list', async () => {
    await campaignTests.testCampaignList()
  })

  test('should create new campaign', async () => {
    await campaignTests.testCreateCampaign()
  })

  test('should edit existing campaign', async () => {
    await campaignTests.testEditCampaign()
  })

  test('should delete campaign', async () => {
    await campaignTests.testDeleteCampaign()
  })

  test('should display campaign details', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Click on first campaign
    await campaignTests.page!.click('[data-testid="campaign-item"]:first-child')
    await campaignTests.waitForPageLoad()
    
    // Verify campaign details are displayed
    await campaignTests.assertElementVisible('[data-testid="campaign-details"]')
    await campaignTests.assertElementVisible('[data-testid="campaign-name"]')
    await campaignTests.assertElementVisible('[data-testid="campaign-status"]')
    await campaignTests.assertElementVisible('[data-testid="campaign-budget"]')
  })

  test('should filter campaigns by status', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Apply status filter
    await campaignTests.page!.click('[data-testid="status-filter"]')
    await campaignTests.page!.click('[data-testid="filter-active"]')
    
    await campaignTests.waitForPageLoad()
    
    // Verify filter is applied
    await campaignTests.assertElementVisible('[data-testid="filter-active"]')
  })

  test('should search campaigns', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Search for campaign
    await campaignTests.page!.fill('[data-testid="campaign-search"]', 'test')
    await campaignTests.page!.press('[data-testid="campaign-search"]', 'Enter')
    
    await campaignTests.waitForPageLoad()
    
    // Verify search results
    await campaignTests.assertElementVisible('[data-testid="search-results"]')
  })

  test('should sort campaigns', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Sort by name
    await campaignTests.page!.click('[data-testid="sort-by-name"]')
    
    await campaignTests.waitForPageLoad()
    
    // Verify sort is applied
    await campaignTests.assertElementVisible('[data-testid="sort-active"]')
  })

  test('should display campaign analytics', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Click on first campaign
    await campaignTests.page!.click('[data-testid="campaign-item"]:first-child')
    await campaignTests.waitForPageLoad()
    
    // Click analytics tab
    await campaignTests.page!.click('[data-testid="analytics-tab"]')
    
    // Verify analytics are displayed
    await campaignTests.assertElementVisible('[data-testid="campaign-analytics"]')
    await campaignTests.assertElementVisible('[data-testid="impressions-chart"]')
    await campaignTests.assertElementVisible('[data-testid="clicks-chart"]')
    await campaignTests.assertElementVisible('[data-testid="conversions-chart"]')
  })

  test('should pause campaign', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Click on first campaign
    await campaignTests.page!.click('[data-testid="campaign-item"]:first-child')
    await campaignTests.waitForPageLoad()
    
    // Click pause button
    await campaignTests.page!.click('[data-testid="pause-campaign"]')
    
    // Confirm pause
    await campaignTests.page!.click('[data-testid="confirm-pause"]')
    
    await campaignTests.waitForPageLoad()
    
    // Verify campaign is paused
    await campaignTests.assertElementText('[data-testid="campaign-status"]', 'PAUSED')
  })

  test('should resume campaign', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Click on first campaign
    await campaignTests.page!.click('[data-testid="campaign-item"]:first-child')
    await campaignTests.waitForPageLoad()
    
    // Click resume button
    await campaignTests.page!.click('[data-testid="resume-campaign"]')
    
    // Confirm resume
    await campaignTests.page!.click('[data-testid="confirm-resume"]')
    
    await campaignTests.waitForPageLoad()
    
    // Verify campaign is active
    await campaignTests.assertElementText('[data-testid="campaign-status"]', 'ACTIVE')
  })

  test('should duplicate campaign', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Click on first campaign
    await campaignTests.page!.click('[data-testid="campaign-item"]:first-child')
    await campaignTests.waitForPageLoad()
    
    // Click duplicate button
    await campaignTests.page!.click('[data-testid="duplicate-campaign"]')
    
    await campaignTests.waitForPageLoad()
    
    // Verify duplicate campaign is created
    await campaignTests.assertUrlContains('/campaigns/new')
    await campaignTests.assertElementVisible('[data-testid="duplicate-indicator"]')
  })

  test('should export campaign data', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Click on first campaign
    await campaignTests.page!.click('[data-testid="campaign-item"]:first-child')
    await campaignTests.waitForPageLoad()
    
    // Click export button
    const downloadPromise = campaignTests.page!.waitForEvent('download')
    await campaignTests.page!.click('[data-testid="export-campaign"]')
    const download = await downloadPromise
    
    expect(download.suggestedFilename()).toContain('.csv')
  })

  test('should display campaign performance metrics', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Click on first campaign
    await campaignTests.page!.click('[data-testid="campaign-item"]:first-child')
    await campaignTests.waitForPageLoad()
    
    // Verify performance metrics
    await campaignTests.assertElementVisible('[data-testid="performance-metrics"]')
    await campaignTests.assertElementVisible('[data-testid="impressions-count"]')
    await campaignTests.assertElementVisible('[data-testid="clicks-count"]')
    await campaignTests.assertElementVisible('[data-testid="conversions-count"]')
    await campaignTests.assertElementVisible('[data-testid="cost-amount"]')
  })

  test('should handle campaign validation errors', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Submit form without required fields
    await campaignTests.submitForm()
    
    // Verify validation errors are displayed
    await campaignTests.assertElementVisible('[data-testid="validation-error"]')
    await campaignTests.assertElementVisible('[data-testid="name-required"]')
    await campaignTests.assertElementVisible('[data-testid="budget-required"]')
  })

  test('should handle campaign creation with invalid data', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Fill form with invalid data
    const invalidData = {
      'campaign-name': '',
      'budget-amount': '-100',
      'budget-currency': 'INVALID'
    }
    
    await campaignTests.fillForm(invalidData)
    await campaignTests.submitForm()
    
    // Verify error messages
    await campaignTests.assertElementVisible('[data-testid="error-message"]')
  })

  test('should display campaign templates', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Click templates tab
    await campaignTests.page!.click('[data-testid="templates-tab"]')
    
    // Verify templates are displayed
    await campaignTests.assertElementVisible('[data-testid="campaign-templates"]')
    await campaignTests.assertElementVisible('[data-testid="template-item"]')
  })

  test('should use campaign template', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Click templates tab
    await campaignTests.page!.click('[data-testid="templates-tab"]')
    
    // Select a template
    await campaignTests.page!.click('[data-testid="template-item"]:first-child')
    
    // Verify template is applied
    await campaignTests.assertElementVisible('[data-testid="template-applied"]')
  })

  test('should display campaign audience settings', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Click audience tab
    await campaignTests.page!.click('[data-testid="audience-tab"]')
    
    // Verify audience settings
    await campaignTests.assertElementVisible('[data-testid="audience-settings"]')
    await campaignTests.assertElementVisible('[data-testid="location-targeting"]')
    await campaignTests.assertElementVisible('[data-testid="industry-targeting"]')
    await campaignTests.assertElementVisible('[data-testid="job-title-targeting"]')
  })

  test('should configure campaign audience', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Click audience tab
    await campaignTests.page!.click('[data-testid="audience-tab"]')
    
    // Configure location targeting
    await campaignTests.page!.click('[data-testid="location-targeting"]')
    await campaignTests.page!.click('[data-testid="select-us"]')
    
    // Configure industry targeting
    await campaignTests.page!.click('[data-testid="industry-targeting"]')
    await campaignTests.page!.click('[data-testid="select-technology"]')
    
    // Verify settings are applied
    await campaignTests.assertElementVisible('[data-testid="audience-configured"]')
  })

  test('should display campaign creative settings', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Click creative tab
    await campaignTests.page!.click('[data-testid="creative-tab"]')
    
    // Verify creative settings
    await campaignTests.assertElementVisible('[data-testid="creative-settings"]')
    await campaignTests.assertElementVisible('[data-testid="headline-input"]')
    await campaignTests.assertElementVisible('[data-testid="description-input"]')
    await campaignTests.assertElementVisible('[data-testid="image-upload"]')
  })

  test('should upload campaign creative', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Click creative tab
    await campaignTests.page!.click('[data-testid="creative-tab"]')
    
    // Upload image
    await campaignTests.uploadFile('[data-testid="image-upload"]', 'test-image.jpg')
    
    // Verify image is uploaded
    await campaignTests.assertElementVisible('[data-testid="image-preview"]')
  })

  test('should preview campaign', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Fill basic campaign data
    const formData = {
      'campaign-name': 'Test Campaign',
      'campaign-objective': 'BRAND_AWARENESS',
      'budget-amount': '1000',
      'budget-currency': 'USD'
    }
    
    await campaignTests.fillForm(formData)
    
    // Click preview button
    await campaignTests.page!.click('[data-testid="preview-campaign"]')
    
    // Verify preview is displayed
    await campaignTests.assertElementVisible('[data-testid="campaign-preview"]')
  })

  test('should schedule campaign', async () => {
    await campaignTests.navigateTo('/campaigns/new')
    await campaignTests.waitForPageLoad()
    
    // Fill campaign data
    const formData = {
      'campaign-name': 'Scheduled Campaign',
      'campaign-objective': 'BRAND_AWARENESS',
      'budget-amount': '1000',
      'budget-currency': 'USD'
    }
    
    await campaignTests.fillForm(formData)
    
    // Set schedule
    await campaignTests.page!.click('[data-testid="schedule-campaign"]')
    await campaignTests.page!.fill('[data-testid="start-date"]', '2024-02-01')
    await campaignTests.page!.fill('[data-testid="end-date"]', '2024-02-28')
    
    // Submit campaign
    await campaignTests.submitForm()
    
    await campaignTests.waitForPageLoad()
    
    // Verify campaign is scheduled
    await campaignTests.assertElementText('[data-testid="campaign-status"]', 'SCHEDULED')
  })

  test('should display campaign history', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Click on first campaign
    await campaignTests.page!.click('[data-testid="campaign-item"]:first-child')
    await campaignTests.waitForPageLoad()
    
    // Click history tab
    await campaignTests.page!.click('[data-testid="history-tab"]')
    
    // Verify history is displayed
    await campaignTests.assertElementVisible('[data-testid="campaign-history"]')
    await campaignTests.assertElementVisible('[data-testid="history-item"]')
  })

  test('should handle campaign bulk operations', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Select multiple campaigns
    await campaignTests.page!.click('[data-testid="select-all-campaigns"]')
    
    // Perform bulk pause
    await campaignTests.page!.click('[data-testid="bulk-pause"]')
    await campaignTests.page!.click('[data-testid="confirm-bulk-pause"]')
    
    await campaignTests.waitForPageLoad()
    
    // Verify bulk operation is completed
    await campaignTests.assertElementVisible('[data-testid="bulk-operation-complete"]')
  })

  test('should display campaign in mobile viewport', async () => {
    await campaignTests.setMobileViewport()
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Verify mobile layout
    await campaignTests.assertElementVisible('[data-testid="mobile-campaigns"]')
    await campaignTests.assertElementVisible('[data-testid="mobile-campaign-item"]')
  })

  test('should handle campaign accessibility', async () => {
    await campaignTests.navigateTo('/campaigns')
    await campaignTests.waitForPageLoad()
    
    // Check accessibility
    const accessibilityIssues = await campaignTests.checkAccessibility()
    expect(accessibilityIssues).toHaveLength(0)
  })

  test('should handle campaign performance requirements', async () => {
    await campaignTests.navigateTo('/campaigns')
    
    // Measure page load time
    const loadTime = await campaignTests.measurePageLoadTime('/campaigns')
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
    
    // Measure campaign list render time
    const listRenderTime = await campaignTests.measureElementRenderTime('[data-testid="campaign-list"]')
    expect(listRenderTime).toBeLessThan(1000) // Should render within 1 second
  })
})
