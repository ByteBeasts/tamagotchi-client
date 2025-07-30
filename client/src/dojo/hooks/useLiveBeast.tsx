import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useCavosAccount } from "./useCavosAccount";
import { addAddressPadding } from "starknet";
import { dojoConfig } from "../dojoConfig";
import { Beast, BeastStatus } from '../models.gen';
import useAppStore from '../../zustand/store';

// Hook return interface
interface UseLiveBeastReturn {
  liveBeast: Beast | null;
  liveBeastStatus: BeastStatus | null;
  hasLiveBeast: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  forceRefetch: () => Promise<void>;
  beastId: number | null;
}

// Torii GraphQL URL
const TORII_URL = dojoConfig.toriiUrl + "/graphql";

const LIVE_BEAST_COMPLETE_QUERY = `
  query GetPlayerLiveBeastComplete($playerAddress: ContractAddress!) {
    liveBeastStatus: tamagotchiBeastStatusModels(
      where: { 
        player: $playerAddress, 
        is_alive: true 
      }
    ) {
      edges {
        node {
          player
          beast_id
          is_alive
          is_awake
          hunger
          energy
          happiness
          hygiene
          clean_status
          last_timestamp
        }
      }
    }
    
    allBeasts: tamagotchiBeastModels(
      where: { 
        player: $playerAddress
      }
    ) {
      edges {
        node {
          player
          beast_id
          age
          birth_date
          specie
          beast_type
        }
      }
    }
  }
`;

// Helper functions
const hexToNumber = (hexValue: string | number): number => {
  if (typeof hexValue === 'number') return hexValue;
  if (typeof hexValue === 'string' && hexValue.startsWith('0x')) {
    return parseInt(hexValue, 16);
  }
  if (typeof hexValue === 'string') {
    return parseInt(hexValue, 10);
  }
  return 0;
};

const hexToBool = (hexValue: string | boolean): boolean => {
  if (typeof hexValue === 'boolean') return hexValue;
  if (typeof hexValue === 'string') {
    if (hexValue === '0x1' || hexValue === '1') return true;
    if (hexValue === '0x0' || hexValue === '0') return false;
    return hexValue.toLowerCase() === 'true';
  }
  return false;
};

// API function to fetch live beast data with manual filtering
const fetchLiveBeastData = async (playerAddress: string): Promise<{
  beast: Beast | null;
  status: BeastStatus | null;
}> => {
  try {
    const response = await fetch(TORII_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: LIVE_BEAST_COMPLETE_QUERY,
        variables: { playerAddress }
      }),
    });

    const result = await response.json();
    const liveBeastStatusEdges = result.data?.liveBeastStatus?.edges;
    const allBeastsEdges = result.data?.allBeasts?.edges || [];
    
    if (!liveBeastStatusEdges?.length) {
      return { beast: null, status: null };
    }

    // Find the most recent alive beast status
    const aliveBeastStatuses = liveBeastStatusEdges.map((edge: any) => ({
      ...edge.node,
      beast_id: hexToNumber(edge.node.beast_id)
    }));
    
    // Order by beast_id to get the latest alive beast
    const latestAliveBeast = aliveBeastStatuses.sort((a: { beast_id: number; }, b: { beast_id: number; }) => b.beast_id - a.beast_id)[0];
    
    const beastStatus: BeastStatus = {
      player: latestAliveBeast.player,
      beast_id: latestAliveBeast.beast_id,
      is_alive: hexToBool(latestAliveBeast.is_alive),
      is_awake: hexToBool(latestAliveBeast.is_awake),
      hunger: hexToNumber(latestAliveBeast.hunger),
      energy: hexToNumber(latestAliveBeast.energy),
      happiness: hexToNumber(latestAliveBeast.happiness),
      hygiene: hexToNumber(latestAliveBeast.hygiene),
      clean_status: hexToNumber(latestAliveBeast.clean_status),
      last_timestamp: hexToNumber(latestAliveBeast.last_timestamp)
    };

    // Search for the matching beast in allBeastsEdges
    const matchingBeastEdge = allBeastsEdges.find((edge: any) => 
      hexToNumber(edge.node.beast_id) === latestAliveBeast.beast_id
    );

    if (!matchingBeastEdge) {
      // Fallback: use the first beast if no match found
      if (allBeastsEdges.length > 0) {
        const rawBeast = allBeastsEdges[0].node;
        const beast: Beast = {
          player: rawBeast.player,
          beast_id: latestAliveBeast.beast_id,
          age: hexToNumber(rawBeast.age),
          birth_date: hexToNumber(rawBeast.birth_date),
          specie: hexToNumber(rawBeast.specie),
          beast_type: hexToNumber(rawBeast.beast_type),
          name: rawBeast.name || "Beast" // Default name if not set
        };
        
        return { beast, status: beastStatus };
      }
      
      return { beast: null, status: beastStatus };
    }

    // Extract beast data normally
    const rawBeast = matchingBeastEdge.node;
    const beast: Beast = {
      player: rawBeast.player,
      beast_id: hexToNumber(rawBeast.beast_id),
      age: hexToNumber(rawBeast.age),
      birth_date: hexToNumber(rawBeast.birth_date),
      specie: hexToNumber(rawBeast.specie),
      beast_type: hexToNumber(rawBeast.beast_type),
      name: rawBeast.name || "Beast" // Default name if not set
    };
    
    return { beast, status: beastStatus };
    
  } catch (error) {
    throw error;
  }
};

