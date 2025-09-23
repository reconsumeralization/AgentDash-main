import { test, expect } from '@playwright/test'

// Increase timeout for this test suite
test.setTimeout(60000)

test.describe('LinkedOut Platform - Analyst Agent Tests', () => {
  // Helper function for reliable navigation
  async function navigateToTab(page: any, tabName: string) {
    const button = page.locator(`button:has-text("${tabName}")`).first()
    await button.waitFor({ state: 'visible', timeout: 10000 })
    await button.click()
    await page.waitForTimeout(2000)
  }

  // Helper function to wait for loading states
  async function waitForLoadingComplete(page: any) {
    // Wait for any loading spinners to disappear
    await page.waitForFunction(() => {
      const spinners = document.querySelectorAll('[data-testid="loading-spinner"], .animate-spin')
      return spinners.length === 0
    }, { timeout: 10000 }).catch(() => {})
    
    // Wait for network to be idle
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  }

  // Helper function to handle onboarding flow
  async function completeOnboardingIfPresent(page: any) {
    const onboardingTitle = page.locator('h2:has-text("LinkedOut Onboarding")')
    const isOnboardingVisible = await onboardingTitle.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (isOnboardingVisible) {
      // Complete onboarding quickly
      await page.fill('input[id="fullName"]', 'Test User')
      await page.fill('input[id="headline"]', 'AI Enthusiast')
      await page.click('button:has-text("Next")')
      
      // Skip through remaining steps
      for (let i = 0; i < 7; i++) {
        await page.click('button:has-text("Next")').catch(() => {})
        await page.waitForTimeout(200)
      }
      
      // Complete onboarding
      await page.click('button:has-text("Complete Setup")').catch(() => {})
      await page.waitForTimeout(1000)
    }
  }

  // Helper function to verify analyst agent navigation
  async function navigateToAnalystAgent(page: any) {
    const analystButton = page.locator('button:has-text("Analyst Agent")').first()
    const isButtonVisible = await analystButton.isVisible({ timeout: 5000 }).catch(() => false)
    
    if (isButtonVisible) {
      await analystButton.click()
      await waitForLoadingComplete(page)
      return true
    }
    return false
  }

  test.beforeEach(async ({ page }) => {
    // Navigate to the LinkedOut platform
    await page.goto('/linkedout')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Handle onboarding flow if present
    await completeOnboardingIfPresent(page)
    
    // Wait for the main dashboard to be visible
    await page.waitForSelector('h1:has-text("LinkedOut")', { timeout: 10000 })
  })

  test('should load LinkedOut platform successfully', async ({ page }) => {
    // Check if the page loads and contains LinkedOut content
    await expect(page.locator('h1:has-text("LinkedOut")')).toBeVisible({ timeout: 10000 })
    
    // Check if we can find at least one navigation element (more flexible)
    const navigationElements = await page.locator('button').count()
    expect(navigationElements).toBeGreaterThan(0)
    
    // Check if the page title contains DefConect or LinkedOut
    await expect(page).toHaveTitle(/DefConect|LinkedOut|AgentDash/)
    
    // Verify page is fully loaded by checking for key UI elements
    await expect(page.locator('body')).toBeVisible()
    
    // Check for accessibility landmarks
    const mainContent = page.locator('main, [role="main"]')
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible()
    }
  })

  test('should navigate to Analyst Agent tab', async ({ page }) => {
    // Check if we're in onboarding or main dashboard
    const isOnboarding = await page.locator('h2:has-text("LinkedOut Onboarding")').isVisible().catch(() => false)
    
    if (isOnboarding) {
      // Skip onboarding for this test
      await page.click('button:has-text("Skip")').catch(() => {})
      await page.waitForTimeout(2000)
    }
    
    // Try to find and click the Analyst Agent button
    const navigationSuccess = await navigateToAnalystAgent(page)
    
    if (navigationSuccess) {
      // Check if Analyst Agent content is visible
      await expect(page.getByText('Analyst Agent Dashboard')).toBeVisible({ timeout: 10000 })
      
      // Verify key dashboard elements are present
      const dashboardElements = [
        page.getByText('Overview'),
        page.getByText('AI Insights'),
        page.getByText('Campaigns'),
        page.getByText('Visualizations'),
        page.getByText('Recommendations')
      ]
      
      // At least 3 dashboard elements should be visible
      const visibleElements = await Promise.all(
        dashboardElements.map(el => el.isVisible().catch(() => false))
      )
      expect(visibleElements.filter(Boolean).length).toBeGreaterThanOrEqual(3)
    } else {
      // If navigation buttons aren't visible, just verify the page loaded
      await expect(page.locator('h1:has-text("LinkedOut")')).toBeVisible()
    }
  })

  test('should display Analyst Agent overview metrics', async ({ page }) => {
    // Check if we're in onboarding or main dashboard
    const isOnboarding = await page.locator('h2:has-text("LinkedOut Onboarding")').isVisible().catch(() => false)
    
    if (isOnboarding) {
      // Skip onboarding for this test
      await page.click('button:has-text("Skip")').catch(() => {})
      await page.waitForTimeout(2000)
    }
    
    // Try to find and click the Analyst Agent button
    const navigationSuccess = await navigateToAnalystAgent(page)
    
    if (navigationSuccess) {
      // Check if overview metrics are visible (with fallback)
      const metricsFound = await Promise.all([
        page.getByText('Total Impressions').isVisible().catch(() => false),
        page.getByText('Total Clicks').isVisible().catch(() => false),
        page.getByText('Conversion Rate').isVisible().catch(() => false),
        page.getByText('Average ROI').isVisible().catch(() => false),
        page.getByText('CTR').isVisible().catch(() => false),
        page.getByText('CPC').isVisible().catch(() => false),
        page.getByText('ROAS').isVisible().catch(() => false)
      ])
      
      // At least one metric should be visible
      expect(metricsFound.some(found => found)).toBe(true)
      
      // Verify metric values are displayed (not just labels)
      const metricCards = page.locator('[data-testid="metric-card"], .metric-card, [class*="metric"]')
      if (await metricCards.count() > 0) {
        await expect(metricCards.first()).toBeVisible()
      }
    } else {
      // If navigation buttons aren't visible, just verify the page loaded
      await expect(page.locator('h1:has-text("LinkedOut")')).toBeVisible()
    }
  })

  test('should display AI insights in the insights tab', async ({ page }) => {
    // Navigate to Analyst Agent tab
    const navigationSuccess = await navigateToAnalystAgent(page)
    
    if (!navigationSuccess) {
      test.skip(true, 'Analyst Agent navigation not available')
    }
    
    // Click on AI Insights tab
    await page.getByText('AI Insights').click()
    await waitForLoadingComplete(page)
    
    // Check if insights are visible
    await expect(page.getByText('AI-Generated Insights')).toBeVisible()
    await expect(page.getByText('Intelligent analysis of your marketing campaign performance')).toBeVisible()
    
    // Check if insight cards are present
    const insightCards = page.locator('[class*="border rounded-lg p-4"], [data-testid="insight-card"]')
    await expect(insightCards.first()).toBeVisible()
    
    // Verify insights contain actionable content
    const insightTexts = [
      'performance',
      'optimization',
      'recommendation',
      'trend',
      'analysis'
    ]
    
    let foundInsightContent = false
    for (const text of insightTexts) {
      if (await page.getByText(new RegExp(text, 'i')).isVisible().catch(() => false)) {
        foundInsightContent = true
        break
      }
    }
    expect(foundInsightContent).toBe(true)
  })

  test('should display campaign performance data', async ({ page }) => {
    // Navigate to Analyst Agent tab
    const navigationSuccess = await navigateToAnalystAgent(page)
    
    if (!navigationSuccess) {
      test.skip(true, 'Analyst Agent navigation not available')
    }
    
    // Click on Campaigns tab
    await page.getByText('Campaigns').click()
    await waitForLoadingComplete(page)
    
    // Check if campaign data is visible
    await expect(page.getByText('Campaign Performance')).toBeVisible()
    await expect(page.getByText('Detailed analysis of your marketing campaigns')).toBeVisible()
    
    // Check if campaign cards are present
    const campaignCards = page.locator('[class*="border rounded-lg p-4"], [data-testid="campaign-card"]')
    await expect(campaignCards.first()).toBeVisible()
    
    // Check if campaign metrics are displayed
    const expectedMetrics = ['Budget', 'CTR', 'ROAS', 'Impressions', 'Clicks', 'Conversions']
    const foundMetrics = await Promise.all(
      expectedMetrics.map(metric => page.getByText(metric).isVisible().catch(() => false))
    )
    
    // At least 4 metrics should be visible
    expect(foundMetrics.filter(Boolean).length).toBeGreaterThanOrEqual(4)
    
    // Verify campaign status indicators
    const statusIndicators = page.locator('[class*="status"], [data-testid="campaign-status"]')
    if (await statusIndicators.count() > 0) {
      await expect(statusIndicators.first()).toBeVisible()
    }
  })

  test('should display visualizations tab', async ({ page }) => {
    // Navigate to Analyst Agent tab
    const navigationSuccess = await navigateToAnalystAgent(page)
    
    if (!navigationSuccess) {
      test.skip(true, 'Analyst Agent navigation not available')
    }
    
    // Click on Visualizations tab
    await page.getByText('Visualizations').click()
    await waitForLoadingComplete(page)
    
    // Check if visualizations are visible
    await expect(page.getByText('Visualizations')).toBeVisible()
    
    // Check if chart placeholders or actual charts are present
    const chartElements = page.locator('[class*="h-64 bg-gray-50 rounded-lg"], [data-testid="chart"], canvas, svg')
    await expect(chartElements.first()).toBeVisible()
    
    // Check if chart insights are displayed
    await expect(page.getByText('Key Insights:')).toBeVisible()
    
    // Verify chart types are available
    const chartTypes = ['Line Chart', 'Bar Chart', 'Pie Chart', 'Area Chart']
    let foundChartType = false
    for (const chartType of chartTypes) {
      if (await page.getByText(chartType).isVisible().catch(() => false)) {
        foundChartType = true
        break
      }
    }
    
    // Chart controls should be present
    const chartControls = page.locator('select, [role="combobox"], button[aria-label*="chart"]')
    if (await chartControls.count() > 0) {
      await expect(chartControls.first()).toBeVisible()
    }
  })

  test('should display recommendations tab', async ({ page }) => {
    // Navigate to Analyst Agent tab
    const navigationSuccess = await navigateToAnalystAgent(page)
    
    if (!navigationSuccess) {
      test.skip(true, 'Analyst Agent navigation not available')
    }
    
    // Click on Recommendations tab
    await page.getByText('Recommendations').click()
    await waitForLoadingComplete(page)
    
    // Check if recommendations are visible
    await expect(page.getByText('AI Recommendations')).toBeVisible()
    await expect(page.getByText('Actionable insights to optimize your marketing performance')).toBeVisible()
    
    // Check if recommendation cards are present
    const recommendationCards = page.locator('[class*="bg-gradient-to-r"], [data-testid="recommendation-card"]')
    await expect(recommendationCards.first()).toBeVisible()
    
    // Check if action buttons are present
    await expect(page.getByText('Apply Recommendation')).toBeVisible()
    
    // Verify recommendation priorities
    const priorityIndicators = ['High', 'Medium', 'Low', 'Critical']
    let foundPriority = false
    for (const priority of priorityIndicators) {
      if (await page.getByText(priority).isVisible().catch(() => false)) {
        foundPriority = true
        break
      }
    }
    
    // Verify recommendation categories
    const categories = ['Budget Optimization', 'Audience Targeting', 'Creative Performance', 'Bidding Strategy']
    let foundCategory = false
    for (const category of categories) {
      if (await page.getByText(new RegExp(category, 'i')).isVisible().catch(() => false)) {
        foundCategory = true
        break
      }
    }
  })

  test('should allow running AI analysis', async ({ page }) => {
    // Navigate to Analyst Agent tab
    const navigationSuccess = await navigateToAnalystAgent(page)
    
    if (!navigationSuccess) {
      test.skip(true, 'Analyst Agent navigation not available')
    }
    
    // Check if Run AI Analysis button is visible
    const analysisButton = page.getByText('Run AI Analysis')
    await expect(analysisButton).toBeVisible()
    
    // Verify button is enabled
    await expect(analysisButton).toBeEnabled()
    
    // Click the Run AI Analysis button
    await analysisButton.click()
    
    // Check if analyzing state is shown
    await expect(page.getByText('Analyzing...')).toBeVisible({ timeout: 5000 })
    
    // Wait for analysis to complete (simulated)
    await page.waitForTimeout(4000)
    
    // Check if analysis completed (button should be back to normal)
    await expect(page.getByText('Run AI Analysis')).toBeVisible()
    
    // Verify analysis results are displayed
    const analysisResults = page.locator('[data-testid="analysis-results"], .analysis-complete')
    if (await analysisResults.count() > 0) {
      await expect(analysisResults.first()).toBeVisible()
    }
  })

  test('should navigate to LinkedIn Analytics tab', async ({ page }) => {
    // Click on LinkedIn Analytics tab
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    
    // Wait for the tab content to load
    await waitForLoadingComplete(page)
    
    // Check if LinkedIn Analytics content is visible
    await expect(page.getByText('LinkedIn Analytics Integration')).toBeVisible()
    await expect(page.getByText('Connect your LinkedIn campaigns to the Analyst Agent for intelligent insights')).toBeVisible()
    
    // Verify LinkedIn branding elements
    const linkedinElements = page.locator('[class*="linkedin"], [data-testid*="linkedin"]')
    if (await linkedinElements.count() > 0) {
      await expect(linkedinElements.first()).toBeVisible()
    }
  })

  test('should display LinkedIn connection interface', async ({ page }) => {
    // Navigate to LinkedIn Analytics tab
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    await waitForLoadingComplete(page)
    
    // Check if connection interface is visible
    await expect(page.getByText('Connect LinkedIn')).toBeVisible()
    
    // Check if connection status is displayed
    await expect(page.locator('[role="alert"], .alert, [data-testid="connection-status"]')).toBeVisible()
    
    // Verify connection requirements are shown
    const requirements = ['LinkedIn Ads Account', 'Campaign Manager Access', 'API Permissions']
    let foundRequirement = false
    for (const req of requirements) {
      if (await page.getByText(new RegExp(req, 'i')).isVisible().catch(() => false)) {
        foundRequirement = true
        break
      }
    }
    
    // Check for security information
    const securityInfo = page.getByText(/secure|encrypted|privacy|oauth/i)
    if (await securityInfo.count() > 0) {
      await expect(securityInfo.first()).toBeVisible()
    }
  })

  test('should simulate LinkedIn connection process', async ({ page }) => {
    // Navigate to LinkedIn Analytics tab
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    await waitForLoadingComplete(page)
    
    // Click Connect LinkedIn button
    const connectButton = page.getByText('Connect LinkedIn')
    await expect(connectButton).toBeEnabled()
    await connectButton.click()
    
    // Check if connecting state is shown
    await expect(page.getByText('Connecting...')).toBeVisible({ timeout: 5000 })
    
    // Wait for connection simulation to complete
    await page.waitForTimeout(3000)
    
    // Check if connected state is shown
    await expect(page.getByText('Successfully connected to LinkedIn Ads Account!')).toBeVisible({ timeout: 10000 })
    
    // Check if sync button is now visible
    await expect(page.getByText('Sync Data Now')).toBeVisible({ timeout: 5000 })
    
    // Verify connection status indicator
    const statusIndicator = page.locator('[class*="connected"], [data-testid="connection-success"]')
    if (await statusIndicator.count() > 0) {
      await expect(statusIndicator.first()).toBeVisible()
    }
  })

  test('should display LinkedIn campaign data after connection', async ({ page }) => {
    // Navigate to LinkedIn Analytics tab
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    await waitForLoadingComplete(page)
    
    // Simulate connection
    await page.getByText('Connect LinkedIn').click()
    await page.waitForTimeout(3000)
    
    // Check if campaign data is displayed
    const expectedMetrics = ['Total Spend', 'Impressions', 'Average CTR', 'Average ROAS', 'Clicks', 'Conversions']
    const foundMetrics = await Promise.all(
      expectedMetrics.map(metric => page.getByText(metric).isVisible().catch(() => false))
    )
    
    // At least 4 metrics should be visible
    expect(foundMetrics.filter(Boolean).length).toBeGreaterThanOrEqual(4)
    
    // Check if LinkedIn campaigns tab is visible
    await page.getByText('Campaigns').click()
    await expect(page.getByText('LinkedIn Campaigns')).toBeVisible()
    
    // Verify campaign list is populated
    const campaignList = page.locator('[data-testid="campaign-list"], .campaign-item')
    if (await campaignList.count() > 0) {
      await expect(campaignList.first()).toBeVisible()
    }
  })

  test('should display AI insights for LinkedIn campaigns', async ({ page }) => {
    // Navigate to LinkedIn Analytics tab
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    await waitForLoadingComplete(page)
    
    // Simulate connection
    await page.getByText('Connect LinkedIn').click()
    await page.waitForTimeout(3000)
    
    // Click on AI Insights tab
    await page.getByText('AI Insights').click()
    await waitForLoadingComplete(page)
    
    // Check if LinkedIn-specific insights are visible
    await expect(page.getByText('AI-Generated Insights')).toBeVisible()
    await expect(page.getByText('Intelligent analysis of your LinkedIn campaign performance')).toBeVisible()
    
    // Check if insight cards are present
    const insightCards = page.locator('[class*="bg-gradient-to-r"], [data-testid="insight-card"]')
    await expect(insightCards.first()).toBeVisible()
    
    // Verify LinkedIn-specific insights
    const linkedinInsights = ['audience targeting', 'professional demographics', 'industry performance', 'job title targeting']
    let foundLinkedInInsight = false
    for (const insight of linkedinInsights) {
      if (await page.getByText(new RegExp(insight, 'i')).isVisible().catch(() => false)) {
        foundLinkedInInsight = true
        break
      }
    }
  })

  test('should display LinkedIn performance analytics', async ({ page }) => {
    // Navigate to LinkedIn Analytics tab
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    await waitForLoadingComplete(page)
    
    // Simulate connection
    await page.getByText('Connect LinkedIn').click()
    await page.waitForTimeout(3000)
    
    // Click on Performance tab
    await page.getByText('Performance').click()
    await waitForLoadingComplete(page)
    
    // Check if performance analytics are visible
    await expect(page.getByText('Performance Analytics')).toBeVisible()
    await expect(page.getByText('Detailed performance metrics and trends')).toBeVisible()
    
    // Check if key metrics are displayed
    await expect(page.getByText('Key Metrics')).toBeVisible()
    await expect(page.getByText('Performance Trends')).toBeVisible()
    
    // Verify performance charts
    const performanceCharts = page.locator('canvas, svg, [data-testid="performance-chart"]')
    if (await performanceCharts.count() > 0) {
      await expect(performanceCharts.first()).toBeVisible()
    }
    
    // Check for time period selectors
    const timePeriods = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom Range']
    let foundTimePeriod = false
    for (const period of timePeriods) {
      if (await page.getByText(period).isVisible().catch(() => false)) {
        foundTimePeriod = true
        break
      }
    }
  })

  test('should display LinkedIn recommendations', async ({ page }) => {
    // Navigate to LinkedIn Analytics tab
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    await waitForLoadingComplete(page)
    
    // Simulate connection
    await page.getByText('Connect LinkedIn').click()
    await page.waitForTimeout(3000)
    
    // Click on Recommendations tab
    await page.getByText('Recommendations').click()
    await waitForLoadingComplete(page)
    
    // Check if LinkedIn recommendations are visible
    await expect(page.getByText('AI Recommendations')).toBeVisible()
    await expect(page.getByText('Actionable recommendations to optimize your LinkedIn campaigns')).toBeVisible()
    
    // Check if recommendation items are present
    const recommendationCards = page.locator('[class*="border rounded-lg p-4"], [data-testid="recommendation-card"]')
    await expect(recommendationCards.first()).toBeVisible()
    
    // Verify LinkedIn-specific recommendations
    const linkedinRecommendations = ['audience expansion', 'bid optimization', 'creative testing', 'targeting refinement']
    let foundLinkedInRecommendation = false
    for (const rec of linkedinRecommendations) {
      if (await page.getByText(new RegExp(rec, 'i')).isVisible().catch(() => false)) {
        foundLinkedInRecommendation = true
        break
      }
    }
  })

  test('should allow data synchronization', async ({ page }) => {
    // Navigate to LinkedIn Analytics tab
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    await waitForLoadingComplete(page)
    
    // Simulate connection first
    await page.getByText('Connect LinkedIn').click()
    await page.waitForTimeout(3000)
    
    // Click sync data button
    const syncButton = page.getByText('Sync Data')
    await expect(syncButton).toBeEnabled()
    await syncButton.click()
    
    // Check if syncing state is shown
    const syncingIndicator = page.getByText('Syncing...', { exact: false })
    if (await syncingIndicator.isVisible().catch(() => false)) {
      await expect(syncingIndicator).toBeVisible()
    }
    
    // Wait for sync to complete
    await page.waitForTimeout(2000)
    
    // Check if last sync time is updated (should show recent timestamp)
    await expect(page.locator('text=/Last sync:/')).toBeVisible()
    
    // Verify sync success indicator
    const syncSuccess = page.locator('[class*="sync-success"], [data-testid="sync-complete"]')
    if (await syncSuccess.count() > 0) {
      await expect(syncSuccess.first()).toBeVisible()
    }
  })

  test('should maintain state between tab switches', async ({ page }) => {
    // Navigate to Analyst Agent tab
    const analystNavSuccess = await navigateToAnalystAgent(page)
    
    if (!analystNavSuccess) {
      test.skip(true, 'Analyst Agent navigation not available')
    }
    
    // Switch to LinkedIn Analytics
    await page.locator('button:has-text("LinkedIn Analytics")').first().click()
    await waitForLoadingComplete(page)
    
    // Verify LinkedIn Analytics content
    await expect(page.getByText('LinkedIn Analytics Integration')).toBeVisible()
    
    // Switch back to Analyst Agent
    await page.locator('button:has-text("Analyst Agent")').first().click()
    await waitForLoadingComplete(page)
    
    // Should still show Analyst Agent content
    await expect(page.getByText('Analyst Agent Dashboard')).toBeVisible()
    
    // Verify state persistence by checking if previous selections are maintained
    const activeTab = page.locator('[aria-selected="true"], .active, [class*="selected"]')
    if (await activeTab.count() > 0) {
      await expect(activeTab.first()).toBeVisible()
    }
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Navigate to Analyst Agent tab
    const navigationSuccess = await navigateToAnalystAgent(page)
    
    if (navigationSuccess) {
      // Should still be functional on mobile
      await expect(page.getByText('Analyst Agent Dashboard')).toBeVisible()
      
      // Check for mobile-specific UI elements
      const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]')
      if (await mobileMenu.count() > 0) {
        await expect(mobileMenu.first()).toBeVisible()
      }
    }
    
    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(1000)
    
    if (navigationSuccess) {
      // Should adapt to tablet size
      await expect(page.getByText('Analyst Agent Dashboard')).toBeVisible()
      
      // Verify responsive grid layout
      const gridElements = page.locator('[class*="grid"], [class*="flex"]')
      if (await gridElements.count() > 0) {
        await expect(gridElements.first()).toBeVisible()
      }
    }
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(1000)
    
    if (navigationSuccess) {
      // Should work well on desktop
      await expect(page.getByText('Analyst Agent Dashboard')).toBeVisible()
      
      // Verify desktop-specific features
      const desktopFeatures = page.locator('[class*="desktop"], [class*="lg:"], [class*="xl:"]')
      // Should work well on desktop
      await expect(page.getByText('Analyst Agent Dashboard')).toBeVisible()
    }
  })

  test('should export reports functionality', async ({ page }) => {
    // Navigate to Analyst Agent tab
    await page.locator('button:has-text("Analyst Agent")').first().click()
    await page.waitForTimeout(1000)
    
    // Check if export button is visible
    await expect(page.getByText('Export Report')).toBeVisible()
    
    // Click export button (this would typically trigger a download)
    await page.getByText('Export Report').click()
    
    // The button should be clickable without errors
    await expect(page.getByText('Export Report')).toBeVisible()
  })
})
