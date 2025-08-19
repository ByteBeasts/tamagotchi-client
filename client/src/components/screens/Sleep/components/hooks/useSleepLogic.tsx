import { useCallback } from 'react';
import { useSleepAwake } from '../../../../../dojo/hooks/useSleepAwake';
import { useSleepAwakeRefactored } from '../../../../../dojo/hooks/useSleepAwakeRefactored';

interface UseSleepLogicReturn {
  // Beast state
  isBeastSleeping: boolean;
  isSleepTransactionInProgress: boolean;
  
  // Campfire integration
  handleCampfireClick: () => Promise<void>;
  
  // Navigation control
  shouldBlockNavigation: boolean;
  
  // Computed
  isInteractionDisabled: boolean;
  
  // Data fetching
  fetchInitialStatus: () => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook refactorizado que coordina sleep/awake siguiendo el plan original:
 * 1. Fetch manual al montar
 * 2. Optimistic updates instantáneos  
 * 3. Sync manual post-transacción
 * Sin polling automático que interfiera
 */
export const useSleepLogic = (): UseSleepLogicReturn => {
  // Hook refactorizado para fetch manual (plan original)
  const { 
    currentBeastAwakeStatus,
    fetchInitialStatus,
    fetchStatusSync,
    isLoading
  } = useSleepAwakeRefactored();
  
  // Hook de transacciones (modificado para usar callbacks)
  const { 
    putToSleep, 
    wakeUp, 
    isSleepTransactionInProgress
  } = useSleepAwake();
  
  /**
   * Determine if beast is currently sleeping
   * Uses real-time status as source of truth
   */
  const isBeastSleeping = currentBeastAwakeStatus === false;
  
  /**
   * Determine if navigation should be blocked
   * Block navigation when beast is sleeping (except to sleep screen)
   */
  const shouldBlockNavigation = isBeastSleeping;
  
  /**
   * Determine if interactions should be disabled
   * Disable during transactions or when status is unknown
   */
  const isInteractionDisabled = isSleepTransactionInProgress || currentBeastAwakeStatus === null;
  
  /**
   * Main campfire click handler - Plan original implementado
   * Ejecuta optimistic update y programa sync post-transacción
   */
  const handleCampfireClick = useCallback(async () => {
    if (isInteractionDisabled) return;
    
    try {
      let result;
      
      // Determine action based on current beast state
      if (isBeastSleeping) {
        console.log('🔥 Beast is sleeping, attempting to wake up...');
        // Sin callback - confiamos en optimistic updates
        result = await wakeUp();
      } else {
        console.log('🌙 Beast is awake, attempting to put to sleep...');
        // Sin callback - confiamos en optimistic updates  
        result = await putToSleep();
      }
      
      // Transaction result handling (optimistic updates already applied)
      if (!result.success) {
        console.error('❌ Sleep/Awake transaction failed:', result.error);
      } else {
        console.log('✅ Sleep/Awake optimistic update completed - no sync needed');
      }
      
    } catch (error) {
      console.error('❌ Unexpected error in handleCampfireClick:', error);
    }
  }, [
    isInteractionDisabled,
    isBeastSleeping,
    wakeUp,
    putToSleep
  ]);
  
  return {
    // Beast state
    isBeastSleeping,
    isSleepTransactionInProgress,
    
    // Campfire integration
    handleCampfireClick,
    
    // Navigation control
    shouldBlockNavigation,
    
    // Computed
    isInteractionDisabled,
    
    // Data fetching (plan original - paso 1)
    fetchInitialStatus,
    isLoading,
  };
};