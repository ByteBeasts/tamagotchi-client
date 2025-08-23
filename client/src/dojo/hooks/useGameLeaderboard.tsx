import { useState, useEffect, useCallback } from 'react';
import { addAddressPadding, shortString } from 'starknet';

// Types import
import { HighestScore } from '../models.gen';
import { GAME_IDS } from '../../components/types/game.types';

// Dojo config import
import { dojoConfig } from '../dojoConfig';

// Types
export interface LeaderboardPlayer {
  address: string;
  name: string;
  score: number;
  rank: number;
  isCurrentUser: boolean;
}

export interface UseGameLeaderboardReturn {
  topPlayers: LeaderboardPlayer[];
  currentUserRanking: LeaderboardPlayer | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

// Constants
const TORII_URL = dojoConfig.toriiUrl + "/graphql";

// Query 1: Top 10 leaderboard for FlappyBeasts
const TOP_LEADERBOARD_QUERY = `
  query GetTopLeaderboard($minigameId: Int!) {
    tamagotchiHighestScoreModels(
      where: { minigame_id: $minigameId }
      order: { field: SCORE, direction: DESC }
      limit: 10
    ) {
      edges {
        node {
          minigame_id
          player
          score
        }
      }
    }
  }
`;

// Query 2: Current user position
const USER_RANKING_QUERY = `
  query GetUserRanking($minigameId: Int!, $playerAddress: ContractAddress!) {
    tamagotchiHighestScoreModels(
      where: { 
        minigame_id: $minigameId,
        player: $playerAddress 
      }
    ) {
      edges {
        node {
          minigame_id
          player
          score
        }
      }
    }
  }
`;

// Query 3: Get individual player name
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

// Query 4: Count all players with score to calculate ranking
const COUNT_ALL_PLAYERS_QUERY = `
  query CountAllPlayers($minigameId: Int!, $userScore: Int!) {
    tamagotchiHighestScoreModels(
      where: { 
        minigame_id: $minigameId,
        score_gt: $userScore 
      }
    ) {
      totalCount
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
export function useGameLeaderboard(
  minigameId: number = GAME_IDS.FLAPPY_BEASTS, 
  currentUserAddress?: string
): UseGameLeaderboardReturn {
  const [topPlayers, setTopPlayers] = useState<LeaderboardPlayer[]>([]);
  const [currentUserRanking, setCurrentUserRanking] = useState<LeaderboardPlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch top 10 players
  const fetchTopPlayers = async (): Promise<HighestScore[]> => {
    try {
      console.log('🏆 Fetching top 10 players for minigame:', minigameId);
      
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: TOP_LEADERBOARD_QUERY,
          variables: { minigameId }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      const edges = result.data?.tamagotchiHighestScoreModels?.edges || [];
      return edges.map((edge: any) => ({
        minigame_id: hexToNumber(edge.node.minigame_id),
        player: edge.node.player,
        score: hexToNumber(edge.node.score)
      }));
    } catch (error) {
      console.error('❌ Error fetching top players:', error);
      throw error;
    }
  };

  // Fetch current user ranking
  const fetchUserRanking = async (address: string): Promise<HighestScore | null> => {
    try {
      console.log('👤 Fetching user ranking for address:', address);
      
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: USER_RANKING_QUERY,
          variables: { 
            minigameId,
            playerAddress: address
          }
        }),
      });

      const result = await response.json();
      
      if (result.errors) {
        console.warn('⚠️ User has no score in this game');
        return null;
      }

      const edges = result.data?.tamagotchiHighestScoreModels?.edges || [];
      if (edges.length === 0) return null;

      return {
        minigame_id: hexToNumber(edges[0].node.minigame_id),
        player: edges[0].node.player,
        score: hexToNumber(edges[0].node.score)
      };
    } catch (error) {
      console.error('❌ Error fetching user ranking:', error);
      return null;
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
        return 'Unknown';
      }

      const edges = result.data?.tamagotchiPlayerModels?.edges || [];
      if (edges.length === 0) {
        console.warn('⚠️ No player found for address:', address);
        return 'Unknown';
      }

      const rawName = edges[0].node.name || '0x0';
      
      // Decode name if it comes as hex using shortString from Starknet
      let decodedName = 'Unknown';
      if (rawName && rawName !== '0x0') {
        try {
          decodedName = shortString.decodeShortString(rawName);
        } catch (error) {
          console.warn('⚠️ Error decoding name:', rawName, error);
          decodedName = rawName; // Fallback to original value
        }
      }
      
      // If name is "Unknown", use truncated address
      if (decodedName === 'Unknown') {
        // Format: 0x1234...abcd (first 6 + last 4 characters)
        if (address.length > 10) {
          decodedName = `${address.slice(0, 6)}...${address.slice(-4)}`;
        } else {
          decodedName = address; // If too short, show complete address
        }
      }
      
      console.log('📝 Fetched name for', address, ':', rawName, '->', decodedName);
      return decodedName;
    } catch (error) {
      console.error('❌ Error fetching name for address:', address, error);
      return 'Unknown';
    }
  };

  // Fetch player names (individual requests)
  const fetchPlayerNames = async (addresses: string[]): Promise<Map<string, string>> => {
    try {
      console.log('📝 Fetching names for', addresses.length, 'players (individual requests)');
      
      const namesMap = new Map<string, string>();
      
      // Make individual requests for each address
      const namePromises = addresses.map(async (address) => {
        const name = await fetchPlayerName(address);
        return { address: address.toLowerCase(), name };
      });

      const nameResults = await Promise.all(namePromises);
      
      nameResults.forEach(({ address, name }) => {
        namesMap.set(address, name);
      });

      console.log('📝 Names fetched:', Array.from(namesMap.entries()));
      return namesMap;
    } catch (error) {
      console.error('❌ Error fetching player names:', error);
      return new Map();
    }
  };

  // Calculate user's actual rank
  const calculateUserRank = async (userScore: number): Promise<number> => {
    try {
      const response = await fetch(TORII_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: COUNT_ALL_PLAYERS_QUERY,
          variables: { 
            minigameId,
            userScore
          }
        }),
      });

      const result = await response.json();
      const playersWithHigherScore = result.data?.tamagotchiHighestScoreModels?.totalCount || 0;
      
      return playersWithHigherScore + 1; // User's rank
    } catch (error) {
      console.error('❌ Error calculating user rank:', error);
      return 999; // Default rank if error
    }
  };

  // Main fetch function
  const fetchLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fetch top 10 players
      const topScores = await fetchTopPlayers();
      
      // 2. Fetch current user if address provided
      let userScore: HighestScore | null = null;
      if (currentUserAddress) {
        const paddedAddress = addAddressPadding(currentUserAddress);
        userScore = await fetchUserRanking(paddedAddress);
      }

      // 3. Collect all unique addresses
      const allAddresses = new Set<string>();
      topScores.forEach(score => allAddresses.add(score.player));
      if (userScore) allAddresses.add(userScore.player);

      // 4. Fetch all names in batch
      const namesMap = await fetchPlayerNames(Array.from(allAddresses));

      // 5. Build top players list with ranks and names
      const topPlayersWithNames: LeaderboardPlayer[] = topScores.map((score, index) => {
        // Normalize both addresses for comparison
        const normalizedScorePlayer = score.player.toLowerCase();
        const normalizedCurrentUser = currentUserAddress ? 
          currentUserAddress.toLowerCase() : '';
        
        // Also compare with padded version just in case
        const paddedCurrentUser = currentUserAddress ? 
          addAddressPadding(currentUserAddress).toLowerCase() : '';
        
        const isCurrentUser = normalizedCurrentUser ? 
          (normalizedScorePlayer === normalizedCurrentUser || 
           normalizedScorePlayer === paddedCurrentUser) : 
          false;
          
        if (index <= 7) { // Log for first positions where user might be
          console.log(`🔍 Address comparison [${index + 1}]:`, {
            scorePlayer: normalizedScorePlayer,
            currentUser: normalizedCurrentUser,
            paddedUser: paddedCurrentUser,
            isMatch: isCurrentUser
          });
        }
        
        return {
          address: score.player,
          name: namesMap.get(normalizedScorePlayer) || 'Unknown',
          score: score.score,
          rank: index + 1,
          isCurrentUser
        };
      });

      // 6. Build current user ranking if exists and not in top 10
      let userRanking: LeaderboardPlayer | null = null;
      if (userScore && currentUserAddress) {
        const isInTop10 = topPlayersWithNames.some(p => p.isCurrentUser);
        
        if (!isInTop10) {
          const userRank = await calculateUserRank(userScore.score);
          userRanking = {
            address: userScore.player,
            name: namesMap.get(userScore.player.toLowerCase()) || 'You',
            score: userScore.score,
            rank: userRank,
            isCurrentUser: true
          };
        }
      }

      setTopPlayers(topPlayersWithNames);
      setCurrentUserRanking(userRanking);
    } catch (err) {
      console.error('❌ Error in fetchLeaderboard:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [minigameId, currentUserAddress]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    topPlayers,
    currentUserRanking,
    isLoading,
    error,
    refetch: fetchLeaderboard
  };
}