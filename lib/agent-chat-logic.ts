import type { Aspiration } from './supabase'
import type { Message, AgentActivity, AgentProcess, UserGoals } from './types'

// Enhanced AI Consciousness - LinkedIn Strategy Intelligence
export const getLinkedInStrategyResponse = (userInput: string): string | null => {
  const input = userInput.toLowerCase();

  if (input.includes("4-star") || input.includes("four star") || input.includes("general")) {
    return "🎯 **4-Star General Strategy Activated!**\n\nThese elite connectors have acceptance rates under 10% and maintain networks under 500 people. Their connections are gold. I've identified 3 potential 4-star generals in AI/tech leadership:\n\n1. **Sarah Chen** - OpenAI Exec, 47 connections\n2. **Marcus Rodriguez** - Anthropic CTO, 52 connections  \n3. **Dr. Lisa Park** - DeepMind Director, 38 connections\n\nWould you like me to draft personalized invitation messages for these high-value targets?";
  }

  if (input.includes("cherry pick") || input.includes("cherry-pick") || input.includes("valuable connections")) {
    return "🍒 **Cherry-Picking Protocol Initiated!**\n\nInstead of mass connections, let's surgically extract value from premium networks. Current analysis shows:\n\n• **47 high-value 2nd-degree connections** through your existing network\n• **12 active tribes** with complementary skills\n• **23K available connection slots** (you're at 29.8K/30K)\n\nReady to identify your next cherry-pick targets? I can analyze your network for the highest ROI connections.";
  }

  if (input.includes("purge") || input.includes("clean") || input.includes("optimize network")) {
    return "🧹 **Network Optimization Starting...**\n\nWith LinkedIn's 30K limit, strategic purging is essential. Analysis complete:\n\n• **156 dormant connections** (last activity >2 years)\n• **89 low-engagement contacts** (no mutual interactions)\n• **42 industry mismatches** (no longer relevant)\n\nPurging these would free up **287 slots** for high-value connections. Should I proceed with automated cleanup recommendations?";
  }

  if (input.includes("recruit") || input.includes("hiring") || input.includes("executive search")) {
    return "🎯 **Automated Recruitment Vision Active!**\n\nYour goal to become the world's most prolific executive search company is brilliant. Current capabilities:\n\n• **AI-powered candidate matching** by aspiration compatibility\n• **Automated outreach sequences** for warm introductions\n• **Dream team assembly** for complex projects\n\nWhat position are we recruiting for? I can analyze the ideal candidate profile and identify potential matches from your network.";
  }

  if (input.includes("tribe") || input.includes("community") || input.includes("ai innovation")) {
    return "🌐 **AI Innovation Tribe Building Active!**\n\nYour tribe currently has **12 active members** across:\n\n• **AI Research**: 4 members\n• **Product Leadership**: 3 members\n• **VC/Investors**: 3 members\n• **Engineering**: 2 members\n\nRecent activity: 3 new introductions, 2 collaboration opportunities identified. Would you like me to identify potential new tribe members or suggest collaboration projects?";
  }

  if (input.includes("vc") || input.includes("funding") || input.includes("investment")) {
    return "💰 **VC Funding Strategy Activated!**\n\nYour funding journey is critical. Current network analysis:\n\n• **23 VC connections** (direct and 1st-degree)\n• **47 potential investors** in your extended network\n• **12 warm introductions** available through mutual contacts\n\nI can help craft your funding narrative and identify the optimal outreach sequence. What's your current funding stage and target amount?";
  }

  if (input.includes("connection limit") || input.includes("30k") || input.includes("limit")) {
    return "📊 **Connection Limit Management**\n\nYou're currently at **29.8K/30K connections** - that's excellent positioning!\n\n**Strategic Recommendations:**\n• Focus on quality over quantity\n• Prioritize 4-star generals and tribe builders\n• Regular network audits (quarterly)\n• Cherry-pick from high-value networks\n\nWould you like me to analyze your connection velocity and predict when you'll hit the limit?";
  }

  if (input.includes("outreach") || input.includes("email") || input.includes("message")) {
    return "📧 **Automated Outreach System Ready**\n\nYour email outreach strategy can be enhanced with AI personalization:\n\n• **Personalized messaging** based on recipient's aspirations\n• **Automated follow-ups** with engagement tracking\n• **A/B testing** for optimal response rates\n• **Integration** with LinkedIn connection requests\n\nReady to create an outreach sequence? What type of connections are you targeting?";
  }

  return null;
};

