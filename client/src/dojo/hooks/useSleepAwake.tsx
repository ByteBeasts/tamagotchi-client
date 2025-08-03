import { useState, useCallback } from 'react';
import { useCavosTransaction } from './useCavosTransaction';
import { toast } from 'react-hot-toast';
import useAppStore from '../../zustand/store';
import { getContractAddresses } from '../../config/cavosConfig';

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
  const { executeTransaction } = useCavosTransaction();
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  const player = useAppStore(state => state.player);
  
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast());
  const realTimeStatus = useAppStore(state => state.realTimeStatus);
  
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
      toast.error('Please connect to play!');
      return { success: false, error };
    }
    
    // Validation: Check if player exists
    if (!player) {
      const error = 'No player data found';
      toast.error('Unable to find your game data!');
      return { success: false, error };
    }
    
    if (!hasLiveBeast) {
      const error = 'No live beast found';
      toast.error('You need a beast first!');
      return { success: false, error };
    }
    if (sleepAwakeTransaction.isInProgress) {
      const error = 'Sleep/Awake transaction already in progress';
      toast.error('Please wait a moment!');
      return { success: false, error };
    }
    if (currentBeastAwakeStatus === false) {
      const error = 'Beast is already sleeping';
      toast.error('Your beast is already sleeping!');
      return { success: false, error };
    }
    
    try {
      setSleepAwakeTransaction({
        isInProgress: true,
        action: 'sleep',
        transactionHash: null,
        error: null,
      });
      
      console.log('🌙 Executing sleep transaction...');
      
      // Execute transaction using Cavos with dynamic contract address
      const contractAddresses = getContractAddresses();
      
      const calls = [{
        contractAddress: contractAddresses.game,
        entrypoint: 'sleep',
        calldata: []
      }];
      
      const transactionHash = await executeTransaction(calls);
      
      // Create a compatible response object
      const tx = {
        transaction_hash: transactionHash,
        code: "SUCCESS"
      };
      
      if (tx && tx.code === "SUCCESS") {
        console.log('✅ Sleep transaction submitted:', tx.transaction_hash);
        setSleepAwakeTransaction({
          isInProgress: false,
          action: 'sleep',
          transactionHash: tx.transaction_hash,
          error: null,
        });
        return {
          success: true,
          transactionHash: tx.transaction_hash,
        };
      } else {
        throw new Error("Sleep transaction failed with code: " + tx?.code);
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to put beast to sleep';
      console.error('❌ Sleep transaction failed:', err);
      setSleepAwakeTransaction({
        isInProgress: false,
        action: 'sleep',
        transactionHash: null,
        error: errorMessage,
      });
      toast.error('Unable to put your beast to sleep. Try again!');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [cavosAuth.isAuthenticated, cavosAuth.wallet, cavosAuth.accessToken, player, hasLiveBeast, sleepAwakeTransaction.isInProgress, currentBeastAwakeStatus, executeTransaction]);
  
  const wakeUp = useCallback(async (): Promise<SleepAwakeResult> => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      const error = 'Please login with ByteBeasts to wake up your beast.';
      toast.error('Please connect to play!');
      return { success: false, error };
    }
    
    // Validation: Check if player exists
    if (!player) {
      const error = 'No player data found';
      toast.error('Unable to find your game data!');
      return { success: false, error };
    }
    
    if (!hasLiveBeast) {
      const error = 'No live beast found';
      toast.error('You need a beast first!');
      return { success: false, error };
    }
    if (sleepAwakeTransaction.isInProgress) {
      const error = 'Sleep/Awake transaction already in progress';
      toast.error('Please wait a moment!');
      return { success: false, error };
    }
    if (currentBeastAwakeStatus === true) {
      const error = 'Beast is already awake';
      toast.error('Your beast is already awake!');
      return { success: false, error };
    }
    
    try {
      setSleepAwakeTransaction({
        isInProgress: true,
        action: 'awake',
        transactionHash: null,
        error: null,
      });
      
      console.log('🔥 Executing awake transaction...');
      
      // Execute transaction using Cavos with dynamic contract address
      const contractAddresses = getContractAddresses();
      
      const calls = [{
        contractAddress: contractAddresses.game,
        entrypoint: 'awake',
        calldata: []
      }];
      
      const transactionHash = await executeTransaction(calls);
      
      // Create a compatible response object
      const tx = {
        transaction_hash: transactionHash,
        code: "SUCCESS"
      };
      
      if (tx && tx.code === "SUCCESS") {
        console.log('✅ Awake transaction submitted:', tx.transaction_hash);
        setSleepAwakeTransaction({
          isInProgress: false,
          action: 'awake',
          transactionHash: tx.transaction_hash,
          error: null,
        });
        return {
          success: true,
          transactionHash: tx.transaction_hash,
        };
      } else {
        throw new Error("Awake transaction failed with code: " + tx?.code);
      }
      
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to wake up beast';
      console.error('❌ Awake transaction failed:', err);
      setSleepAwakeTransaction({
        isInProgress: false,
        action: 'awake',
        transactionHash: null,
        error: errorMessage,
      });
      toast.error('Unable to wake your beast. Try again!');
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [cavosAuth.isAuthenticated, cavosAuth.wallet, cavosAuth.accessToken, player, hasLiveBeast, sleepAwakeTransaction.isInProgress, currentBeastAwakeStatus, executeTransaction]);
  
  const resetTransaction = useCallback(() => {
    setSleepAwakeTransaction({
      isInProgress: false,
      action: null,
      transactionHash: null,
      error: null,
    });
  }, []);
  
  return {
    isSleepTransactionInProgress: sleepAwakeTransaction.isInProgress,
    sleepAwakeTransaction,
    putToSleep,
    wakeUp,
    resetTransaction,
    canToggleSleep,
    currentBeastAwakeStatus,
  };
};
