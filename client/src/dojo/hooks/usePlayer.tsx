import { useState, useEffect, useMemo } from 'react';
import { useCavosAccount } from './useCavosAccount';
import { addAddressPadding } from 'starknet';

// Store import
import useAppStore from '../../zustand/store';

// Types import
import { Player } from '../models.gen';

// Dojo config import
import { dojoConfig } from '../dojoConfig';

// Types
interface UsePlayerReturn {
  player: Player | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Constants
const TORII_URL = dojoConfig.toriiUrl + "/graphql";
const PLAYER_QUERY = `
  query GetPlayer($playerAddress: ContractAddress!) {
    tamagotchiPlayerModels(where: { address: $playerAddress }) {
      edges {
        node {
          address
          current_beast_id
          daily_streak
          total_points
          total_coins
          total_gems
          last_active_day
          creation_day
        }
      }
      totalCount
    }
  }
`;

// Helper to convert hex strings to numbers
const hexToNumber = (hexValue: string | number): number => {
  // If it's already a number, return it
  if (typeof hexValue === 'number') return hexValue;
  
  // If it's a hex string, convert it
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    return parseInt(hexValue, 16);
  }
  
  // If it's a string but not hex, try to parse it as number
  if (typeof hexValue === 'string') {
    return parseInt(hexValue, 10);
  }
  
  // Fallback
  return 0;
};

// API Functions
const fetchPlayerData = async (playerAddress: string): Promise<Player | null> => {
  try {
    
    const response = await fetch(TORII_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: PLAYER_QUERY,
        variables: { playerAddress }
      }),
    });

    const result = await response.json();
    
    if (!result.data?.tamagotchiPlayerModels?.edges?.length) {
      return null; // Player not found
    }

    // Extract player data
    const rawPlayerData = result.data.tamagotchiPlayerModels.edges[0].node;
    
    // Convert hex values to numbers
    const playerData: Player = {
      address: rawPlayerData.address,
      current_beast_id: hexToNumber(rawPlayerData.current_beast_id),
      daily_streak: hexToNumber(rawPlayerData.daily_streak),
      total_points: hexToNumber(rawPlayerData.total_points),
      total_coins: hexToNumber(rawPlayerData.total_coins) || 0, // Default to 0 if not available
      total_gems: hexToNumber(rawPlayerData.total_gems) || 0, // Default to 0 if not available
      last_active_day: hexToNumber(rawPlayerData.last_active_day),
      creation_day: hexToNumber(rawPlayerData.creation_day)
    };
    
    return playerData;
  } catch (error) {
    console.error("Error fetching player:", error);
    throw error;
  }
};

/**
 * Hook for managing player data from Dojo/Torii
 * Handles fetching, caching, and updating player information
 */
export const usePlayer = (): UsePlayerReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useCavosAccount();
  
  // Get and set player from/to store
  const storePlayer = useAppStore(state => state.player);
  const setPlayer = useAppStore(state => state.setPlayer);

  // Memoize the formatted user address
  const userAddress = useMemo(() => 
    account ? addAddressPadding(account.address).toLowerCase() : '', 
    [account]
  );

  // Function to fetch and update player data
  const refetch = async () => {
    if (!userAddress) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const playerData = await fetchPlayerData(userAddress);
      
      // Update store with player data
      setPlayer(playerData);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      console.error("Error in refetch:", error);
      setError(error);
      setPlayer(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Effect to fetch player data when address changes
  useEffect(() => {
    if (userAddress) {
      refetch();
    }
  }, [userAddress]);

  // Effect to sync with account changes
  useEffect(() => {
    if (!account) {
      setPlayer(null);
      setError(null);
      setIsLoading(false);
    }
  }, [account, setPlayer]);

  return {
    player: storePlayer,
    isLoading,
    error,
    refetch
  };
};