export const getProactiveSuggestions = (userGoals: UserGoals, userAspirations: Aspiration[]): Message[] => {
  const suggestions: Message[] = [];
  const now = new Date();
  const hoursSinceLastInteraction = (now.getTime() - userGoals.lastInteraction.getTime()) / (1000 * 60 * 60);

  // LinkedIn-specific proactive suggestions
  if (hoursSinceLastInteraction > 6) {
    suggestions.push({
      id: `linkedin-${Date.now()}-strategy`,
      content: `🔥 **LinkedIn Strategy Alert**: You're approaching 30K connections! With only 200 slots remaining, I recommend focusing on 4-star generals and cherry-picking from premium networks. Would you like me to analyze your network for optimization opportunities?`,
      role: "assistant",
      timestamp: new Date(),
      agentType: "linkedin",
      linkedinStrategy: true,
      proactiveSuggestion: "linkedin-strategy"
    });

    suggestions.push({
      id: `linkedin-${Date.now()}-tribe`,
      content: `🌐 **Tribe Building Opportunity**: Your AI innovation tribe has grown to 12 members, but I see 3 potential high-value additions in AI leadership. Ready to expand your professional network strategically?`,
      role: "assistant",
      timestamp: new Date(),
      agentType: "linkedin",
      linkedinStrategy: true,
      proactiveSuggestion: "tribe-expansion"
    });

    if (userGoals.businessGoals.vcFunding) {
      suggestions.push({
        id: `linkedin-${Date.now()}-funding`,
        content: `💰 **VC Funding Network**: I found 12 potential investor introductions through your existing network. With your AI innovation focus, these could be perfect for your Series A. Want me to prepare outreach sequences?`,
        role: "assistant",
        timestamp: new Date(),
        agentType: "linkedin",
        linkedinStrategy: true,
        proactiveSuggestion: "funding-network"
      });
    }
  }

  // Aspiration-based proactive suggestions
  if (userAspirations.length > 0 && hoursSinceLastInteraction > 12) {

    // Career aspirations
    const careerAspirations = userAspirations.filter((a) => a.category === 'career');
    if (careerAspirations.length > 0) {
      suggestions.push({
        id: `suggestion-${Date.now()}-career`,
        content: `I see you're working toward career goals like "${careerAspirations[0].title}". Would you like me to help you connect with people who have achieved similar career aspirations? I can find your professional tribe!`,
        role: "assistant",
        timestamp: new Date(),
        agentType: "linkedin",
        linkedinStrategy: true,
        proactiveSuggestion: "career-networking"
      });
    }

    // Skill learning aspirations
    const skillAspirations = userAspirations.filter((a) => a.category === 'skill');
    if (skillAspirations.length > 0) {
      suggestions.push({
        id: `suggestion-${Date.now()}-skill`,
        content: `You're learning ${skillAspirations.map((a) => a.title).join(', ')}! I can connect you with mentors and peers who are on the same learning journey. Ready to build your skill-based tribe?`,
        role: "assistant",
        timestamp: new Date(),
        agentType: "expert",
        proactiveSuggestion: "skill-mentorship"
      });
    }

    // Project aspirations
    const projectAspirations = userAspirations.filter((a) => a.category === 'project');
    if (projectAspirations.length > 0) {
      suggestions.push({
        id: `suggestion-${Date.now()}-project`,
        content: `Your project "${projectAspirations[0].title}" could benefit from a dream team! I can help you find collaborators who share your vision and complementary skills. Shall we build your project team?`,
        role: "assistant",
        timestamp: new Date(),
        agentType: "context",
        proactiveSuggestion: "dream-team-building"
      });
    }

    // Cause-driven aspirations
    const causeAspirations = userAspirations.filter((a) => a.category === 'cause');
    if (causeAspirations.length > 0) {
      suggestions.push({
        id: `suggestion-${Date.now()}-cause`,
        content: `Your commitment to ${causeAspirations[0].title} is inspiring! I can connect you with others who champion similar causes and are working toward the same impact. Ready to find your impact tribe?`,
        role: "assistant",
        timestamp: new Date(),
        agentType: "expert",
        proactiveSuggestion: "cause-alignment"
      });
    }

    // Networking aspirations
    const networkingAspirations = userAspirations.filter((a) => a.category === 'networking');
    if (networkingAspirations.length > 0) {
      suggestions.push({
        id: `suggestion-${Date.now()}-networking`,
        content: `I see you want to build meaningful professional relationships. Based on your aspirations, I can help you find people who share your professional trajectory and could be valuable long-term connections. Let's optimize your network!`,
        role: "assistant",
        timestamp: new Date(),
        agentType: "linkedin",
        linkedinStrategy: true,
        proactiveSuggestion: "aspiration-networking"
      });
    }
  }

  // General aspiration discovery if no aspirations set
  if (userAspirations.length === 0 && hoursSinceLastInteraction > 6) {
    suggestions.push({
      id: `suggestion-${Date.now()}-discovery`,
      content: "I notice you haven't set any aspirations yet. DefConect works best when I understand your future goals! Would you like to add some aspirations so I can help you find your professional tribe and build dream teams for your projects?",
      role: "assistant",
      timestamp: new Date(),
      agentType: "context",
      proactiveSuggestion: "aspiration-discovery"
    });
  }

  return suggestions;
};

