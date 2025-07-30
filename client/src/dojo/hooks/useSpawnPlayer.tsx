import { useState, useCallback } from 'react';
import { useCavosAccount } from './useCavosAccount';
// import { Account } from 'starknet'; // Deprecated - using Cavos instead
import { v4 as uuidv4 } from 'uuid';
import { useDojoSDK } from '@dojoengine/sdk/react';

// Hooks imports
import { usePlayer } from './usePlayer';
import { useStarknetConnect } from './useStarknetConnect';

// Store import
import useAppStore from '../../zustand/store';

// Types
interface InitializationState {
  isInitializing: boolean;
  error: string | null;
  completed: boolean;
  step: 'checking' | 'spawning' | 'loading' | 'success';
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
}

interface InitializationResult {
  success: boolean;
  playerExists: boolean;
  transactionHash?: string;
  error?: string;
}

interface UseSpawnPlayerReturn {
  // State
  isInitializing: boolean;
  error: string | null;
  completed: boolean;
  currentStep: string;
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
  isConnected: boolean;
  playerExists: boolean;
  
  // Actions
  initializePlayer: () => Promise<InitializationResult>;
  resetInitializer: () => void;
}

/**
 * Hook coordinator for player spawning and initialization
 * Handles the complete flow of player verification and creation
 */
