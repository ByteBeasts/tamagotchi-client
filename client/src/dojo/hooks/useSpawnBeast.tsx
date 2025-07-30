import { useState, useCallback } from 'react';
import { useCavosAccount } from './useCavosAccount';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { useCavosTransaction } from './useCavosTransaction';

// Hooks imports
import { useLiveBeast } from './useLiveBeast';
import { usePlayer } from './usePlayer';
import { useStarknetConnect } from './useStarknetConnect';
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
  const { useDojoStore, client } = useDojoSDK();
  const state = useDojoStore((state) => state);
  const { account } = useCavosAccount();
  const { status } = useStarknetConnect();
  const { executeTransaction } = useCavosTransaction();
  
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
    // Validation: Check if wallet is connected
    if (status !== "connected") {
      const error = "Wallet not connected. Please connect your wallet first.";
      setSpawnState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    // Validation: Check if account exists
    if (!account) {
      const error = "No account found. Please connect your wallet.";
      setSpawnState(prev => ({ ...prev, error }));
      return { success: false, error };
    }

    // Validation: Check if player exists
    if (!storePlayer) {
      const error = "Player not found. Please spawn player first.";
      setSpawnState(prev => ({ ...prev, error }));
      return { success: false, error };
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
      
      // Construct Cavos transaction call
      const calls = [{
        contractAddress: client.client.contractAddresses.game,
        entrypoint: 'spawn_beast',
        calldata: [
          params.specie.toString(),
          params.beast_type.toString(),
          params.name.toString()
        ]
      }];
      
      // Execute transaction using Cavos
      const transactionHash = await executeTransaction(calls);
      
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
  }, [account, status, storePlayer, client, state, refetchLiveBeast, refetchPlayer, syncAfterSpawn]);

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