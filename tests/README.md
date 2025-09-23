# API Tests

Comprehensive test suite for all API integrations in the AgentDash codebase.

## 📁 Test Structure

```
tests/
├── __mocks__/                 # Mock data and utilities
│   └── linkedin-api-mock.ts   # LinkedIn API mocks
├── linkedin-profile-api.test.ts    # LinkedIn Profile API tests
├── linkedin-oauth.test.ts          # LinkedIn OAuth tests
├── office365-management-api.test.ts # Office 365 Management API tests
├── integration.test.ts             # Integration tests
├── test-utils.ts                   # Test utilities and helpers
├── jest.config.js                  # Jest configuration
├── setup.ts                        # Test setup
├── global-setup.ts                 # Global setup
├── global-teardown.ts              # Global teardown
└── README.md                       # This file
```

## 🧪 Test Categories

### 1. Unit Tests
- **LinkedIn Profile API** (`linkedin-profile-api.test.ts`)
  - Profile fetching and management
  - Utility functions
  - Error handling
  - Type validation

- **LinkedIn OAuth** (`linkedin-oauth.test.ts`)
  - OAuth 2.0 flow
  - Token management
  - Scope handling
  - Error scenarios

- **Office 365 Management API** (`office365-management-api.test.ts`)
  - Service health monitoring
  - Activity record management
  - Subscription handling
  - Analytics and reporting

### 2. Integration Tests
- **Cross-API Integration** (`integration.test.ts`)
  - End-to-end workflows
  - Multi-API scenarios
  - Error recovery
  - Performance testing

## 🚀 Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# LinkedIn Profile API tests
npm test linkedin-profile-api

# LinkedIn OAuth tests
npm test linkedin-oauth

# Office 365 Management API tests
npm test office365-management-api

# Integration tests
npm test integration
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests in CI Mode
```bash
npm run test:ci
```

## 📊 Test Coverage

The test suite aims for comprehensive coverage:

- **Global Coverage**: 80% minimum
- **Library Code**: 85% minimum
- **Critical Paths**: 95% minimum

### Coverage Reports
- **HTML Report**: `coverage/html-report/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **JSON Report**: `coverage/coverage-final.json`

## 🔧 Test Configuration

### Jest Configuration
- **Test Environment**: jsdom
- **Timeout**: 30 seconds (60 seconds for integration tests)
- **Parallel Execution**: 50% of CPU cores
- **Cache**: Enabled for faster subsequent runs

### Mock Configuration
- **Fetch API**: Globally mocked
- **LocalStorage**: Mocked for persistence testing
- **Console**: Suppressed for cleaner output
- **Performance API**: Mocked for timing tests

## 📝 Writing Tests

### Test Structure
```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  afterEach(() => {
    // Cleanup after each test
  })

  describe('Specific Functionality', () => {
    it('should handle success case', async () => {
      // Arrange
      const mockData = TestDataGenerator.randomLinkedInProfile()
      
      // Act
      const result = await api.getProfile()
      
      // Assert
      expect(result).toEqual(mockData)
    })

    it('should handle error case', async () => {
      // Arrange
      LinkedInApiTestUtils.setupErrorFetch('unauthorized')
      
      // Act & Assert
      await expect(api.getProfile()).rejects.toThrow('Unauthorized')
    })
  })
})
```

### Best Practices

1. **Use Descriptive Test Names**
   ```typescript
   it('should return user profile when valid access token is provided')
   ```

2. **Follow AAA Pattern**
   - **Arrange**: Set up test data and mocks
   - **Act**: Execute the code under test
   - **Assert**: Verify the results

3. **Mock External Dependencies**
   ```typescript
   LinkedInApiTestUtils.setupSuccessfulFetch('linkedinProfile')
   ```

4. **Test Error Scenarios**
   ```typescript
   LinkedInApiTestUtils.setupErrorFetch('unauthorized')
   ```

5. **Use Test Utilities**
   ```typescript
   const profile = TestDataGenerator.randomLinkedInProfile()
   ```

## 🛠️ Test Utilities

### TestDataGenerator
```typescript
// Generate random test data
const profile = TestDataGenerator.randomLinkedInProfile()
const email = TestDataGenerator.randomEmail()
const uuid = TestDataGenerator.randomUUID()
```

### TestHelpers
```typescript
// Wait for conditions
await TestHelpers.waitForCondition(() => result.current.isLoading === false)

