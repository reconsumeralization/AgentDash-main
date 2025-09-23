# AgentDash Component Library

This document provides comprehensive documentation for the AgentDash component library.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Base Components](#base-components)
- [Social Media Components](#social-media-components)
- [Agent Components](#agent-components)
- [Analytics Components](#analytics-components)
- [UI Components](#ui-components)
- [Layout Components](#layout-components)
- [Form Components](#form-components)
- [Theming](#theming)
- [Best Practices](#best-practices)

## Overview

The AgentDash component library provides a comprehensive set of React components built with TypeScript, Tailwind CSS, and Radix UI primitives. All components are designed to work seamlessly with the AgentDash platform's theming system and responsive design principles.

### Key Features

- **TypeScript**: Full type safety and IntelliSense support
- **Accessible**: Built on Radix UI primitives for accessibility
- **Responsive**: Mobile-first design with responsive utilities
- **Themable**: Context-aware theming system
- **Customizable**: Extensive customization options
- **Performance**: Optimized for performance with proper memoization

## Installation

### Package Installation

```bash
npm install @agentdash/components
```

### Peer Dependencies

```bash
npm install react react-dom tailwindcss @radix-ui/react-* lucide-react
```

### Tailwind Configuration

Add to your `tailwind.config.js`:

```javascript
module.exports = {
  content: [
    './node_modules/@agentdash/components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // AgentDash theme extensions
    }
  },
  plugins: [
    require('@agentdash/components/plugin'),
  ],
}
```

## Base Components

### Button

A versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@agentdash/components'

// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// With sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icons
<Button>
  <Plus className="w-4 h-4 mr-2" />
  Add Item
</Button>

// As link
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
- `size`: 'sm' | 'md' | 'lg'
- `disabled`: boolean
- `loading`: boolean
- `asChild`: boolean (for composition)

### Card

A flexible card component for content organization.

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@agentdash/components'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Badge

A small status or category indicator.

```tsx
import { Badge } from '@agentdash/components'

<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Error</Badge>
<Badge variant="outline">Outline</Badge>
```

## Social Media Components

### SocialAccountCard

Display social media account information with connection status.

```tsx
import { SocialAccountCard } from '@agentdash/components'

<SocialAccountCard
  account={{
    id: 'acc_123',
    platform: 'linkedin',
    username: 'john_doe',
    displayName: 'John Doe',
    followers: 1500,
    isConnected: true,
    lastSync: '2024-01-01T10:00:00Z'
  }}
  onConnect={() => console.log('Connect')}
  onDisconnect={() => console.log('Disconnect')}
/>
```

### PostComposer

Rich text editor for creating social media posts.

```tsx
import { PostComposer } from '@agentdash/components'

<PostComposer
  platforms={['linkedin', 'twitter']}
  onPost={(post) => console.log('Post created:', post)}
  onSchedule={(post, date) => console.log('Post scheduled:', post, date)}
  suggestions={[
    { text: 'Great content!', type: 'hashtag' },
    { text: '@mention', type: 'mention' }
  ]}
/>
```

### PostCard

Display a social media post with engagement metrics.

```tsx
import { PostCard } from '@agentdash/components'

<PostCard
  post={{
    id: 'post_123',
    platform: 'linkedin',
    content: {
      text: 'Excited to share our latest update!',
      hashtags: ['innovation', 'product'],
      media: [{ type: 'image', url: 'image.jpg' }]
    },
    status: 'published',
    publishedAt: '2024-01-01T15:00:00Z',
    engagement: {
      likes: 45,
      comments: 12,
      shares: 8,
      clicks: 23
    }
  }}
  showAnalytics={true}
  onEdit={(post) => console.log('Edit post:', post)}
  onDelete={(post) => console.log('Delete post:', post)}
/>
```

### AnalyticsChart

Interactive charts for social media analytics.

```tsx
import { AnalyticsChart } from '@agentdash/components'

<AnalyticsChart
  data={[
    { date: '2024-01-01', engagement: 450, reach: 1250 },
    { date: '2024-01-02', engagement: 520, reach: 1400 },
    // ... more data
  ]}
  metrics={['engagement', 'reach']}
  type="line"
  height={300}
/>
```

## Agent Components

### AgentCard

Display agent information and status.

```tsx
import { AgentCard } from '@agentdash/components'

<AgentCard
  agent={{
    id: 'agent_123',
    name: 'LinkedIn Growth Agent',
    type: 'social_media',
    status: 'active',
    capabilities: ['posting', 'analytics', 'engagement'],
    lastActive: '2024-01-01T12:00:00Z'
  }}
  onConfigure={() => console.log('Configure agent')}
  onStart={() => console.log('Start agent')}
  onStop={() => console.log('Stop agent')}
/>
```

### AgentDashboard

Comprehensive dashboard for agent management.

```tsx
import { AgentDashboard } from '@agentdash/components'

<AgentDashboard
  agents={agents}
  onAgentSelect={(agent) => console.log('Agent selected:', agent)}
  onCreateAgent={() => console.log('Create agent')}
  onEditAgent={(agent) => console.log('Edit agent:', agent)}
/>
```

### AgentConfiguration

Form component for configuring agent settings.

```tsx
import { AgentConfiguration } from '@agentdash/components'

<AgentConfiguration
  agentType="social_media"
  initialConfig={{
    platforms: ['linkedin'],
    postingFrequency: 'daily',
    contentTypes: ['text', 'image']
  }}
  onSave={(config) => console.log('Config saved:', config)}
  onCancel={() => console.log('Config cancelled')}
/>
```

## Analytics Components

### MetricsCard

Display key performance metrics.

```tsx
import { MetricsCard } from '@agentdash/components'

<MetricsCard
  title="Total Engagement"
  value={12500}
  change={15.2}
  changeType="increase"
  format="number"
  icon={Heart}
/>
```

### PerformanceChart

Advanced chart component for performance visualization.

```tsx
import { PerformanceChart } from '@agentdash/components'

<PerformanceChart
  data={performanceData}
  type="area"
  metrics={['impressions', 'clicks', 'conversions']}
  timeRange="30d"
  granularity="daily"
  height={400}
  showLegend={true}
  interactive={true}
/>
```

### AnalyticsTable

Data table for analytics with sorting and filtering.

```tsx
import { AnalyticsTable } from '@agentdash/components'

<AnalyticsTable
  data={analyticsData}
  columns={[
    { key: 'date', label: 'Date', sortable: true },
    { key: 'platform', label: 'Platform', filterable: true },
    { key: 'engagement', label: 'Engagement', sortable: true },
    { key: 'reach', label: 'Reach', sortable: true }
  ]}
  onRowClick={(row) => console.log('Row clicked:', row)}
  pagination={{ page: 1, limit: 20, total: 100 }}
/>
```

## UI Components

### Modal

Flexible modal component with backdrop and animations.

```tsx
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@agentdash/components'

<Modal>
  <ModalTrigger asChild>
    <Button>Open Modal</Button>
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Modal Title</ModalTitle>
    </ModalHeader>
    <ModalBody>
      <p>Modal content goes here</p>
    </ModalBody>
    <ModalFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>
```

### Dropdown

Dropdown menu component with keyboard navigation.

```tsx
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from '@agentdash/components'

<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="outline">Options</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem>Duplicate</DropdownItem>
    <DropdownSeparator />
    <DropdownItem variant="destructive">Delete</DropdownItem>
  </DropdownContent>
</Dropdown>
```

### Tabs

Tabbed interface component.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@agentdash/components'

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="analytics">Analytics</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <p>Overview content</p>
  </TabsContent>
  <TabsContent value="analytics">
    <p>Analytics content</p>
  </TabsContent>
  <TabsContent value="settings">
    <p>Settings content</p>
  </TabsContent>
</Tabs>
```

## Layout Components

### Container

Responsive container with max-width constraints.

```tsx
import { Container } from '@agentdash/components'

<Container size="lg">
  <h1>Page Title</h1>
  <p>Page content</p>
</Container>
```

### Grid

CSS Grid layout component.

```tsx
import { Grid } from '@agentdash/components'

<Grid cols={3} gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Grid>

// Responsive grid
<Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
  {/* Grid items */}
</Grid>
```

### Stack

Vertical or horizontal stack layout.

```tsx
import { Stack } from '@agentdash/components'

<Stack direction="vertical" gap={4}>
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>

<Stack direction="horizontal" gap={2} align="center">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Stack>
```

## Form Components

### Input

Styled input component with validation states.

```tsx
import { Input } from '@agentdash/components'

<Input
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  error={error}
  disabled={loading}
/>
```

### Select

Dropdown select component.

```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@agentdash/components'

<Select value={selected} onValueChange={setSelected}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
    <SelectItem value="option3">Option 3</SelectItem>
  </SelectContent>
</Select>
```

### Form

Form component with validation and error handling.

```tsx
import { Form, FormField, FormLabel, FormControl, FormMessage, FormDescription } from '@agentdash/components'

<Form onSubmit={handleSubmit}>
  <FormField>
    <FormLabel>Email</FormLabel>
    <FormControl>
      <Input type="email" {...register('email')} />
    </FormControl>
    <FormMessage>{errors.email?.message}</FormMessage>
    <FormDescription>Enter your email address</FormDescription>
  </FormField>
</Form>
```

## Theming

### Theme Provider

Context-aware theming system.

```tsx
import { ThemeProvider, useTheme } from '@agentdash/components'

// App level
<ThemeProvider
  theme={{
    primary: 'linkedin',
    mode: 'light',
    customColors: {
      brand: '#0077B5'
    }
  }}
>
  <App />
</ThemeProvider>

// Component level
function MyComponent() {
  const { theme, setTheme } = useTheme()
  
  return (
    <div className={theme.primary}>
      Current theme: {theme.primary}
    </div>
  )
}
```

### Theme Variants

```tsx
// LinkedIn theme
const linkedinTheme = {
  primary: '#0077B5',
  secondary: '#F3F2EF',
  accent: '#004182',
  background: '#FFFFFF',
  surface: '#F3F2EF'
}

// Security theme
const securityTheme = {
  primary: '#DC2626',
  secondary: '#FEF2F2',
  accent: '#991B1B',
  background: '#FFFFFF',
  surface: '#FEF2F2'
}

// Hybrid theme (LinkedIn + Security)
const hybridTheme = {
  primary: '#8B5CF6',
  secondary: '#F3F2EF',
  accent: '#004182',
  background: '#FFFFFF',
  surface: '#F3F2EF'
}
```

## Best Practices

### Performance

```tsx
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Expensive rendering */}</div>
})

// Use useMemo for expensive calculations
const processedData = useMemo(() => {
  return expensiveDataProcessing(data)
}, [data])

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  console.log('Clicked')
}, [])
```

### Accessibility

```tsx
// Always provide proper labels
<Button aria-label="Close modal">×</Button>

// Use semantic HTML
<main>
  <h1>Page Title</h1>
  <section aria-labelledby="section-title">
    <h2 id="section-title">Section Title</h2>
  </section>
</main>

// Provide keyboard navigation
<div role="button" tabIndex={0} onKeyDown={handleKeyDown}>
  Custom button
</div>
```

### Responsive Design

```tsx
// Use responsive utilities
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// Use responsive props
<Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={{ sm: 2, md: 4, lg: 6 }}>
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</Grid>
```

### Error Handling

```tsx
// Use error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <MyComponent />
</ErrorBoundary>

// Handle loading states
{loading ? (
  <Skeleton />
) : error ? (
  <ErrorMessage error={error} />
) : (
  <DataDisplay data={data} />
)}
```

---

## Examples

### Complete Dashboard

```tsx
import { 
  Container, 
  Grid, 
  MetricsCard, 
  AnalyticsChart, 
  SocialAccountCard,
  AgentCard 
} from '@agentdash/components'

function Dashboard() {
  return (
    <Container size="xl">
      <h1>Dashboard</h1>
      
      <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap={4} className="mb-8">
        <MetricsCard title="Total Posts" value={245} change={12.5} />
        <MetricsCard title="Engagement" value={12500} change={8.2} />
        <MetricsCard title="Followers" value={8500} change={15.1} />
        <MetricsCard title="Growth Rate" value="12.5%" change={2.1} />
      </Grid>
      
      <Grid cols={{ sm: 1, lg: 2 }} gap={6} className="mb-8">
        <AnalyticsChart data={chartData} type="line" />
        <SocialAccountCard account={linkedinAccount} />
      </Grid>
      
      <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap={4}>
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </Grid>
    </Container>
  )
}
```

---

## Support

### Documentation
- [API Documentation](api.md)
- [Integration Guide](integration.md)
- [Getting Started Guide](getting-started.md)

### Community
- [GitHub Issues](https://github.com/agentdash/components/issues)
- [Discord Community](https://discord.gg/agentdash)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/agentdash-components)

### Professional Support
For enterprise support and custom components:
- **Email**: components-support@agentdash.com
- **Phone**: +1 (555) 123-4567
- **Hours**: Monday-Friday, 9 AM - 6 PM PST

---

**Last Updated**: 2024-01-01
**Component Library Version**: v2.1.0
**React Version**: ^18.0.0
**TypeScript Version**: ^5.0.0
