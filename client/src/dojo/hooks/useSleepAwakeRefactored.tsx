import { useState, useCallback, useRef } from 'react';
import useAppStore from '../../zustand/store';
import fetchStatus from '../../utils/fetchStatus';
import { network } from '../../config/cavosConfig';

interface UseSleepAwakeRefactoredReturn {
  // Data
  currentBeastAwakeStatus: boolean | null;
  
  // Actions
  fetchInitialStatus: () => Promise<void>;
  fetchStatusSync: () => Promise<void>;
  
  // State
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook refactorizado para manejo manual de sleep/awake data
 * Implementa el plan original:
 * 1. Fetch manual al montar
 * 2. Sin polling automático
 * 3. Fetch manual post-transacción para sync
 */
export const useSleepAwakeRefactored = (): UseSleepAwakeRefactoredReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get Cavos wallet address
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast());
  
  // Store actions
  const setRealTimeStatus = useAppStore(state => state.setRealTimeStatus);
  const validateStatusForCurrentBeast = useAppStore(state => state.validateStatusForCurrentBeast);
  const realTimeStatus = useAppStore(state => state.realTimeStatus);
  
  // Prevent multiple simultaneous fetches
  const isFetchingRef = useRef(false);
  
  // Get current beast awake status from store
  const currentBeastAwakeStatus = realTimeStatus.length >= 4 
    ? Boolean(realTimeStatus[3]) 
    : null;
  
  /**
   * Fetch initial status when mounting SleepScreen
   * Parte 1 del plan original
   */
  const fetchInitialStatus = useCallback(async () => {
    if (!cavosWallet?.address || !hasLiveBeast || isFetchingRef.current) {
      console.log('⏸️ SleepAwakeRefactored: Skipping initial fetch', {
        hasWallet: !!cavosWallet?.address,
        hasLiveBeast,
        isFetching: isFetchingRef.current
      });
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      console.log('🌙 SleepAwakeRefactored: Fetching initial status...');
      const newStatus = await fetchStatus({ address: cavosWallet.address, chainId: network });
      
      if (newStatus && newStatus.length >= 10) {
        // Validate that status belongs to current beast
        if (validateStatusForCurrentBeast(newStatus)) {
          setRealTimeStatus(newStatus, true); // skipSync = true
          console.log('✅ SleepAwakeRefactored: Initial status loaded', {
            beast_id: newStatus[1],
            is_alive: Boolean(newStatus[2]),
            is_awake: Boolean(newStatus[3]),
            hunger: newStatus[4],
            energy: newStatus[5],
            happiness: newStatus[6],
            hygiene: newStatus[7]
          });
        } else {
          console.log('⚠️ SleepAwakeRefactored: Status for different beast, ignoring');
        }
      } else if (newStatus === undefined) {
        console.log('💀 SleepAwakeRefactored: Beast is dead');
      } else {
        setError('Invalid status response');
        console.error('❌ SleepAwakeRefactored: Invalid status response:', newStatus);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('❌ SleepAwakeRefactored: Failed to fetch initial status:', errorMessage);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [cavosWallet?.address, hasLiveBeast, validateStatusForCurrentBeast, setRealTimeStatus]);
  
  /**
   * Fetch status for post-transaction sync
   * Parte 3 del plan original (después de optimistic update)
   */
  const fetchStatusSync = useCallback(async () => {
    if (!cavosWallet?.address || !hasLiveBeast || isFetchingRef.current) {
      console.log('⏸️ SleepAwakeRefactored: Skipping sync fetch', {
        hasWallet: !!cavosWallet?.address,
        hasLiveBeast,
        isFetching: isFetchingRef.current
      });
      return;
    }
    
    try {
      isFetchingRef.current = true;
      setError(null);
      
      console.log('🔄 SleepAwakeRefactored: Syncing status with blockchain...');
      const newStatus = await fetchStatus({ address: cavosWallet.address, chainId: network });
      
      if (newStatus && newStatus.length >= 10) {
        if (validateStatusForCurrentBeast(newStatus)) {
          setRealTimeStatus(newStatus, true); // skipSync = true
          console.log('✅ SleepAwakeRefactored: Status synced with blockchain', {
            beast_id: newStatus[1],
            is_awake: Boolean(newStatus[3]),
            hunger: newStatus[4],
            energy: newStatus[5],
            happiness: newStatus[6],
            hygiene: newStatus[7]
          });
        } else {
          console.log('⚠️ SleepAwakeRefactored: Sync status for different beast, ignoring');
        }
      } else if (newStatus === undefined) {
        console.log('💀 SleepAwakeRefactored: Beast is dead during sync');
      } else {
        setError('Invalid sync response');
        console.error('❌ SleepAwakeRefactored: Invalid sync response:', newStatus);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('❌ SleepAwakeRefactored: Failed to sync status:', errorMessage);
    } finally {
      isFetchingRef.current = false;
    }
  }, [cavosWallet?.address, hasLiveBeast, validateStatusForCurrentBeast, setRealTimeStatus]);
  
  return {
    // Data
    currentBeastAwakeStatus,
    
    // Actions
    fetchInitialStatus,
    fetchStatusSync,
    
    // State
    isLoading,
    error,
  };
};