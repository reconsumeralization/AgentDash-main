# Hooks and Providers Guide

This guide covers all the custom hooks and providers available in the AgentDash codebase.

## 📚 Table of Contents

- [Basic Hooks](#basic-hooks)
- [Advanced Hooks](#advanced-hooks)
- [LinkedIn API Hooks](#linkedin-api-hooks)
- [Providers](#providers)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)

## 🔧 Basic Hooks

### useDebounce
Debounces a value to prevent excessive updates.

```typescript
import { useDebounce } from '@/hooks'

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  
  useEffect(() => {
    // This will only run 500ms after the user stops typing
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm)
    }
  }, [debouncedSearchTerm])
}
```

### useLocalStorage
Persists state to localStorage with automatic serialization.

```typescript
import { useLocalStorage } from '@/hooks'

function SettingsComponent() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')
  const [userPreferences, setUserPreferences] = useLocalStorage('preferences', {})
  
  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  )
}
```

### useMediaQuery
Responds to CSS media queries.

```typescript
import { useMediaQuery } from '@/hooks'

function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  
  return (
    <div>
      {isMobile && <MobileLayout />}
      {isTablet && <TabletLayout />}
      {!isMobile && !isTablet && <DesktopLayout />}
    </div>
  )
}
```

### useToggle
Manages boolean state with convenient methods.

```typescript
import { useToggle } from '@/hooks'

function ToggleComponent() {
  const [isOpen, { toggle, setTrue, setFalse }] = useToggle(false)
  
  return (
    <div>
      <button onClick={toggle}>Toggle</button>
      <button onClick={setTrue}>Open</button>
      <button onClick={setFalse}>Close</button>
      <p>Status: {isOpen ? 'Open' : 'Closed'}</p>
    </div>
  )
}
```

### useWindowSize
Tracks window dimensions.

```typescript
import { useWindowSize } from '@/hooks'

function WindowSizeComponent() {
  const { width, height } = useWindowSize()
  
  return (
    <div>
      <p>Window size: {width} × {height}</p>
    </div>
  )
}
```

### useOnline
Tracks online/offline status.

```typescript
import { useOnline } from '@/hooks'

function ConnectionStatus() {
  const isOnline = useOnline()
  
  return (
    <div className={isOnline ? 'text-green-600' : 'text-red-600'}>
      {isOnline ? 'Online' : 'Offline'}
    </div>
  )
}
```

### useClipboard
Handles clipboard operations.

```typescript
import { useClipboard } from '@/hooks'

function CopyButton() {
  const { copied, copy, error } = useClipboard()
  
  const handleCopy = () => {
    copy('Text to copy')
  }
  
  return (
    <button onClick={handleCopy}>
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}
```

## 🚀 Advanced Hooks

### useAsync
Handles async operations with loading states and error handling.

```typescript
import { useAsync } from '@/hooks'

function DataComponent() {
  const { data, loading, error, execute } = useAsync(
    async () => {
      const response = await fetch('/api/data')
      return response.json()
    },
    { immediate: true }
  )
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return <div>{JSON.stringify(data)}</div>
}
```

### useIntersectionObserver
Observes element intersection with viewport.

```typescript
import { useIntersectionObserver } from '@/hooks'

function LazyComponent() {
  const [node, entry] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true
  })
  
  return (
    <div ref={node}>
      {entry?.isIntersecting ? 'Visible!' : 'Not visible'}
    </div>
  )
}
```

### usePrevious
Tracks previous value of a state.

```typescript
import { usePrevious } from '@/hooks'

function CounterComponent() {
  const [count, setCount] = useState(0)
  const prevCount = usePrevious(count)
  
  return (
    <div>
      <p>Current: {count}</p>
      <p>Previous: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
```

## 🔗 LinkedIn API Hooks

### useLinkedInApi
Provides utilities for working with LinkedIn API objects.

```typescript
import { useLinkedInApi } from '@/hooks'

function LinkedInContent() {
  const { getLocalizedString, formatDate, getContentType } = useLinkedInApi({
    preferredLocale: 'en_US'
  })
  
  const videoTitle = getLocalizedString(video.title)
  const formattedDate = formatDate(video.createdDate)
  const contentType = getContentType(video)
  
  return (
    <div>
      <h3>{videoTitle}</h3>
      <p>Created: {formattedDate}</p>
      <p>Type: {contentType}</p>
    </div>
  )
}
```

### useLinkedInContent
Manages LinkedIn content with statistics.

```typescript
import { useLinkedInContent } from '@/hooks'

function ContentManager() {
  const { content, stats, addContent, removeContent } = useLinkedInContent()
  
  return (
    <div>
      <div>Total: {stats.total}</div>
      <div>Videos: {stats.videos}</div>
      <div>Images: {stats.images}</div>
      
      {content.map((item, index) => (
        <div key={index}>
          <span>{item.title}</span>
          <button onClick={() => removeContent(index)}>Remove</button>
        </div>
      ))}
    </div>
  )
}
```

### useLinkedInLocalization
Manages LinkedIn localization settings.

```typescript
import { useLinkedInLocalization } from '@/hooks'

function LocalizationSettings() {
  const { currentLocale, changeLocale, availableLocales } = useLinkedInLocalization()
  
  return (
    <select 
      value={currentLocale.language}
      onChange={(e) => changeLocale({ language: e.target.value })}
    >
      {availableLocales.map(locale => (
        <option key={locale.language} value={locale.language}>
          {locale.language}
        </option>
      ))}
    </select>
  )
}
```

## 🏗️ Providers

### AppProvider
Combines all providers for easy setup.

```typescript
import { AppProvider } from '@/lib'

function App({ children }) {
  return (
    <AppProvider
      themeConfig={{
        defaultTheme: 'professional',
        defaultDarkMode: false
      }}
      apiConfig={{
        baseUrl: '/api',
        timeout: 30000
      }}
    >
      {children}
    </AppProvider>
  )
}
```

### ThemeProvider
Manages theme state and provides theme utilities.

```typescript
import { ThemeProvider, useTheme } from '@/lib'

function ThemedComponent() {
  const { theme, setTheme, isDarkMode, toggleDarkMode } = useTheme()
  
  return (
    <div>
      <button onClick={toggleDarkMode}>
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>
      <p>Current theme: {theme?.name}</p>
    </div>
  )
}
```

### ApiProvider
Provides API utilities with error handling and retry logic.

```typescript
import { ApiProvider, useApi } from '@/lib'

function ApiComponent() {
  const { get, post, isLoading, isOnline } = useApi()
  
  const handleFetch = async () => {
    try {
      const data = await get('/api/users')
      console.log(data)
    } catch (error) {
      console.error('API call failed:', error)
    }
  }
  
  return (
    <div>
      <button onClick={handleFetch} disabled={!isOnline || isLoading}>
        {isLoading ? 'Loading...' : 'Fetch Data'}
      </button>
    </div>
  )
}
```

### NotificationProvider
Manages toast notifications.

```typescript
import { NotificationProvider, useToast } from '@/lib'

function NotificationComponent() {
  const { success, error, warning, info } = useToast()
  
  const handleSuccess = () => {
    success('Operation completed successfully!')
  }
  
  const handleError = () => {
    error('Something went wrong!')
  }
  
  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  )
}
```

## 📖 Usage Examples

### Complete Example with All Providers

```typescript
import { AppProvider } from '@/lib'
import { useDebounce, useAsync, useLinkedInApi } from '@/hooks'

function MyApp() {
  return (
    <AppProvider
      themeConfig={{ defaultTheme: 'professional' }}
      apiConfig={{ baseUrl: '/api' }}
    >
      <MainContent />
    </AppProvider>
  )
}

function MainContent() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const linkedInApi = useLinkedInApi()
  
  const { data, loading, execute } = useAsync(
    async () => {
      if (!debouncedSearch) return null
      const response = await fetch(`/api/search?q=${debouncedSearch}`)
      return response.json()
    },
    { immediate: false }
  )
  
  useEffect(() => {
    if (debouncedSearch) {
      execute()
    }
  }, [debouncedSearch, execute])
  
  return (
    <div>
      <input 
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      {loading && <div>Searching...</div>}
      {data && <SearchResults data={data} />}
    </div>
  )
}
```

## ✅ Best Practices

### 1. Hook Dependencies
Always include all dependencies in hook dependency arrays:

```typescript
// ✅ Good
useEffect(() => {
  fetchData(userId, filters)
}, [userId, filters, fetchData])

// ❌ Bad
useEffect(() => {
  fetchData(userId, filters)
}, [userId]) // Missing dependencies
```

### 2. Provider Composition
Compose providers in the correct order:

```typescript
// ✅ Good - Context providers first, then feature providers
<ContextSurfacerProvider>
  <ThemeProvider>
    <ApiProvider>
      <NotificationProvider>
        {children}
      </NotificationProvider>
    </ApiProvider>
  </ThemeProvider>
</ContextSurfacerProvider>
```

### 3. Error Handling
Always handle errors in async operations:

```typescript
// ✅ Good
const { data, error, loading } = useAsync(fetchData, {
  onError: (error) => {
    console.error('Failed to fetch data:', error)
    showNotification('Failed to load data', 'error')
  }
})
```

### 4. Performance Optimization
Use useCallback and useMemo for expensive operations:

```typescript
// ✅ Good
const expensiveValue = useMemo(() => {
  return heavyComputation(data)
}, [data])

const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```

### 5. Type Safety
Always use TypeScript types for better development experience:

```typescript
// ✅ Good
interface User {
  id: string
  name: string
  email: string
}

const { data: users } = useAsync<User[]>(fetchUsers)
```

## 🔧 Customization

### Creating Custom Hooks

```typescript
// Custom hook example
function useCustomHook(initialValue: string) {
  const [value, setValue] = useState(initialValue)
  const [isLoading, setIsLoading] = useState(false)
  
  const updateValue = useCallback(async (newValue: string) => {
    setIsLoading(true)
    try {
      await api.updateValue(newValue)
      setValue(newValue)
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  return { value, updateValue, isLoading }
}
```

### Extending Providers

```typescript
// Custom provider example
function CustomProvider({ children }) {
  const [customState, setCustomState] = useState({})
  
  const value = {
    customState,
    setCustomState,
    // ... other methods
  }
  
  return (
    <CustomContext.Provider value={value}>
      {children}
    </CustomContext.Provider>
  )
}
```

This guide provides comprehensive coverage of all hooks and providers in the AgentDash codebase. For more specific examples, check the demo component at `components/examples/hooks-and-providers-demo.tsx`.
