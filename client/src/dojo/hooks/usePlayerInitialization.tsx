import { useState, useCallback, useEffect } from 'react';
import { useCavosAccount } from './useCavosAccount';
import { useSpawnPlayerCavos } from './useSpawnPlayerCavos';
import { useLiveBeast } from './useLiveBeast';
import { useRealTimeStatus } from './useRealTimeStatus';
import { useUpdateBeast } from './useUpdateBeast';
import useAppStore from '../../zustand/store';
import fetchStatus from '../../utils/fetchStatus';

// Types
interface InitializationState {
  isInitializing: boolean;
  error: string | null;
  completed: boolean;
  step: 'idle' | 'spawning_player' | 'checking_beast' | 'validating_beast' | 'complete';
  playerExists: boolean;
  hasLiveBeast: boolean;
  shouldGoToHatch: boolean;
  shouldGoToHome: boolean;
}

interface InitializationResult {
  success: boolean;
  playerExists: boolean;
  hasLiveBeast: boolean;
  shouldGoToHatch: boolean;
  shouldGoToHome: boolean;
  error?: string;
}

interface UsePlayerInitializationReturn {
  // State 
  isInitializing: boolean;
  error: string | null;
  completed: boolean;
  currentStep: string;
  playerExists: boolean;
  hasLiveBeast: boolean;
  shouldGoToHatch: boolean;
  shouldGoToHome: boolean;
  
  // Player spawn state passthrough
  playerSpawnTxHash: string | null;
  playerSpawnTxStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
  
  // Actions
  initializeComplete: () => Promise<InitializationResult>;
  resetInitialization: () => void;
}

/**
 * Enhanced coordinator hook for complete player initialization
 * includes beast status validation with contract sync
 */
