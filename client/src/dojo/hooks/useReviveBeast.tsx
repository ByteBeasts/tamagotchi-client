import { useState, useCallback } from 'react';
import { useOptimisticTransaction } from './useOptimisticTransaction';
import { getContractAddresses } from '../../config/cavosConfig';
import useAppStore from '../../zustand/store';
import toast from 'react-hot-toast';

// Constants
const REVIVE_FEE_GEMS = 20;

// Hook interface
interface UseReviveBeastReturn {
  reviveBeast: () => Promise<{ success: boolean; error?: string; txHash?: string }>;
  isReviving: boolean;
  error: string | null;
}

// Beast status for optimistic update
interface OptimisticBeastStatus {
  is_alive: boolean;
  hunger: number;
  energy: number;
  happiness: number;
  hygiene: number;
}

/**
 * Hook for reviving a dead beast using the game contract
 * Handles optimistic updates and gem balance validation
 */
export const useReviveBeast = (): UseReviveBeastReturn => {
  const [error, setError] = useState<string | null>(null);
  const { executeOptimistic, isProcessing } = useOptimisticTransaction();

  // Store actions
  const storePlayer = useAppStore(state => state.player);
  const liveBeast = useAppStore(state => state.liveBeast.beast);
  const setLiveBeast = useAppStore(state => state.setLiveBeast);
  const setPlayer = useAppStore(state => state.setPlayer);
  const setRealTimeStatus = useAppStore(state => state.setRealTimeStatus);

  const reviveBeast = useCallback(async (): Promise<{ success: boolean; error?: string; txHash?: string }> => {
    setError(null);

    // Validation: Check if player has enough gems
    const currentGems = storePlayer?.total_gems || 0;
    if (currentGems < REVIVE_FEE_GEMS) {
      const errorMsg = `Insufficient gems. You need ${REVIVE_FEE_GEMS} gems but only have ${currentGems}.`;
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    // Validation: Check if beast exists and is dead
    if (!liveBeast) {
      const errorMsg = 'No beast found to revive.';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      const contractAddresses = getContractAddresses();

      // Prepare transaction call
      const calls = [{
        contractAddress: contractAddresses.game,
        entrypoint: 'revive',
        calldata: [] // revive() takes no parameters
      }];

      // Execute optimistic transaction
      const result = await executeOptimistic(calls, {
        // Capture current state before changes
        captureState: () => ({
          player: { ...storePlayer },
          beast: liveBeast ? { ...liveBeast } : null,
          beastStatus: useAppStore.getState().liveBeast.status
        }),

        // Apply optimistic updates immediately
        onOptimisticUpdate: () => {
          console.log('🔄 Applying optimistic revive updates...');

          // Update player gems immediately
          if (storePlayer) {
            const updatedPlayer = {
              ...storePlayer,
              total_gems: storePlayer.total_gems - REVIVE_FEE_GEMS
            };
            setPlayer(updatedPlayer);
          }

          // Create optimistic beast status (alive with full stats)
          const optimisticStatus: OptimisticBeastStatus = {
            is_alive: true,
            hunger: 100,
            energy: 100,
            happiness: 100,
            hygiene: 100
          };

          // Update live beast status to alive
          if (liveBeast) {
            const currentStatus = useAppStore.getState().liveBeast.status;
            if (currentStatus) {
              setLiveBeast(liveBeast, {
                ...currentStatus,
                ...optimisticStatus
              });
            }
          }

          // Update real-time status for UI
          const currentRealTimeStatus = useAppStore.getState().realTimeStatus;
          if (currentRealTimeStatus.length >= 10) {
            const newRealTimeStatus = [...currentRealTimeStatus];
            newRealTimeStatus[2] = 1; // is_alive = true
            newRealTimeStatus[4] = 100; // hunger = 100
            newRealTimeStatus[5] = 100; // energy = 100
            newRealTimeStatus[6] = 100; // happiness = 100
            newRealTimeStatus[7] = 100; // hygiene = 100
            setRealTimeStatus(newRealTimeStatus);
          }

          toast.success('Beast revived! ✨', {
            duration: 2000,
            position: 'top-center'
          });
        },

        // Rollback on transaction failure
        onRollback: (originalState: any) => {
          console.log('🔄 Rolling back revive transaction...');

          // Restore original player state
          if (originalState.player) {
            setPlayer(originalState.player);
          }

          // Restore original beast state
          if (originalState.beast && originalState.beastStatus) {
            setLiveBeast(originalState.beast, originalState.beastStatus);
          }

          // Restore original real-time status
          const currentRealTimeStatus = useAppStore.getState().realTimeStatus;
          if (currentRealTimeStatus.length >= 10 && originalState.beastStatus) {
            const restoredRealTimeStatus = [...currentRealTimeStatus];
            restoredRealTimeStatus[2] = originalState.beastStatus.is_alive ? 1 : 0;
            restoredRealTimeStatus[4] = originalState.beastStatus.hunger;
            restoredRealTimeStatus[5] = originalState.beastStatus.energy;
            restoredRealTimeStatus[6] = originalState.beastStatus.happiness;
            restoredRealTimeStatus[7] = originalState.beastStatus.hygiene;
            setRealTimeStatus(restoredRealTimeStatus);
          }

          toast.error('Failed to revive beast. Please try again.');
        },

        // Success callback
        onSuccess: (txHash: string) => {
          console.log('✅ Beast revive transaction successful:', txHash);
          toast.success('Beast successfully revived on blockchain! 🎉', {
            duration: 3000,
            position: 'top-center'
          });
        },

        // Error callback
        onError: (error: any) => {
          console.error('❌ Beast revive transaction failed:', error);
          const errorMsg = error?.message || 'Failed to revive beast';
          setError(errorMsg);
        }
      });

      if (result.success) {
        return { success: true, txHash: result.txHash };
      } else {
        return { success: false, error: result.error?.message || 'Transaction failed' };
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to revive beast';
      setError(errorMsg);
      console.error('❌ Revive beast error:', err);
      return { success: false, error: errorMsg };
    }
  }, [storePlayer, liveBeast, executeOptimistic, setLiveBeast, setPlayer, setRealTimeStatus]);

  return {
    reviveBeast,
    isReviving: isProcessing,
    error
  };
};