/**
 * Hook that handles live beast data with a contract-first approach
 */
export const useLiveBeast = (): UseLiveBeastReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { account } = useCavosAccount();
  
  // Single ref to prevent multiple refetches
  const isRefetchingRef = useRef(false);
  
  // Get live beast data from store
  const liveBeastData = useAppStore(state => state.liveBeast);
  const setLiveBeast = useAppStore(state => state.setLiveBeast);
  const clearLiveBeast = useAppStore(state => state.clearLiveBeast);

  // Stable userAddress
  const userAddress = useMemo(() => 
    account ? addAddressPadding(account.address).toLowerCase() : '', 
    [account?.address]
  );

  // Extract data from store
  const liveBeast = liveBeastData.beast;
  const liveBeastStatus = liveBeastData.status;
  const hasLiveBeast = liveBeastData.isAlive;
  const beastId = liveBeast?.beast_id || null;

  // SIMPLE FIX: Contract-first refetch function with clean wait strategy
  const refetch = useCallback(async () => {
    if (!userAddress) {
      setIsLoading(false);
      clearLiveBeast();
      return;
    }

    if (isRefetchingRef.current) return;

    try {
      isRefetchingRef.current = true;
      setIsLoading(true);
      setError(null);
      
      const { beast, status } = await fetchLiveBeastData(userAddress);
      
      if (beast && status && status.is_alive) {
        // CONTRACT-FIRST: Check if contract has recent data
        const currentState = useAppStore.getState();
        const contractBeastId = currentState.realTimeStatus.length >= 10 ? 
          currentState.realTimeStatus[1] : null;
        
        if (contractBeastId && beast.beast_id !== contractBeastId) {
          console.log('🔄 Contract has newer beast than Torii:', {
            torii_beast_id: beast.beast_id,
            contract_beast_id: contractBeastId,
            problem: 'Torii is returning old beast data'
          });
          
          // SIMPLE FIX: Don't use outdated Torii data
          console.log('⏳ Waiting for Torii to sync with contract...');
          clearLiveBeast(); // Clear incorrect data
          
          // Retry after delay to give Torii time to sync
          setTimeout(() => {
            if (isRefetchingRef.current) {
              isRefetchingRef.current = false;
              console.log('🔄 Retrying beast fetch after Torii sync delay...');
              refetch();
            }
          }, 3000);
          
          return; // Don't set incorrect data
        } else {
          // Use Torii data normally when synchronized
          console.log('✅ Torii and contract are synchronized, using Torii data');
          setLiveBeast(beast, status);
        }
      } else {
        clearLiveBeast();
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(new Error(errorMessage));
      clearLiveBeast();
    } finally {
      setIsLoading(false);
      isRefetchingRef.current = false;
    }
  }, [userAddress, setLiveBeast, clearLiveBeast]);

  // Force refetch
  const forceRefetch = useCallback(async () => {
    if (!userAddress) return;
    isRefetchingRef.current = false;
    await refetch();
  }, [userAddress, refetch]);

  // Effect para refetch cuando cambia la dirección
  useEffect(() => {
    if (userAddress) {
      refetch();
    } else {
      clearLiveBeast();
      setError(null);
      setIsLoading(false);
    }
  }, [userAddress]);

  // Effect para limpieza cuando no hay account
  useEffect(() => {
    if (!account) {
      clearLiveBeast();
      setError(null);
      setIsLoading(false);
      isRefetchingRef.current = false;
    }
  }, [account, clearLiveBeast]);

  return {
    liveBeast,
    liveBeastStatus,
    hasLiveBeast,
    isLoading,
    error,
    refetch,
    forceRefetch,
    beastId
  };
};