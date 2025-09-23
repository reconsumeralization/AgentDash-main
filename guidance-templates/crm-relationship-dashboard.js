/**
 * GUIDANCE TEMPLATE: CRM Relationship Dashboard
 * For managing professional relationships and contact pipelines
 *
 * PURPOSE: Help LLMs build comprehensive CRM interfaces that track relationship
 * progression from prospects to tribe members with engagement analytics
 */

export const CRMRelationshipDashboardGuidance = {
  // Core CRM Structure
  crmStructure: {
    relationshipStages: [
      {
        stage: "prospect",
        description: "Initial discovery, low engagement",
        color: "bg-gray-100 text-gray-800",
        actions: ["research", "initial_outreach", "profile_analysis"]
      },
      {
        stage: "contact",
        description: "Active engagement, building relationship",
        color: "bg-blue-100 text-blue-800",
        actions: ["follow_up", "meeting_scheduling", "information_sharing"]
      },
      {
        stage: "qualified",
        description: "High potential, shared interests identified",
        color: "bg-yellow-100 text-yellow-800",
        actions: ["deep_dive", "collaboration_discussion", "referral_requests"]
      },
      {
        stage: "tribe_member",
        description: "Active collaborator, part of professional community",
        color: "bg-green-100 text-green-800",
        actions: ["project_collaboration", "mentorship", "community_building"]
      }
    ],

    contactMetrics: {
      interactionCount: "Total interactions across all channels",
      lastInteraction: "Date/time of most recent engagement",
      engagementLevel: "low | medium | high | very_high",
      responseRate: "Percentage of messages that received responses",
      meetingFrequency: "Average time between interactions"
    }
  },

  // UI Layout Pattern
  uiLayout: {
    header: {
      title: "Professional Relationship CRM",
      subtitle: "Manage your professional network with AI-powered insights",
      stats: [
        { label: "Total Contacts", value: "contactCount", icon: "Users" },
        { label: "Active Relationships", value: "activeRelationships", icon: "Heart" },
        { label: "Pending Follow-ups", value: "pendingFollowups", icon: "Bell" },
        { label: "Tribe Members", value: "tribeMembers", icon: "Network" }
      ]
    },

    pipelineView: {
      visualStyle: "kanban_board_with_stage_columns",
      cardContent: {
        avatar: "contact_photo_or_initials",
        name: "full_name_with_title",
        company: "current_employer",
        stage: "relationship_stage_badge",
        lastActivity: "time_since_last_interaction",
        nextAction: "suggested_follow_up_date",
        engagementScore: "0-100_engagement_indicator"
      },
      dragDrop: "Enable stage transitions with confirmation dialogs"
    },

    contactDetailView: {
      sections: [
        "basic_info",
        "relationship_timeline",
        "shared_interests",
        "collaboration_history",
        "notes_and_tags",
        "upcoming_actions"
      ],
      actionButtons: [
        "schedule_meeting",
        "send_message",
        "update_stage",
        "add_note",
        "create_project"
      ]
    }
  },

  // Data Management
  dataStructure: {
    contactProfile: {
      basicInfo: {
        name: "string",
        title: "string",
        company: "string",
        location: "string",
        linkedinUrl: "string",
        email: "string",
        phone: "string"
      },
      professionalData: {
        aspirations: "string_array",
        skills: "string_array",
        learning: "string_array",
        causes: "string_array",
        tribeScore: "number_0-100"
      },
      crmData: {
        relationshipStatus: "prospect|contact|qualified|tribe_member",
        engagementLevel: "low|medium|high|very_high",
        lastInteraction: "Date",
        interactionCount: "number",
        followUpDate: "Date",
        referralSource: "string"
      },
      communication: {
        notes: "note_array_with_timestamps",
        tags: "string_array_for_categorization",
        importantDates: "key_milestones_and_reminders"
      }
    },

    interactionTracking: {
      types: ["email", "meeting", "message", "social_engagement", "project_collaboration"],
      metadata: {
        timestamp: "Date",
        type: "interaction_type",
        outcome: "success|neutral|needs_followup",
        notes: "string",
        followUpRequired: "boolean"
      }
    }
  },

  // AI Integration Features
  aiFeatures: {
    engagementPrediction: {
      algorithm: "interaction_frequency + response_patterns + content_relevance",
      predictions: ["next_best_contact_time", "engagement_probability", "relationship_health_score"]
    },

    smartSuggestions: {
      conversationStarters: "Contextual message suggestions based on shared interests",
      followUpReminders: "Automated scheduling based on interaction patterns",
      relationshipInsights: "AI analysis of relationship strength and growth opportunities"
    },

    automatedWorkflows: {
      stageProgression: "Automatic stage advancement based on engagement metrics",
      followUpAutomation: "Scheduled follow-ups for dormant relationships",
      opportunityAlerts: "Notifications for high-potential collaboration opportunities"
    }
  },

  // Analytics & Reporting
  analytics: {
    relationshipMetrics: {
      pipelineConversion: "Stage transition rates and time-to-conversion",
      engagementTrends: "Interaction frequency and quality over time",
      networkGrowth: "New contacts added and relationship development",
      collaborationSuccess: "Projects started from CRM relationships"
    },

    performanceIndicators: {
      responseTime: "Average time to respond to outreach",
      conversionRate: "Percentage of prospects becoming tribe members",
      relationshipHealth: "Overall network engagement score",
      opportunityValue: "Potential collaboration opportunities identified"
    }
  },

  // Integration Points
  integrations: {
    communication: {
      email: "Outlook/Gmail integration for tracking",
      calendar: "Meeting scheduling and reminder integration",
      messaging: "LinkedIn/InMail integration",
      social: "Social media activity monitoring"
    },

    externalData: {
      linkedin: "Profile data and activity sync",
      companyDatabases: "Professional contact information",
      eventPlatforms: "Conference and networking event data",
      newsFeeds: "Industry news and company updates"
    }
  },

  // Best Practices for LLM Implementation
  implementationGuidelines: {
    userExperience: {
      progressiveOnboarding: "Guide users through CRM setup and data import",
      contextualActions: "Show relevant actions based on relationship stage",
      smartDefaults: "Pre-fill information from LinkedIn and other sources",
      feedbackLoops: "Allow users to correct AI suggestions and improve accuracy"
    },

    dataPrivacy: {
      consentManagement: "Clear opt-in/opt-out for data collection",
      dataRetention: "Configurable data retention policies",
      exportCapabilities: "Full data export for user control",
      auditLogging: "Track all data access and modifications"
    },

    performance: {
      lazyLoading: "Load contact lists in pages for large networks",
      searchOptimization: "Full-text search across all contact fields",
      cachingStrategy: "Cache frequently accessed contact data",
      backgroundSync: "Sync external data sources in background"
    },

    scalability: {
      modularArchitecture: "Separate concerns for different CRM functions",
      apiFirst: "Design with API integration in mind",
      realTimeUpdates: "WebSocket support for live collaboration",
      offlineSupport: "Basic functionality without internet connection"
    }
  }
};

/**
 * CRM IMPLEMENTATION CHECKLIST:
 *
 * 1. ✅ Design relationship pipeline with clear stages
 * 2. ✅ Create contact profile data structure
 * 3. ✅ Build pipeline visualization (Kanban-style)
 * 4. ✅ Implement contact detail views with notes
 * 5. ✅ Add AI-powered engagement suggestions
 * 6. ✅ Integrate communication tracking
 * 7. ✅ Create analytics and reporting features
 * 8. ✅ Add import/export functionality
 * 9. ✅ Implement search and filtering
 * 10. ✅ Add data privacy and security features
 */
