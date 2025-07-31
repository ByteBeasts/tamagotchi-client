import { useState, useCallback } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // Not needed for Cavos
import { useDojoSDK } from '@dojoengine/sdk/react';
import { useCavosTransaction } from './useCavosTransaction';
import { usePlayer } from './usePlayer';
import useAppStore from '../../zustand/store';

interface InitializationResult {
  success: boolean;
  playerExists: boolean;
  transactionHash?: string;
  error?: string;
}

interface UseSpawnPlayerCavosReturn {
  isInitializing: boolean;
  error: string | null;
  completed: boolean;
  txHash: string | null;
  playerExists: boolean;
  initializePlayer: (walletAddress: string) => Promise<InitializationResult>;
  resetInitializer: () => void;
}

/**
 * Simplified hook for player spawning using Cavos invisible wallet
 */
export const useSpawnPlayerCavos = (): UseSpawnPlayerCavosReturn => {
  const { client } = useDojoSDK();
  const { executeTransaction, loading: txLoading } = useCavosTransaction();
  const { refetch: refetchPlayer } = usePlayer();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);

  /**
   * Wait for player data to be indexed by Torii
   */
  const waitForPlayerData = useCallback(async (walletAddress: string, maxAttempts = 8): Promise<boolean> => {
    console.log('🔄 Waiting for player data to be indexed...', { walletAddress, maxAttempts });
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔍 Player polling attempt ${attempt}/${maxAttempts}`);
      
      try {
        await refetchPlayer();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const storePlayer = useAppStore.getState().player;
        
        if (storePlayer && storePlayer.address === walletAddress) {
          console.log('✅ Player data found and verified');
          return true;
        }
        
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`❌ Error in polling attempt ${attempt}:`, error);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    return false;
  }, [refetchPlayer]);

  /**
   * Initialize player using Cavos wallet
   */
  const initializePlayer = useCallback(async (walletAddress: string): Promise<InitializationResult> => {
    if (isInitializing) {
      return { success: false, playerExists: false, error: "Already initializing" };
    }

    setIsInitializing(true);
    setError(null);
    setCompleted(false);
    setTxHash(null);

    // const transactionId = uuidv4(); // Not needed for Cavos
    
    try {
      console.log('🔍 Checking if player exists for wallet:', walletAddress);
      
      // Check if player already exists
      await refetchPlayer();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storePlayer = useAppStore.getState().player;
      const playerExists = storePlayer !== null && storePlayer.address === walletAddress;

      if (playerExists) {
        console.log('✅ Player already exists');
        setCompleted(true);
        setIsInitializing(false);
        return { success: true, playerExists: true };
      }

      console.log('🥚 Player does not exist - spawning new player...');
      
      // For Cavos, construct the call manually using contract address from manifest
      const playerContractAddress = '0x5e79b9650cb00d19d21601c9c712654cb13daa3007fd78cce0e90051e46ec8a';
      
      const calls = [{
        contractAddress: playerContractAddress,
        entrypoint: 'spawn_player',
        calldata: [] // spawn_player doesn't need parameters
      }];

      console.log('📋 Prepared spawn player call:', calls);

      console.log('📤 Executing spawn player transaction via Cavos...');
      
      // Execute transaction using Cavos
      const transactionHash = await executeTransaction(calls);
      setTxHash(transactionHash);
      
      console.log('✅ Spawn transaction successful:', transactionHash);
      
      // Wait for transaction to be processed and indexed
      console.log('⏳ Waiting for transaction to be processed and indexed...');
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      // Poll for player data
      const playerDataFound = await waitForPlayerData(walletAddress, 8);
      
      if (playerDataFound) {
        console.log('✅ Player data successfully indexed!');
        setCompleted(true);
        setIsInitializing(false);
        return { 
          success: true, 
          playerExists: false,
          transactionHash 
        };
      } else {
        console.log('⚠️ Player spawn succeeded but data not yet indexed');
        setCompleted(true);
        setIsInitializing(false);
        return { 
          success: true,
          playerExists: false,
          transactionHash,
          error: "Player spawn succeeded but data sync incomplete. Please refresh the page."
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("❌ Player initialization failed:", errorMessage);
      
      setError(errorMessage);
      setIsInitializing(false);
      return { success: false, playerExists: false, error: errorMessage };
    }
  }, [isInitializing, client, executeTransaction, refetchPlayer, waitForPlayerData]);

  const resetInitializer = useCallback(() => {
    setIsInitializing(false);
    setError(null);
    setCompleted(false);
    setTxHash(null);
  }, []);

  return {
    isInitializing: isInitializing || txLoading,
    error,
    completed,
    txHash,
    playerExists: useAppStore.getState().player !== null,
    initializePlayer,
    resetInitializer
  };
};