export const simulateThinking = async (addAgentProcess: (type: AgentProcess["type"], content: string, metadata?: AgentProcess["metadata"]) => void, thought: string) => {
  addAgentProcess("thinking", thought);
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));
};

export const simulateApiCall = async (addAgentProcess: (type: AgentProcess["type"], content: string, metadata?: AgentProcess["metadata"]) => void, endpoint: string, method = "POST") => {
  addAgentProcess("api_call", `Making ${method} request to ${endpoint}`, { endpoint });
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 1500));

  const status = Math.random() > 0.1 ? 200 : 500;
  const duration = Math.floor(200 + Math.random() * 800);

  addAgentProcess("api_call", `${method} ${endpoint} - ${status} (${duration}ms)`, {
    endpoint,
    tokens: Math.floor(100 + Math.random() * 500),
  });

  return { status, duration };
};

export const simulateCoding = async (addAgentProcess: (type: AgentProcess["type"], content: string, metadata?: AgentProcess["metadata"]) => void, language: string, description: string) => {
  const codeExamples = {
    python: `def analyze_context(input_text):
    # Tokenize and analyze semantic meaning
    tokens = tokenize(input_text)
    context = extract_context(tokens)
    return context`,
    javascript: `async function processRequest(data) {
  const response = await fetch('/api/process', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.json();
}`,
    sql: `SELECT * FROM knowledge_base
WHERE relevance_score > 0.8
ORDER BY confidence DESC
LIMIT 10;`,
  };

  const code = codeExamples[language as keyof typeof codeExamples] || "// Code generated";
  addAgentProcess("coding", `Generated ${language} code for ${description}`, { language });
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 2500));
  return code;
};

export const simulateTalking = async (addAgentProcess: (type: AgentProcess["type"], content: string, metadata?: AgentProcess["metadata"]) => void, message: string, agentName: string) => {
  addAgentProcess("talking", `${agentName}: ${message}`);
  await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 1200));
};

