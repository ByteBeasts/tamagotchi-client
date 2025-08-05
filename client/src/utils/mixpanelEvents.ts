// Eventos simples para trackear solo cuando las personas entran
export const MIXPANEL_EVENTS = {
  APP_VISIT: 'App Visit',
  APP_LOAD: 'App Load',
  FIRST_VISIT: 'First Visit',
} as const;

// Propiedades que se envían con cada visita
export interface VisitEventProperties {
  timestamp?: string;
  page?: string;
  referrer?: string;
  user_agent?: string;
  session_id?: string;
}

// Ejemplo de uso manual (opcional):
/*
import { useMixpanel } from '../context/MixpanelContext';

const MyComponent = () => {
  const { trackVisit } = useMixpanel();
  
  // Se trackea automáticamente al entrar, pero puedes llamarlo manualmente si necesitas
  const handleManualTrack = () => {
    trackVisit();
  };
  
  return <div>App content</div>;
};
*/ 