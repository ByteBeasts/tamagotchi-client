import mixpanel from 'mixpanel-browser';

// Initialize Mixpanel
const MIXPANEL_TOKEN = process.env.REACT_APP_MIXPANEL_TOKEN || '';

export const initMixpanel = () => {
  if (MIXPANEL_TOKEN) {
    mixpanel.init(MIXPANEL_TOKEN, {
      debug: process.env.NODE_ENV === 'development',
      track_pageview: false,
      persistence: 'localStorage'
    });
  }
};

// Essential tracking functions for ByteBeasts growth
export class MixpanelService {
  
  // Track beast care actions (core engagement)
  static trackBeastCare(action: string, data: {
    beast_id: number;
    species: string;
    hunger_level: number;
    happiness_level: number;
    energy_level: number;
    hygiene_level: number;
    user_streak: number;
    is_emergency?: boolean;
  }) {
    mixpanel.track(`Beast ${action}`, {
      ...data,
      beast_health_score: Math.round((data.hunger_level + data.happiness_level + data.energy_level + data.hygiene_level) / 4),
      care_urgency: this.calculateUrgency(data),
      timing_quality: data.is_emergency ? 'emergency' : 'good'
    });
  }

  // Track gameplay sessions (engagement depth)
  static trackGameplay(gameId: string, data: {
    score: number;
    duration: number;
    completed: boolean;
    coins_earned: number;
    gems_earned: number;
    user_streak: number;
    beast_happiness: number;
  }) {
    mixpanel.track('Minigame Completed', {
      game_id: gameId,
      ...data,
      performance_tier: this.getPerformanceTier(gameId, data.score),
      session_quality: data.completed ? 'complete' : 'abandoned'
    });
  }

  // Track onboarding steps (activation optimization)
  static trackOnboarding(step: string, data: {
    step_number: number;
    completed: boolean;
    time_spent: number;
    user_id?: string;
  }) {
    mixpanel.track('Onboarding Step', {
      step_name: step,
      ...data,
      friction_level: data.time_spent > 60 ? 'high' : 'low'
    });
  }

  // Track purchase intent (monetization)
  static trackPurchaseIntent(trigger: string, data: {
    gems_needed: number;
    current_gems: number;
    beast_urgency: string;
    user_engagement: string;
  }) {
    mixpanel.track('Purchase Intent', {
      trigger_event: trigger,
      ...data,
      conversion_likelihood: this.calculateConversionLikelihood(data)
    });
  }

  // Track daily login (retention)
  static trackDailyLogin(data: {
    user_id: string;
    streak_count: number;
    days_since_signup: number;
    beast_alive: boolean;
  }) {
    mixpanel.track('Daily Login', {
      ...data,
      retention_risk: data.streak_count < 3 ? 'high' : 'low',
      user_maturity: data.days_since_signup > 7 ? 'veteran' : 'new'
    });
  }

  // Track session end (engagement quality)
  static trackSessionEnd(data: {
    session_duration: number;
    actions_performed: number;
    screens_visited: number;
    positive_outcomes: number;
  }) {
    mixpanel.track('Session End', {
      ...data,
      session_quality_score: this.calculateSessionScore(data),
      engagement_depth: data.actions_performed > 5 ? 'deep' : 'shallow'
    });
  }

  // Helper functions
  private static calculateUrgency(data: any): string {
    const minStat = Math.min(data.hunger_level, data.happiness_level, data.energy_level, data.hygiene_level);
    if (minStat < 20) return 'critical';
    if (minStat < 40) return 'high';
    if (minStat < 60) return 'medium';
    return 'low';
  }

  private static getPerformanceTier(gameId: string, score: number): string {
    const thresholds = gameId === 'flappy_beasts' ? [10, 25, 50] : [500, 1500, 3000];
    if (score > thresholds[2]) return 'expert';
    if (score > thresholds[1]) return 'intermediate';
    if (score > thresholds[0]) return 'beginner';
    return 'novice';
  }

  private static calculateConversionLikelihood(data: any): string {
    if (data.beast_urgency === 'critical' && data.user_engagement === 'high') return 'high';
    if (data.beast_urgency === 'high' || data.user_engagement === 'high') return 'medium';
    return 'low';
  }

  private static calculateSessionScore(data: any): number {
    return Math.min(100, (data.actions_performed * 10) + (data.positive_outcomes * 15) + Math.min(data.session_duration / 10, 20));
  }
}

export default MixpanelService; 