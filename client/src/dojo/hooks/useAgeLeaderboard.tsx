import { useState, useEffect, useCallback } from 'react';
import { addAddressPadding, shortString } from 'starknet';

// Dojo config import
import { dojoConfig } from '../dojoConfig';

// Types
export interface LeaderboardBeast {
  rank: number;
  playerAddress: string;
  playerName: string;
  beastId: number;
  beastName: string;
  age: number;
  isAlive: boolean;
  isCurrentUserBeast: boolean;
}

export interface UseAgeLeaderboardReturn {
  topBeasts: LeaderboardBeast[];
  currentUserBestBeast: LeaderboardBeast | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Constants
const TORII_URL = dojoConfig.toriiUrl + "/graphql";

// Query 1: Top 10 beasts by age
const TOP_BEASTS_BY_AGE_QUERY = `
  query GetTopBeastsByAge {
    tamagotchiBeastModels(
      order: { field: AGE, direction: DESC }
      limit: 10
    ) {
      edges {
        node {
          player
          beast_id
          age
          birth_date
          specie
          beast_type
          name
        }
      }
    }
  }
`;

// Query 2: Get beast status (for is_alive)
const BEAST_STATUS_QUERY = `
  query GetBeastStatus($player: ContractAddress!, $beastId: Int!) {
    tamagotchiBeastStatusModels(
      where: { 
        player: $player,
        beast_id: $beastId 
      }
    ) {
      edges {
        node {
          is_alive
        }
      }
    }
  }
`;

// Query 3: Get player name
const PLAYER_NAME_QUERY = `
  query GetPlayerName($address: ContractAddress!) {
    tamagotchiPlayerModels(where: { address: $address }) {
      edges {
        node {
          address
          name
        }
      }
    }
  }
`;

// Query 4: Count beasts with higher age for ranking
const COUNT_OLDER_BEASTS_QUERY = `
  query CountOlderBeasts($userAge: Int!) {
    tamagotchiBeastModels(
      where: { 
        ageGT: $userAge 
      }
    ) {
      totalCount
    }
  }
`;

// Query 5: Get user's oldest beast
const USER_OLDEST_BEAST_QUERY = `
  query GetUserOldestBeast($playerAddress: ContractAddress!) {
    tamagotchiBeastModels(
      where: { player: $playerAddress }
      order: { field: AGE, direction: DESC }
      limit: 1
    ) {
      edges {
        node {
          player
          beast_id
          age
          birth_date
          specie
          beast_type
          name
        }
      }
    }
  }
`;

// Helper to convert hex strings to numbers
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

// Main hook
export function useAgeLeaderboard(currentUserAddress?: string): UseAgeLeaderboardReturn {
  const [topBeasts, setTopBeasts] = useState<LeaderboardBeast[]>([]);
  const [currentUserBestBeast, setCurrentUserBestBeast] = useState<LeaderboardBeast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch top 10 beasts by age
  const fetchTopBeasts = async () => {
    try {
      console.log('🏆 Fetching top 10 oldest beasts');
      
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: TOP_BEASTS_BY_AGE_QUERY
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const edges = result.data?.tamagotchiBeastModels?.edges || [];
      
      // Convert and sort by age DESC, then birth_date ASC
      const beasts = edges.map((edge: any) => ({
        player: edge.node.player,
        beast_id: hexToNumber(edge.node.beast_id),
        age: hexToNumber(edge.node.age),
        birth_date: hexToNumber(edge.node.birth_date),
        specie: hexToNumber(edge.node.specie),
        beast_type: hexToNumber(edge.node.beast_type),
        name: edge.node.name
      }));

      // Sort by age DESC, then by birth_date ASC (older first)
      beasts.sort((a: any, b: any) => {
        if (b.age !== a.age) {
          return b.age - a.age; // Higher age first
        }
        return a.birth_date - b.birth_date; // Older birth_date first
      });

      return beasts.slice(0, 10); // Take top 10
    } catch (error) {
      console.error('❌ Error fetching top beasts:', error);
      throw error;
    }
  };

  // Fetch individual beast status
  const fetchBeastStatus = async (player: string, beastId: number): Promise<boolean> => {
    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: BEAST_STATUS_QUERY,
          variables: { 
            player,
            beastId
          }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.warn('⚠️ Error fetching beast status:', player, beastId, result.errors);
        return false; // Default to dead if error
      }

      const edges = result.data?.tamagotchiBeastStatusModels?.edges || [];
      if (edges.length === 0) {
        console.warn('⚠️ No status found for beast:', player, beastId);
        return false;
      }

      return edges[0].node.is_alive === true || edges[0].node.is_alive === 1;
    } catch (error) {
      console.error('❌ Error fetching beast status:', error);
      return false;
    }
  };

  // Fetch individual player name
  const fetchPlayerName = async (address: string): Promise<string> => {
    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: PLAYER_NAME_QUERY,
          variables: { address }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.warn('⚠️ Error fetching name for address:', address, result.errors);
        return '';
      }

      const edges = result.data?.tamagotchiPlayerModels?.edges || [];
      if (edges.length === 0) {
        console.warn('⚠️ No player found for address:', address);
        return '';
      }

      const rawName = edges[0].node.name || '0x0';
      
      // Decode name if it comes as hex
      let decodedName = '';
      if (rawName && rawName !== '0x0') {
        try {
          decodedName = shortString.decodeShortString(rawName);
        } catch (error) {
          console.warn('⚠️ Error decoding player name:', rawName, error);
        }
      }
      
      // If no name, use truncated address
      if (!decodedName || decodedName === '') {
        if (address.length > 10) {
          decodedName = `${address.slice(0, 6)}...${address.slice(-4)}`;
        } else {
          decodedName = address;
        }
      }
      
      return decodedName;
    } catch (error) {
      console.error('❌ Error fetching name for address:', address, error);
      // Return truncated address as fallback
      if (address.length > 10) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
      }
      return address;
    }
  };

  // Decode beast name
  const decodeBeastName = (rawName: string | undefined, beastId: number): string => {
    if (!rawName || rawName === '0x0' || rawName === '0') {
      return `Beast #${beastId}`;
    }
    
    try {
      const decoded = shortString.decodeShortString(rawName);
      return decoded || `Beast #${beastId}`;
    } catch (error) {
      console.warn('⚠️ Error decoding beast name:', rawName, error);
      return `Beast #${beastId}`;
    }
  };

  // Fetch user's oldest beast
  const fetchUserOldestBeast = async (address: string) => {
    try {
      console.log('👤 Fetching user\'s oldest beast for address:', address);
      
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: USER_OLDEST_BEAST_QUERY,
          variables: { 
            playerAddress: address
          }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.warn('⚠️ User has no beasts');
        return null;
      }

      const edges = result.data?.tamagotchiBeastModels?.edges || [];
      if (edges.length === 0) return null;

      const beast = edges[0].node;
      return {
        player: beast.player,
        beast_id: hexToNumber(beast.beast_id),
        age: hexToNumber(beast.age),
        birth_date: hexToNumber(beast.birth_date),
        specie: hexToNumber(beast.specie),
        beast_type: hexToNumber(beast.beast_type),
        name: beast.name
      };
    } catch (error) {
      console.error('❌ Error fetching user beast:', error);
      return null;
    }
  };

  // Calculate beast's actual rank
  const calculateBeastRank = async (beastAge: number): Promise<number> => {
    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: COUNT_OLDER_BEASTS_QUERY,
          variables: { 
            userAge: beastAge
          }
        }),
      });

      const result = await response.json();
      const beastsWithHigherAge = result.data?.tamagotchiBeastModels?.totalCount || 0;
      
      return beastsWithHigherAge + 1;
    } catch (error) {
      console.error('❌ Error calculating beast rank:', error);
      return 999;
    }
  };

  // Main fetch function
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch top 10 beasts
      const topBeastsList = await fetchTopBeasts();
      
      // 2. Fetch current user's oldest beast if address provided
      let userOldestBeast = null;
      if (currentUserAddress) {
        const paddedAddress = addAddressPadding(currentUserAddress);
        userOldestBeast = await fetchUserOldestBeast(paddedAddress);
      }

      // 3. Collect all unique player addresses
      const uniqueAddresses = new Set<string>();
      topBeastsList.forEach((beast: any) => uniqueAddresses.add(beast.player));
      if (userOldestBeast) uniqueAddresses.add(userOldestBeast.player);

      // 4. Fetch all player names individually
      const namesMap = new Map<string, string>();
      const namePromises = Array.from(uniqueAddresses).map(async (address) => {
        const name = await fetchPlayerName(address);
        return { address: address.toLowerCase(), name };
      });
      
      const nameResults = await Promise.all(namePromises);
      nameResults.forEach(({ address, name }) => {
        namesMap.set(address, name);
      });

      // 5. Fetch beast status for all beasts
      const statusPromises = topBeastsList.map(async (beast: any) => {
        const isAlive = await fetchBeastStatus(beast.player, beast.beast_id);
        return { 
          player: beast.player, 
          beast_id: beast.beast_id, 
          isAlive 
        };
      });

      const statusResults = await Promise.all(statusPromises);
      const statusMap = new Map<string, boolean>();
      statusResults.forEach(({ player, beast_id, isAlive }) => {
        statusMap.set(`${player}_${beast_id}`, isAlive);
      });

      // Also fetch status for user's oldest beast if exists
      if (userOldestBeast) {
        const userBeastAlive = await fetchBeastStatus(userOldestBeast.player, userOldestBeast.beast_id);
        statusMap.set(`${userOldestBeast.player}_${userOldestBeast.beast_id}`, userBeastAlive);
      }

      // 6. Build top beasts list with all info
      const normalizedCurrentUser = currentUserAddress ? 
        currentUserAddress.toLowerCase() : '';
      const paddedCurrentUser = currentUserAddress ? 
        addAddressPadding(currentUserAddress).toLowerCase() : '';

      const topBeastsWithInfo: LeaderboardBeast[] = topBeastsList.map((beast: any, index: number) => {
        const normalizedBeastPlayer = beast.player.toLowerCase();
        const isCurrentUserBeast = normalizedCurrentUser ? 
          (normalizedBeastPlayer === normalizedCurrentUser || 
           normalizedBeastPlayer === paddedCurrentUser) : 
          false;
        
        return {
          rank: index + 1,
          playerAddress: beast.player,
          playerName: namesMap.get(normalizedBeastPlayer) || 'Unknown',
          beastId: beast.beast_id,
          beastName: decodeBeastName(beast.name, beast.beast_id),
          age: beast.age,
          isAlive: statusMap.get(`${beast.player}_${beast.beast_id}`) || false,
          isCurrentUserBeast
        };
      });

      // 7. Build current user's best beast if exists and not in top 10
      let userBestBeast: LeaderboardBeast | null = null;
      if (userOldestBeast && currentUserAddress) {
        const isInTop10 = topBeastsWithInfo.some(b => 
          b.isCurrentUserBeast && b.beastId === userOldestBeast.beast_id
        );
        
        if (!isInTop10) {
          const userRank = await calculateBeastRank(userOldestBeast.age);
          const normalizedUserPlayer = userOldestBeast.player.toLowerCase();
          
          userBestBeast = {
            rank: userRank,
            playerAddress: userOldestBeast.player,
            playerName: namesMap.get(normalizedUserPlayer) || 'You',
            beastId: userOldestBeast.beast_id,
            beastName: decodeBeastName(userOldestBeast.name, userOldestBeast.beast_id),
            age: userOldestBeast.age,
            isAlive: statusMap.get(`${userOldestBeast.player}_${userOldestBeast.beast_id}`) || false,
            isCurrentUserBeast: true
          };
        }
      }

      console.log('✅ Age leaderboard loaded:', {
        topBeasts: topBeastsWithInfo.length,
        userBest: userBestBeast
      });

      setTopBeasts(topBeastsWithInfo);
      setCurrentUserBestBeast(userBestBeast);
    } catch (err) {
      console.error('❌ Error in fetchLeaderboard:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUserAddress]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    topBeasts,
    currentUserBestBeast,
    isLoading,
    error,
    refetch: fetchLeaderboard
  };
}