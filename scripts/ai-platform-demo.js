/**
 * 🤖 AI PLATFORM DEMO - Comprehensive AI-Powered Social Networking Platform
 * Demonstrates the full capabilities of the AI chat interface with context switching
 */

const { chromium } = require('playwright');

async function runAIPlatformDemo() {
  console.log('🚀 Starting AI Platform Demo...');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to AI Platform
    console.log('📍 Navigating to AI Platform...');
    await page.goto('http://localhost:3000/ai-platform');
    await page.waitForLoadState('networkidle');

    // Wait for chat interface to load
    await page.waitForSelector('[data-testid="ai-chat-interface"]', { timeout: 10000 });

    console.log('✅ AI Platform loaded successfully');

    // Test 1: General Chat Interaction
    console.log('\n🧪 Test 1: General Chat Interaction');
    await testGeneralChat(page);

    // Test 2: Context Switching
    console.log('\n🧪 Test 2: Context Switching');
    await testContextSwitching(page);

    // Test 3: Social Media Management
    console.log('\n🧪 Test 3: Social Media Management');
    await testSocialMediaManagement(page);

    // Test 4: Tribe Management
    console.log('\n🧪 Test 4: Tribe Management');
    await testTribeManagement(page);

    // Test 5: Project Management
    console.log('\n🧪 Test 5: Project Management');
    await testProjectManagement(page);

    // Test 6: File Sharing
    console.log('\n🧪 Test 6: File Sharing');
    await testFileSharing(page);

    // Test 7: Analytics
    console.log('\n🧪 Test 7: Analytics');
    await testAnalytics(page);

    // Test 8: Governance
    console.log('\n🧪 Test 8: Governance');
    await testGovernance(page);

    // Test 9: Action Execution
    console.log('\n🧪 Test 9: Action Execution');
    await testActionExecution(page);

    // Test 10: AI Assistance
    console.log('\n🧪 Test 10: AI Assistance');
    await testAIAssistance(page);

    console.log('\n🎉 AI Platform Demo completed successfully!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await browser.close();
  }
}

async function testGeneralChat(page) {
  console.log('  💬 Testing general chat interaction...');
  
  // Send a general message
  await page.fill('input[placeholder*="Ask me anything"]', 'Hello! Can you help me understand what this platform can do?');
  await page.click('button:has-text("Send")');
  
  // Wait for AI response
  await page.waitForSelector('.bg-white.border.border-gray-200.rounded-lg', { timeout: 10000 });
  
  console.log('  ✅ General chat interaction successful');
}

async function testContextSwitching(page) {
  console.log('  🎨 Testing context switching...');
  
  // Switch to social media context
  await page.click('button:has-text("social media")');
  await page.waitForTimeout(1000);
  
  // Switch to project management context
  await page.click('button:has-text("project management")');
  await page.waitForTimeout(1000);
  
  // Switch to tribe management context
  await page.click('button:has-text("tribe management")');
  await page.waitForTimeout(1000);
  
  // Switch back to general
  await page.click('button:has-text("general")');
  await page.waitForTimeout(1000);
  
  console.log('  ✅ Context switching successful');
}

async function testSocialMediaManagement(page) {
  console.log('  📱 Testing social media management...');
  
  // Switch to social media context
  await page.click('button:has-text("social media")');
  await page.waitForTimeout(1000);
  
  // Send social media related message
  await page.fill('input[placeholder*="Ask me anything"]', 'I want to create a LinkedIn post about my new project');
  await page.click('button:has-text("Send")');
  
  // Wait for response and actions
  await page.waitForSelector('.bg-white.border.border-gray-200.rounded-lg', { timeout: 10000 });
  
  console.log('  ✅ Social media management test successful');
}

async function testTribeManagement(page) {
  console.log('  👥 Testing tribe management...');
  
  // Switch to tribe management context
  await page.click('button:has-text("tribe management")');
  await page.waitForTimeout(1000);
  
  // Send tribe related message
  await page.fill('input[placeholder*="Ask me anything"]', 'I want to create a new tribe for AI enthusiasts');
  await page.click('button:has-text("Send")');
  
  // Wait for response
  await page.waitForSelector('.bg-white.border.border-gray-200.rounded-lg', { timeout: 10000 });
  
  console.log('  ✅ Tribe management test successful');
}

async function testProjectManagement(page) {
  console.log('  🎯 Testing project management...');
  
  // Switch to project management context
  await page.click('button:has-text("project management")');
  await page.waitForTimeout(1000);
  
  // Send project related message
  await page.fill('input[placeholder*="Ask me anything"]', 'I need to create a new project for our AI platform development');
  await page.click('button:has-text("Send")');
  
  // Wait for response
  await page.waitForSelector('.bg-white.border.border-gray-200.rounded-lg', { timeout: 10000 });
  
  console.log('  ✅ Project management test successful');
}

