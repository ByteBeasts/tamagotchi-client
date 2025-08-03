import { useState, useCallback, useRef } from 'react';
import { useCavosTransaction } from './useCavosTransaction';
import useAppStore from '../../zustand/store';
import { useRealTimeStatus } from './useRealTimeStatus';
import { getContractAddresses } from '../../config/cavosConfig';

interface UpdateBeastState {
  isUpdating: boolean;
  lastUpdate: number | null;
  error: string | null;
  retryCount: number;
}

interface UseUpdateBeastReturn {
  // State
  isUpdating: boolean;
  lastUpdate: number | null;
  error: string | null;
  
  // Actions
  updateBeast: () => Promise<boolean>;
  triggerUpdate: () => void; // Fire-and-forget for navigation
  resetError: () => void;
}

/**
 * Hook for managing background beast updates
 * Executes update_beast contract calls without blocking UI
 */
export const useUpdateBeast = (): UseUpdateBeastReturn => {
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  const { executeTransaction } = useCavosTransaction();
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast());
  const { fetchLatestStatus } = useRealTimeStatus();
  
  // Local state
  const [state, setState] = useState<UpdateBeastState>({
    isUpdating: false,
    lastUpdate: null,
    error: null,
    retryCount: 0,
  });
  
  // Prevent multiple simultaneous updates
  const isUpdatingRef = useRef(false);
  
  /**
   * Execute update_beast transaction
   * Returns true if successful, false if failed
   */
  const updateBeast = useCallback(async (): Promise<boolean> => {
    // Early returns for invalid states
    if (!cavosWallet?.address || !hasLiveBeast) {
      console.log('⏸️ Skipping update_beast - no wallet or live beast');
      return false;
    }
    
    if (isUpdatingRef.current) {
      console.log('⏸️ Update already in progress, skipping');
      return false;
    }
    
    try {
      isUpdatingRef.current = true;
      setState(prev => ({ 
        ...prev, 
        isUpdating: true, 
        error: null 
      }));
      
      // Execute the contract transaction using Cavos
      const contractAddresses = getContractAddresses();
      
      const calls = [{
        contractAddress: contractAddresses.game,
        entrypoint: 'update_beast',
        calldata: []
      }];
      
      const transactionHash = await executeTransaction(calls);
      
      if (transactionHash) {
        console.log('✅ update_beast transaction submitted:', transactionHash);
        
        setState(prev => ({
          ...prev,
          isUpdating: false,
          lastUpdate: Date.now(),
          retryCount: 0,
        }));
        
        // Fetch updated status after successful transaction
        // Small delay to ensure transaction is processed
        setTimeout(() => {
          fetchLatestStatus();
        }, 2000);
        
        return true;
      } else {
        throw new Error('Transaction returned null');
      }
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Update beast failed';
      console.error('❌ update_beast failed:', error);
      
      setState(prev => ({
        ...prev,
        isUpdating: false,
        error: errorMessage,
        retryCount: prev.retryCount + 1,
      }));
      
      return false;
    } finally {
      isUpdatingRef.current = false;
    }
  }, [cavosWallet, hasLiveBeast, executeTransaction, fetchLatestStatus]);
  
  /**
   * Fire-and-forget update for navigation
   * Executes update_beast in background without blocking UI
   */
  const triggerUpdate = useCallback(() => {
    if (!cavosWallet?.address || !hasLiveBeast) {
      console.log('⏸️ Skipping trigger update - no wallet or live beast');
      return;
    }
    
    console.log('🚀 Triggering background update_beast...');
    
    // Execute async without awaiting to avoid blocking navigation
    updateBeast().then(success => {
      if (success) {
        console.log('✅ Background update_beast completed successfully');
      } else {
        console.log('⚠️ Background update_beast failed (non-blocking)');
      }
    }).catch(error => {
      console.error('❌ Background update_beast error (non-blocking):', error);
    });
  }, [updateBeast, cavosWallet, hasLiveBeast]);
  
  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, retryCount: 0 }));
  }, []);
  
  return {
    // State
    isUpdating: state.isUpdating,
    lastUpdate: state.lastUpdate,
    error: state.error,
    
    // Actions
    updateBeast,
    triggerUpdate,
    resetError,
  };
};