/**
 * GUI Testing Framework
 * Comprehensive GUI testing utilities using Playwright
 */

import { test, expect, Page, Browser, BrowserContext } from '@playwright/test'
import { TestDataGenerator, TestHelpers } from '../test-utils'

// GUI Test Configuration
interface GuiTestConfig {
  baseUrl: string
  timeout: number
  viewport: {
    width: number
    height: number
  }
  userAgent: string
  locale: string
  timezone: string
}

// Test User Interface
interface TestUser {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'admin' | 'user' | 'viewer'
}

// GUI Test Suite
class GuiTestSuite {
  private config: GuiTestConfig
  private page: Page | null = null
  private context: BrowserContext | null = null
  private browser: Browser | null = null

  constructor(config: GuiTestConfig) {
    this.config = config
  }

  // Setup and teardown
  async setup() {
    this.browser = await test.browser()
    this.context = await this.browser.newContext({
      viewport: this.config.viewport,
      userAgent: this.config.userAgent,
      locale: this.config.locale,
      timezoneId: this.config.timezone
    })
    this.page = await this.context.newPage()
    
    // Set default timeout
    this.page.setDefaultTimeout(this.config.timeout)
  }

  async teardown() {
    if (this.page) await this.page.close()
    if (this.context) await this.context.close()
  }

  // Navigation helpers
  async navigateTo(path: string) {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.goto(`${this.config.baseUrl}${path}`)
  }

  async waitForPageLoad() {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.waitForLoadState('networkidle')
  }

  async waitForElement(selector: string, timeout?: number) {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.waitForSelector(selector, { timeout })
  }

  // Authentication helpers
  async login(user: TestUser) {
    if (!this.page) throw new Error('Page not initialized')
    
    await this.navigateTo('/login')
    await this.waitForPageLoad()
    
    await this.page.fill('[data-testid="email-input"]', user.email)
    await this.page.fill('[data-testid="password-input"]', user.password)
    await this.page.click('[data-testid="login-button"]')
    
    await this.waitForPageLoad()
    await this.waitForElement('[data-testid="dashboard"]')
  }

  async logout() {
    if (!this.page) throw new Error('Page not initialized')
    
    await this.page.click('[data-testid="user-menu"]')
    await this.page.click('[data-testid="logout-button"]')
    await this.waitForPageLoad()
  }

  // Form interaction helpers
  async fillForm(formData: Record<string, string>) {
    if (!this.page) throw new Error('Page not initialized')
    
    for (const [field, value] of Object.entries(formData)) {
      const selector = `[data-testid="${field}"]`
      await this.page.fill(selector, value)
    }
  }

  async submitForm(formSelector: string = 'form') {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.click(`${formSelector} [data-testid="submit-button"]`)
  }

  async selectDropdown(selector: string, value: string) {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.selectOption(selector, value)
  }

  async uploadFile(selector: string, filePath: string) {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.setInputFiles(selector, filePath)
  }

  // Assertion helpers
  async assertElementVisible(selector: string) {
    if (!this.page) throw new Error('Page not initialized')
    await expect(this.page.locator(selector)).toBeVisible()
  }

  async assertElementHidden(selector: string) {
    if (!this.page) throw new Error('Page not initialized')
    await expect(this.page.locator(selector)).toBeHidden()
  }

  async assertElementText(selector: string, expectedText: string) {
    if (!this.page) throw new Error('Page not initialized')
    await expect(this.page.locator(selector)).toHaveText(expectedText)
  }

  async assertElementValue(selector: string, expectedValue: string) {
    if (!this.page) throw new Error('Page not initialized')
    await expect(this.page.locator(selector)).toHaveValue(expectedValue)
  }

  async assertUrlContains(path: string) {
    if (!this.page) throw new Error('Page not initialized')
    expect(this.page.url()).toContain(path)
  }

  async assertTitleContains(title: string) {
    if (!this.page) throw new Error('Page not initialized')
    await expect(this.page).toHaveTitle(new RegExp(title))
  }

  // Performance testing
  async measurePageLoadTime(url: string): Promise<number> {
    if (!this.page) throw new Error('Page not initialized')
    
    const startTime = Date.now()
    await this.page.goto(url)
    await this.page.waitForLoadState('networkidle')
    const endTime = Date.now()
    
    return endTime - startTime
  }

  async measureElementRenderTime(selector: string): Promise<number> {
    if (!this.page) throw new Error('Page not initialized')
    
    const startTime = Date.now()
    await this.page.waitForSelector(selector)
    const endTime = Date.now()
    
    return endTime - startTime
  }

