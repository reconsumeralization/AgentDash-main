/**
 * GUIDANCE TEMPLATE: AI Matching Dashboard
 * For aspiration-based professional networking and collaboration discovery
 *
 * PURPOSE: Help LLMs build intelligent matching interfaces that connect professionals
 * based on shared goals, complementary skills, and future aspirations
 */

export const AIMatchingDashboardGuidance = {
  // Core Components Required
  coreComponents: {
    matchingEngine: {
      algorithm: "aspiration_similarity + skill_complementarity + goal_alignment",
      scoring: {
        tribeScore: "0-100 based on shared professional DNA",
        collaborationPotential: "0-100 based on complementary skills",
        aspirationAlignment: "0-100 based on future goals overlap"
      },
      realTimeUpdates: true
    },

    profileAnalysis: {
      dataSources: ["professional_profiles", "social_activity", "learning_patterns"],
      analysisTypes: ["skill_gap_analysis", "aspiration_matching", "collaboration_potential"],
      aiPowered: true
    }
  },

  // UI Structure Pattern
  uiStructure: {
    header: {
      title: "AI Aspiration Matching Engine",
      subtitle: "Powered by Coral Protocol",
      badges: ["AI-Powered", "Real-time", "Smart Matching"]
    },

    mainContent: {
      tabs: [
        { id: "discover", label: "Discover", icon: "Search" },
        { id: "matches", label: "My Matches", icon: "Heart" },
        { id: "tribes", label: "Tribe Suggestions", icon: "Users" },
        { id: "insights", label: "AI Insights", icon: "Brain" }
      ]
    },

    matchingCards: {
      layout: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
      cardStructure: {
        avatar: "professional_initials_with_primary_color",
        name: "professional_name_with_title",
        company: "current_company_location",
        matchScore: "tribe_score_with_color_coding",
        sharedAspirations: "top_3_common_goals_badges",
        complementarySkills: "skills_they_have_that_you_need",
        collaborationPotential: "ai_calculated_percentage",
        actionButtons: ["View_Profile", "Connect", "Message", "Add_to_Project"]
      }
    }
  },

  // Data Management
  dataManagement: {
    stateStructure: {
      currentProfile: "user_professional_profile",
      potentialMatches: "array_of_matching_professionals",
      selectedFilters: "aspiration_skills_location_filters",
      matchHistory: "previous_connections_and_outcomes"
    },

    realTimeFeatures: {
      liveMatching: "continuous_background_matching_updates",
      instantFeedback: "immediate_response_to_profile_changes",
      predictiveScoring: "ai_calculated_success_probabilities"
    }
  },

  // AI Integration Points
  aiIntegration: {
    coralProtocolAgents: [
      {
        name: "AspirationAnalyzer",
        purpose: "Analyze professional goals and future aspirations",
        inputs: ["profile_data", "social_activity", "learning_history"],
        outputs: ["aspiration_vector", "goal_clusters", "growth_trajectory"]
      },
      {
        name: "CollaborationMatcher",
        purpose: "Find complementary skills and collaboration potential",
        inputs: ["skill_sets", "project_history", "aspiration_alignment"],
        outputs: ["match_score", "complementary_skills", "collaboration_probability"]
      },
      {
        name: "TribeIdentifier",
        purpose: "Group professionals with shared professional DNA",
        inputs: ["matching_profiles", "interaction_patterns", "community_data"],
        outputs: ["tribe_suggestions", "community_fit_scores", "growth_opportunities"]
      }
    ],

    aiFeatures: {
      smartFiltering: "AI-powered search and filter suggestions",
      conversationStarters: "Contextual outreach message generation",
      timingOptimization: "Best engagement timing predictions",
      successPrediction: "Connection success probability scoring"
    }
  },

  // Analytics & Insights
  analyticsIntegration: {
    metrics: {
      matchQuality: "Average match scores over time",
      connectionRate: "Successful connections from matches",
      collaborationSuccess: "Projects started from AI matches",
      networkGrowth: "New tribe members discovered"
    },

    insights: {
      patternRecognition: "Identify successful matching patterns",
      optimizationSuggestions: "Profile improvement recommendations",
      trendAnalysis: "Emerging aspiration trends in network",
      opportunityAlerts: "High-potential connection opportunities"
    }
  },

  // Best Practices for LLM Implementation
  implementationGuidelines: {
    userExperience: {
      progressiveDisclosure: "Show basic matches first, reveal AI insights gradually",
      contextualHelp: "Provide tooltips explaining AI matching scores",
      feedbackLoops: "Allow users to rate matches and improve algorithm",
      personalization: "Adapt interface based on user interaction patterns"
    },

    performance: {
      lazyLoading: "Load matches in batches to maintain responsiveness",
      backgroundProcessing: "Run heavy AI computations in background",
      cachingStrategy: "Cache match results for frequently accessed profiles",
      realTimeUpdates: "Use websockets for live match score updates"
    },

    accessibility: {
      keyboardNavigation: "Full keyboard support for all matching actions",
      screenReaderSupport: "Descriptive labels for AI scores and recommendations",
      colorBlindFriendly: "Use both color and pattern for match indicators",
      errorHandling: "Clear error messages for AI processing failures"
    }
  }
};

/**
 * QUICK IMPLEMENTATION CHECKLIST:
 *
 * 1. ✅ Import required Coral Protocol agents
 * 2. ✅ Set up real-time matching state management
 * 3. ✅ Create professional profile card components
 * 4. ✅ Implement AI scoring visualization
 * 5. ✅ Add conversation starter generation
 * 6. ✅ Include analytics tracking
 * 7. ✅ Test with sample professional data
 * 8. ✅ Add error boundaries for AI failures
 * 9. ✅ Implement responsive design
 * 10. ✅ Add accessibility features
 */
