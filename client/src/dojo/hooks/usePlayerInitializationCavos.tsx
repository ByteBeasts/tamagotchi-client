import { useState, useCallback } from 'react';
import { useSpawnPlayerCavos } from './useSpawnPlayerCavos';
import { useLiveBeast } from './useLiveBeast';
import { useUpdateBeast } from './useUpdateBeast';
import useAppStore from '../../zustand/store';

interface InitializationResult {
  success: boolean;
  playerExists: boolean;
  hasLiveBeast: boolean;
  shouldGoToHatch: boolean;
  shouldGoToHome: boolean;
  error?: string;
}

interface UsePlayerInitializationCavosReturn {
  isInitializing: boolean;
  error: string | null;
  completed: boolean;
  currentStep: string;
  playerExists: boolean;
  hasLiveBeast: boolean;
  shouldGoToHatch: boolean;
  shouldGoToHome: boolean;
  playerSpawnTxHash: string | null;
  playerSpawnTxStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
  initializeComplete: (walletAddress: string) => Promise<InitializationResult>;
  resetInitialization: () => void;
}

/**
 * Simplified player initialization coordinator for Cavos
 */
export const usePlayerInitializationCavos = (): UsePlayerInitializationCavosReturn => {
  const {
    isInitializing: playerSpawning,
    error: playerSpawnError,
    completed: playerSpawnCompleted,
    txHash: playerSpawnTxHash,
    initializePlayer
  } = useSpawnPlayerCavos();

  const { refetch: refetchBeast } = useLiveBeast();
  const { updateBeast } = useUpdateBeast();

  const [state, setState] = useState({
    isInitializing: false,
    error: null as string | null,
    completed: false,
    currentStep: 'idle',
    playerExists: false,
    hasLiveBeast: false,
    shouldGoToHatch: false,
    shouldGoToHome: false
  });

  /**
   * Complete initialization process for Cavos wallet
   */
  const initializeComplete = useCallback(async (walletAddress: string): Promise<InitializationResult> => {
    if (state.isInitializing) {
      return {
        success: false,
        playerExists: false,
        hasLiveBeast: false,
        shouldGoToHatch: false,
        shouldGoToHome: false,
        error: "Already initializing"
      };
    }

    setState(prev => ({
      ...prev,
      isInitializing: true,
      error: null,
      completed: false,
      currentStep: 'spawning_player'
    }));

    try {
      console.log('🚀 Starting complete initialization for Cavos wallet:', walletAddress);

      // Step 1: Initialize player
      const playerResult = await initializePlayer(walletAddress);
      
      if (!playerResult.success) {
        throw new Error(playerResult.error || 'Player initialization failed');
      }

      setState(prev => ({
        ...prev,
        playerExists: true,
        currentStep: 'checking_beast'
      }));

      console.log('✅ Player initialization complete, checking beast status...');

      // Step 2: Fetch and validate beast data
      await refetchBeast();
      await new Promise(resolve => setTimeout(resolve, 1000));

      const storeState = useAppStore.getState();
      const liveBeast = storeState.liveBeast;
      const hasLiveBeast = liveBeast.isAlive && liveBeast.beast !== null;

      console.log('📊 Beast status check:', {
        hasLiveBeast,
        isAlive: liveBeast.isAlive,
        beastExists: !!liveBeast.beast
      });

      setState(prev => ({
        ...prev,
        hasLiveBeast,
        currentStep: 'validating_beast'
      }));

      // Step 3: Validate beast with real-time status if beast exists
      if (hasLiveBeast && liveBeast.beast) {
        console.log('🔄 Validating beast with real-time status...');
        
        // TODO: Implement fetchStatus for Cavos wallets
        // For now, just update the beast without status validation
        try {
          console.log('🔄 Updating beast data...');
          await updateBeast();
          console.log('✅ Beast validation complete');
        } catch (statusError) {
          console.error('⚠️ Beast update failed but continuing:', statusError);
        }
      }

      // Determine navigation destination
      const shouldGoToHome = hasLiveBeast;
      const shouldGoToHatch = !hasLiveBeast;

      setState(prev => ({
        ...prev,
        shouldGoToHome,
        shouldGoToHatch,
        completed: true,
        isInitializing: false,
        currentStep: 'complete'
      }));

      console.log('🎉 Complete initialization finished:', {
        playerExists: true,
        hasLiveBeast,
        shouldGoToHome,
        shouldGoToHatch
      });

      return {
        success: true,
        playerExists: true,
        hasLiveBeast,
        shouldGoToHome,
        shouldGoToHatch
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
      console.error('❌ Complete initialization failed:', errorMessage);

      setState(prev => ({
        ...prev,
        error: errorMessage,
        isInitializing: false,
        completed: false,
        currentStep: 'idle'
      }));

      return {
        success: false,
        playerExists: false,
        hasLiveBeast: false,
        shouldGoToHome: false,
        shouldGoToHatch: false,
        error: errorMessage
      };
    }
  }, [state.isInitializing, initializePlayer, refetchBeast, updateBeast]);

  const resetInitialization = useCallback(() => {
    setState({
      isInitializing: false,
      error: null,
      completed: false,
      currentStep: 'idle',
      playerExists: false,
      hasLiveBeast: false,
      shouldGoToHatch: false,
      shouldGoToHome: false
    });
  }, []);

  // Determine transaction status
  const playerSpawnTxStatus = playerSpawnCompleted ? 'SUCCESS' : (playerSpawnError ? 'REJECTED' : (playerSpawning ? 'PENDING' : null));

  return {
    isInitializing: state.isInitializing || playerSpawning,
    error: state.error || playerSpawnError,
    completed: state.completed,
    currentStep: state.currentStep,
    playerExists: state.playerExists,
    hasLiveBeast: state.hasLiveBeast,
    shouldGoToHatch: state.shouldGoToHatch,
    shouldGoToHome: state.shouldGoToHome,
    playerSpawnTxHash,
    playerSpawnTxStatus,
    initializeComplete,
    resetInitialization
  };
};