  // Accessibility testing
  async checkAccessibility() {
    if (!this.page) throw new Error('Page not initialized')
    
    // Check for basic accessibility features
    const accessibilityIssues = []
    
    // Check for alt text on images
    const imagesWithoutAlt = await this.page.locator('img:not([alt])').count()
    if (imagesWithoutAlt > 0) {
      accessibilityIssues.push(`${imagesWithoutAlt} images missing alt text`)
    }
    
    // Check for form labels
    const inputsWithoutLabels = await this.page.locator('input:not([aria-label]):not([aria-labelledby])').count()
    if (inputsWithoutLabels > 0) {
      accessibilityIssues.push(`${inputsWithoutLabels} inputs missing labels`)
    }
    
    // Check for heading hierarchy
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').all()
    let previousLevel = 0
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName.toLowerCase())
      const level = parseInt(tagName.substring(1))
      
      if (level > previousLevel + 1) {
        accessibilityIssues.push(`Heading hierarchy issue: ${tagName} follows h${previousLevel}`)
      }
      previousLevel = level
    }
    
    return accessibilityIssues
  }

  // Visual regression testing
  async takeScreenshot(name: string, fullPage: boolean = false) {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage 
    })
  }

  async compareScreenshot(name: string, threshold: number = 0.2) {
    if (!this.page) throw new Error('Page not initialized')
    await expect(this.page).toHaveScreenshot(`${name}.png`, { threshold })
  }

  // Mobile testing
  async setMobileViewport() {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.setViewportSize({ width: 375, height: 667 })
  }

  async setTabletViewport() {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.setViewportSize({ width: 768, height: 1024 })
  }

  async setDesktopViewport() {
    if (!this.page) throw new Error('Page not initialized')
    await this.page.setViewportSize({ width: 1920, height: 1080 })
  }

  // Cross-browser testing
  async testInBrowser(browserName: 'chromium' | 'firefox' | 'webkit') {
    // This would be implemented with different browser contexts
    // For now, we'll just log the browser type
    console.log(`Testing in ${browserName}`)
  }

  // Error handling
  async handleError(error: Error) {
    if (!this.page) return
    
    // Take screenshot on error
    await this.takeScreenshot(`error-${Date.now()}`)
    
    // Log error details
    console.error('GUI Test Error:', error.message)
  }

  // Data generation helpers
  generateTestUser(role: 'admin' | 'user' | 'viewer' = 'user'): TestUser {
    return {
      email: TestDataGenerator.randomEmail(),
      password: TestDataGenerator.randomString(12),
      firstName: TestDataGenerator.randomString(8),
      lastName: TestDataGenerator.randomString(10),
      role
    }
  }

  generateFormData(): Record<string, string> {
    return {
      'firstName': TestDataGenerator.randomString(8),
      'lastName': TestDataGenerator.randomString(10),
      'email': TestDataGenerator.randomEmail(),
      'phone': `+1-555-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      'company': TestDataGenerator.randomString(12),
      'message': `Test message: ${TestDataGenerator.randomString(50)}`
    }
  }
}

// Dashboard Tests
class DashboardTests extends GuiTestSuite {
  async testDashboardLoad() {
    await this.navigateTo('/dashboard')
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="dashboard"]')
    await this.assertTitleContains('Dashboard')
  }

  async testDashboardWidgets() {
    await this.navigateTo('/dashboard')
    await this.waitForPageLoad()
    
    // Check for key widgets
    await this.assertElementVisible('[data-testid="stats-widget"]')
    await this.assertElementVisible('[data-testid="chart-widget"]')
    await this.assertElementVisible('[data-testid="recent-activity"]')
  }

  async testDashboardNavigation() {
    await this.navigateTo('/dashboard')
    await this.waitForPageLoad()
    
    // Test navigation menu
    await this.page!.click('[data-testid="nav-campaigns"]')
    await this.assertUrlContains('/campaigns')
    
    await this.page!.click('[data-testid="nav-analytics"]')
    await this.assertUrlContains('/analytics')
    
    await this.page!.click('[data-testid="nav-settings"]')
    await this.assertUrlContains('/settings')
  }
}

// Campaign Management Tests
class CampaignTests extends GuiTestSuite {
  async testCampaignList() {
    await this.navigateTo('/campaigns')
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="campaign-list"]')
  }

  async testCreateCampaign() {
    await this.navigateTo('/campaigns/new')
    await this.waitForPageLoad()
    
    const formData = {
      'campaign-name': `Test Campaign ${TestDataGenerator.randomString(6)}`,
      'campaign-objective': 'BRAND_AWARENESS',
      'budget-amount': '1000',
      'budget-currency': 'USD'
    }
    
    await this.fillForm(formData)
    await this.submitForm()
    
    await this.waitForPageLoad()
    await this.assertUrlContains('/campaigns')
  }

  async testEditCampaign() {
    await this.navigateTo('/campaigns')
    await this.waitForPageLoad()
    
    // Click on first campaign
    await this.page!.click('[data-testid="campaign-item"]:first-child')
    await this.waitForPageLoad()
    
    // Click edit button
    await this.page!.click('[data-testid="edit-campaign"]')
    await this.waitForPageLoad()
    
    // Update campaign name
    const newName = `Updated Campaign ${TestDataGenerator.randomString(6)}`
    await this.page!.fill('[data-testid="campaign-name"]', newName)
    await this.submitForm()
    
    await this.waitForPageLoad()
    await this.assertElementText('[data-testid="campaign-name"]', newName)
  }

  async testDeleteCampaign() {
    await this.navigateTo('/campaigns')
    await this.waitForPageLoad()
    
    // Click on first campaign
    await this.page!.click('[data-testid="campaign-item"]:first-child')
    await this.waitForPageLoad()
    
    // Click delete button
    await this.page!.click('[data-testid="delete-campaign"]')
    
    // Confirm deletion
    await this.page!.click('[data-testid="confirm-delete"]')
    
    await this.waitForPageLoad()
    await this.assertUrlContains('/campaigns')
  }
}

// Analytics Tests
class AnalyticsTests extends GuiTestSuite {
  async testAnalyticsDashboard() {
    await this.navigateTo('/analytics')
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="analytics-dashboard"]')
  }

  async testDateRangeFilter() {
    await this.navigateTo('/analytics')
    await this.waitForPageLoad()
    
    // Set date range
    await this.page!.click('[data-testid="date-range-picker"]')
    await this.page!.click('[data-testid="last-30-days"]')
    
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="analytics-chart"]')
  }

  async testExportData() {
    await this.navigateTo('/analytics')
    await this.waitForPageLoad()
    
    // Click export button
    await this.page!.click('[data-testid="export-data"]')
    
    // Wait for download to start
    const downloadPromise = this.page!.waitForEvent('download')
    await this.page!.click('[data-testid="export-csv"]')
    const download = await downloadPromise
    
    expect(download.suggestedFilename()).toContain('.csv')
  }
}

// Settings Tests
class SettingsTests extends GuiTestSuite {
  async testUserProfile() {
    await this.navigateTo('/settings/profile')
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="profile-form"]')
  }

  async testUpdateProfile() {
    await this.navigateTo('/settings/profile')
    await this.waitForPageLoad()
    
    const formData = {
      'firstName': TestDataGenerator.randomString(8),
      'lastName': TestDataGenerator.randomString(10),
      'email': TestDataGenerator.randomEmail()
    }
    
    await this.fillForm(formData)
    await this.submitForm()
    
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="success-message"]')
  }

  async testChangePassword() {
    await this.navigateTo('/settings/security')
    await this.waitForPageLoad()
    
    const formData = {
      'current-password': 'oldPassword123',
      'new-password': 'newPassword123',
      'confirm-password': 'newPassword123'
    }
    
    await this.fillForm(formData)
    await this.submitForm()
    
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="success-message"]')
  }

  async testApiKeys() {
    await this.navigateTo('/settings/api-keys')
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="api-keys-list"]')
  }

  async testGenerateApiKey() {
    await this.navigateTo('/settings/api-keys')
    await this.waitForPageLoad()
    
    await this.page!.click('[data-testid="generate-api-key"]')
    await this.waitForPageLoad()
    
    const formData = {
      'key-name': `Test Key ${TestDataGenerator.randomString(6)}`,
      'key-description': 'Test API key for automation'
    }
    
    await this.fillForm(formData)
    await this.submitForm()
    
    await this.waitForPageLoad()
    await this.assertElementVisible('[data-testid="api-key-display"]')
  }
}

// Export test suites
export {
  GuiTestSuite,
  DashboardTests,
  CampaignTests,
  AnalyticsTests,
  SettingsTests,
  GuiTestConfig,
  TestUser
}
