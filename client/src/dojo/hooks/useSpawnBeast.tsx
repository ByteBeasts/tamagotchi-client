import { useState, useCallback } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { useCavosTransaction } from './useCavosTransaction';

// Hooks imports
import { useLiveBeast } from './useLiveBeast';
import { usePlayer } from './usePlayer';
import { usePostSpawnSync } from './usePostSpawnSync'; 

// Helpers imports
import { 
  generateRandomBeastParams, 
  validateBeastParams,
  type BeastSpawnParams 
} from '../../utils/beastHelpers';

// Store import
import useAppStore from '../../zustand/store';

// Types
interface SpawnState {
  isSpawning: boolean;
  error: string | null;
  completed: boolean;
  step: 'preparing' | 'spawning' | 'confirming' | 'syncing' | 'success';
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
  spawnedBeastParams: BeastSpawnParams | null;
  syncSuccess: boolean; 
}

interface SpawnResult {
  success: boolean;
  transactionHash?: string;
  beastParams?: BeastSpawnParams;
  syncSuccess?: boolean; 
  finalBeastId?: number | null; 
  error?: string;
}

interface UseSpawnBeastReturn {
  // State
  isSpawning: boolean;
  error: string | null;
  completed: boolean;
  currentStep: string;
  txHash: string | null;
  txStatus: 'PENDING' | 'SUCCESS' | 'REJECTED' | null;
  spawnedBeastParams: BeastSpawnParams | null;
  syncSuccess: boolean; 
  
  // Actions
  spawnBeast: (params?: BeastSpawnParams) => Promise<SpawnResult>; 
  resetSpawner: () => void;
}

/**
 * Hook for spawning beasts with automatic post-spawn sync
 * includes definitive sync solution for contract-Torii alignment
 */
