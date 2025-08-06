import mixpanel from 'mixpanel-browser';

// Mixpanel configuration
const MIXPANEL_TOKEN = process.env.REACT_APP_MIXPANEL_TOKEN || 'your-mixpanel-token';

export const initializeMixpanel = () => {
  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV === 'development',
    track_pageview: true,
    persistence: 'localStorage',
    batch_requests: true,
    batch_size: 50,
    batch_flush_interval_ms: 5000,
    cross_subdomain_cookie: false,
    secure_cookie: true,
    ip: false, // Don't track IP for privacy
    property_blacklist: ['$current_url', '$initial_referrer'] // Exclude sensitive data
  });

  // Set up super properties that will be sent with every event
  mixpanel.register({
    'App Version': '1.0.0',
    'Environment': process.env.NODE_ENV,
    'Platform': 'Web'
  });
};

// Strategic event categories for organized analysis
export const EventCategories = {
  // User Lifecycle
  ONBOARDING: 'onboarding',
  ACTIVATION: 'activation', 
  ENGAGEMENT: 'engagement',
  RETENTION: 'retention',
  MONETIZATION: 'monetization',
  
  // Game Mechanics
  BEAST_CARE: 'beast_care',
  GAMEPLAY: 'gameplay',
  PROGRESSION: 'progression',
  SOCIAL: 'social',
  
  // Technical
  PERFORMANCE: 'performance',
  ERRORS: 'errors'
} as const;

// Strategic Analysis Configurations
export const MixpanelAnalysisConfig = {
  // Retention Analysis Setup
  retentionCohorts: {
    // Define cohorts by behavior, not just time
    'Quick Adopters': {
      criteria: 'Completed onboarding within 10 minutes',
      trackingEvents: ['Beast Hatched', 'First Feed', 'First Game']
    },
    'Game Focused Users': {
      criteria: 'Played 3+ games in first session',
      trackingEvents: ['Minigame Session', 'Score Achieved']
    },
    'Care Focused Users': {
      criteria: 'Fed beast 3+ times in first day',
      trackingEvents: ['Beast Fed', 'Beast Cleaned', 'Beast Sleep']
    }
  },

  // Conversion Funnels
  keyFunnels: {
    'User Activation': [
      'App Opened',
      'Worldcoin Auth Started', 
      'Worldcoin Auth Completed',
      'Beast Creation Started',
      'Beast Hatched Successfully',
      'First Beast Interaction'
    ],
    'Daily Engagement': [
      'Daily Login',
      'Beast Status Check',
      'Care Action Performed',
      'Minigame Played',
      'Session End'
    ],
    'Monetization': [
      'Purchase Intent Detected',
      'Payment Flow Started', 
      'Payment Completed',
      'Item Used'
    ]
  },

  // Key Performance Indicators
  kpis: {
    // Growth KPIs
    'New User Quality Score': {
      calculation: 'Average of (first_session_actions * engagement_depth * retention_day_1)',
      benchmark: '> 7.5 indicates high-quality users'
    },
    'Activation Rate': {
      calculation: 'Users who complete first beast interaction / Total signups',
      benchmark: '> 65%'
    },
    'D1/D7/D30 Retention': {
      calculation: 'Users returning on day 1, 7, 30',
      benchmark: 'D1: >40%, D7: >20%, D30: >10%'
    },
    
    // Engagement KPIs  
    'Session Quality Score': {
      calculation: 'Weighted average of session_duration + unique_actions + positive_outcomes',
      benchmark: '> 75/100'
    },
    'Daily Streak Conversion': {
      calculation: 'Users achieving 7+ day streak / Total activated users',
      benchmark: '> 25%'
    },
    
    // Monetization KPIs
    'Time to First Purchase': {
      calculation: 'Average days from signup to first gem purchase',
      benchmark: '< 14 days'
    },
    'Purchase Conversion by Urgency': {
      calculation: 'Conversion rate segmented by beast urgency level',
      benchmark: 'Critical: >60%, High: >30%, Medium: >15%'
    }
  },

  // Predictive Analytics Setup
  predictiveModels: {
    'Churn Risk': {
      inputs: ['days_since_last_session', 'beast_health_trend', 'session_quality_decline', 'care_consistency'],
      threshold: 0.7,
      actions: ['push_notification', 'special_offer', 'reminder_email']
    },
    'Purchase Likelihood': {
      inputs: ['engagement_level', 'beast_urgency', 'previous_purchases', 'session_frustration_signals'],
      threshold: 0.4,
      actions: ['targeted_offer', 'timing_optimization', 'price_adjustment']
    },
    'Viral Potential': {
      inputs: ['achievement_unlock_rate', 'social_sharing_history', 'network_effect_indicators'],
      threshold: 0.3,
      actions: ['sharing_prompts', 'referral_incentives', 'social_features_highlight']
    }
  }
};

