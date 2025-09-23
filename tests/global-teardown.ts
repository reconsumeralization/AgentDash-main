/**
 * Global Jest Teardown
 * Runs once after all tests
 */

import { TestEnvironment, cleanupTestData } from './test-utils'

export default async function globalTeardown() {
  console.log('🧹 Cleaning up after tests...')
  
  // Cleanup test environment
  TestEnvironment.cleanup()
  
  // Cleanup test data
  cleanupTestData()
  
  console.log('✅ Global test teardown completed')
}
