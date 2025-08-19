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
  wasExistingPlayer: boolean;
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
  const { forceUpdateBeast } = useUpdateBeast();

  const [state, setState] = useState({
    isInitializing: false,
    error: null as string | null,
    completed: false,
    currentStep: 'idle',
    playerExists: false,
    wasExistingPlayer: false,
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

      // Track if this was a newly created player or already existed
      const wasExistingPlayer = playerResult.playerExists === true;

      setState(prev => ({
        ...prev,
        playerExists: true,
        wasExistingPlayer,
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

      // Step 3: Force beast update to sync Torii with contract (only for existing players)
      if (wasExistingPlayer) {
        console.log('🔧 Force updating beast data to sync Torii with contract (existing player)...');
        try {
          await forceUpdateBeast();
          console.log('✅ Force beast update complete - Torii synchronized');
          
          // Re-fetch beast data after forced update to get accurate status
          await refetchBeast();
          
          // Re-check beast status after sync
          const updatedStoreState = useAppStore.getState();
          const updatedLiveBeast = updatedStoreState.liveBeast;
          const updatedHasLiveBeast = updatedLiveBeast.isAlive && updatedLiveBeast.beast !== null;
          
          console.log('📊 Updated beast status after sync:', {
            hasLiveBeast: updatedHasLiveBeast,
            isAlive: updatedLiveBeast.isAlive,
            beastExists: !!updatedLiveBeast.beast
          });
          
          // Update state with correct beast status
          setState(prev => ({
            ...prev,
            hasLiveBeast: updatedHasLiveBeast
          }));
          
        } catch (statusError) {
          console.error('⚠️ Force beast update failed but continuing:', statusError);
        }
      } else {
        console.log('🆕 New player - skipping beast update (no beast to update)');
      }

      // Determine navigation destination
      // New player (just created) → Always go to Hatch
      // Existing player → Always go to Home (to see beast status, alive or dead)
      const shouldGoToHome = wasExistingPlayer; // Existing players go to home
      const shouldGoToHatch = !wasExistingPlayer; // Only new players go to hatch

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
  }, [state.isInitializing, initializePlayer, refetchBeast, forceUpdateBeast]);

  const resetInitialization = useCallback(() => {
    setState({
      isInitializing: false,
      error: null,
      completed: false,
      currentStep: 'idle',
      playerExists: false,
      wasExistingPlayer: false,
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
    wasExistingPlayer: state.wasExistingPlayer,
    hasLiveBeast: state.hasLiveBeast,
    shouldGoToHatch: state.shouldGoToHatch,
    shouldGoToHome: state.shouldGoToHome,
    playerSpawnTxHash,
    playerSpawnTxStatus,
    initializeComplete,
    resetInitialization
  };
};