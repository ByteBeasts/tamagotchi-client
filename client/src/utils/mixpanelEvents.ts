export const MIXPANEL_EVENTS = {
  APP_VISIT: 'App Visit',
  APP_LOAD: 'App Load',
  FIRST_VISIT: 'First Visit',
} as const;

export interface VisitEventProperties {
  timestamp?: string;
  page?: string;
  referrer?: string;
  user_agent?: string;
  session_id?: string;
}
