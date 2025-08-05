// @ts-ignore
import mixpanel from 'mixpanel-browser';

interface MixpanelSetupResult {
  initialized: boolean;
  client: any | null; 
}

export function setupMixpanel(): MixpanelSetupResult {
  const apiKey = import.meta.env.VITE_MIXPANEL_API_KEY;
  const isDevelopment = import.meta.env.VITE_DEV;

  if (!apiKey) {
    console.warn('Mixpanel API key not found. Analytics will not be loaded.');
    return { initialized: false, client: null };
  }

  try {
    mixpanel.init(apiKey, {
      debug: isDevelopment,
      track_pageview: false,
      persistence: 'localStorage',
    });
    
    if (isDevelopment) {
      console.log('🎯 Mixpanel initialized - tracking visits only');
    }
    
    return { 
      initialized: true, 
      client: mixpanel 
    };
  } catch (error) {
    console.error('Mixpanel Error:', error);
    return { initialized: false, client: null };
  }
}

export const mixpanelInstance = setupMixpanel(); 
