import { useState } from 'react';
import { toast } from 'react-hot-toast';

// Types
import { GameResult } from '../../../../../types/play.types';
import { GAME_IDS } from '../../../../../types/game.types';

// Services
import CoinGemRewardService from '../../../../../utils/coinGemRewardService';
import { getContractAddresses } from '../../../../../../config/cavosConfig';

// Cavos transaction hook
import { useCavosTransaction } from '../../../../../../dojo/hooks/useCavosTransaction';

// Store import
import useAppStore from '../../../../../../zustand/store';

// high score hook
import { useHighScore } from '../../../../../../dojo/hooks/useHighScore';

// player hook for refreshing player data
import { usePlayer } from '../../../../../../dojo/hooks/usePlayer';

// Constants
const ENERGY_REQUIREMENT = 20;

// No props needed - using Cavos SDK internally

interface UseFlappyGameLogicReturn {
  // Energy management
  checkEnergyRequirement: () => boolean;
  consumeEnergy: () => Promise<boolean>;
  consumeEnergyOptimistic: () => boolean; // New: immediate optimistic update
  showEnergyToast: boolean;
  setShowEnergyToast: (show: boolean) => void;
  
  // Game completion
  handleGameCompletion: (finalScore: number) => Promise<GameResult>;
  
  // High score management
  isNewHighScore: boolean;
  currentHighScore: number;
  
  // Loading states
  isProcessingResults: boolean;
}