// Retry operations
await TestHelpers.retry(() => api.getData(), 3, 1000)

// Mock fetch with delay
const mockFetch = TestHelpers.mockFetchWithDelay(response, 100)
```

### TestAssertions
```typescript
// Custom assertions
TestAssertions.assertInRange(value, 0, 100)
TestAssertions.assertMatches(value, /^[a-z]+$/)
TestAssertions.assertUnique(array)
```

### PerformanceTestUtils
```typescript
// Measure performance
const { result, duration } = await PerformanceTestUtils.measureTime(() => api.getData())
PerformanceTestUtils.assertPerformance(duration, 1000)
```

## 🐛 Debugging Tests

### Debug Mode
```bash
npm run test:debug
```

### Verbose Output
```bash
npm test -- --verbose
```

### Run Single Test
```bash
npm test -- --testNamePattern="should handle success case"
```

### Debug Specific File
```bash
npm test -- linkedin-profile-api.test.ts
```

## 📈 Performance Testing

### Load Testing
```typescript
it('should handle concurrent requests efficiently', async () => {
  const promises = Array.from({ length: 100 }, () => api.getData())
  const results = await Promise.all(promises)
  expect(results).toHaveLength(100)
})
```

### Benchmark Testing
```typescript
it('should meet performance requirements', async () => {
  const { duration } = await PerformanceTestUtils.measureTime(() => api.getData())
  expect(duration).toBeLessThan(1000) // Less than 1 second
})
```

## 🔍 Mock Data

### LinkedIn API Mocks
- `mockLinkedInProfile`: Complete LinkedIn profile
- `mockOAuthResponse`: OAuth token response
- `mockOAuthError`: OAuth error response
- `mockApiError`: Generic API error

### Office 365 Mocks
- `mockServiceHealthStatus`: Service health data
- `mockActivityRecord`: Activity log entry
- `mockSubscription`: Webhook subscription

### Mock Responses
- `mockSuccessfulResponses`: Successful API responses
- `mockErrorResponses`: Error API responses

## 🚨 Error Handling Tests

### Common Error Scenarios
1. **Network Errors**: Connection timeouts, DNS failures
2. **Authentication Errors**: Invalid tokens, expired credentials
3. **Authorization Errors**: Insufficient permissions
4. **Rate Limiting**: Too many requests
5. **Server Errors**: 5xx HTTP status codes
6. **Client Errors**: 4xx HTTP status codes

### Error Recovery Testing
```typescript
it('should recover from temporary failures', async () => {
  // First call fails
  LinkedInApiTestUtils.setupErrorFetch('network')
  await expect(api.getData()).rejects.toThrow()
  
  // Second call succeeds
  LinkedInApiTestUtils.setupSuccessfulFetch('data')
  const result = await api.getData()
  expect(result).toBeDefined()
})
```

## 📋 Test Checklist

Before submitting code, ensure:

- [ ] All new features have corresponding tests
- [ ] Error scenarios are covered
- [ ] Integration tests pass
- [ ] Performance tests meet requirements
- [ ] Coverage thresholds are met
- [ ] Tests are deterministic (no flaky tests)
- [ ] Mock data is realistic
- [ ] Test names are descriptive
- [ ] Tests follow AAA pattern
- [ ] Cleanup is properly handled

## 🔗 Related Documentation

- [LinkedIn Profile API Integration](../docs/linkedin-profile-api-integration.md)
- [LinkedIn OAuth Integration](../docs/linkedin-oauth-integration.md)
- [Office 365 Management API Integration](../docs/office365-management-api-integration.md)
- [React Hooks Guide](../docs/hooks-and-providers-guide.md)

## 📞 Support

For test-related questions or issues:

1. Check existing test examples
2. Review test utilities documentation
3. Consult API integration guides
4. Create an issue with test details

---

**Happy Testing! 🧪✨**
