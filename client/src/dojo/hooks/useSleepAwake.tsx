import { useState, useCallback } from 'react';
import { useCavosAccount } from './useCavosAccount';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { toast } from 'react-hot-toast';
import useAppStore from '../../zustand/store';

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
  const { account } = useCavosAccount();
  const { client } = useDojoSDK();
  
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
    account &&
    hasLiveBeast &&
    !sleepAwakeTransaction.isInProgress &&
    currentBeastAwakeStatus !== null
  );
  
  const putToSleep = useCallback(async (): Promise<SleepAwakeResult> => {
    // Validation
    if (!account) {
      const error = 'Wallet not connected';
      toast.error(error);
      return { success: false, error };
    }
    if (!hasLiveBeast) {
      const error = 'No live beast found';
      toast.error(error);
      return { success: false, error };
    }
    if (sleepAwakeTransaction.isInProgress) {
      const error = 'Sleep/Awake transaction already in progress';
      toast.error(error);
      return { success: false, error };
    }
    if (currentBeastAwakeStatus === false) {
      const error = 'Beast is already sleeping';
      toast.error(error);
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
      const tx = await client.game.sleep(account);
      
      if (tx?.transaction_hash) {
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
        throw new Error('Transaction returned no hash');
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
      toast.error(`Sleep failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [account, hasLiveBeast, sleepAwakeTransaction.isInProgress, currentBeastAwakeStatus, client]);
  
  const wakeUp = useCallback(async (): Promise<SleepAwakeResult> => {
    // Validation
    if (!account) {
      const error = 'Wallet not connected';
      toast.error(error);
      return { success: false, error };
    }
    if (!hasLiveBeast) {
      const error = 'No live beast found';
      toast.error(error);
      return { success: false, error };
    }
    if (sleepAwakeTransaction.isInProgress) {
      const error = 'Sleep/Awake transaction already in progress';
      toast.error(error);
      return { success: false, error };
    }
    if (currentBeastAwakeStatus === true) {
      const error = 'Beast is already awake';
      toast.error(error);
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
      const tx = await client.game.awake(account);
      
      if (tx?.transaction_hash) {
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
        throw new Error('Transaction returned no hash');
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
      toast.error(`Wake up failed: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, [account, hasLiveBeast, sleepAwakeTransaction.isInProgress, currentBeastAwakeStatus, client]);
  
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
