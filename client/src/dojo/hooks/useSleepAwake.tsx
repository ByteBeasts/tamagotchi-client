import { useState, useCallback } from 'react';
import { useOptimisticTransaction } from './useOptimisticTransaction';
import useAppStore from '../../zustand/store';
import { getContractAddresses } from '../../config/cavosConfig';

// Optimistic helpers
import { calculateOptimisticSleepAwake, isBeastAlive } from '../../utils/optimisticHelpers';

// No more automatic hooks - will be handled externally

// Types
interface SleepAwakeTransactionState {
  isInProgress: boolean;
  action: 'sleep' | 'awake' | null;
  transactionHash: string | null;
  error: string | null;
}

interface SleepAwakeResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

interface UseSleepAwakeReturn {
  // State
  isSleepTransactionInProgress: boolean;
  sleepAwakeTransaction: SleepAwakeTransactionState;
  
  // Actions  
  putToSleep: () => Promise<SleepAwakeResult>;
  wakeUp: () => Promise<SleepAwakeResult>;
  resetTransaction: () => void;
  
  // Computed
  canToggleSleep: boolean;
  currentBeastAwakeStatus: boolean | null;
}

/**
 * Hook for managing Sleep/Awake transactions
 */
export const useSleepAwake = (): UseSleepAwakeReturn => {
  const { executeOptimistic } = useOptimisticTransaction();
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  const player = useAppStore(state => state.player);
  
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast());
  const realTimeStatus = useAppStore(state => state.realTimeStatus);
  const setRealTimeStatus = useAppStore(state => state.setRealTimeStatus);
  const setOptimisticSleepFlag = useAppStore(state => state.setOptimisticSleepFlag);
  
  const [sleepAwakeTransaction, setSleepAwakeTransaction] = useState<SleepAwakeTransactionState>({
    isInProgress: false,
    action: null,
    transactionHash: null,
    error: null,
  });
  
  const currentBeastAwakeStatus = realTimeStatus.length >= 4
    ? Boolean(realTimeStatus[3])
    : null;
  
  const canToggleSleep = Boolean(
    cavosAuth.isAuthenticated &&
    cavosAuth.wallet &&
    cavosAuth.accessToken &&
    player &&
    hasLiveBeast &&
    !sleepAwakeTransaction.isInProgress &&
    currentBeastAwakeStatus !== null
  );
  
  const putToSleep = useCallback(async (): Promise<SleepAwakeResult> => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      const error = 'Please login with ByteBeasts to put your beast to sleep.';
      return { success: false, error };
    }
    
    // Validation: Check if player exists
    if (!player) {
      const error = 'No player data found';
      return { success: false, error };
    }
    
    if (!hasLiveBeast) {
      const error = 'No live beast found';
      return { success: false, error };
    }
    if (sleepAwakeTransaction.isInProgress) {
      const error = 'Sleep/Awake transaction already in progress';
      return { success: false, error };
    }
    if (currentBeastAwakeStatus === false) {
      const error = 'Beast is already sleeping';
      return { success: false, error };
    }
    
    // Validation: Check if beast is alive
    if (!isBeastAlive(realTimeStatus)) {
      const error = 'Beast is not alive';
      return { success: false, error };
    }
    
    console.log('🌙 Executing sleep transaction...');
    
    // Execute transaction with optimistic updates
    const contractAddresses = getContractAddresses();
    
    const calls = [{
      contractAddress: contractAddresses.game,
      entrypoint: 'sleep',
      calldata: []
    }];
    
    const result = await executeOptimistic(calls, {
      // Capture current state
      captureState: () => ({
        originalStatus: [...realTimeStatus]
      }),
      
      // Apply optimistic update
      onOptimisticUpdate: () => {
        // Set flag to prevent overwrites
        setOptimisticSleepFlag(true);
        // Update awake status optimistically
        const optimisticStats = calculateOptimisticSleepAwake(realTimeStatus);
        setRealTimeStatus(optimisticStats, true); // skipSync = true
        console.log('💤 Beast set to sleep mode (optimistic)');
      },
      
      // Rollback on failure
      onRollback: (originalState: any) => {
        setOptimisticSleepFlag(false); // Clear flag on rollback
        setRealTimeStatus(originalState.originalStatus, true);
        console.log('Sleep transaction rolled back');
      },
      
      // On success, schedule background sync
      onSuccess: (txHash: string) => {
        console.log('✅ Sleep transaction successful:', txHash);
        
        // Clear flag after successful transaction
        setOptimisticSleepFlag(false);
        
        // Clear transaction state
        setSleepAwakeTransaction({
          isInProgress: false,
          action: 'sleep',
          transactionHash: txHash,
          error: null,
        });
        
        // Sin post-success sync - confiamos en optimistic updates
        console.log('✅ Sleep optimistic update applied - polling mantendrá consistencia eventual');
      },
      
      // On error
      onError: (error: any) => {
        console.error('Sleep transaction failed:', error);
        
        // Clear flag on error
        setOptimisticSleepFlag(false);
        
        // Clear transaction state
        setSleepAwakeTransaction({
          isInProgress: false,
          action: 'sleep',
          transactionHash: null,
          error: error?.message || 'Transaction failed',
        });
      }
    });
    
    if (result.success) {
      return {
        success: true,
        transactionHash: result.txHash,
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Transaction failed',
      };
    }
  }, [
    cavosAuth.isAuthenticated, 
    cavosAuth.wallet, 
    cavosAuth.accessToken, 
    player, 
    hasLiveBeast, 
    sleepAwakeTransaction.isInProgress, 
    currentBeastAwakeStatus, 
    executeOptimistic, 
    realTimeStatus, 
    setRealTimeStatus,
    setOptimisticSleepFlag
  ]);
  
  const wakeUp = useCallback(async (): Promise<SleepAwakeResult> => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      const error = 'Please login with ByteBeasts to wake up your beast.';
      return { success: false, error };
    }
    
    // Validation: Check if player exists
    if (!player) {
      const error = 'No player data found';
      return { success: false, error };
    }
    
    if (!hasLiveBeast) {
      const error = 'No live beast found';
      return { success: false, error };
    }
    if (sleepAwakeTransaction.isInProgress) {
      const error = 'Sleep/Awake transaction already in progress';
      return { success: false, error };
    }
    if (currentBeastAwakeStatus === true) {
      const error = 'Beast is already awake';
      return { success: false, error };
    }
    
    // Validation: Check if beast is alive
    if (!isBeastAlive(realTimeStatus)) {
      const error = 'Beast is not alive';
      return { success: false, error };
    }
    
    console.log('🔥 Executing awake transaction...');
    
    // Execute transaction with optimistic updates
    const contractAddresses = getContractAddresses();
    
    const calls = [{
      contractAddress: contractAddresses.game,
      entrypoint: 'awake',
      calldata: []
    }];
    
    const result = await executeOptimistic(calls, {
      // Capture current state
      captureState: () => ({
        originalStatus: [...realTimeStatus]
      }),
      
      // Apply optimistic update
      onOptimisticUpdate: () => {
        // Set flag to prevent overwrites
        setOptimisticSleepFlag(true);
        // Update awake status optimistically
        const optimisticStats = calculateOptimisticSleepAwake(realTimeStatus);
        setRealTimeStatus(optimisticStats, true); // skipSync = true
        console.log('☀️ Beast woken up (optimistic)');
      },
      
      // Rollback on failure
      onRollback: (originalState: any) => {
        setOptimisticSleepFlag(false); // Clear flag on rollback
        setRealTimeStatus(originalState.originalStatus, true);
        console.log('Awake transaction rolled back');
      },
      
      // On success, schedule background sync
      onSuccess: (txHash: string) => {
        console.log('✅ Awake transaction successful:', txHash);
        
        // Clear flag after successful transaction
        setOptimisticSleepFlag(false);
        
        // Clear transaction state
        setSleepAwakeTransaction({
          isInProgress: false,
          action: 'awake',
          transactionHash: txHash,
          error: null,
        });
        
        // Sin post-success sync - confiamos en optimistic updates
        console.log('✅ Awake optimistic update applied - polling mantendrá consistencia eventual');
      },
      
      // On error
      onError: (error: any) => {
        console.error('Awake transaction failed:', error);
        
        // Clear flag on error
        setOptimisticSleepFlag(false);
        
        // Clear transaction state
        setSleepAwakeTransaction({
          isInProgress: false,
          action: 'awake',
          transactionHash: null,
          error: error?.message || 'Transaction failed',
        });
      }
    });
    
    if (result.success) {
      return {
        success: true,
        transactionHash: result.txHash,
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Transaction failed',
      };
    }
  }, [
    cavosAuth.isAuthenticated, 
    cavosAuth.wallet, 
    cavosAuth.accessToken, 
    player, 
    hasLiveBeast, 
    sleepAwakeTransaction.isInProgress, 
    currentBeastAwakeStatus, 
    executeOptimistic, 
    realTimeStatus, 
    setRealTimeStatus,
    setOptimisticSleepFlag
  ]);
  
  const resetTransaction = useCallback(() => {
    setSleepAwakeTransaction({
      isInProgress: false,
      action: null,
      transactionHash: null,
      error: null,
    });
  }, []);
  
  return {
    // Beast state
    isSleepTransactionInProgress: sleepAwakeTransaction.isInProgress,
    sleepAwakeTransaction,
    
    // Actions
    putToSleep,
    wakeUp,
    resetTransaction,
    
    // Computed
    canToggleSleep,
    currentBeastAwakeStatus,
  };
};