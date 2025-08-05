import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { mixpanelInstance } from './MixpanelConfig';

interface MixpanelContextType {
  trackVisit: () => void;
  isInitialized: boolean;
}

const MixpanelContext = createContext<MixpanelContextType | undefined>(undefined);

interface MixpanelProviderProps {
  children: ReactNode;
}

export const MixpanelProvider: React.FC<MixpanelProviderProps> = ({ children }) => {
  
  const trackVisit = () => {
    if (mixpanelInstance.initialized && mixpanelInstance.client) {
      mixpanelInstance.client.track('App Visit', {
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer || 'direct',
        user_agent: navigator.userAgent,
      });
    }
  };

  useEffect(() => {
    trackVisit();
  }, []);

  const value: MixpanelContextType = {
    trackVisit,
    isInitialized: mixpanelInstance.initialized,
  };

  return (
    <MixpanelContext.Provider value={value}>
      {children}
    </MixpanelContext.Provider>
  );
};

export const useMixpanel = (): MixpanelContextType => {
  const context = useContext(MixpanelContext);
  if (context === undefined) {
    throw new Error('useMixpanel must be used within a MixpanelProvider');
  }
  return context;
}; 
