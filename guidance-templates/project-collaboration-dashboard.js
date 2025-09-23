/**
 * GUIDANCE TEMPLATE: Project Collaboration Dashboard
 * For AI-powered team formation and aspiration-aligned project management
 *
 * PURPOSE: Help LLMs build intelligent project management interfaces that
 * optimize team composition and align project goals with personal aspirations
 */

export const ProjectCollaborationDashboardGuidance = {
  // Core Project Management Structure
  projectStructure: {
    aspirationAlignment: {
      projectGoals: "explicit_connection_to_team_member_aspirations",
      milestoneMapping: "personal_growth_tied_to_project_deliverables",
      skillDevelopment: "learning_opportunities_built_into_project_work"
    },

    teamFormation: {
      aiMatching: "intelligent_team_composition_based_on_complementary_skills",
      aspirationBalance: "ensure_project_goals_align_with_member_motivations",
      diversityOptimization: "balance_experience_levels_and_perspectives"
    }
  },

  // UI Structure Pattern
  uiStructure: {
    dashboardLayout: {
      header: {
        title: "Tribe Project Management",
        subtitle: "Build dream teams aligned with shared aspirations",
        projectStats: [
          { label: "Active Projects", value: "activeProjects", icon: "Target" },
          { label: "Team Members", value: "totalMembers", icon: "Users" },
          { label: "Aspiration Alignment", value: "avgAlignment", icon: "Heart" },
          { label: "Collaboration Score", value: "avgCollaboration", icon: "Zap" }
        ]
      },

      projectOverview: {
        gridLayout: "responsive_grid_with_project_cards",
        cardContent: {
          title: "project_name_with_status_badge",
          tribe: "associated_tribe_name",
          progress: "visual_progress_bar_with_percentage",
          team: "member_avatars_with_roles",
          deadline: "target_completion_date",
          alignment: "aspiration_alignment_score",
          priority: "low_medium_high_critical_with_colors"
        }
      },

      projectDetailView: {
        tabs: [
          { id: "overview", label: "Overview", icon: "Eye" },
          { id: "team", label: "Team", icon: "Users" },
          { id: "tasks", label: "Tasks", icon: "CheckSquare" },
          { id: "timeline", label: "Timeline", icon: "Calendar" },
          { id: "analytics", label: "Analytics", icon: "BarChart" }
        ]
      }
    },

    teamBuilderInterface: {
      dreamTeamComposer: {
        projectDescription: "text_area_for_project_idea_and_goals",
        requiredSkills: "dynamic_skill_selection_with_importance_levels",
        aspirationAlignment: "shared_goals_selection_from_tribe",
        aiSuggestions: "real_time_team_recommendations"
      },

      candidateCards: {
        profilePreview: "avatar_name_title_company",
        skillMatch: "complementary_skills_highlighted",
        aspirationOverlap: "shared_goals_visualization",
        collaborationScore: "ai_calculated_team_fit",
        availability: "current_workload_and_availability"
      }
    }
  },

  // AI-Powered Team Optimization
  aiTeamOptimization: {
    skillComplementarity: {
      analysis: "identify_missing_skills_and_redundant_capabilities",
      recommendations: "suggest_team_members_with_unique_contributions",
      balance: "optimize_experience_levels_and_expertise_areas"
    },

    aspirationAlignment: {
      goalMapping: "connect_project_milestones_to_personal_aspirations",
      motivationScoring: "calculate_intrinsic_motivation_levels",
      growthOpportunities: "identify_skill_development_potential"
    },

    collaborationPrediction: {
      successModeling: "predict_team_performance_based_on_composition",
      conflictPrevention: "identify_potential_personality_or_style_clashes",
      communicationOptimization: "suggest_optimal_communication_patterns"
    }
  },

  // Task Management with AI
  intelligentTaskManagement: {
    aspirationTagging: {
      taskGoals: "link_tasks_to_specific_personal_or_team_aspirations",
      skillDevelopment: "identify_learning_opportunities_in_assignments",
      motivationAlignment: "ensure_tasks_match_member_interests"
    },

    smartAssignment: {
      aiSuggestions: "recommend_best_person_for_each_task",
      workloadBalancing: "distribute_work_based_on_availability_and_capacity",
      skillMatching: "assign_tasks_to_members_with_relevant_expertise"
    },

    progressTracking: {
      milestoneCelebration: "highlight_personal_growth_achievements",
      aspirationProgress: "track_goal_advancement_through_project_work",
      motivationMaintenance: "identify_and_address_engagement_dips"
    }
  },

  // Collaboration Analytics
  collaborationAnalytics: {
    teamPerformance: {
      metrics: {
        collaborationScore: "communication_quality_and_frequency",
        aspirationAlignment: "goal_achievement_vs_personal_growth",
        skillDevelopment: "new_capabilities_gained_through_project",
        relationshipStrength: "interpersonal_connections_built"
      }
    },

    individualContributions: {
      impactMeasurement: "quantify_contribution_to_project_success",
      growthTracking: "personal_development_through_collaboration",
      networkExpansion: "new_relationships_and_connections_made"
    },

    projectInsights: {
      successPrediction: "forecast_project_outcomes_based_on_team_dynamics",
      optimizationSuggestions: "recommend_improvements_to_team_composition",
      riskAssessment: "identify_potential_collaboration_challenges"
    }
  },

  // Real-time Collaboration Features
  realTimeCollaboration: {
    liveUpdates: {
      progressSync: "real_time_task_status_updates",
      activityFeeds: "live_stream_of_team_activities",
      notificationSystem: "intelligent_alerts_for_important_events"
    },

    communicationTools: {
      integratedChat: "project_specific_messaging_with_context",
      videoCollaboration: "built_in_video_calling_and_screen_sharing",
      documentCollaboration: "real_time_document_editing_and_review"
    },

    coordinationFeatures: {
      sharedCalendars: "team_availability_and_deadline_visibility",
      resourceManagement: "shared_tools_and_resource_tracking",
      decisionTracking: "document_important_decisions_and_rationales"
    }
  },

  // Integration & Workflow Automation
  workflowAutomation: {
    projectLifecycle: {
      initiation: "automated_team_formation_and_kickoff_setup",
      execution: "intelligent_task_assignment_and_progress_tracking",
      review: "automated_retrospectives_and_learning_capture",
      completion: "success_celebration_and_next_steps_planning"
    },

    externalIntegrations: {
      calendarSync: "automatic_meeting_scheduling_and_reminders",
      documentManagement: "integration_with_collaboration_platforms",
      communicationTools: "sync_with_slack_teams_email_clients"
    }
  },

  // Data Structure & State Management
  dataArchitecture: {
    projectModel: {
      basicInfo: {
        id: "string",
        name: "string",
        description: "string",
        tribeId: "string",
        status: "planning|active|review|completed"
      },

      teamStructure: {
        members: "array_of_member_objects_with_roles",
        skills: "aggregated_team_capabilities",
        aspirations: "shared_professional_goals",
        communication: "preferred_collaboration_methods"
      },

      projectData: {
        milestones: "array_of_milestone_objects",
        tasks: "array_of_task_objects",
        timeline: "start_and_end_dates_with_key_dates",
        resources: "required_tools_and_materials"
      },

      analytics: {
        collaborationScore: "number_0-100",
        aspirationAlignment: "number_0-100",
        progressRate: "actual_vs_planned_progress",
        riskLevel: "low|medium|high|critical"
      }
    },

    realTimeState: {
      activeUsers: "currently_online_team_members",
      recentActivity: "last_24_hours_of_project_activity",
      urgentItems: "overdue_tasks_and_blocking_issues",
      upcomingDeadlines: "next_7_days_of_key_dates"
    }
  },

  // User Experience Guidelines
  userExperience: {
    progressiveDisclosure: {
      overviewFirst: "show_project_summary_and_key_metrics",
      drillDown: "allow_detailed_exploration_on_demand",
      contextualHelp: "provide_guidance_based_on_user_actions"
    },

    personalization: {
      roleBasedViews: "different_interfaces_for_leaders_vs_contributors",
      preferenceLearning: "adapt_ui_based_on_usage_patterns",
      customization: "allow_users_to_configure_dashboard_layout"
    },

    motivationDesign: {
      progressCelebration: "highlight_achievements_and_milestones",
      growthVisibility: "show_personal_development_through_project_work",
      socialRecognition: "publicize_contributions_and_successes"
    }
  },

  // Performance & Scalability
  performanceOptimization: {
    dataLoading: {
      lazyLoading: "load_project_details_on_demand",
      incrementalUpdates: "sync_only_changed_data_in_real_time",
      cachingStrategy: "cache_frequently_accessed_project_data"
    },

    realTimeEfficiency: {
      websocketOptimization: "efficient_real_time_data_streaming",
      changeDetection: "smart_update_detection_to_minimize_payloads",
      backgroundSync: "sync_external_data_without_blocking_ui"
    }
  },

  // Implementation Checklist
  implementationChecklist: {
    coreFeatures: [
      "✅ AI-powered team formation and optimization",
      "✅ Aspiration-aligned project goal setting",
      "✅ Intelligent task assignment and tracking",
      "✅ Real-time collaboration tools",
      "✅ Collaboration analytics and insights",
      "✅ Project lifecycle automation",
      "✅ External tool integrations",
      "✅ Mobile-responsive design",
      "✅ Offline capability for critical features",
      "✅ Comprehensive security and privacy"
    ],

    aiFeatures: [
      "✅ Team composition optimization algorithms",
      "✅ Aspiration alignment scoring",
      "✅ Collaboration success prediction",
      "✅ Task assignment recommendations",
      "✅ Progress and motivation analytics",
      "✅ Risk assessment and mitigation",
      "✅ Automated workflow suggestions",
      "✅ Personalization and adaptation"
    ]
  }
};

/**
 * PROJECT COLLABORATION DASHBOARD IMPLEMENTATION CHECKLIST:
 *
 * 1. ✅ Design aspiration-aligned project structure
 * 2. ✅ Build AI-powered team formation interface
 * 3. ✅ Create intelligent task management system
 * 4. ✅ Implement real-time collaboration features
 * 5. ✅ Add comprehensive analytics and insights
 * 6. ✅ Build workflow automation capabilities
 * 7. ✅ Integrate with external collaboration tools
 * 8. ✅ Ensure mobile and offline functionality
 * 9. ✅ Implement security and access controls
 * 10. ✅ Add personalization and customization options
 */
