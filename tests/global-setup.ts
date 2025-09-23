/**
 * Global Jest Setup
 * Runs once before all tests
 */

import { TestEnvironment } from './test-utils'

export default async function globalSetup() {
  console.log('🚀 Starting API Tests...')
  
  // Setup global test environment
  TestEnvironment.setup()
  
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
  
  // Mock external services
  process.env.LINKEDIN_CLIENT_ID = 'test_client_id'
  process.env.LINKEDIN_CLIENT_SECRET = 'test_client_secret'
  process.env.OFFICE365_TENANT_ID = 'test-tenant-id'
  process.env.OFFICE365_CLIENT_ID = 'test-client-id'
  process.env.OFFICE365_CLIENT_SECRET = 'test-client-secret'
  
  console.log('✅ Global test setup completed')
}
