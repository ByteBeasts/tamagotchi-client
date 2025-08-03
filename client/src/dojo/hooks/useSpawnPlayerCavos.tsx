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
  const waitForPlayerData = useCallback(async (walletAddress: string, maxAttempts = 20): Promise<boolean> => {
    console.log('🔄 Waiting for player data to be indexed...', { walletAddress, maxAttempts });
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔍 Player polling attempt ${attempt}/${maxAttempts}`);
      
      try {
        // Force refetch from Torii
        await refetchPlayer();
        
        // Give more time for the refetch to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const storePlayer = useAppStore.getState().player;
        
        console.log(`🔍 Polling attempt ${attempt} - Player state:`, {
          hasStorePlayer: !!storePlayer,
          storePlayerAddress: storePlayer?.address,
          targetAddress: walletAddress,
          addressMatch: storePlayer?.address === walletAddress
        });
        
        if (storePlayer && storePlayer.address === walletAddress) {
          console.log('✅ Player data found and verified!');
          return true;
        }
        
        // More aggressive polling: shorter waits initially, then longer
        if (attempt < maxAttempts) {
          let waitTime;
          if (attempt <= 5) {
            waitTime = 2000; // First 5 attempts: 2s
          } else if (attempt <= 10) {
            waitTime = 3000; // Next 5 attempts: 3s
          } else {
            waitTime = 5000; // Final attempts: 5s
          }
          console.log(`⏳ Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      } catch (error) {
        console.error(`❌ Error in polling attempt ${attempt}:`, error);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    console.log('❌ Player data polling completed without success');
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
      console.log('🔍 Checking player initialization requirements for wallet:', walletAddress);
      
      // Check if this is a new user from Cavos store
      const cavosAuth = useAppStore.getState().cavos;
      const isNewUser = !cavosAuth.user?.created_at || 
                       (Date.now() - new Date(cavosAuth.user.created_at).getTime()) < 60000; // Less than 1 minute old
      
      console.log(`👤 User type: ${isNewUser ? 'NEW USER' : 'EXISTING USER'}`, {
        userCreated: cavosAuth.user?.created_at,
        timeSinceCreation: cavosAuth.user?.created_at ? 
          Date.now() - new Date(cavosAuth.user.created_at).getTime() : 'unknown'
      });
      
      // Check if player already exists in blockchain
      await refetchPlayer();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storePlayer = useAppStore.getState().player;
      const playerExists = storePlayer !== null && storePlayer.address === walletAddress;

      if (playerExists) {
        console.log('✅ Player already exists in blockchain');
        setCompleted(true);
        setIsInitializing(false);
        return { success: true, playerExists: true };
      }

      // Only spawn player if it's a new user or doesn't exist in blockchain
      if (!isNewUser && !playerExists) {
        console.log('⚠️ Existing user but no player found - this is unexpected but proceeding with spawn');
      }
      
      console.log('🥚 Player does not exist - spawning new player...');
      
      // For Cavos, construct the call manually using contract address from manifest
      const playerContractAddress = '0x2277356f235adb1550f3e18d5f93b0903cec390335967c3ddba7b446638fbac';
      
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
      console.log('🔗 Transaction hash:', transactionHash);
      console.log('📍 Target wallet address:', walletAddress);
      console.log('🌐 Expected to index player for address:', walletAddress);
      
      await new Promise(resolve => setTimeout(resolve, 5000)); // Increased wait time
      
      // Poll for player data with more attempts
      const playerDataFound = await waitForPlayerData(walletAddress, 20);
      
      // No need to clear flags since we use timestamp-based detection

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
          error: "Game is taking a bit longer to load. Please refresh the page!"
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