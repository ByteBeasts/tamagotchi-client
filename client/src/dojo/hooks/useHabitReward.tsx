// src/dojo/hooks/useHabitReward.tsx

/**
 * HABIT REWARD HOOK
 * Handles blockchain transactions for habit rewards:
 * - Coins (guaranteed)
 * - Gems (probabilistic)
 * - Food (probabilistic)
 *
 * Uses optimistic updates and syncs with Supabase
 */

import { useCallback } from 'react';
import { useOptimisticTransaction } from './useOptimisticTransaction';
import { getContractAddresses } from '../../config/cavosConfig';
import useAppStore from '../../zustand/store';
import { userBalanceService } from '../../services/api/userBalance.service';
import type { HabitReward } from '../../utils/habitRewardCalculator';

interface UseHabitRewardReturn {
  grantReward: (reward: HabitReward) => Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }>;
  isGranting: boolean;
}

export const useHabitReward = (): UseHabitRewardReturn => {
  const { executeOptimistic } = useOptimisticTransaction();
  const player = useAppStore(state => state.player);
  const setPlayer = useAppStore(state => state.setPlayer);
  const cavosAuth = useAppStore(state => state.cavos);

  /**
   * Grant rewards for completing a habit
   * Executes blockchain transactions for coins, gems, and food
   */
  const grantReward = useCallback(async (reward: HabitReward) => {
    // Validation
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      return {
        success: false,
        error: 'Not authenticated. Please login first.'
      };
    }

    if (!player) {
      return {
        success: false,
        error: 'Player data not found'
      };
    }

    const contractAddresses = getContractAddresses();
    const calls: any[] = [];

    // Build transaction calls based on rewards
    const { coins, gems, foodId } = reward;

    // 1. Add coins transaction (always)
    // NOTE: Contract sums the amount automatically, so we pass the INCREMENT, not the total
    if (coins > 0) {
      calls.push({
        contractAddress: contractAddresses.player,
        entrypoint: 'update_player_total_coins',
        calldata: [coins.toString()] // Pass increment only (50, 100, or 150)
      });
    }

    // 2. Add gems transaction (if won)
    // NOTE: Contract sums the amount automatically, so we pass the INCREMENT, not the total
    if (gems > 0) {
      calls.push({
        contractAddress: contractAddresses.player,
        entrypoint: 'update_player_total_gems',
        calldata: [gems.toString()] // Pass increment only (1, 2, or 3)
      });
    }

    // 3. Add food transaction (if won)
    if (foodId !== null) {
      calls.push({
        contractAddress: contractAddresses.player,
        entrypoint: 'add_or_update_food_amount',
        calldata: [
          foodId.toString(),  // food ID
          '1',                // amount (always 1)
          '0'                 // price (free reward)
        ]
      });
    }

    console.log('🎁 [HabitReward] Granting reward:', {
      coins,
      gems,
      foodId,
      calls: calls.length,
      player: cavosAuth.wallet.address
    });

    // Execute optimistic transaction
    const result = await executeOptimistic(calls, {
      // Capture current state
      captureState: () => ({
        originalPlayer: { ...player }
      }),

      // Apply optimistic update
      onOptimisticUpdate: () => {
        const updatedPlayer = {
          ...player,
          total_coins: player.total_coins + coins,
          total_gems: player.total_gems + gems
        };
        setPlayer(updatedPlayer);

        console.log('⚡ [HabitReward] Optimistic update applied:', {
          coins: `${player.total_coins} → ${updatedPlayer.total_coins}`,
          gems: `${player.total_gems} → ${updatedPlayer.total_gems}`
        });
      },

      // Rollback on failure
      onRollback: (originalState: any) => {
        setPlayer(originalState.originalPlayer);
        console.log('↩️ [HabitReward] Rolled back to original state');
      },

      // On success
      onSuccess: (txHash: string) => {
        console.log('✅ [HabitReward] Transaction successful:', txHash);

        // Sync with Supabase in background (non-blocking)
        setTimeout(async () => {
          try {
            // Sync coins
            if (coins > 0) {
              await userBalanceService.syncCoinsBalance();
              console.log('📊 [HabitReward] Coins synced to Supabase');
            }

            // Sync gems
            if (gems > 0) {
              await userBalanceService.syncGemsBalance();
              console.log('📊 [HabitReward] Gems synced to Supabase');
            }
          } catch (syncError) {
            console.error('⚠️ [HabitReward] Supabase sync failed (non-critical):', syncError);
          }
        }, 2000); // Wait 2 seconds before syncing
      },

      // On error
      onError: (error: any) => {
        console.error('❌ [HabitReward] Transaction failed:', error);
      }
    });

    if (result.success) {
      return {
        success: true,
        txHash: result.txHash
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Failed to grant reward'
      };
    }
  }, [
    cavosAuth.isAuthenticated,
    cavosAuth.wallet,
    cavosAuth.accessToken,
    player,
    setPlayer,
    executeOptimistic
  ]);

  return {
    grantReward,
    isGranting: false // We can add state tracking if needed
  };
};
