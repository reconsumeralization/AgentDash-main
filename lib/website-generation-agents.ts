import { SpecializedAgentFactory } from "./specialized-agents"
import { agentRegistry } from "./agent-integrators"

// Website Generation Types
export interface WebsiteSpec {
  id: string
  name: string
  description: string
  type: "landing" | "ecommerce" | "blog" | "portfolio" | "saas" | "corporate" | "custom"
  framework: "nextjs" | "react" | "vue" | "svelte" | "html"
  styling: "tailwind" | "css" | "styled-components" | "scss"
  features: WebsiteFeature[]
  pages: WebsitePage[]
  components: WebsiteComponent[]
  integrations: string[]
  theme: WebsiteTheme
  createdAt: Date
}

export interface WebsiteFeature {
  id: string
  name: string
  description: string
  type: "authentication" | "payment" | "cms" | "analytics" | "seo" | "api" | "database" | "custom"
  required: boolean
  config: Record<string, any>
}

export interface WebsitePage {
  id: string
  name: string
  path: string
  type: "static" | "dynamic" | "api"
  components: string[]
  layout: string
  seoConfig: SEOConfig
}

export interface WebsiteComponent {
  id: string
  name: string
  type: "header" | "footer" | "hero" | "form" | "card" | "navigation" | "custom"
  props: Record<string, any>
  styling: Record<string, any>
  responsive: boolean
}

export interface WebsiteTheme {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    foreground: string
  }
  typography: {
    headingFont: string
    bodyFont: string
    sizes: Record<string, string>
  }
  spacing: Record<string, string>
  borderRadius: string
  shadows: Record<string, string>
}

export interface SEOConfig {
  title: string
  description: string
  keywords: string[]
  ogImage?: string
  canonical?: string
}

export interface GenerationProgress {
  websiteId: string
  currentStage: string
  stagesCompleted: number
  stagesTotal: number
  currentTask: string
  progress: number
  errors: string[]
  generatedFiles: GeneratedFile[]
}

export interface GeneratedFile {
  path: string
  content: string
  type: "component" | "page" | "api" | "config" | "style"
  language: string
}

// Website Generation Agent Templates
const WEBSITE_GENERATION_AGENTS = {
  DESIGN_ARCHITECT: {
    name: "Design Architect",
    systemPrompt: `You are a web design architect specializing in creating comprehensive design systems 
    and user experience flows. You analyze requirements and create detailed design specifications, 
    component hierarchies, and responsive layouts that follow modern design principles.`,
    specializations: ["design_systems", "ux_flows", "responsive_design", "accessibility"],
    capabilities: ["wireframing", "component_design", "layout_planning", "color_theory"],
  },
  FRONTEND_DEVELOPER: {
    name: "Frontend Developer",
    systemPrompt: `You are an expert frontend developer who creates modern, performant web applications. 
    You write clean, maintainable code using the latest frameworks and best practices. You focus on 
    component reusability, performance optimization, and cross-browser compatibility.`,
    specializations: ["react_development", "nextjs_optimization", "component_architecture", "performance"],
    capabilities: ["component_creation", "state_management", "routing", "optimization"],
  },
  BACKEND_ARCHITECT: {
    name: "Backend Architect",
    systemPrompt: `You are a backend architect who designs scalable API architectures and database schemas. 
    You create secure, efficient backend systems with proper authentication, data validation, and 
    error handling. You focus on scalability and maintainability.`,
    specializations: ["api_design", "database_architecture", "authentication", "security"],
    capabilities: ["api_endpoints", "database_design", "auth_systems", "data_validation"],
  },
  SEO_SPECIALIST: {
    name: "SEO Specialist",
    systemPrompt: `You are an SEO specialist who optimizes websites for search engines and performance. 
    You implement technical SEO, create meta tags, optimize images, and ensure proper site structure. 
    You focus on Core Web Vitals and accessibility standards.`,
    specializations: ["technical_seo", "performance_optimization", "meta_optimization", "structured_data"],
    capabilities: ["seo_optimization", "performance_audit", "meta_generation", "sitemap_creation"],
  },
  CONTENT_STRATEGIST: {
    name: "Content Strategist",
    systemPrompt: `You are a content strategist who creates compelling, conversion-focused content for websites. 
    You understand user psychology, brand voice, and content marketing principles. You create content 
    that engages users and drives business objectives.`,
    specializations: ["copywriting", "content_strategy", "conversion_optimization", "brand_voice"],
    capabilities: ["content_creation", "copy_optimization", "user_messaging", "cta_optimization"],
  },
}

// Website Generation Factory
export class WebsiteGenerationFactory {
  private static websiteSpecs: Map<string, WebsiteSpec> = new Map()
  private static generationProgress: Map<string, GenerationProgress> = new Map()

