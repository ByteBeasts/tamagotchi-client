import { useCallback, useState, useRef } from "react";
import toast from "react-hot-toast";

// Hooks imports
import { useCleanBeast } from '../../../../../dojo/hooks/useCleanBeast';
import { useRainSystem } from './useRainSystem';

// Hook return interface
interface UseCleanLogicReturn {
  // Transaction state from useCleanBeast
  isCleaningInProgress: boolean;
  canClean: boolean;
  
  // Rain system state
  isRainActive: boolean;
  
  // Clean process state
  isProcessingClean: boolean;
  
  // Actions
  handleCloudClick: () => Promise<boolean>; // Returns success state
  
  // Computed
  isInteractionDisabled: boolean;
}

/**
 * Hook for integrating clean beast transaction with rain animation system
 * Coordinates the sequence: Click → TX → Rain → Status Update
 */
export const useCleanLogic = (rainDuration: number = 5): UseCleanLogicReturn => {
  
  // Get clean transaction capabilities
  const {
    cleanBeast,
    isCleaningInProgress,
    canClean
  } = useCleanBeast();
  
  // Get rain animation system
  const {
    isRainActive,
    startRain
  } = useRainSystem(rainDuration);
  
  // Local state for coordination
  const [isProcessingClean, setIsProcessingClean] = useState(false);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Only disable during transaction, not during rain animation
  const isInteractionDisabled = Boolean(
    isCleaningInProgress || 
    !canClean
  );

  /**
   * Handle successful clean with post-cleaning updates
   * Returns success state for CleanScreen to handle UI feedback
   */
  const handleSuccessfulClean = useCallback(async (): Promise<boolean> => {
    try {
      // Start rain animation IMMEDIATELY (optimistic)
      startRain();
      
      // Execute blockchain transaction (optimistic updates handled inside)
      const result = await cleanBeast();
      
      // Reset processing state quickly to allow consecutive clicks
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
      
      processingTimeoutRef.current = setTimeout(() => {
        setIsProcessingClean(false);
      }, 500);
      
      if (result.success) {
        return true;
      } else {
        console.error('Clean transaction failed:', result.error);
        setIsProcessingClean(false);
        return false;
      }
      
    } catch (error) {
      console.error('Unexpected error in handleSuccessfulClean:', error);
      setIsProcessingClean(false);
      return false;
    }
  }, [cleanBeast, startRain]);

  /**
   * Handle cloud click - main action for clean screen
   * Returns success state for CleanScreen to handle success feedback
   */
  const handleCloudClick = useCallback(async (): Promise<boolean> => {
    // Only block if blockchain transaction is already active
    if (isCleaningInProgress) {
      // No toast - let the UI handle the feedback
      return false;
    }
    
    try {
      setIsProcessingClean(true);
      
      // Execute the cleaning sequence - let cleanBeast handle specific validations
      const success = await handleSuccessfulClean();
      
      return success;
      
    } catch (error) {
      console.error('Error in handleCloudClick:', error);
      setIsProcessingClean(false);
      return false;
    }
  }, [
    isCleaningInProgress,
    handleSuccessfulClean
  ]);

  return {
    // Transaction state
    isCleaningInProgress,
    canClean,
    
    // Animation state
    isRainActive,
    
    // Clean process state
    isProcessingClean,
    
    // Actions
    handleCloudClick,
    
    // Computed
    isInteractionDisabled,
  };
};