import { useState, useEffect, useMemo, useCallback } from 'react';
import { addAddressPadding } from 'starknet';
import { dojoConfig } from '../dojoConfig';
import { GAME_IDS } from '../../components/types/game.types';
import useAppStore from '../../zustand/store';

// Simple types
interface PlayerHighScore {
  minigame_id: number;
  player: string;
  score: number;
}

interface UseHighScoreReturn {
  // Player scores for specific games
  flappyBirdScore: number;
  skyJumpScore: number;
  
  // Loading state
  isLoading: boolean;
  error: Error | null;
  
  // Simple methods
  getScore: (gameId: number) => number;
  refetch: () => Promise<void>;
}

// Constants
const TORII_URL = dojoConfig.toriiUrl + "/graphql";

// Simple query for player's high scores only
const PLAYER_HIGH_SCORES_QUERY = `
  query GetPlayerHighScores($playerAddress: ContractAddress!) {
    tamagotchiHighestScoreModels(
      where: { 
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

// Helper function
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

// API function
const fetchPlayerHighScores = async (playerAddress: string): Promise<PlayerHighScore[]> => {
  try {
    const response = await fetch(TORII_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        query: PLAYER_HIGH_SCORES_QUERY,
        variables: { playerAddress }
      }),
    });

    const result = await response.json();
    
    if (!result.data?.tamagotchiHighestScoreModels?.edges) {
      return [];
    }

    return result.data.tamagotchiHighestScoreModels.edges.map((edge: any) => ({
      minigame_id: hexToNumber(edge.node.minigame_id),
      player: edge.node.player,
      score: hexToNumber(edge.node.score)
    }));
    
  } catch (error) {
    console.error("Error fetching player high scores:", error);
    throw error;
  }
};

/**
 * Simple hook for player's high scores only
 */
export const useHighScore = (): UseHighScoreReturn => {
  const [playerScores, setPlayerScores] = useState<PlayerHighScore[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const cavosWallet = useAppStore(state => state.cavos.wallet);

  // User address
  const userAddress = useMemo(() => 
    cavosWallet?.address ? addAddressPadding(cavosWallet.address) : '',
    [cavosWallet?.address]
  );

  // Get scores for specific games
  const flappyBirdScore = useMemo(() => {
    const score = playerScores.find(s => s.minigame_id === GAME_IDS.FLAPPY_BEASTS);
    return score ? score.score : 0;
  }, [playerScores]);

  const skyJumpScore = useMemo(() => {
    const score = playerScores.find(s => s.minigame_id === GAME_IDS.PLATFORM_JUMP);
    return score ? score.score : 0;
  }, [playerScores]);

  // Generic getter
  const getScore = useCallback((gameId: number): number => {
    const score = playerScores.find(s => s.minigame_id === gameId);
    return score ? score.score : 0;
  }, [playerScores]);

  // Fetch function
  const fetchScores = useCallback(async () => {
    if (!userAddress) {
      setPlayerScores([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const scores = await fetchPlayerHighScores(userAddress);
      setPlayerScores(scores);
      
      console.info('Player high scores loaded:', scores);
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  // Public refetch
  const refetch = useCallback(async () => {
    await fetchScores();
  }, [fetchScores]);

  // Load scores when user changes
  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return {
    flappyBirdScore,
    skyJumpScore,
    isLoading,
    error,
    getScore,
    refetch,
  };
};