import { useCallback, useState } from 'react';
import { useCavosTransaction } from './useCavosTransaction';

// Store imports
import useAppStore from '../../zustand/store';
import { getContractAddresses } from '../../config/cavosConfig';

// Hook return interface
interface UseSetPlayerNameReturn {
  // State
  isSettingName: boolean;
  error: string | null;
  optimisticName: string | null;
  
  // Actions
  setPlayerName: (name: string) => Promise<SetNameResult>;
  
  // Computed
  canSetName: boolean;
}

// Set name action result interface
interface SetNameResult {
  success: boolean;
  name?: string;
  transactionHash?: string;
  error?: string;
}

/**
 * Hook for managing set player name transactions
 * Handles contract interactions, optimistic updates, and error recovery
 */
export const useSetPlayerName = (): UseSetPlayerNameReturn => {
  const { executeTransaction } = useCavosTransaction();
  const [isSettingName, setIsSettingName] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticName, setOptimisticName] = useState<string | null>(null);
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  
  // Store state and actions
  const player = useAppStore(state => state.player);
  const setPlayer = useAppStore(state => state.setPlayer);

  // Execute set player name transaction
  const setPlayerName = useCallback(async (name: string): Promise<SetNameResult> => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      const errorMsg = 'Please connect to play';
      return { success: false, error: errorMsg };
    }

    // Validation: Check if player exists
    if (!player) {
      const errorMsg = 'No player data found';
      return { success: false, error: errorMsg };
    }

    // Validation: Check if already setting name
    if (isSettingName) {
      const errorMsg = 'Transaction in progress';
      return { success: false, error: errorMsg };
    }

    // Validation: Check player has enough gems (5 gems required)
    const playerGems = player.total_gems || 0;
    if (playerGems < 5) {
      const errorMsg = `Not enough gems (5 required)`;
      return { success: false, error: errorMsg };
    }

    try {
      // Start transaction - set loading state
      setIsSettingName(true);
      setError(null);

      // Optimistic updates:
      // 1. Set the optimistic name to show immediately
      setOptimisticName(name);
      
      // 2. Update player gems (subtract 5)
      const updatedPlayer = { ...player, total_gems: player.total_gems - 5 };
      setPlayer(updatedPlayer);

      // Execute transaction using Cavos with dynamic contract address
      const contractAddresses = getContractAddresses();
      
      // Send the name as a string directly - contract will handle conversion
      const calls = [{
        contractAddress: contractAddresses.player,
        entrypoint: 'set_player_name',
        calldata: [name] // Send string directly
      }];
      
      const transactionHash = await executeTransaction(calls);
      
      // Create a compatible response object
      const tx = {
        transaction_hash: transactionHash,
        code: "SUCCESS"
      };
      
      // Check transaction result
      if (tx && tx.code === "SUCCESS") {
        // Update transaction state with success
        setIsSettingName(false);
        setError(null);

        // Success - clear optimistic name so real name from contract shows
        setOptimisticName(null);

        return {
          success: true,
          name,
          transactionHash: tx.transaction_hash,
        };
        
      } else {
        throw new Error("Set name transaction failed with code: " + tx?.code);
      }

    } catch (error: any) {
      console.error('Set player name transaction failed:', error);

      // Rollback optimistic updates
      setOptimisticName(null);
      // Rollback player gems
      if (player) {
        const originalGems = player.total_gems + 5; // Add back the 5 gems
        setPlayer({ ...player, total_gems: originalGems });
      }

      // Update transaction state with error
      const errorMessage = error?.message || error?.toString() || 'Transaction failed';
      setIsSettingName(false);
      setError(errorMessage);

      // Return error for modal to handle
      return {
        success: false,
        name,
        error: errorMessage,
      };
    }
  }, [
    cavosAuth.isAuthenticated,
    cavosAuth.wallet,
    cavosAuth.accessToken,
    player,
    isSettingName,
    setPlayer,
    executeTransaction,
    setOptimisticName
  ]);

  // Computed values
  const canSetName = Boolean(
    cavosAuth.isAuthenticated &&
    cavosAuth.wallet &&
    cavosAuth.accessToken &&
    player &&
    !isSettingName &&
    (player.total_gems || 0) >= 5
  );

  return {
    // State
    isSettingName,
    error,
    optimisticName,
    
    // Actions
    setPlayerName,
    
    // Computed
    canSetName,
  };
};