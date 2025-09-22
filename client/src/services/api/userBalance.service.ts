// src/services/api/userBalance.service.ts
import { usersService } from './users.service';
import useAppStore from '../../zustand/store';
import type { UpdateUserDto } from '../../types/api.types';

/**
 * Helper service to sync user balances with Supabase backend
 */
export const userBalanceService = {
    /**
     * Update user balances in Supabase based on current Zustand store state
     */
    async syncUserBalances(address?: string): Promise<void> {
        try {
            // Get current state from Zustand store
            const { player, cavos } = useAppStore.getState();

            // Use provided address or get from Cavos wallet
            const userAddress = address || cavos.wallet?.address;

            if (!userAddress) {
                console.warn('⚠️ No wallet address available for balance sync');
                return;
            }

            if (!player) {
                console.warn('⚠️ No player data available for balance sync');
                return;
            }

            // Prepare update data
            const updateData: UpdateUserDto = {
                totalCoins: player.total_coins,
                totalGems: player.total_gems
            };

            console.log('🔄 Syncing user balances to Supabase:', {
                address: userAddress,
                coins: updateData.totalCoins,
                gems: updateData.totalGems
            });

            // Update user in Supabase
            await usersService.update(userAddress, updateData);

            console.log('✅ User balances synced successfully to Supabase');

        } catch (error) {
            // Don't fail the transaction flow if Supabase sync fails
            console.error('⚠️ Failed to sync user balances to Supabase (non-critical):', error);
        }
    },

    /**
     * Update only coins balance
     */
    async syncCoinsBalance(address?: string): Promise<void> {
        try {
            const { player, cavos } = useAppStore.getState();
            const userAddress = address || cavos.wallet?.address;

            if (!userAddress || !player) return;

            const updateData: UpdateUserDto = {
                totalCoins: player.total_coins
            };

            console.log('🪙 Syncing coins balance to Supabase:', {
                address: userAddress,
                coins: updateData.totalCoins
            });

            await usersService.update(userAddress, updateData);
            console.log('✅ Coins balance synced to Supabase');

        } catch (error) {
            console.error('⚠️ Failed to sync coins balance to Supabase (non-critical):', error);
        }
    },

    /**
     * Update only gems balance
     */
    async syncGemsBalance(address?: string): Promise<void> {
        try {
            const { player, cavos } = useAppStore.getState();
            const userAddress = address || cavos.wallet?.address;

            if (!userAddress || !player) return;

            const updateData: UpdateUserDto = {
                totalGems: player.total_gems
            };

            console.log('💎 Syncing gems balance to Supabase:', {
                address: userAddress,
                gems: updateData.totalGems
            });

            await usersService.update(userAddress, updateData);
            console.log('✅ Gems balance synced to Supabase');

        } catch (error) {
            console.error('⚠️ Failed to sync gems balance to Supabase (non-critical):', error);
        }
    }
};