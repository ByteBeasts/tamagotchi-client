import { useCallback } from 'react';
import { useCavosTransaction } from './useCavosTransaction';
import toast from 'react-hot-toast';

// Store imports
import useAppStore from '../../zustand/store';

// Types imports
import { CleanTransactionState } from '../../components/types/clean.types';

// Hook return interface
interface UseCleanBeastReturn {
  // State
  cleanTransaction: CleanTransactionState;
  
  // Actions
  cleanBeast: () => Promise<CleanActionResult>;
  resetTransaction: () => void;
  
  // Computed
  canClean: boolean;
  isCleaningInProgress: boolean;
}

// Clean action result interface
interface CleanActionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

/**
 * Hook for managing clean beast transactions
 * Handles contract interactions with proper validation and error handling
 * Follows the same pattern as useFeedBeast for consistency
 */
export const useCleanBeast = (): UseCleanBeastReturn => {
  const { executeTransaction } = useCavosTransaction();
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  
  // Store state and actions
  const cleanTransaction = useAppStore(state => state.cleanTransaction);
  const setCleanTransaction = useAppStore(state => state.setCleanTransaction);
  const resetCleanTransaction = useAppStore(state => state.resetCleanTransaction);
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast);
  const player = useAppStore(state => state.player);

  // Execute clean beast transaction
  const cleanBeast = useCallback(async (): Promise<CleanActionResult> => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      const error = 'Please login with ByteBeasts to clean your beast.';
      toast.error('Please connect to play!');
      return { success: false, error };
    }

    // Validation: Check if player exists
    if (!player) {
      const error = 'No player data found';
      toast.error('Unable to find your game data!');
      return { success: false, error };
    }

    // Validation: Check if beast is live
    if (!hasLiveBeast()) {
      const error = 'No live beast found';
      toast.error('You need a beast to clean!');
      return { success: false, error };
    }

    // Validation: Check if already cleaning
    if (cleanTransaction.isCleaningInProgress) {
      const error = 'Clean transaction already in progress';
      toast.error('Your beast is still being cleaned!');
      return { success: false, error };
    }

    try {
      // Start transaction - set loading state
      setCleanTransaction({
        isCleaningInProgress: true,
        transactionHash: null,
        error: null,
      });

      // Execute transaction using Cavos with hardcoded contract address
      const gameContractAddress = '0x217331080ea988e121cbe284bfe9b2504d9e78c363234abd57c260f7b3621a8';
      
      const calls = [{
        contractAddress: gameContractAddress,
        entrypoint: 'clean',
        calldata: []
      }];
      
      const transactionHash = await executeTransaction(calls);
      
      // Create a compatible response object
      const tx = {
        transaction_hash: transactionHash,
        code: "SUCCESS"
      };
      
      // Check transaction result
      if (tx && tx.code === "SUCCESS") {
        // Update transaction state with success
        setCleanTransaction({
          isCleaningInProgress: false,
          transactionHash: tx.transaction_hash,
          error: null,
        });

        return {
          success: true,
          transactionHash: tx.transaction_hash,
        };
        
      } else {
        throw new Error("Clean transaction failed with code: " + tx?.code);
      }

    } catch (error: any) {
      console.error('Clean transaction failed:', error);

      // Update transaction state with error
      const errorMessage = error?.message || error?.toString() || 'Transaction failed';
      setCleanTransaction({
        isCleaningInProgress: false,
        transactionHash: null,
        error: errorMessage,
      });

      // Show error toast
      toast.error('Unable to clean your beast. Try again!', {
        duration: 4000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '16px',
        },
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [
    cavosAuth.isAuthenticated,
    cavosAuth.wallet,
    cavosAuth.accessToken,
    player,
    hasLiveBeast,
    cleanTransaction.isCleaningInProgress,
    setCleanTransaction,
    executeTransaction
  ]);

  // Reset transaction state
  const resetTransaction = useCallback(() => {
    resetCleanTransaction();
  }, [resetCleanTransaction]);

  // Computed values with proper boolean types
  const canClean = Boolean(
    cavosAuth.isAuthenticated &&
    cavosAuth.wallet &&
    cavosAuth.accessToken &&
    player &&
    hasLiveBeast() &&
    !cleanTransaction.isCleaningInProgress
  );
  
  const isCleaningInProgress = Boolean(cleanTransaction.isCleaningInProgress);

  return {
    // State
    cleanTransaction,
    
    // Actions
    cleanBeast,
    resetTransaction,
    
    // Computed
    canClean,
    isCleaningInProgress,
  };
};