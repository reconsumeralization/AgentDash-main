/**
 * GUIDANCE TEMPLATE: Analytics & Reporting Dashboard
 * For AI-powered insights and performance metrics in social platforms
 *
 * PURPOSE: Help LLMs build comprehensive analytics interfaces that provide
 * actionable insights from complex social and professional data
 */

export const AnalyticsReportingDashboardGuidance = {
  // Core Analytics Framework
  analyticsFramework: {
    dataSources: {
      userActivity: ["page_views", "feature_usage", "time_spent"],
      socialInteractions: ["messages_sent", "connections_made", "collaborations"],
      performanceMetrics: ["goal_achievement", "skill_development", "network_growth"],
      aiGenerated: ["match_quality", "engagement_predictions", "success_rates"]
    },

    metricTypes: {
      quantitative: ["counts", "percentages", "averages", "trends"],
      qualitative: ["sentiment_analysis", "engagement_quality", "relationship_strength"],
      predictive: ["future_trends", "success_probabilities", "growth_forecasts"]
    }
  },

  // UI Structure Pattern
  uiStructure: {
    dashboardLayout: {
      header: {
        title: "Analytics & Insights Dashboard",
        subtitle: "AI-powered insights for professional growth",
        timeRangeSelector: ["7d", "30d", "90d", "1y", "all"],
        exportOptions: ["PDF", "CSV", "JSON"]
      },

      metricCards: {
        gridLayout: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4",
        cardStructure: {
          icon: "relevant_metric_icon",
          title: "metric_name",
          value: "current_value_with_formatting",
          change: "percentage_change_with_indicator",
          trend: "sparkline_or_trend_indicator",
          description: "contextual_explanation"
        }
      },

      chartSections: {
        primaryCharts: "line_charts_for_trends_and_growth",
        comparisonCharts: "bar_charts_for_period_comparisons",
        distributionCharts: "pie_charts_for_category_breakdowns",
        correlationCharts: "scatter_plots_for_relationships"
      }
    },

    insightPanels: {
      aiInsights: {
        type: "collapsible_cards",
        priority: "high|medium|low",
        actionable: "boolean_flag_for_actionable_insights",
        content: {
          title: "insight_title",
          description: "detailed_explanation",
          recommendation: "suggested_action",
          impact: "expected_benefit",
          confidence: "ai_confidence_score"
        }
      },

      recommendations: {
        personalization: "user_specific_suggestions",
        automation: "suggested_workflow_improvements",
        networking: "connection_and_collaboration_opportunities"
      }
    }
  },

  // Data Visualization Standards
  visualizationStandards: {
    chartTypes: {
      lineCharts: {
        useCase: "time_series_data_and_trends",
        libraries: ["recharts", "chart.js", "d3"],
        features: ["interactive_tooltips", "zoom_pan", "data_brushing"]
      },

      barCharts: {
        useCase: "comparisons_and_distributions",
        variants: ["horizontal", "vertical", "stacked", "grouped"],
        interactions: ["sorting", "filtering", "drill_down"]
      },

      pieCharts: {
        useCase: "proportion_and_composition",
        alternatives: ["donut_charts_for_better_readability"],
        limitations: ["avoid_for_many_categories"]
      },

      scatterPlots: {
        useCase: "correlation_and_relationship_analysis",
        features: ["regression_lines", "quadrant_analysis"]
      }
    },

    colorSchemes: {
      primary: "#3b82f6", // blue-500
      success: "#10b981", // emerald-500
      warning: "#f59e0b", // amber-500
      danger: "#ef4444", // red-500
      neutral: "#6b7280"  // gray-500
    },

    responsiveDesign: {
      breakpoints: ["sm", "md", "lg", "xl"],
      mobileOptimization: ["stacked_layouts", "touch_friendly_interactions"]
    }
  },

  // AI Integration for Analytics
  aiAnalyticsIntegration: {
    insightGeneration: {
      patternRecognition: {
        algorithms: ["clustering", "anomaly_detection", "trend_analysis"],
        dataInputs: ["user_behavior", "network_patterns", "performance_metrics"],
        outputs: ["actionable_insights", "predictive_analytics", "optimization_suggestions"]
      },

      predictiveModeling: {
        userGrowth: "forecast_skill_development_and_network_expansion",
        engagementPrediction: "predict_optimal_engagement_times_and_methods",
        successModeling: "calculate_collaboration_success_probabilities"
      }
    },

    automatedReporting: {
      scheduledReports: "weekly_monthly_quarterly_business_reviews",
      alertSystem: "real_time_notifications_for_important_changes",
      personalizedDashboards: "custom_views_based_on_user_role_and_goals"
    }
  },

  // Key Performance Indicators (KPIs)
  kpiFramework: {
    networkingKPIs: {
      connectionGrowth: {
        metric: "new_connections_per_period",
        benchmark: "industry_averages",
        trend: "month_over_month_growth"
      },

      engagementQuality: {
        metric: "interaction_depth_and_frequency",
        scoring: "weighted_engagement_algorithm",
        insights: "engagement_pattern_analysis"
      },

      tribeHealth: {
        metric: "community_activity_and_satisfaction",
        indicators: ["member_retention", "collaboration_rate", "growth_velocity"]
      }
    },

    professionalDevelopmentKPIs: {
      skillGrowth: {
        metric: "new_skills_learned_and_applied",
        tracking: "learning_pathway_progress",
        validation: "peer_and_self_assessment"
      },

      goalAchievement: {
        metric: "aspiration_milestone_completion",
        measurement: "progress_toward_professional_goals",
        forecasting: "time_to_completion_predictions"
      }
    },

    collaborationKPIs: {
      projectSuccess: {
        metric: "project_completion_rate_and_quality",
        attribution: "contribution_to_team_success",
        networking: "connections_leading_to_collaborations"
      },

      relationshipValue: {
        metric: "long_term_value_of_professional_relationships",
        calculation: "future_collaboration_potential",
        measurement: "relationship_strength_scoring"
      }
    }
  },

  // Data Management & Performance
  dataManagement: {
    dataProcessing: {
      realTimeUpdates: "websocket_connections_for_live_metrics",
      batchProcessing: "scheduled_analytics_for_heavy_computations",
      cachingStrategy: "redis_memcache_for_frequent_queries",
      dataAggregation: "pre_computed_metrics_for_dashboard_speed"
    },

    dataQuality: {
      validation: "automated_data_quality_checks",
      cleansing: "outlier_detection_and_correction",
      completeness: "missing_data_handling_strategies",
      accuracy: "cross_reference_with_multiple_sources"
    }
  },

  // Export & Integration Capabilities
  exportIntegration: {
    dataExport: {
      formats: ["CSV", "JSON", "PDF", "Excel"],
      scheduling: "automated_report_generation",
      customization: "user_defined_report_templates",
      security: "encrypted_exports_with_access_controls"
    },

    apiIntegration: {
      restAPI: "programmatic_access_to_analytics_data",
      webhooks: "real_time_data_streaming",
      thirdParty: "integration_with_business_intelligence_tools",
      embedding: "dashboard_components_for_other_applications"
    }
  },

  // Best Practices for LLM Implementation
  implementationGuidelines: {
    userExperience: {
      progressiveDisclosure: "show_summary_first_details_on_demand",
      contextualHelp: "inline_explanations_for_complex_metrics",
      guidedAnalytics: "step_by_step_insight_exploration",
      mobileFirst: "responsive_design_for_all_screen_sizes"
    },

    performanceOptimization: {
      lazyLoading: "load_charts_and_data_on_demand",
      virtualization: "render_only_visible_dashboard_elements",
      compression: "minimize_data_transfer_with_efficient_formats",
      caching: "intelligent_caching_of_expensive_calculations"
    },

    accessibility: {
      screenReaderSupport: "descriptive_labels_for_all_visual_elements",
      keyboardNavigation: "full_keyboard_support_for_interactions",
      colorBlindFriendly: "use_patterns_and_text_in_addition_to_color",
      highContrast: "support_for_high_contrast_display_modes"
    },

    security: {
      dataPrivacy: "implement_proper_data_masking_and_anonymization",
      accessControl: "role_based_permissions_for_sensitive_metrics",
      auditLogging: "track_all_analytics_access_and_exports",
      compliance: "gdpr_ccpa_compliance_for_user_data_handling"
    }
  }
};

/**
 * ANALYTICS DASHBOARD IMPLEMENTATION CHECKLIST:
 *
 * 1. ✅ Define core metrics and KPIs structure
 * 2. ✅ Create responsive dashboard layout with metric cards
 * 3. ✅ Implement data visualization components (charts/graphs)
 * 4. ✅ Add AI-powered insight generation
 * 5. ✅ Build time range filtering and date selection
 * 6. ✅ Create export functionality for reports
 * 7. ✅ Add real-time data updates
 * 8. ✅ Implement user customization options
 * 9. ✅ Add accessibility features
 * 10. ✅ Include comprehensive error handling
 */