  static createWebsiteSpec(
    name: string,
    description: string,
    type: WebsiteSpec["type"],
    requirements: Partial<WebsiteSpec>,
  ): WebsiteSpec {
    const spec: WebsiteSpec = {
      id: `website_${Date.now()}`,
      name,
      description,
      type,
      framework: "nextjs",
      styling: "tailwind",
      features: [],
      pages: [],
      components: [],
      integrations: [],
      theme: this.getDefaultTheme(),
      createdAt: new Date(),
      ...requirements,
    }

    this.websiteSpecs.set(spec.id, spec)
    return spec
  }

  private static getDefaultTheme(): WebsiteTheme {
    return {
      colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#f59e0b",
        background: "#ffffff",
        foreground: "#0f172a",
      },
      typography: {
        headingFont: "Inter",
        bodyFont: "Inter",
        sizes: {
          xs: "0.75rem",
          sm: "0.875rem",
          base: "1rem",
          lg: "1.125rem",
          xl: "1.25rem",
          "2xl": "1.5rem",
          "3xl": "1.875rem",
          "4xl": "2.25rem",
        },
      },
      spacing: {
        xs: "0.5rem",
        sm: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
      borderRadius: "0.5rem",
      shadows: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
      },
    }
  }

  static async generateWebsite(websiteId: string): Promise<GenerationProgress> {
    const spec = this.websiteSpecs.get(websiteId)
    if (!spec) throw new Error(`Website spec ${websiteId} not found`)

    // Initialize progress tracking
    const progress: GenerationProgress = {
      websiteId,
      currentStage: "Planning",
      stagesCompleted: 0,
      stagesTotal: 6,
      currentTask: "Analyzing requirements",
      progress: 0,
      errors: [],
      generatedFiles: [],
    }

    this.generationProgress.set(websiteId, progress)

    try {
      // Create specialized agents for website generation
      const agents = await this.createWebsiteGenerationTeam()

      // Stage 1: Design Architecture
      progress.currentStage = "Design Architecture"
      progress.currentTask = "Creating design system and component architecture"
      this.updateProgress(websiteId, progress)

      const designPlan = await this.executeDesignPhase(agents.designArchitect, spec)
      progress.stagesCompleted++
      progress.progress = (progress.stagesCompleted / progress.stagesTotal) * 100

      // Stage 2: Component Generation
      progress.currentStage = "Component Generation"
      progress.currentTask = "Generating reusable components"
      this.updateProgress(websiteId, progress)

      const components = await this.executeComponentGeneration(agents.frontendDeveloper, spec, designPlan)
      progress.generatedFiles.push(...components)
      progress.stagesCompleted++
      progress.progress = (progress.stagesCompleted / progress.stagesTotal) * 100

      // Stage 3: Page Generation
      progress.currentStage = "Page Generation"
      progress.currentTask = "Creating pages and layouts"
      this.updateProgress(websiteId, progress)

      const pages = await this.executePageGeneration(agents.frontendDeveloper, spec, components)
      progress.generatedFiles.push(...pages)
      progress.stagesCompleted++
      progress.progress = (progress.stagesCompleted / progress.stagesTotal) * 100

      // Stage 4: Backend Integration
      progress.currentStage = "Backend Integration"
      progress.currentTask = "Setting up APIs and database"
      this.updateProgress(websiteId, progress)

      const backend = await this.executeBackendGeneration(agents.backendArchitect, spec)
      progress.generatedFiles.push(...backend)
      progress.stagesCompleted++
      progress.progress = (progress.stagesCompleted / progress.stagesTotal) * 100

      // Stage 5: Content Integration
      progress.currentStage = "Content Integration"
      progress.currentTask = "Adding content and copy"
      this.updateProgress(websiteId, progress)

      const content = await this.executeContentGeneration(agents.contentStrategist, spec)
      progress.generatedFiles.push(...content)
      progress.stagesCompleted++
      progress.progress = (progress.stagesCompleted / progress.stagesTotal) * 100

      // Stage 6: SEO Optimization
      progress.currentStage = "SEO Optimization"
      progress.currentTask = "Optimizing for search engines"
      this.updateProgress(websiteId, progress)

      const seo = await this.executeSEOOptimization(agents.seoSpecialist, spec)
      progress.generatedFiles.push(...seo)
      progress.stagesCompleted++
      progress.progress = 100

      progress.currentStage = "Completed"
      progress.currentTask = "Website generation complete"
      this.updateProgress(websiteId, progress)

      return progress
    } catch (error) {
      progress.errors.push(error instanceof Error ? error.message : "Unknown error")
      this.updateProgress(websiteId, progress)
      throw error
    }
  }

  private static async createWebsiteGenerationTeam() {
    const agents = {
      designArchitect: "",
      frontendDeveloper: "",
      backendArchitect: "",
      seoSpecialist: "",
      contentStrategist: "",
    }

    // Create and register specialized agents
    for (const [key, template] of Object.entries(WEBSITE_GENERATION_AGENTS)) {
      const agent = SpecializedAgentFactory.createSpecializedAgent("CONTENT_CREATION", {
        name: template.name,
        systemPrompt: template.systemPrompt,
        specializations: template.specializations,
        capabilities: template.capabilities,
      })

      agentRegistry.registerAgent(agent)
      agents[key.toLowerCase() as keyof typeof agents] = agent.id
    }

    return agents
  }

  private static async executeDesignPhase(agentId: string, spec: WebsiteSpec): Promise<any> {
    const prompt = `
Create a comprehensive design architecture for a ${spec.type} website named "${spec.name}".

Requirements:
- Framework: ${spec.framework}
- Styling: ${spec.styling}
- Features: ${spec.features.map((f) => f.name).join(", ")}
- Theme: ${JSON.stringify(spec.theme)}

Please provide:
1. Component hierarchy and design system
2. Layout structure for each page type
3. Responsive breakpoints and mobile-first approach
4. Accessibility considerations
5. Color palette and typography scale
    `

    const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, prompt)
    const execution = agentRegistry.getExecution(executionId)
    return execution?.output || ""
  }

  private static async executeComponentGeneration(
    agentId: string,
    spec: WebsiteSpec,
    designPlan: string,
  ): Promise<GeneratedFile[]> {
    const components: GeneratedFile[] = []

    // Generate common components
    const componentTypes = ["Header", "Footer", "Hero", "Card", "Button", "Form", "Navigation"]

    for (const componentType of componentTypes) {
      const prompt = `
Create a ${componentType} component for a ${spec.framework} application using ${spec.styling}.

Design Plan Context:
${designPlan}

Requirements:
- Follow the design system and theme
- Make it responsive and accessible
- Include proper TypeScript types
- Use modern React patterns
- Include proper styling with ${spec.styling}

Generate clean, production-ready code.
      `

      const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, prompt)
      const execution = agentRegistry.getExecution(executionId)

      if (execution?.output) {
        components.push({
          path: `components/${componentType.toLowerCase()}.tsx`,
          content: execution.output,
          type: "component",
          language: "typescript",
        })
      }
    }

    return components
  }

  private static async executePageGeneration(
    agentId: string,
    spec: WebsiteSpec,
    components: GeneratedFile[],
  ): Promise<GeneratedFile[]> {
    const pages: GeneratedFile[] = []

    // Generate pages based on website type
    const pageTypes = this.getPageTypesForWebsite(spec.type)

    for (const pageType of pageTypes) {
      const prompt = `
Create a ${pageType} page for a ${spec.framework} ${spec.type} website.

Available Components:
${components.map((c) => `- ${c.path}`).join("\n")}

Requirements:
- Use the generated components appropriately
- Follow ${spec.framework} best practices
- Include proper SEO meta tags
- Make it responsive and accessible
- Include loading states and error handling

Generate a complete page component.
      `

      const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, prompt)
      const execution = agentRegistry.getExecution(executionId)

      if (execution?.output) {
        pages.push({
          path: `app/${pageType.toLowerCase()}/page.tsx`,
          content: execution.output,
          type: "page",
          language: "typescript",
        })
      }
    }

    return pages
  }

  private static async executeBackendGeneration(agentId: string, spec: WebsiteSpec): Promise<GeneratedFile[]> {
    const backendFiles: GeneratedFile[] = []

    if (spec.features.some((f) => f.type === "api" || f.type === "database" || f.type === "authentication")) {
      const prompt = `
Create backend API routes and database schema for a ${spec.type} website.

Features requiring backend:
${spec.features
  .filter((f) => ["api", "database", "authentication"].includes(f.type))
  .map((f) => f.name)
  .join(", ")}

Requirements:
- Use ${spec.framework} API routes
- Include proper error handling and validation
- Add authentication middleware if needed
- Create database schema and migrations
- Include proper TypeScript types

Generate production-ready backend code.
      `

      const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, prompt)
      const execution = agentRegistry.getExecution(executionId)

      if (execution?.output) {
        backendFiles.push({
          path: "app/api/route.ts",
          content: execution.output,
          type: "api",
          language: "typescript",
        })
      }
    }

    return backendFiles
  }

  private static async executeContentGeneration(agentId: string, spec: WebsiteSpec): Promise<GeneratedFile[]> {
    const contentFiles: GeneratedFile[] = []

    const prompt = `
Create compelling content and copy for a ${spec.type} website named "${spec.name}".

Description: ${spec.description}

Requirements:
- Create engaging headlines and copy
- Write conversion-focused content
- Include proper calls-to-action
- Maintain consistent brand voice
- Optimize for user engagement

Generate content for all major sections and pages.
    `

    const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, prompt)
    const execution = agentRegistry.getExecution(executionId)

    if (execution?.output) {
      contentFiles.push({
        path: "content/copy.json",
        content: execution.output,
        type: "config",
        language: "json",
      })
    }

    return contentFiles
  }

  private static async executeSEOOptimization(agentId: string, spec: WebsiteSpec): Promise<GeneratedFile[]> {
    const seoFiles: GeneratedFile[] = []

    const prompt = `
Create comprehensive SEO optimization for a ${spec.type} website.

Requirements:
- Generate meta tags for all pages
- Create sitemap.xml
- Add structured data markup
- Optimize for Core Web Vitals
- Include robots.txt
- Add Open Graph and Twitter Card meta

Generate all necessary SEO files and configurations.
    `

    const executionId = await SpecializedAgentFactory.executeWithMemory(agentId, prompt)
    const execution = agentRegistry.getExecution(executionId)

    if (execution?.output) {
      seoFiles.push({
        path: "public/sitemap.xml",
        content: execution.output,
        type: "config",
        language: "xml",
      })
    }

    return seoFiles
  }

  private static getPageTypesForWebsite(type: WebsiteSpec["type"]): string[] {
    const pageMap = {
      landing: ["home", "about", "contact"],
      ecommerce: ["home", "products", "product", "cart", "checkout", "account"],
      blog: ["home", "blog", "post", "about", "contact"],
      portfolio: ["home", "portfolio", "project", "about", "contact"],
      saas: ["home", "features", "pricing", "dashboard", "login", "signup"],
      corporate: ["home", "about", "services", "team", "contact"],
      custom: ["home", "about", "contact"],
    }

    return pageMap[type] || pageMap.custom
  }

  private static updateProgress(websiteId: string, progress: GenerationProgress) {
    this.generationProgress.set(websiteId, progress)
  }

  static getWebsiteSpec(websiteId: string): WebsiteSpec | undefined {
    return this.websiteSpecs.get(websiteId)
  }

  static getAllWebsiteSpecs(): WebsiteSpec[] {
    return Array.from(this.websiteSpecs.values())
  }

  static getGenerationProgress(websiteId: string): GenerationProgress | undefined {
    return this.generationProgress.get(websiteId)
  }

  static getAllGenerationProgress(): GenerationProgress[] {
    return Array.from(this.generationProgress.values())
  }
}