export const useSpawnPlayer = (): UseSpawnPlayerReturn => {
  const { useDojoStore, client } = useDojoSDK();
  const state = useDojoStore((state) => state);
  const { account } = useCavosAccount();
  const { status } = useStarknetConnect();
  const { refetch: refetchPlayer } = usePlayer();

  // Local state for initialization process
  const [initState, setInitState] = useState<InitializationState>({
    isInitializing: false,
    error: null,
    completed: false,
    step: 'checking',
    txHash: null,
    txStatus: null,
  });

  // Tracking if we're currently initializing
  const [isInitializing, setIsInitializing] = useState(false);

  /**
   * Enhanced player data polling with retry mechanism
   */
  const waitForPlayerData = useCallback(async (maxAttempts = 8, delayMs = 2000): Promise<boolean> => {
    console.log('🔄 Starting player data polling...', { maxAttempts, delayMs });
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`🔍 Player polling attempt ${attempt}/${maxAttempts}`);
      
      try {
        // Refetch player data
        await refetchPlayer();
        
        // Small delay for store update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if player exists in store
        const storePlayer = useAppStore.getState().player;
        
        console.log(`📊 Attempt ${attempt} store check:`, {
          playerExists: !!storePlayer,
          playerAddress: storePlayer?.address,
          accountAddress: account?.address
        });
        
        if (storePlayer) {
          // Verify the player belongs to current account
          if (storePlayer.address === account?.address) {
            console.log('✅ Player data found and verified for current account');
            return true;
          } else {
            console.log('⚠️ Player found but address mismatch:', {
              storeAddress: storePlayer.address,
              accountAddress: account?.address
            });
          }
        }
        
        // Wait before next attempt (except for last attempt)
        if (attempt < maxAttempts) {
          console.log(`⏳ Waiting ${delayMs}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
        
      } catch (error) {
        console.error(`❌ Error in polling attempt ${attempt}:`, error);
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }
    
    console.log('❌ Player data polling exhausted all attempts');
    return false;
  }, [refetchPlayer, account?.address]);

  /**
   * Main initialization function
   * Checks if player exists, if not spawns a new one
   */
  const initializePlayer = useCallback(async (): Promise<InitializationResult> => {
    console.log('🚀 Starting player initialization process...');
    
    // Prevent multiple executions
    if (isInitializing) {
      console.log('⚠️ Already initializing - skipping');
      return { success: false, playerExists: false, error: "Already initializing" };
    }

    setIsInitializing(true);

    // Validation: Check if wallet is connected
    if (status !== "connected") {
      const error = "Wallet not connected. Please connect your wallet first.";
      console.log('❌ Wallet not connected');
      setInitState(prev => ({ ...prev, error }));
      setIsInitializing(false);
      return { success: false, playerExists: false, error };
    }

    // Validation: Check if account exists
    if (!account) {
      const error = "No account found. Please connect your wallet.";
      console.log('❌ No account found');
      setInitState(prev => ({ ...prev, error }));
      setIsInitializing(false);
      return { success: false, playerExists: false, error };
    }

    console.log('📋 Account details:', {
      address: account.address,
      status
    });

    const transactionId = uuidv4();
    console.log('🆔 Transaction ID generated:', transactionId);
    
    try {
      // Start initialization
      setInitState(prev => ({ 
        ...prev, 
        isInitializing: true, 
        error: null,
        step: 'checking'
      }));

      console.log('🔍 Step 1: Checking if player already exists...');

      // Step 1: Refetch player data to check if player exists
      await refetchPlayer();
      
      // Wait a bit to ensure data is loaded
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if player exists in the store
      const storePlayer = useAppStore.getState().player;
      const playerExists = storePlayer !== null;

      console.log('📊 Player existence check:', {
        playerExists,
        storePlayerAddress: storePlayer?.address,
        accountAddress: account.address,
        addressMatch: storePlayer?.address === account.address
      });

      if (playerExists && storePlayer?.address === account.address) {
        // Player exists - load data and continue
        console.log('✅ Player already exists for this account');
        
        setInitState(prev => ({ 
          ...prev, 
          step: 'loading'
        }));
        
        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setInitState(prev => ({ 
          ...prev, 
          completed: true,
          isInitializing: false,
          step: 'success'
        }));

        setIsInitializing(false);
        return { success: true, playerExists: true };
      } else {
        // Player doesn't exist - spawn new player
        console.log('🥚 Player does not exist - starting spawn process...');
        
        setInitState(prev => ({ 
          ...prev, 
          step: 'spawning',
          txStatus: 'PENDING'
        }));

        console.log('📤 Executing spawn player transaction...');
        
        // TODO: This hook is deprecated - use useSpawnPlayerCavos instead
        // Execute spawn player transaction using Dojo SDK  
        const spawnTx = await client.player.spawnPlayer(account as any); // Temporary fix - hook is deprecated
        
        console.log('📥 Spawn transaction response:', {
          transaction_hash: spawnTx?.transaction_hash,
          code: spawnTx?.code,
          fullResponse: spawnTx
        });
        
        if (spawnTx?.transaction_hash) {
          setInitState(prev => ({ 
            ...prev, 
            txHash: spawnTx.transaction_hash
          }));
        }
        
        if (spawnTx && spawnTx.code === "SUCCESS") {
          console.log('✅ Spawn transaction successful - hash:', spawnTx.transaction_hash);
          
          setInitState(prev => ({ 
            ...prev, 
            txStatus: 'SUCCESS'
          }));
          
          console.log('⏳ Waiting for transaction to be processed...');
          
          // Wait for transaction to be processed initially
          await new Promise(resolve => setTimeout(resolve, 3500));
          
          console.log('🔄 Starting enhanced player data synchronization...');
          
          // Enhanced: Use polling mechanism to wait for player data
          const playerDataFound = await waitForPlayerData(8, 2500); // 8 attempts, 2.5s each = 20s max
          
          if (playerDataFound) {
            console.log('✅ Player data successfully found after spawn!');
            
            setInitState(prev => ({ 
              ...prev, 
              completed: true,
              isInitializing: false,
              step: 'success'
            }));

            // Confirm transaction in store
            state.confirmTransaction(transactionId);

            setIsInitializing(false);
            return { 
              success: true, 
              playerExists: false,
              transactionHash: spawnTx.transaction_hash 
            };
          } else {
            // Player data still not found after polling
            console.log('⚠️ Player spawn transaction succeeded but data sync incomplete');
            console.log('🔍 Final store state check:');
            const finalStorePlayer = useAppStore.getState().player;
            console.log('📊 Final store player:', {
              exists: !!finalStorePlayer,
              address: finalStorePlayer?.address,
              expectedAddress: account.address
            });
            
            // This is not necessarily an error - the transaction succeeded
            // The data might appear after a page refresh
            const warningMessage = "Player spawn succeeded but data sync incomplete. Please refresh the page.";
            console.log('⚠️', warningMessage);
            
            setInitState(prev => ({ 
              ...prev, 
              completed: true, // Still mark as completed since transaction succeeded
              isInitializing: false,
              step: 'success',
              error: null // Don't treat this as an error
            }));

            state.confirmTransaction(transactionId);
            setIsInitializing(false);
            
            return { 
              success: true, // Transaction was successful
              playerExists: false,
              transactionHash: spawnTx.transaction_hash,
              error: warningMessage // But note the sync issue
            };
          }
        } else {
          // Update transaction status to rejected
          console.log('❌ Spawn transaction failed - code:', spawnTx?.code);
          
          setInitState(prev => ({ 
            ...prev, 
            txStatus: 'REJECTED'
          }));
          throw new Error("Spawn transaction failed with code: " + spawnTx?.code);
        }
      }
    } catch (error) {
      console.error("❌ Player initialization failed:", error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.log('📊 Error details:', {
        errorMessage,
        errorType: typeof error,
        isAlreadyInitializing: errorMessage === "Already initializing"
      });
      
      // Revert optimistic update if applicable
      state.revertOptimisticUpdate(transactionId);
      
      // Update transaction status to rejected if there was a transaction
      if (initState.txHash) {
        setInitState(prev => ({ 
          ...prev, 
          txStatus: 'REJECTED'
        }));
      }
      
      if (errorMessage !== "Already initializing") {
        setInitState(prev => ({ 
          ...prev, 
          error: errorMessage,
          isInitializing: false,
          step: 'checking'
        }));
      } else {
        setInitState(prev => ({ 
          ...prev, 
          isInitializing: false,
          step: 'checking'
        }));
      }

      setIsInitializing(false);
      return { success: false, playerExists: false, error: errorMessage };
    }
  }, [status, account, refetchPlayer, isInitializing, client.player, state, waitForPlayerData]);

  /**
   * Reset initialization state
   */
  const resetInitializer = useCallback(() => {
    console.log('🔄 Resetting player initializer state');
    setIsInitializing(false);
    setInitState({
      isInitializing: false,
      error: null,
      completed: false,
      step: 'checking',
      txHash: null,
      txStatus: null
    });
  }, []);

  return {
    // State
    isInitializing: initState.isInitializing,
    error: initState.error,
    completed: initState.completed,
    currentStep: initState.step,
    txHash: initState.txHash,
    txStatus: initState.txStatus,
    isConnected: status === "connected",
    playerExists: useAppStore.getState().player !== null,
    
    // Actions
    initializePlayer,
    resetInitializer,
  };
};