export const useFlappyGameLogic = (): UseFlappyGameLogicReturn => {
  const { executeTransaction } = useCavosTransaction();
  
  // Get Cavos auth state for validation
  const cavosAuth = useAppStore(state => state.cavos);
  const player = useAppStore(state => state.player);
  // simple high score hook
  const {
    flappyBirdScore,
    refetch: refetchHighScores
  } = useHighScore();
  
  // player hook for refreshing player data after rewards
  const { refetch: refetchPlayer } = usePlayer();

  // State
  const [showEnergyToast, setShowEnergyToast] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isProcessingResults, setIsProcessingResults] = useState(false);

  // Get current high score for Flappy Bird
  const currentHighScore = flappyBirdScore;

  /**
   * Check if beast has enough energy to play using store data (no fetch)
   */
  const checkEnergyRequirement = (): boolean => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      console.warn("No Cavos wallet available for energy check");
      return false;
    }

    // Get energy from store instead of fetching
    const realTimeStatus = useAppStore.getState().realTimeStatus;
    const hasLiveBeast = useAppStore.getState().hasLiveBeast();
    
    if (!hasLiveBeast) {
      console.info("No live beast found");
      return false;
    }
    
    if (realTimeStatus.length < 10) {
      console.warn("No real-time status available, allowing play");
      // If no status available, allow play (blockchain will validate)
      return true;
    }
    
    const currentEnergy = realTimeStatus[5] || 0;
    console.info("Current energy level from store:", currentEnergy);
    
    // Check if beast has enough energy (minimum 20%)
    const hasEnoughEnergy = currentEnergy >= ENERGY_REQUIREMENT;
    
    if (!hasEnoughEnergy) {
      console.warn(`Insufficient energy: ${currentEnergy} < ${ENERGY_REQUIREMENT}`);
    }
    
    return hasEnoughEnergy;
  };

  /**
   * Consume energy before starting the game with optimistic updates
   */
  const consumeEnergy = async (): Promise<boolean> => {
    try {
      // Validation: Check if Cavos is authenticated
      if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
        console.warn("No Cavos authentication for energy consumption");
        toast.error("Please login with ByteBeasts to play");
        return false;
      }

      // Validation: Check if player exists
      if (!player) {
        console.warn("No player data found");
        toast.error("Player data not found");
        return false;
      }

      // Store original state for potential rollback
      const originalStatus = useAppStore.getState().realTimeStatus;
      
      // Apply optimistic energy update immediately (only if we have status)
      if (originalStatus.length >= 10) {
        const newStatus = [...originalStatus];
        const currentEnergy = newStatus[5] || 100;
        newStatus[5] = Math.max(0, currentEnergy - ENERGY_REQUIREMENT);
        
        console.log("🔮 [Play] Optimistic energy update:", {
          before: currentEnergy,
          after: newStatus[5],
          consumed: ENERGY_REQUIREMENT
        });
        
        // Update store immediately (optimistic)
        useAppStore.getState().setRealTimeStatus(newStatus, true); // skipSync = true
      }

      // Execute transaction using Cavos with dynamic contract address
      const contractAddresses = getContractAddresses();
      
      const calls = [{
        contractAddress: contractAddresses.game,
        entrypoint: 'play',
        calldata: []
      }];
      
      console.log('🎮 Executing play transaction (consume energy)...');
      const txHash = await executeTransaction(calls);
      
      if (txHash) {
        console.log('✅ Energy consumed successfully, tx:', txHash);
        // No fetch needed - polling will sync eventually
        return true;
      } else {
        // Revert optimistic update on null response
        if (originalStatus.length >= 10) {
          console.log("↩️ [Play] Reverting energy optimistic update");
          useAppStore.getState().setRealTimeStatus(originalStatus, true);
        }
        toast.error("Failed to start game - transaction failed");
        return false;
      }
    } catch (error) {
      console.error("Error consuming energy:", error);
      
      // Revert optimistic update on error
      const currentStatus = useAppStore.getState().realTimeStatus;
      if (currentStatus.length >= 10) {
        const originalEnergy = (currentStatus[5] || 0) + ENERGY_REQUIREMENT;
        const revertedStatus = [...currentStatus];
        revertedStatus[5] = Math.min(100, originalEnergy);
        console.log("↩️ [Play] Reverting energy optimistic update on error");
        useAppStore.getState().setRealTimeStatus(revertedStatus, true);
      }
      
      toast.error("Failed to start game - could not consume energy");
      return false;
    }
  };

  /**
   * Consume energy with immediate optimistic update and background transaction
   * Returns true if optimistic update succeeded, transaction executes in background
   */
  const consumeEnergyOptimistic = (): boolean => {
    // Validation: Check if Cavos is authenticated
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      console.warn("No Cavos authentication for energy consumption");
      toast.error("Please login with ByteBeasts to play");
      return false;
    }

    // Validation: Check if player exists
    if (!player) {
      console.warn("No player data found");
      toast.error("Player data not found");
      return false;
    }

    // Apply optimistic energy update immediately
    const originalStatus = useAppStore.getState().realTimeStatus;
    if (originalStatus.length >= 10) {
      const newStatus = [...originalStatus];
      const currentEnergy = newStatus[5] || 100;
      newStatus[5] = Math.max(0, currentEnergy - ENERGY_REQUIREMENT);
      
      console.log("🔮 [Play] Immediate optimistic energy update:", {
        before: currentEnergy,
        after: newStatus[5],
        consumed: ENERGY_REQUIREMENT
      });
      
      // Update store immediately (optimistic)
      useAppStore.getState().setRealTimeStatus(newStatus, true); // skipSync = true
    }

    // Execute transaction in background (fire and forget)
    const executeBackgroundTransaction = async () => {
      try {
        const contractAddresses = getContractAddresses();
        
        const calls = [{
          contractAddress: contractAddresses.game,
          entrypoint: 'play',
          calldata: []
        }];
        
        console.log('🎮 Executing background play transaction...');
        const txHash = await executeTransaction(calls);
        
        if (txHash) {
          console.log('✅ Background energy transaction completed:', txHash);
        } else {
          console.warn('⚠️ Background energy transaction returned null');
        }
      } catch (error) {
        console.error("❌ Background energy transaction failed:", error);
        // Note: We don't revert optimistic updates for background failures
        // since the game has already started and polling will sync eventually
      }
    };

    // Fire and forget the background transaction
    executeBackgroundTransaction();

    // Return true immediately to allow game to start
    return true;
  };

  /**
   * Save game results to blockchain
   */
  const saveGameResults = async (score: number, isNewHigh: boolean): Promise<void> => {
    try {
      // Validation: Check if Cavos is authenticated
      if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
        console.warn("Cannot save game results - no Cavos authentication");
        return;
      }

      // Validation: Check if player exists
      if (!player) {
        console.warn("Cannot save game results - no player data");
        return;
      }

      // Calculate rewards for the blockchain transactions
      const rewards = calculateRewards(score);
      
      // Optimistic update: immediately update coins, gems and points in the store
      const currentPlayer = useAppStore.getState().player;
      if (currentPlayer) {
        const optimisticPlayer = {
          ...currentPlayer,
          total_coins: currentPlayer.total_coins + rewards.coins,
          total_gems: currentPlayer.total_gems + rewards.gems,
          total_points: currentPlayer.total_points + score
        };
        
        console.log("🔮 [FlappyBeast] Optimistic update:", {
          coins: { before: currentPlayer.total_coins, after: optimisticPlayer.total_coins, earned: rewards.coins },
          gems: { before: currentPlayer.total_gems, after: optimisticPlayer.total_gems, earned: rewards.gems },
          points: { before: currentPlayer.total_points, after: optimisticPlayer.total_points, earned: score }
        });
        
        // Update store immediately (optimistic)
        useAppStore.getState().setPlayer(optimisticPlayer);
      }
      
      // Execute multiple transactions using Cavos with correct contract addresses
      const contractAddresses = getContractAddresses();
      
      const calls = [
        // Update total points (player system)
        {
          contractAddress: contractAddresses.player,
          entrypoint: 'update_player_total_points',
          calldata: [score.toString()]
        },
        // Update total coins (player system)
        {
          contractAddress: contractAddresses.player,
          entrypoint: 'update_player_total_coins',
          calldata: [rewards.coins.toString()]
        },
        // Update total gems (player system)
        {
          contractAddress: contractAddresses.player,
          entrypoint: 'update_player_total_gems',
          calldata: [rewards.gems.toString()]
        },
        // Update high score (player system)
        {
          contractAddress: contractAddresses.player,
          entrypoint: 'update_player_minigame_highest_score',
          calldata: [score.toString(), GAME_IDS.FLAPPY_BEASTS.toString()]
        }
      ];
      
      console.log('💾 Executing save game results transaction...', {
        score,
        rewards: rewards.coins + ' coins, ' + rewards.gems + ' gems',
        isNewHighScore: isNewHigh
      });
      await executeTransaction(calls);
      console.log('✅ Game results saved successfully');

      // Refresh high scores after saving
      await refetchHighScores();
      
      // Schedule a background refresh to sync with blockchain
      // This will correct any discrepancies after Torii updates
      setTimeout(async () => {
        console.log("🔄 [FlappyBeast] Background sync with blockchain...");
        
        // Get current store state before refetch
        const currentPlayerBeforeRefetch = useAppStore.getState().player;
        console.log("💰 [FlappyBeast] Player stats before refetch:", {
          coins: currentPlayerBeforeRefetch?.total_coins,
          gems: currentPlayerBeforeRefetch?.total_gems,
          points: currentPlayerBeforeRefetch?.total_points
        });
        
        await refetchPlayer();
        
        // Log after refetch to see what happened
        const currentPlayerAfterRefetch = useAppStore.getState().player;
        console.log("💰 [FlappyBeast] Player stats after refetch:", {
          coins: currentPlayerAfterRefetch?.total_coins,
          gems: currentPlayerAfterRefetch?.total_gems,
          points: currentPlayerAfterRefetch?.total_points
        });
      }, 8000); // Wait 8 seconds for Torii to process
      
    } catch (error) {
      console.error("Error saving game results:", error);
      
      // Revert optimistic update on error
      const currentPlayer = useAppStore.getState().player;
      const rewards = calculateRewards(score);
      if (currentPlayer) {
        const revertedPlayer = {
          ...currentPlayer,
          total_coins: Math.max(0, currentPlayer.total_coins - rewards.coins),
          total_gems: Math.max(0, currentPlayer.total_gems - rewards.gems),
          total_points: Math.max(0, currentPlayer.total_points - score)
        };
        
        console.log("↩️ [FlappyBeast] Reverting optimistic update:", {
          coins: { before: currentPlayer.total_coins, after: revertedPlayer.total_coins },
          gems: { before: currentPlayer.total_gems, after: revertedPlayer.total_gems },
          points: { before: currentPlayer.total_points, after: revertedPlayer.total_points }
        });
        
        useAppStore.getState().setPlayer(revertedPlayer);
      }
      
      toast.error("Couldn't save your game results. Your progress might not be recorded.");
    }
  };

  /**
   * Calculate rewards based on score
   */
  const calculateRewards = (score: number) => {
    return CoinGemRewardService.calculateCoinReward(GAME_IDS.FLAPPY_BEASTS, score);
  };

  /**
   * Calculate additional game statistics
   */
  const calculateGameStats = (score: number) => {
    return {
      tier: calculateRewards(score).range.label,
      accuracy: score > 0 ? Math.round((score / (score + 1)) * 100) : 0,
      rank: score < 10 ? 'Beginner' : score < 25 ? 'Intermediate' : 'Advanced'
    };
  };

  /**
   * Main function to handle game completion
   */
  const handleGameCompletion = async (finalScore: number): Promise<GameResult> => {
    setIsProcessingResults(true);

    try {
      // Calculate rewards
      const rewards = calculateRewards(finalScore);
      
      // Check if this is a new high score
      const isNewHigh = finalScore > currentHighScore;
      setIsNewHighScore(isNewHigh);

      // Save results to blockchain (async, don't block UI)
      saveGameResults(finalScore, isNewHigh).catch(error => {
        console.error("Background save failed:", error);
      });

      // Calculate game statistics
      const gameStats = calculateGameStats(finalScore);

      // Create game result object
      const gameResult: GameResult = {
        score: finalScore,
        rewards: {
          coins: rewards.coins,
          gems: rewards.gems,
          range: rewards.range,
          percentage: rewards.percentage
        },
        isNewHighScore: isNewHigh,
        gameData: gameStats
      };

      // Show success toast
      if (isNewHigh) {
        toast.success(`🏆 New High Score: ${finalScore}!`, { duration: 4000 });
      } else {
        toast.success(`Game Complete! +${rewards.coins} coins, +${rewards.gems} gems`, { 
          duration: 3000 
        });
      }

      return gameResult;

    } catch (error) {
      console.error("Error handling game completion:", error);
      
      // Fallback result in case of error
      const fallbackRewards = calculateRewards(finalScore);
      
      return {
        score: finalScore,
        rewards: {
          coins: fallbackRewards.coins,
          gems: fallbackRewards.gems,
          range: fallbackRewards.range,
          percentage: fallbackRewards.percentage
        },
        isNewHighScore: false,
        gameData: calculateGameStats(finalScore)
      };

    } finally {
      setIsProcessingResults(false);
    }
  };

  return {
    // Energy management
    checkEnergyRequirement,
    consumeEnergy,
    consumeEnergyOptimistic,
    showEnergyToast,
    setShowEnergyToast,
    
    // Game completion
    handleGameCompletion,
    
    // High score management
    isNewHighScore,
    currentHighScore,
    
    // Loading states
    isProcessingResults,
  };
};