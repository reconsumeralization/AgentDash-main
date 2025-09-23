# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Development Scripts
```bash
# Development server
npm run dev              # Start development server on port 3000

# Building and production
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run Next.js linting

# Core testing commands
npm run test            # Run custom test suite
npm run test:api        # Test API endpoints only
npm run test:ui         # Test UI components only
npm run test:integration # Integration tests only

# Playwright testing
npm run test:playwright          # Run Playwright tests
npm run test:playwright:api      # API endpoint tests with Playwright
npm run test:playwright:ui       # UI tests with Playwright
npm run test:playwright:headed   # Run tests with browser UI
npm run test:playwright:debug    # Debug mode for tests
npm run playwright:install       # Install Playwright browsers

# Advanced testing workflows
npm run test:loop               # Run test loop system
npm run test:enhanced           # Enhanced test runner
npm run test:automated          # Automated test runner with fixes
npm run test:monitor            # Test monitoring dashboard
```

### Demo and Feature Testing
```bash
# Component demos
npm run guidance:demo          # Code intelligence demo
npm run social:demo           # Social media management demo
npm run security:demo         # Security intelligence demo
npm run mcp:demo             # MCP extensions demo
npm run algo:demo            # Algorithmic tools demo
npm run ai:demo              # AI platform demo
npm run context:demo         # Context surfacer demo
npm run fuzzing:demo         # Security fuzzing demo

# Demo with server (auto-starts dev server)
npm run guidance:test         # Guidance demo with dev server
npm run social:test          # Social media demo with dev server
npm run security:test        # Security demo with dev server
npm run mcp:test            # MCP demo with dev server
npm run algo:test           # Algorithmic tools with dev server
npm run ai:test             # AI platform with dev server
npm run context:test        # Context surfacer with dev server
npm run fuzzing:test        # Fuzzing demo with dev server
```

### Advanced Testing Systems
```bash
# Systems thinking and comprehensive testing
npm run test:systems:thinking        # Systems thinking demo
npm run test:systems:model          # Systems thinking model
npm run test:systems:comprehensive  # Comprehensive systems demo
npm run test:system:orchestrator    # System orchestrator
npm run test:demo:comprehensive     # Comprehensive demo suite
npm run demo:analyst-agent          # Analyst agent demo
```

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, TypeScript, Tailwind CSS, Radix UI components
- **Backend**: Node.js API routes
- **Database**: Supabase PostgreSQL (optional)
- **Authentication**: Clerk (optional, demo mode without auth)
- **AI Integration**: OpenAI GPT, dynamic AI provider selection
- **Testing**: Playwright, custom test runners
- **Analytics**: Vercel Analytics

### Core Platform Modules

This is a comprehensive AI agent management platform with multiple specialized modules:

1. **Agent Orchestration** (`lib/agent-orchestrator.ts`, `components/agent-orchestration-dashboard.tsx`)
   - Multi-agent deployment and management
   - Agent lifecycle management and monitoring
   - Workflow automation with visual builder

2. **Professional Networking (DefConect)**
   - LinkedIn automation and management (`lib/linkedin-data-processor.ts`)
   - Professional relationship mapping
   - Aspiration-based matching system (`components/aspiration-matching-engine.tsx`)

3. **Code Intelligence & Guidance** (`lib/guidance-engine.ts`)
   - AI-powered code generation and analysis
   - Performance analytics and optimization
   - Smart development suggestions

4. **Security Intelligence** (`lib/stateful-fuzzing-engine.ts`)
   - Automated vulnerability scanning
   - Security monitoring and threat detection
   - Compliance tracking and reporting

5. **Social Media Management** (`lib/social-media-types.ts`)
   - Cross-platform social media automation
   - Content calendar and analytics
   - Multi-platform connector system

6. **MCP Extensions** (`lib/native-mcp-extension.ts`)
   - Model Context Protocol integrations
   - Extensible AI model management
   - Native extension registry

### Key Architectural Patterns

#### Provider-Based Architecture
The app uses React context providers for state management:
- `ThemeProvider` - Theme and styling management
- `NotificationProvider` - Toast notifications and alerts
- `ModalProvider` - Modal dialog management
- `ErrorBoundary` - Error handling and recovery

#### Type Safety
Comprehensive TypeScript definitions in `lib/types.ts` covering:
- Agent capabilities and execution models
- Workflow definitions and orchestration
- LinkedIn integration types
- VDR (Virtual Data Room) business logic
- Security and compliance interfaces

#### Modular Component System
- `components/ui/` - Base UI components (Radix UI based)
- `components/providers/` - Context providers
- `components/layouts/` - Themed layout components
- Feature-specific components organized by domain

#### API Route Organization
- `app/api/` - RESTful API endpoints
- Domain-specific route groupings (agents, guidance, social-media, etc.)
- Consistent response patterns with `ApiResponse<T>` types

### Environment Configuration

The app supports flexible configuration:
- **Demo Mode**: Works without authentication when Clerk keys not provided
- **Optional Services**: Supabase, LinkedIn API, various AI providers
- **Development**: Uses `env.example` as template

Required for basic functionality:
```env
OPENAI_API_KEY=your_openai_api_key
```

Optional integrations:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

### Testing Strategy

Multi-layered testing approach:
1. **Unit Tests**: Custom test runner (`tests/test-runner.js`)
2. **API Tests**: Playwright-based API testing
3. **Integration Tests**: End-to-end workflow testing
4. **Demo Testing**: Live feature demonstrations with health checks
5. **Monitoring**: Real-time test monitoring dashboards

### Development Guidelines

#### File Naming and Organization
- Use kebab-case for file names
- Group related functionality in modules
- Separate concerns: UI components, business logic, types
- API routes follow RESTful conventions

#### Component Development
- Use TypeScript interfaces from `lib/types.ts`
- Follow Radix UI patterns for consistency
- Implement proper error boundaries
- Use context providers for shared state

#### API Development
- Return consistent `ApiResponse<T>` format
- Implement proper error handling
- Use TypeScript for request/response types
- Follow domain-driven route organization

#### Agent Development
- Extend base agent capabilities in `lib/agent-tools.ts`
- Use workflow definitions for complex operations
- Implement proper monitoring and logging
- Follow agent orchestration patterns

## Common Development Tasks

### Adding New Agent Types
1. Define agent capabilities in `lib/types.ts`
2. Implement agent logic in `lib/specialized-agents.ts`
3. Create UI components in `components/`
4. Add API routes in `app/api/agents/`
5. Update orchestration dashboard

### Adding New Integrations
1. Define integration config in `lib/types.ts`
2. Implement connector in `lib/` directory
3. Add API routes for integration management
4. Create management UI components
5. Update integration framework

### Testing New Features
1. Write unit tests using custom test runner
2. Add Playwright tests for API endpoints
3. Create demo scripts in `scripts/`
4. Test with monitoring dashboard
5. Run comprehensive test suite

### Building for Production
1. Run `npm run build` to create production build
2. Test with `npm run start`
3. Verify all integrations work in production mode
4. Deploy to Vercel or preferred platform