// Dashboard Templates for Different Stakeholders
export const DashboardTemplates = {
  // For Product Managers
  productManager: {
    name: 'Product Health Dashboard',
    widgets: [
      {
        type: 'insights',
        title: 'User Activation Funnel',
        query: 'funnel from "App Opened" to "First Beast Interaction"',
        segmentation: ['acquisition_source', 'device_type']
      },
      {
        type: 'retention',
        title: 'Cohort Retention Analysis', 
        cohortBy: 'signup_week',
        retentionCriteria: 'performed_care_action'
      },
      {
        type: 'insights',
        title: 'Feature Discovery Rate',
        query: 'unique_count of "Feature Used" grouped by feature_name',
        timeframe: 'last_30_days'
      }
    ]
  },

  // For Growth Team
  growthTeam: {
    name: 'Growth Metrics Dashboard',
    widgets: [
      {
        type: 'insights',
        title: 'Acquisition Channel Performance',
        query: 'count of "User Signed Up" segmented by utm_source',
        metrics: ['cost_per_acquisition', 'ltv_prediction', 'quality_score']
      },
      {
        type: 'insights', 
        title: 'Viral Coefficient',
        query: 'referrals_made / active_users',
        segmentation: ['user_level', 'engagement_tier']
      },
      {
        type: 'insights',
        title: 'Churn Risk Distribution',
        query: 'users segmented by churn_risk_level',
        actions: ['intervention_campaigns', 'retention_experiments']
      }
    ]
  },

  // For Monetization Team
  monetizationTeam: {
    name: 'Revenue Intelligence Dashboard',
    widgets: [
      {
        type: 'insights',
        title: 'Purchase Intent to Conversion',
        query: 'funnel from "Purchase Intent Detected" to "Payment Completed"',
        segmentation: ['urgency_level', 'user_tier', 'beast_species']
      },
      {
        type: 'insights',
        title: 'Optimal Pricing Analysis',
        query: 'conversion_rate by price_point and user_segment',
        optimization: 'dynamic_pricing'
      },
      {
        type: 'revenue',
        title: 'LTV Cohort Analysis',
        cohortBy: 'first_purchase_month',
        metrics: ['revenue_per_user', 'purchase_frequency', 'average_order_value']
      }
    ]
  }
};

// A/B Testing Framework
export const ABTestingFramework = {
  experiments: {
    'Onboarding Optimization': {
      variants: ['control', 'simplified_flow', 'gamified_tutorial'],
      successMetrics: ['completion_rate', 'time_to_first_care', 'day_1_retention'],
      sample_size: 1000,
      confidence_level: 95
    },
    'Purchase Flow Optimization': {
      variants: ['control', 'urgency_messaging', 'bundle_offers'],
      successMetrics: ['conversion_rate', 'average_order_value', 'completion_time'],
      segmentation: ['urgency_level', 'user_type']
    },
    'Retention Campaign Timing': {
      variants: ['immediate', '24h_delay', '72h_delay'],
      successMetrics: ['return_rate', 'engagement_increase', 'long_term_retention'],
      trigger: 'churn_risk_detected'
    }
  }
};

// Strategic Questions to Answer with Analytics
export const AnalyticalQuestions = {
  growth: [
    'Which acquisition channels bring the highest quality users?',
    'What onboarding experience leads to highest activation?',
    'At what point do users develop sustainable habits?'
  ],
  engagement: [
    'What beast care patterns correlate with long-term retention?',
    'Which game features drive the most daily engagement?',
    'How does beast species choice affect user behavior?'
  ],
  monetization: [
    'What emotional states predict highest purchase intent?',
    'How does purchase timing affect customer lifetime value?',
    'Which user segments have the highest price elasticity?'
  ],
  product: [
    'Which features are discovered vs. which should be?',
    'Where do users experience the most friction?',
    'What predicts transition from casual to committed user?'
  ]
};

export default {
  initializeMixpanel,
  EventCategories,
  MixpanelAnalysisConfig,
  DashboardTemplates,
  ABTestingFramework,
  AnalyticalQuestions
}; 