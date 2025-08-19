import { useCallback } from 'react';
import { useSleepAwake } from '../../../../../dojo/hooks/useSleepAwake';

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
}

/**
 * Hook that integrates Sleep/Awake transactions with navigation control
 * Coordinates the complete sleep/awake flow including blockchain updates and UI synchronization
 */
export const useSleepLogic = (): UseSleepLogicReturn => {
  // Get sleep/awake transaction capabilities
  const { 
    putToSleep, 
    wakeUp, 
    isSleepTransactionInProgress,
    currentBeastAwakeStatus 
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
   * Main campfire click handler
   * animations be controlled by beast state
   */
  const handleCampfireClick = useCallback(async () => {
    if (isInteractionDisabled) return;
    
    try {
      let result;
      
      // Determine action based on current beast state
      if (isBeastSleeping) {
        console.log('🔥 Beast is sleeping, attempting to wake up...');
        result = await wakeUp();
      } else {
        console.log('🌙 Beast is awake, attempting to put to sleep...');
        result = await putToSleep();
      }
      
      // Transaction result handling (optimistic updates already applied)
      if (!result.success) {
        console.error('❌ Sleep/Awake transaction failed:', result.error);
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
  };
};