export const saveConversationContext = async (sessionId: string, userAspirations: Aspiration[], conversationContext: any, updates: Partial<{
  session_id: string;
  aspirations_discussed: string[];
  topics_covered: string[];
  goals_progress: Record<string, unknown>;
  lastContext: string;
  summary: string;
}>) => {
  try {
    const contextData = {
      session_id: sessionId,
      aspirations_discussed: userAspirations.map(a => a.id),
      topics_covered: conversationContext?.topics_covered || [],
      goals_progress: conversationContext?.goals_progress || {},
      last_context: updates.lastContext || conversationContext?.last_context || '',
      conversation_summary: updates.summary || conversationContext?.conversation_summary || '',
      ...updates
    };

    await fetch('/api/context', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contextData)
    });
  } catch (error) {
    console.error('Failed to save conversation context:', error);
  }
};

export const simulateAgentOrchestration = async (userInput: string, files: File[] | undefined, setMessages: React.Dispatch<React.SetStateAction<Message[]>>, setAgentActivities: React.Dispatch<React.SetStateAction<AgentActivity[]>>, addAgentProcess: (type: AgentProcess["type"], content: string, metadata?: AgentProcess["metadata"]) => void, userGoals: UserGoals, userAspirations: Aspiration[], conversationContext: any, sessionId: string) => {
  // Update last interaction time
  // setUserGoals(prev => ({ ...prev, lastInteraction: new Date() }))

  // Check for LinkedIn strategy responses first
  const linkedinResponse = getLinkedInStrategyResponse(userInput);
  if (linkedinResponse) {
    const linkedinMessage: Message = {
      id: `linkedin-${Date.now()}`,
      content: linkedinResponse,
      role: "assistant",
      timestamp: new Date(),
      agentType: "linkedin",
      linkedinStrategy: true,
    };
    setMessages((prev) => [...prev, linkedinMessage]);
    return;
  }

  // Add proactive suggestions if appropriate
  const suggestions = getProactiveSuggestions(userGoals, userAspirations);
  if (suggestions.length > 0) {
    // Add suggestions with a delay
    setTimeout(() => {
      suggestions.forEach((suggestion, index) => {
        setTimeout(() => {
          setMessages((prev) => [...prev, suggestion]);
        }, index * 2000); // Stagger suggestions
      });
    }, 3000);
  } else {
    // Continue with normal agent orchestration
    const activities: AgentActivity[] = [
      {
        id: "1",
        agentId: "context-analyzer",
        type: "processing",
        message: "Analyzing task context...",
        timestamp: new Date(),
        name: "Context Analyzer",
        action: "Analyzing task context...",
        progress: 0,
        isActive: true,
        subTasks: [
          { name: "Parse input", status: "running" },
          { name: "Extract intent", status: "pending" },
          { name: "Identify requirements", status: "pending" },
        ],
      },
      {
        id: "2",
        agentId: "research-agent",
        type: "waiting",
        message: "Gathering relevant information...",
        timestamp: new Date(),
        name: "Research Agent",
        action: "Gathering relevant information...",
        progress: 0,
        isActive: false,
        subTasks: [
          { name: "Query knowledge base", status: "pending" },
          { name: "External API calls", status: "pending" },
          { name: "Synthesize findings", status: "pending" },
        ],
      },
      {
        id: "3",
        agentId: "file-processor",
        type: "waiting",
        message: "Processing attachments...",
        timestamp: new Date(),
        name: "File Processor",
        action: "Processing attachments...",
        progress: 0,
        isActive: false,
        subTasks: [
          { name: "Extract content", status: "pending" },
          { name: "Analyze structure", status: "pending" },
          { name: "Index information", status: "pending" },
        ],
      },
      {
        id: "4",
        agentId: "expert-generator",
        type: "waiting",
        message: "Creating specialized agent...",
        timestamp: new Date(),
        name: "Expert Generator",
        action: "Creating specialized agent...",
        progress: 0,
        isActive: false,
        subTasks: [
          { name: "Determine expertise", status: "pending" },
          { name: "Load domain knowledge", status: "pending" },
          { name: "Initialize agent", status: "pending" },
        ],
      },
      {
        id: "5",
        agentId: "response-synthesizer",
        type: "waiting",
        message: "Generating response...",
        timestamp: new Date(),
        name: "Response Synthesizer",
        action: "Generating response...",
        progress: 0,
        isActive: false,
        subTasks: [
          { name: "Compile insights", status: "pending" },
          { name: "Generate code", status: "pending" },
          { name: "Format response", status: "pending" },
        ],
      },
    ];

    setAgentActivities(activities);

    // Context Analysis Phase with real-time processes
    await simulateThinking(addAgentProcess, "Analyzing the user's request for key requirements and context...");
    await simulateApiCall(addAgentProcess, "/api/nlp/analyze");
    await simulateTalking(addAgentProcess, "I need to understand the complexity and domain of this request", "Context Analyzer");
    // await simulateAgentWork("1", "Analyzing requirements and context alignment...");

    // Add context analysis message with API call data
    const contextMessage: Message = {
      id: `context-${Date.now()}`,
      content: `🔍 **Context Analysis Complete**\n\nI've analyzed your request: "${userInput}"\n\n**Key Requirements Identified:**\n• Task complexity: ${files && files.length > 0 ? "High (with file processing)" : "Medium"}\n• Domain expertise needed: General\n• Response type: Informational\n• File attachments: ${files ? files.length : 0}\n\n**API Calls Made:**\n• NLP Analysis: 200ms\n• Context Extraction: 150ms\n\n**Proceeding with ${files && files.length > 0 ? "file processing and " : ""}research phase...`,
      role: "system",
      timestamp: new Date(),
      agentType: "context",
      apiCalls: [
        { endpoint: "/api/nlp/analyze", method: "POST", status: 200, duration: 200 },
        { endpoint: "/api/context/extract", method: "POST", status: 200, duration: 150 },
      ],
    };
    setMessages((prev) => [...prev, contextMessage]);

    // Research Phase with intelligent processes
    await simulateThinking(addAgentProcess, "I need to gather domain-specific information and check my knowledge base...");
    await simulateApiCall(addAgentProcess, "/api/knowledge/search");
    await simulateApiCall(addAgentProcess, "/api/external/research");
    await simulateTalking(addAgentProcess, "Found relevant information in knowledge base", "Research Agent");
    // await simulateAgentWork("2", "Researching domain-specific information...");

    // File Processing Phase (if files exist)
    if (files && files.length > 0) {
      await simulateThinking(addAgentProcess, `Processing ${files.length} files - need to extract and analyze content...`);
      await simulateApiCall(addAgentProcess, "/api/files/process");
      await simulateCoding(addAgentProcess, "python", "file content extraction");
      await simulateTalking(addAgentProcess, `Successfully processed ${files.length} files`, "File Processor");
      // await simulateAgentWork("3", `Processing ${files.length} file(s)...`);

      const fileMessage: Message = {
        id: `files-${Date.now()}`,
        content: `📁 **File Processing Complete**\n\nProcessed ${files.length} file(s):\n${files.map((f) => `• ${f.name} (${(f.size / 1024).toFixed(1)} KB)`).join("\n")}\n\n**File Analysis:**\n• Content extracted and indexed\n• Metadata processed\n• Ready for agent utilization\n\n**Processing Details:**\n• Extraction time: 340ms\n• Analysis time: 180ms\n• Indexing time: 120ms`,
        role: "system",
        timestamp: new Date(),
        agentType: "file",
        apiCalls: [
          { endpoint: "/api/files/extract", method: "POST", status: 200, duration: 340 },
          { endpoint: "/api/files/analyze", method: "POST", status: 200, duration: 180 },
        ],
      };
      setMessages((prev) => [...prev, fileMessage]);
    }

    // Expert Creation Phase with code generation
    await simulateThinking(addAgentProcess, "Determining what type of expert agent would be most helpful...");
    await simulateApiCall(addAgentProcess, "/api/agents/create");
    await simulateCoding(addAgentProcess, "javascript", "specialized agent configuration");
    await simulateTalking(addAgentProcess, "Expert agent initialized with domain knowledge", "Expert Generator");
    // await simulateAgentWork("4", "Generating specialized response agent...");

    // Response Generation Phase with comprehensive processing
    await simulateThinking(addAgentProcess, "Compiling all insights and generating comprehensive response...");
    await simulateApiCall(addAgentProcess, "/api/response/generate");
    await simulateCoding(addAgentProcess, "markdown", "response formatting");
    await simulateTalking(addAgentProcess, "Response synthesis complete", "Response Synthesizer");
    // await simulateAgentWork("5", "Synthesizing comprehensive response...");

    // Final response with all process data
    const finalResponse: Message = {
      id: `final-${Date.now()}`,
      content: `Based on my multi-agent analysis${files && files.length > 0 ? " and file processing" : ""}, here's my comprehensive response to: "${userInput}"\n\nI've coordinated with my specialized agents to provide you with the most relevant and accurate information. The context analyzer identified the key requirements, the research agent gathered domain-specific knowledge${files && files.length > 0 ? ", the file processor analyzed your attachments" : ""}, and an expert agent was created to handle your specific needs.\n\n**Agent Collaboration Summary:**\n• Context analysis: ✅ Complete (3 API calls, 2 code generations)\n• Information research: ✅ Complete (2 API calls, 1 knowledge query)${files && files.length > 0 ? "\n• File processing: ✅ Complete (2 API calls, 1 extraction script)" : ""}\n• Expert agent creation: ✅ Complete (1 API call, 1 configuration script)\n• Response synthesis: ✅ Complete (1 API call, 1 formatting script)\n\n**Total Processing Time:** ${Math.floor(2000 + Math.random() * 3000)}ms\n**API Calls Made:** ${files && files.length > 0 ? "8" : "6"}\n**Code Blocks Generated:** ${files && files.length > 0 ? "4" : "3"}\n\nIs there anything specific you'd like me to elaborate on or any follow-up questions?`,
      role: "assistant",
      timestamp: new Date(),
      agentType: "expert",
      expertise: "Multi-Agent Coordination",
      attachments: files
        ? files.map((f) => ({
            name: f.name,
            type: f.type,
            url: URL.createObjectURL(f),
            size: f.size,
          }))
        : undefined,
      apiCalls: [
        { endpoint: "/api/nlp/analyze", method: "POST", status: 200, duration: 200 },
        { endpoint: "/api/knowledge/search", method: "GET", status: 200, duration: 150 },
        { endpoint: "/api/response/generate", method: "POST", status: 200, duration: 300 },
      ],
      codeBlocks: [
        {
          language: "python",
          code: "def analyze_context(input_text):\n    tokens = tokenize(input_text)\n    return extract_context(tokens)",
          description: "Context analysis function",
        },
        {
          language: "javascript",
          code: "const agent = new ExpertAgent({\n  domain: 'general',\n  capabilities: ['analysis', 'synthesis']\n});",
          description: "Expert agent initialization",
        },
      ],
    };

    setMessages((prev) => [...prev, finalResponse]);
    setAgentActivities([]);

    // Save conversation context for session awareness
    saveConversationContext(sessionId, userAspirations, conversationContext, {
      lastContext: finalResponse.content,
      topics_covered: [...(conversationContext?.topics_covered || []), userInput],
      goals_progress: userGoals as unknown as Record<string, unknown>
    });
  }
};