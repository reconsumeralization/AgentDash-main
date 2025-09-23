/**
 * GUIDANCE TEMPLATE: AI Engagement Assistant
 * For intelligent conversation and relationship management automation
 *
 * PURPOSE: Help LLMs build AI-powered assistants that enhance human
 * communication and relationship building in professional networks
 */

export const AIengagementAssistantGuidance = {
  // Core AI Assistant Architecture
  assistantArchitecture: {
    aiCapabilities: {
      naturalLanguageProcessing: {
        intentRecognition: "understand_user_communication_goals",
        contextAwareness: "maintain_relationship_history_and_context",
        toneAnalysis: "detect_emotional_context_and_appropriateness"
      },

      conversationIntelligence: {
        messageGeneration: "create_personalized_contextual_messages",
        timingOptimization: "predict_best_engagement_windows",
        successPrediction: "calculate_response_likelihood_and_quality"
      },

      relationshipManagement: {
        interactionTracking: "log_and_analyze_all_communications",
        patternRecognition: "identify_successful_engagement_strategies",
        automationRules: "create_smart_follow_up_and_nurturing_sequences"
      }
    },

    dataSources: {
      userProfile: "professional_background_and_preferences",
      contactHistory: "past_interactions_and_relationship_data",
      networkContext: "shared_connections_and_mutual_interests",
      behavioralPatterns: "communication_style_and_response_patterns"
    }
  },

  // UI Structure Pattern
  uiStructure: {
    assistantInterface: {
      header: {
        title: "AI Engagement Assistant",
        subtitle: "Smart communication tools for professional networking",
        status: "online_indicator_with_ai_confidence_score",
        mode: "manual|assisted|automated"
      },

      conversationComposer: {
        inputArea: "multi_line_text_input_with_ai_suggestions",
        aiSuggestions: "real_time_message_improvements_and_alternatives",
        personalizationPanel: "contact_specific_customization_options",
        toneSelector: "professional|casual|enthusiastic|concise"
      },

      conversationStarters: {
        categories: [
          { id: "icebreakers", label: "Icebreakers", icon: "Snowflake" },
          { id: "aspirations", label: "Shared Aspirations", icon: "Target" },
          { id: "collaboration", label: "Collaboration Ideas", icon: "Users" },
          { id: "personal", label: "Personal Touch", icon: "Heart" }
        ],
        cardStructure: {
          title: "starter_title",
          preview: "first_few_words_of_message",
          effectiveness: "ai_calculated_success_score",
          context: "when_and_how_to_use",
          tags: "relevant_topic_badges"
        }
      },

      engagementSuggestions: {
        suggestionTypes: [
          "follow_up_reminders",
          "relationship_nurturing",
          "collaboration_opportunities",
          "celebration_messages"
        ],
        priorityLevels: ["high", "medium", "low"],
        scheduling: "suggested_timing_with_success_probability"
      }
    },

    analyticsView: {
      messagePerformance: "response_rates_and_engagement_metrics",
      patternInsights: "successful_communication_strategies",
      relationshipHealth: "connection_strength_trends",
      optimizationSuggestions: "ai_recommended_improvements"
    }
  },

  // AI Message Generation Engine
  messageGenerationEngine: {
    contentCreation: {
      personalization: {
        contactSpecific: "reference_shared_interests_and_history",
        contextAware: "adapt_based_on_relationship_stage",
        goalOriented: "align_messages_with_professional_objectives"
      },

      styleOptimization: {
        toneMatching: "mirror_recipient_communication_style",
        lengthOptimization: "balance_comprehensiveness_with_attention_span",
        callToAction: "include_clear_next_steps_when_appropriate"
      }
    },

    conversationStarters: {
      icebreakers: {
        examples: [
          "mutual_connection_references",
          "shared_interest_discovery",
          "compliment_on_recent_achievement",
          "question_about_professional_journey"
        ],
        effectiveness: "based_on_opening_response_rates"
      },

      aspirationBased: {
        examples: [
          "shared_goal_discussion",
          "learning_journey_questions",
          "career_transition_inquiry",
          "industry_challenge_exploration"
        ],
        alignment: "matched_to_declared_professional_aspirations"
      },

      collaborationFocused: {
        examples: [
          "project_idea_sharing",
          "skill_complement_suggestion",
          "mutual_benefit_proposal",
          "networking_opportunity_reference"
        ],
        potential: "calculated_collaboration_success_probability"
      }
    },

    followUpAutomation: {
      smartScheduling: {
        optimalTiming: "analyze_response_patterns_for_best_follow_up_times",
        frequencyOptimization: "prevent_over_communication_while_maintaining_engagement",
        contextAwareness: "adapt_follow_up_strategy_based_on_relationship_stage"
      },

      contentPersonalization: {
        progressUpdates: "reference_previous_conversation_topics",
        valueAddition: "provide_helpful_resources_or_insights",
        relationshipBuilding: "deepen_connection_with_personal_touch"
      }
    }
  },

  // Engagement Intelligence System
  engagementIntelligence: {
    predictiveAnalytics: {
      responsePrediction: {
        algorithm: "machine_learning_model_based_on_historical_data",
        factors: ["message_quality", "timing", "relationship_context", "recipient_profile"],
        confidence: "probability_score_with_uncertainty_range"
      },

      optimalTiming: {
        analysis: "historical_response_patterns_and_availability_indicators",
        suggestions: "best_days_times_for_initial_contact_and_follow_ups",
        automation: "schedule_messages_for_maximum_engagement_probability"
      }
    },

    relationshipInsights: {
      healthScoring: {
        metrics: ["interaction_frequency", "response_quality", "mutual_engagement"],
        scoring: "0-100_relationship_strength_indicator",
        trends: "improvement_or_decline_over_time"
      },

      opportunityDetection: {
        collaborationPotential: "identify_high_value_connection_opportunities",
        networkingGaps: "suggest_missing_connections_for_goal_achievement",
        timingAlerts: "notify_when_conditions_are_right_for_important_conversations"
      }
    },

    patternRecognition: {
      successPatterns: {
        communicationStyles: "identify_most_effective_messaging_approaches",
        timingPreferences: "learn_optimal_contact_times_for_different_people",
        contentThemes: "discover_topics_that_generate_highest_engagement"
      },

      improvementSuggestions: {
        styleOptimization: "recommend_communication_improvements",
        strategyRefinement: "suggest_better_engagement_approaches",
        goalAlignment: "ensure_communication_supports_professional_objectives"
      }
    }
  },

  // Automation & Workflow Integration
  automationFramework: {
    smartSequences: {
      nurtureCampaigns: "automated_relationship_building_sequences",
      followUpReminders: "intelligent_reminder_system_based_on_context",
      celebrationMessages: "automated_congratulations_for_achievements"
    },

    integrationPoints: {
      calendarIntegration: "schedule_follow_ups_and_meetings",
      emailIntegration: "sync_with_email_clients_for_comprehensive_tracking",
      socialIntegration: "connect_with_linkedin_and_other_platforms",
      crmIntegration: "update_relationship_status_based_on_engagement"
    }
  },

  // User Experience Guidelines
  userExperience: {
    progressiveAssistance: {
      beginnerMode: "full_ai_guidance_with_explanations",
      intermediateMode: "ai_suggestions_with_user_control",
      expertMode: "minimal_intervention_with_advanced_automation"
    },

    transparency: {
      aiDecisions: "explain_why_suggestions_are_made",
      confidenceLevels: "show_uncertainty_in_ai_predictions",
      learningProgress: "demonstrate_ai_improvement_over_time"
    },

    controlAndOverride: {
      manualOverride: "allow_users_to_ignore_ai_suggestions",
      customization: "let_users_set_preferences_and_boundaries",
      feedbackLoop: "incorporate_user_feedback_to_improve_ai_accuracy"
    }
  },

  // Ethics & Privacy Framework
  ethicsPrivacy: {
    dataProtection: {
      messageContent: "secure_storage_with_encryption",
      metadataOnly: "ai_learns_from_patterns_not_content",
      userConsent: "explicit_permission_for_ai_analysis"
    },

    responsibleAI: {
      biasMitigation: "regular_audits_for_fair_recommendations",
      transparency: "clear_disclosure_of_ai_involvement",
      humanOversight: "important_decisions_require_human_approval"
    },

    privacyControls: {
      dataRetention: "configurable_data_storage_policies",
      optOutOptions: "ability_to_disable_ai_features",
      dataPortability: "export_personal_communication_data"
    }
  },

  // Performance & Scalability
  performanceOptimization: {
    realTimeProcessing: {
      caching: "cache_frequent_ai_computations",
      backgroundProcessing: "heavy_analysis_in_background_threads",
      progressiveLoading: "show_basic_suggestions_first_ai_enhancements_second"
    },

    resourceManagement: {
      apiLimits: "respect_external_api_rate_limits",
      computationalEfficiency: "optimize_ai_models_for_speed",
      memoryManagement: "efficient_data_structures_for_large_networks"
    }
  },

  // Implementation Checklist
  implementationChecklist: {
    coreFeatures: [
      "✅ AI message composition with suggestions",
      "✅ Conversation starter library",
      "✅ Engagement timing optimization",
      "✅ Response prediction analytics",
      "✅ Relationship health scoring",
      "✅ Automation workflow creation",
      "✅ Privacy and ethics controls",
      "✅ Performance optimization",
      "✅ User customization options",
      "✅ Integration with external platforms"
    ],

    testingRequirements: [
      "✅ Unit tests for AI algorithms",
      "✅ Integration tests for external APIs",
      "✅ User acceptance testing for UX",
      "✅ Performance testing under load",
      "✅ Security and privacy audits",
      "✅ Accessibility compliance testing"
    ]
  }
};

/**
 * AI ENGAGEMENT ASSISTANT IMPLEMENTATION CHECKLIST:
 *
 * 1. ✅ Design conversation composer with AI suggestions
 * 2. ✅ Build conversation starter library with categories
 * 3. ✅ Implement message generation and personalization
 * 4. ✅ Add engagement timing and success prediction
 * 5. ✅ Create relationship health analytics
 * 6. ✅ Build automation and workflow features
 * 7. ✅ Implement privacy and ethics controls
 * 8. ✅ Add real-time AI processing capabilities
 * 9. ✅ Create user customization and preferences
 * 10. ✅ Integrate with communication platforms
 */
