import { useEffect, useRef, useCallback } from 'react';
import useAppStore from '../../zustand/store';
import fetchStatus from '../../utils/fetchStatus';
import { network } from '../../config/cavosConfig';

interface UseRealTimeStatusReturn {
  // State from store
  realTimeStatus: number[];
  lastStatusUpdate: number | null;
  isStatusLoading: boolean;
  
  // 🆕 UPDATED: Formatted status for UI (now includes isAwake)
  statusForUI: {
    energy: number;
    hunger: number;
    happiness: number;
    hygiene: number;
    isAwake: boolean; // 🆕 NEW: Include is_awake status
  } | null;
  
  // Actions
  fetchLatestStatus: (skipSync?: boolean) => Promise<void>;
  updateOptimistic: (statusUpdate: Partial<{
    energy: number;
    hunger: number;
    happiness: number;
    hygiene: number;
  }>) => void;
  startPolling: (intervalMs?: number) => void;
  stopPolling: () => void;
}

/**
 * Hook for managing real-time beast status
 * Handles periodic fetching, optimistic updates, and UI integration
 */
export const useRealTimeStatus = (): UseRealTimeStatusReturn => {
  // Get Cavos wallet address instead of Starknet account
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  
  // Store selectors
  const realTimeStatus = useAppStore(state => state.realTimeStatus);
  const lastStatusUpdate = useAppStore(state => state.lastStatusUpdate);
  const isStatusLoading = useAppStore(state => state.isStatusLoading);
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast());
  
  // Store actions
  const setRealTimeStatus = useAppStore(state => state.setRealTimeStatus);
  const updateStatusOptimistic = useAppStore(state => state.updateStatusOptimistic);
  const validateStatusForCurrentBeast = useAppStore(state => state.validateStatusForCurrentBeast);
  const getRealTimeStatusForUI = useAppStore(state => state.getRealTimeStatusForUI);
  const clearRealTimeStatus = useAppStore(state => state.clearRealTimeStatus);
  
  // Polling control
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);
  
  /**
   * Fetch latest status from contract
   */
  const fetchLatestStatus = useCallback(async (skipSync = false) => {
    if (!cavosWallet?.address || !hasLiveBeast) {
      console.log('⏸️ Skipping status fetch - no Cavos wallet or live beast');
      return;
    }
    
    try {
      console.log('🔄 Fetching real-time status...');
      
      // Set loading state
      useAppStore.setState({ isStatusLoading: true });
      
      const newStatus = await fetchStatus({ address: cavosWallet.address, chainId: network });
      
      if (newStatus && newStatus.length >= 10) {
        // Validate that status belongs to current beast
        if (validateStatusForCurrentBeast(newStatus)) {
          setRealTimeStatus(newStatus, skipSync);
          console.log('✅ Real-time status updated:', {
            beast_id: newStatus[1],
            is_alive: Boolean(newStatus[2]),
            is_awake: Boolean(newStatus[3]),
            hunger: newStatus[4],
            energy: newStatus[5],
            happiness: newStatus[6],
            hygiene: newStatus[7]
          });
        } else {
          console.log('⚠️ Status received for different beast, ignoring');
          useAppStore.setState({ isStatusLoading: false });
        }
      } else if (newStatus === undefined) {
        // undefined means the beast is dead (Option::unwrap failed in contract)
        console.log('💀 Beast is dead, marking as dead in store');
        const currentState = useAppStore.getState();
        
        if (currentState.liveBeast.status) {
          // Update existing beast to dead status
          useAppStore.setState({ 
            isStatusLoading: false,
            liveBeast: {
              ...currentState.liveBeast,
              isAlive: false,
              status: {
                ...currentState.liveBeast.status,
                is_alive: false,
                hunger: 0,
                happiness: 0,
                hygiene: 0,
                energy: 0
              }
            },
            // Also reset realTimeStatus to ensure NavBar shows 0s
            realTimeStatus: []
          });
        } else {
          // No beast status, just mark as not alive
          useAppStore.setState({ 
            isStatusLoading: false,
            liveBeast: {
              ...currentState.liveBeast,
              isAlive: false
            },
            realTimeStatus: []
          });
        }
      } else {
        console.log('❌ Invalid status response');
        useAppStore.setState({ isStatusLoading: false });
      }
    } catch (error) {
      console.error('❌ Failed to fetch real-time status:', error);
      useAppStore.setState({ isStatusLoading: false });
    }
  }, [cavosWallet?.address, hasLiveBeast, validateStatusForCurrentBeast, setRealTimeStatus]);
  
  /**
   * Start polling for status updates
   */
  const startPolling = useCallback((intervalMs: number = 120000) => {
    if (isPollingRef.current) {
      console.log('⚠️ Polling already active');
      return;
    }
    
    console.log(`🚀 Starting real-time status polling (every ${intervalMs/1000}s)`);
    isPollingRef.current = true;
    
    // Fetch immediately
    fetchLatestStatus();
    
    // Set up interval
    intervalRef.current = setInterval(() => {
      if (isPollingRef.current) {
        fetchLatestStatus();
      }
    }, intervalMs);
  }, [fetchLatestStatus]);
  
  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (!isPollingRef.current) return;
    
    console.log('⏹️ Stopping real-time status polling');
    isPollingRef.current = false;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);
  
  /**
   * Optimistic update wrapper
   */
  const updateOptimistic = useCallback((statusUpdate: Partial<{
    energy: number;
    hunger: number;
    happiness: number;
    hygiene: number;
  }>) => {
    console.log('🔄 Optimistic status update:', statusUpdate);
    updateStatusOptimistic(statusUpdate);
  }, [updateStatusOptimistic]);
  
  // Auto-start polling when Cavos wallet and beast are available
  useEffect(() => {
    if (cavosWallet?.address && hasLiveBeast && !isPollingRef.current) {
      startPolling();
    } else if (cavosWallet?.address && !hasLiveBeast && !isPollingRef.current) {
      // NEW: Even if no live beast, try to fetch once to validate death status
      console.log('🔍 Checking contract for beast status (possible dead beast)...');
      fetchLatestStatus();
    } else if ((!cavosWallet?.address || !hasLiveBeast) && isPollingRef.current) {
      stopPolling();
      clearRealTimeStatus();
    }
    
    return () => {
      stopPolling();
    };
  }, [cavosWallet?.address, hasLiveBeast, startPolling, stopPolling, clearRealTimeStatus, fetchLatestStatus]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);
  
  // Get formatted status for UI (now includes isAwake)
  const statusForUI = getRealTimeStatusForUI();
  
  return {
    // State
    realTimeStatus,
    lastStatusUpdate,
    isStatusLoading,
    statusForUI,
    
    // Actions
    fetchLatestStatus,
    updateOptimistic,
    startPolling,
    stopPolling,
  };
};