async function testFileSharing(page) {
  console.log('  📁 Testing file sharing...');
  
  // Switch to file sharing context
  await page.click('button:has-text("file sharing")');
  await page.waitForTimeout(1000);
  
  // Send file sharing related message
  await page.fill('input[placeholder*="Ask me anything"]', 'I want to securely share a document with my team');
  await page.click('button:has-text("Send")');
  
  // Wait for response
  await page.waitForSelector('.bg-white.border.border-gray-200.rounded-lg', { timeout: 10000 });
  
  console.log('  ✅ File sharing test successful');
}

async function testAnalytics(page) {
  console.log('  📊 Testing analytics...');
  
  // Switch to analytics context
  await page.click('button:has-text("analytics")');
  await page.waitForTimeout(1000);
  
  // Send analytics related message
  await page.fill('input[placeholder*="Ask me anything"]', 'Show me analytics for my social media engagement');
  await page.click('button:has-text("Send")');
  
  // Wait for response
  await page.waitForSelector('.bg-white.border.border-gray-200.rounded-lg', { timeout: 10000 });
  
  console.log('  ✅ Analytics test successful');
}

async function testGovernance(page) {
  console.log('  🛡️ Testing governance...');
  
  // Switch to governance context
  await page.click('button:has-text("governance")');
  await page.waitForTimeout(1000);
  
  // Send governance related message
  await page.fill('input[placeholder*="Ask me anything"]', 'I need to set up compliance policies for our platform');
  await page.click('button:has-text("Send")');
  
  // Wait for response
  await page.waitForSelector('.bg-white.border.border-gray-200.rounded-lg', { timeout: 10000 });
  
  console.log('  ✅ Governance test successful');
}

async function testActionExecution(page) {
  console.log('  ⚡ Testing action execution...');
  
  // Send message that should trigger actions
  await page.fill('input[placeholder*="Ask me anything"]', 'Create a new LinkedIn post about AI innovation');
  await page.click('button:has-text("Send")');
  
  // Wait for actions panel to appear
  await page.waitForSelector('text=Suggested Actions', { timeout: 10000 });
  
  // Execute an action if available
  const executeButton = page.locator('button:has-text("Execute")').first();
  if (await executeButton.isVisible()) {
    await executeButton.click();
    await page.waitForTimeout(2000);
  }
  
  console.log('  ✅ Action execution test successful');
}

async function testAIAssistance(page) {
  console.log('  🤖 Testing AI assistance...');
  
  // Test different types of assistance
  const assistanceTests = [
    'Help me plan a social media campaign',
    'Analyze my tribe engagement metrics',
    'Suggest collaboration opportunities',
    'Create a project timeline',
    'Set up file sharing permissions'
  ];
  
  for (const test of assistanceTests) {
    await page.fill('input[placeholder*="Ask me anything"]', test);
    await page.click('button:has-text("Send")');
    await page.waitForSelector('.bg-white.border.border-gray-200.rounded-lg', { timeout: 10000 });
    await page.waitForTimeout(1000);
  }
  
  console.log('  ✅ AI assistance test successful');
}

// Keyboard shortcuts test
async function testKeyboardShortcuts(page) {
  console.log('  ⌨️ Testing keyboard shortcuts...');
  
  // Test context switching shortcuts
  const shortcuts = [
    { key: 'Control+1', context: 'social-media' },
    { key: 'Control+2', context: 'project-management' },
    { key: 'Control+3', context: 'tribe-management' },
    { key: 'Control+4', context: 'file-sharing' },
    { key: 'Control+5', context: 'analytics' },
    { key: 'Control+6', context: 'governance' },
    { key: 'Control+0', context: 'general' }
  ];
  
  for (const shortcut of shortcuts) {
    await page.keyboard.press(shortcut.key);
    await page.waitForTimeout(500);
  }
  
  console.log('  ✅ Keyboard shortcuts test successful');
}

// Settings test
async function testSettings(page) {
  console.log('  ⚙️ Testing settings...');
  
  // Open settings
  await page.click('button[aria-label="Settings"]');
  await page.waitForSelector('text=AI Assistant Settings', { timeout: 5000 });
  
  // Test setting changes
  await page.selectOption('select', 'formal');
  await page.selectOption('select', 'analytical');
  await page.selectOption('select', 'comprehensive');
  
  // Close settings
  await page.click('button[aria-label="Settings"]');
  
  console.log('  ✅ Settings test successful');
}

// Run the demo
if (require.main === module) {
  runAIPlatformDemo().catch(console.error);
}

module.exports = { runAIPlatformDemo };