export const usePlayerInitialization = (): UsePlayerInitializationReturn => {
  const { account } = useCavosAccount();
  
  // Hooks dependencies
  const {
    initializePlayer: initializePlayerCavos,
    isInitializing: playerSpawning,
    error: playerError,
    txHash: playerTxHash,
    resetInitializer: resetPlayerSpawn
  } = useSpawnPlayerCavos();

  // Use optimized live beast hook
  const {
    hasLiveBeast,
    isLoading: liveBeastLoading,
    error: liveBeastError,
    refetch: refetchLiveBeast
  } = useLiveBeast();

  // NEW: Add beast validation hooks
  const { fetchLatestStatus } = useRealTimeStatus();
  const { updateBeast } = useUpdateBeast();

  // Local state for coordination 
  const [initState, setInitState] = useState<InitializationState>({
    isInitializing: false,
    error: null,
    completed: false,
    step: 'idle',
    playerExists: false,
    hasLiveBeast: false,
    shouldGoToHatch: false,
    shouldGoToHome: false,
  });

  /**
   * Enhanced beast validation with contract sync
   * This is the key addition for your problem
   */
  const validateBeastWithContractSync = useCallback(async (): Promise<boolean> => {
    if (!account) {
      console.log('⚠️ No account for beast validation');
      return false;
    }
    
    try {
      console.log('🔍 Starting enhanced beast validation...');
      
      // Step 1: Fetch real-time status from contract first
      console.log('📡 Fetching contract status with fetchStatus...');
      const contractStatus = await fetchStatus(account);
      
      // Handle different fetchStatus return values:
      // undefined = no beast exists (Option::unwrap failed - expected)
      // null = actual error occurred
      // array = beast data received
      if (contractStatus === undefined) {
        console.log('ℹ️ Player has no live beast (expected - Option::unwrap failed)');
        return false;
      }
      
      if (contractStatus === null) {
        console.log('❌ Error fetching contract status - network or contract issue');
        return false;
      }
      
      if (!contractStatus || contractStatus.length < 10) {
        console.log('❌ Invalid contract status format');
        return false;
      }
      
      // Step 2: Check if beast is alive in contract
      const isAliveInContract = contractStatus[2] === 1; // is_alive field
      console.log('🏠 Contract beast status:', {
        beast_id: contractStatus[1],
        is_alive: isAliveInContract,
        hunger: contractStatus[4],
        energy: contractStatus[5],
        happiness: contractStatus[6],
        hygiene: contractStatus[7]
      });
      
      if (!isAliveInContract) {
        console.log('💀 Beast is dead in contract - will redirect to hatch');
        return false;
      }
      
      // Step 3: Sync with Torii using updateBeast to ensure indexer is up to date
      console.log('🔄 Executing updateBeast to sync contract state with Torii...');
      const updateSuccess = await updateBeast();
      
      if (updateSuccess) {
        console.log('✅ updateBeast successful - waiting for Torii sync...');
        
        // Wait for transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Step 4: Fetch updated data from Torii via fetchLatestStatus
        console.log('📋 Fetching latest status from Torii...');
        await fetchLatestStatus();
        
        // Small delay for store update
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Step 5: Refetch beast data to ensure store is updated
        await refetchLiveBeast();
        
        // Another small delay to ensure beast data is processed
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log('⚠️ updateBeast failed - using contract status as fallback');
      }
      
      // Step 6: Final validation from store
      const finalBeastStatus = useAppStore.getState().hasLiveBeast();
      console.log('🏪 Final beast status from store after sync:', finalBeastStatus);
      
      return finalBeastStatus;
      
    } catch (error) {
      console.error('❌ Beast validation with sync failed:', error);
      // Fallback to current store status
      return useAppStore.getState().hasLiveBeast();
    }
  }, [account, updateBeast, fetchLatestStatus, refetchLiveBeast]);

  /**
   * Enhanced main initialization coordinator function
   * Now includes beast validation step
   */
  const initializeComplete = useCallback(async (): Promise<InitializationResult> => {
    try {
      setInitState(prev => ({
        ...prev,
        isInitializing: true,
        error: null,
        step: 'spawning_player',
        completed: false
      }));

      // Step 1: Initialize/spawn player 
      if (!account?.address) {
        throw new Error("No wallet address available");
      }
      const playerResult = await initializePlayerCavos(account.address);

      if (!playerResult.success) {
        throw new Error(playerResult.error || "Player initialization failed");
      }

      setInitState(prev => ({
        ...prev,
        step: 'checking_beast',
        playerExists: playerResult.playerExists
      }));

      // Step 2: Initial beast check using your existing approach
      await new Promise(resolve => setTimeout(resolve, 1000));
      await refetchLiveBeast();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 3: Enhanced beast validation with contract sync
      setInitState(prev => ({
        ...prev,
        step: 'validating_beast'
      }));

      console.log('🚀 Starting enhanced beast validation process...');
      const validatedBeastStatus = await validateBeastWithContractSync();

      // Step 4: Determine navigation based on validated beast status
      const shouldGoToHome = validatedBeastStatus;
      const shouldGoToHatch = !validatedBeastStatus;

      console.log('🎯 Enhanced navigation decision:', {
        validatedBeastStatus,
        shouldGoToHome,
        shouldGoToHatch
      });

      // Step 5: Complete initialization
      setInitState(prev => ({
        ...prev,
        step: 'complete',
        completed: true,
        isInitializing: false,
        hasLiveBeast: validatedBeastStatus,
        shouldGoToHatch,
        shouldGoToHome
      }));

      return {
        success: true,
        playerExists: playerResult.playerExists,
        hasLiveBeast: validatedBeastStatus,
        shouldGoToHatch,
        shouldGoToHome
      };

    } catch (error: any) {
      const errorMessage = error?.message || "Complete initialization failed";

      setInitState(prev => ({
        ...prev,
        error: errorMessage,
        isInitializing: false,
        step: 'idle',
        completed: false
      }));

      return {
        success: false,
        playerExists: false,
        hasLiveBeast: false,
        shouldGoToHatch: false,
        shouldGoToHome: false,
        error: errorMessage
      };
    }
  }, [initializePlayerCavos, validateBeastWithContractSync, account]);

  /**
   * Reset all initialization state 
   */
  const resetInitialization = useCallback(() => {
    // Reset our local state
    setInitState({
      isInitializing: false,
      error: null,
      completed: false,
      step: 'idle',
      playerExists: false,
      hasLiveBeast: false,
      shouldGoToHatch: false,
      shouldGoToHome: false,
    });

    // Reset player spawn state
    resetPlayerSpawn();
  }, [resetPlayerSpawn]);

  // Update state when dependencies change
  useEffect(() => {
    if (playerError || liveBeastError) {
      const combinedError = playerError || (liveBeastError ? liveBeastError.message : null);
      setInitState(prev => ({
        ...prev,
        error: combinedError,
        isInitializing: false
      }));
    }
  }, [playerError, liveBeastError]);

  // Update hasLiveBeast when it changes 
  useEffect(() => {
    setInitState(prev => ({
      ...prev,
      hasLiveBeast
    }));
  }, [hasLiveBeast]);

  return {
    // State 
    isInitializing: initState.isInitializing || playerSpawning || liveBeastLoading,
    error: initState.error,
    completed: initState.completed,
    currentStep: initState.step,
    playerExists: initState.playerExists,
    hasLiveBeast: initState.hasLiveBeast,
    shouldGoToHatch: initState.shouldGoToHatch,
    shouldGoToHome: initState.shouldGoToHome,
    
    // Player spawn state passthrough 
    playerSpawnTxHash: playerTxHash,
    playerSpawnTxStatus: null, // Cavos version doesn't provide transaction status
    
    // Actions
    initializeComplete,
    resetInitialization,
  };
};