// Website Template Library
export const WEBSITE_TEMPLATES = {
  STARTUP_LANDING: {
    name: "Startup Landing Page",
    description: "Modern landing page for startups with hero section, features, and CTA",
    type: "landing" as const,
    features: [
      { id: "1", name: "Hero Section", description: "Eye-catching header with main value proposition", type: "custom" as const, required: true, config: {} },
      { id: "2", name: "Feature Showcase", description: "Display key product features and benefits", type: "custom" as const, required: true, config: {} },
      { id: "3", name: "Contact Form", description: "Lead capture form for user engagement", type: "custom" as const, required: true, config: {} },
    ],
  },
  ECOMMERCE_STORE: {
    name: "E-commerce Store",
    description: "Full-featured online store with product catalog and checkout",
    type: "ecommerce" as const,
    features: [
      { id: "1", name: "Product Catalog", description: "Display products with images and details", type: "custom" as const, required: true, config: {} },
      { id: "2", name: "Shopping Cart", description: "Manage items and checkout process", type: "custom" as const, required: true, config: {} },
      { id: "3", name: "Payment Processing", description: "Secure payment gateway integration", type: "payment" as const, required: true, config: {} },
      { id: "4", name: "User Authentication", description: "User registration and login system", type: "authentication" as const, required: true, config: {} },
    ],
  },
  SAAS_PLATFORM: {
    name: "SaaS Platform",
    description: "Complete SaaS application with dashboard and user management",
    type: "saas" as const,
    features: [
      { id: "1", name: "User Dashboard", description: "Personalized user interface and controls", type: "custom" as const, required: true, config: {} },
      { id: "2", name: "Authentication System", description: "Secure user login and account management", type: "authentication" as const, required: true, config: {} },
      { id: "3", name: "Subscription Management", description: "Handle billing and subscription plans", type: "payment" as const, required: true, config: {} },
      { id: "4", name: "API Integration", description: "Connect with external services and APIs", type: "api" as const, required: true, config: {} },
    ],
  },
}