export const useSpawnBeast = (): UseSpawnBeastReturn => {
  const { useDojoStore } = useDojoSDK();
  const state = useDojoStore((state) => state);
  const { executeTransaction } = useCavosTransaction();
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  
  // Use optimized hooks for data management
  const { refetch: refetchLiveBeast } = useLiveBeast();
  const { refetch: refetchPlayer } = usePlayer();
  
  // Post-spawn sync hook
  const { syncAfterSpawn } = usePostSpawnSync();

  // Enhanced local state for spawn process
  const [spawnState, setSpawnState] = useState<SpawnState>({
    isSpawning: false,
    error: null,
    completed: false,
    step: 'preparing',
    txHash: null,
    txStatus: null,
    spawnedBeastParams: null,
    syncSuccess: false, 
  });

  // Get player from store
  const storePlayer = useAppStore(state => state.player);

  /**
   * Internal spawn beast function with comprehensive sync
   */
  const executeSpawnBeast = useCallback(async (params: BeastSpawnParams): Promise<SpawnResult> => {
    // Debug: Log current Cavos auth state
    console.log('🔍 Spawn Beast Validation - Cavos Auth State:', {
      isAuthenticated: cavosAuth.isAuthenticated,
      hasWallet: !!cavosAuth.wallet,
      hasAccessToken: !!cavosAuth.accessToken,
      walletAddress: cavosAuth.wallet?.address
    });

    // Validation: Check if Cavos is authenticated (PRIMARY check)
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      const error = "Please login with ByteBeasts to spawn your beast.";
      console.log('❌ Spawn Beast validation failed:', error);
      setSpawnState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    // Validation: Check if player exists (with fallback refetch)
    if (!storePlayer) {
      console.log('⚠️ Player not found in store, attempting refetch...');
      try {
        await refetchPlayer();
        await new Promise(resolve => setTimeout(resolve, 1000));
        const refreshedPlayer = useAppStore.getState().player;
        
        if (!refreshedPlayer) {
          const error = "Player not found. Please complete player creation first.";
          console.log('❌ Player still not found after refetch');
          setSpawnState(prev => ({ ...prev, error }));
          return { success: false, error };
        }
        console.log('✅ Player found after refetch:', refreshedPlayer.address);
      } catch (refetchError) {
        console.error('❌ Failed to refetch player:', refetchError);
        const error = "Could not verify player. Please try again.";
        setSpawnState(prev => ({ ...prev, error }));
        return { success: false, error };
      }
    }

    // Validation: Check beast parameters
    if (!validateBeastParams(params)) {
      const error = "Invalid beast parameters. Specie and beast_type must be 1-3.";
      setSpawnState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    try {
      setSpawnState(prev => ({
        ...prev,
        isSpawning: true,
        error: null,
        step: 'preparing',
        spawnedBeastParams: params,
        syncSuccess: false
      }));

      // Step 1: Prepare and execute transaction
      setSpawnState(prev => ({ ...prev, step: 'spawning' }));

      console.log('🥚 Executing spawn_beast transaction...', params);
      
      // Use hardcoded game contract address (more reliable than client.contractAddresses)
      const gameContractAddress = '0x217331080ea988e121cbe284bfe9b2504d9e78c363234abd57c260f7b3621a8';
      
      // Construct Cavos transaction call
      // Use "0" as default name (represents null/empty in felt252)
      const defaultName = "0";
      
      const calls = [{
        contractAddress: gameContractAddress,
        entrypoint: 'spawn_beast',
        calldata: [
          params.specie.toString(),
          params.beast_type.toString(),
          defaultName // "0" as felt252
        ]
      }];
      
      // Execute transaction using Cavos
      const transactionHash = await executeTransaction(calls);
      
      // Validate transaction hash
      if (!transactionHash) {
        throw new Error('Transaction execution failed - no transaction hash returned');
      }
      
      // Create a compatible response object
      const tx = {
        transaction_hash: transactionHash,
        code: "SUCCESS"
      };
      
      setSpawnState(prev => ({
        ...prev,
        txHash: tx.transaction_hash,
        txStatus: 'PENDING',
        step: 'confirming'
      }));

      // Step 2: Wait for transaction confirmation
      if (tx && tx.code === "SUCCESS") {
        console.log('✅ Spawn transaction successful:', tx.transaction_hash);
        
        setSpawnState(prev => ({
          ...prev,
          txStatus: 'SUCCESS',
          step: 'syncing' // 🆕 NEW: Dedicated sync step
        }));

        // 🆕 NEW: Step 3 - Execute comprehensive post-spawn sync
        console.log('🔄 Starting post-spawn synchronization...');
        
        const syncResult = await syncAfterSpawn(tx.transaction_hash, params);
        
        if (syncResult.success) {
          const isFullyComplete = syncResult.syncType === 'complete';
          const logMessage = isFullyComplete 
            ? '✅ Post-spawn sync completed successfully (fully synced)'
            : '✅ Post-spawn transaction successful (partial sync - Torii catching up)';
          
          console.log(logMessage);
          
          setSpawnState(prev => ({
            ...prev,
            completed: true,
            step: 'success',
            isSpawning: false,
            syncSuccess: isFullyComplete
          }));

          return {
            success: true,
            transactionHash: tx.transaction_hash,
            beastParams: params,
            syncSuccess: isFullyComplete,
            finalBeastId: syncResult.finalBeastId
          };
        } else {
          // Sync failed but transaction succeeded
          console.log('⚠️ Transaction succeeded but sync failed:', syncResult.error);
          
          // Fallback: Try basic refetch
          console.log('🔄 Attempting fallback refetch...');
          try {
            await Promise.all([
              refetchPlayer(),
              refetchLiveBeast()
            ]);
            
            // Check if fallback worked
            const hasLiveBeast = useAppStore.getState().hasLiveBeast();
            
            setSpawnState(prev => ({
              ...prev,
              completed: hasLiveBeast,
              step: hasLiveBeast ? 'success' : 'syncing',
              isSpawning: false,
              syncSuccess: hasLiveBeast,
              error: hasLiveBeast ? null : 'Sync incomplete - beast may appear after refresh'
            }));
            
            return {
              success: true, // Transaction succeeded
              transactionHash: tx.transaction_hash,
              beastParams: params,
              syncSuccess: hasLiveBeast,
              finalBeastId: useAppStore.getState().getCurrentBeastId(),
              error: hasLiveBeast ? undefined : 'Sync incomplete'
            };
            
          } catch (fallbackError) {
            console.error('❌ Fallback refetch also failed:', fallbackError);
            
            setSpawnState(prev => ({
              ...prev,
              completed: false,
              isSpawning: false,
              syncSuccess: false,
              error: 'Transaction succeeded but data sync failed'
            }));
            
            return {
              success: true, // Transaction still succeeded
              transactionHash: tx.transaction_hash,
              beastParams: params,
              syncSuccess: false,
              error: 'Transaction succeeded but data sync failed'
            };
          }
        }
      } else {
        // Transaction failed
        setSpawnState(prev => ({
          ...prev,
          txStatus: 'REJECTED',
          isSpawning: false,
          error: 'Transaction failed'
        }));
        
        throw new Error("Spawn transaction failed with code: " + tx?.code);
      }

    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || "Unknown error occurred";
      
      console.error('❌ Spawn beast failed:', errorMessage);
      
      setSpawnState(prev => ({
        ...prev,
        error: errorMessage,
        txStatus: 'REJECTED',
        isSpawning: false,
        syncSuccess: false
      }));

      return {
        success: false,
        error: errorMessage,
        syncSuccess: false
      };
    }
  }, [storePlayer, state, refetchLiveBeast, refetchPlayer, syncAfterSpawn, cavosAuth.isAuthenticated, cavosAuth.wallet, cavosAuth.accessToken, executeTransaction]);

  /**
   * Spawn beast with optional parameters
   */
  const spawnBeast = useCallback(async (params?: BeastSpawnParams): Promise<SpawnResult> => {
    const beastParams = params || generateRandomBeastParams();
    return executeSpawnBeast(beastParams);
  }, [executeSpawnBeast]);

  /**
   * Reset the spawner state
   */
  const resetSpawner = useCallback(() => {
    setSpawnState({
      isSpawning: false,
      error: null,
      completed: false,
      step: 'preparing',
      txHash: null,
      txStatus: null,
      spawnedBeastParams: null,
      syncSuccess: false,
    });
  }, []);

  return {
    // State
    isSpawning: spawnState.isSpawning,
    error: spawnState.error,
    completed: spawnState.completed,
    currentStep: spawnState.step,
    txHash: spawnState.txHash,
    txStatus: spawnState.txStatus,
    spawnedBeastParams: spawnState.spawnedBeastParams,
    syncSuccess: spawnState.syncSuccess, 
    
    // Actions
    spawnBeast,
    resetSpawner,
  };
};