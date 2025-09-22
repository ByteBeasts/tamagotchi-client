// src/services/api/systemLogs.helper.ts
import { systemLogsService } from './system-logs.service';
import useAppStore from '../../zustand/store';
import type { CreateSystemLogDto } from '../../types/api.types';

/**
 * Helper service to easily create system logs with consistent metadata
 */
export const systemLogsHelper = {
    /**
     * Create a system log with automatic userAddress detection
     */
    async createLog(
        action: string,
        entityType: string,
        description: string,
        customMetadata: Record<string, any> = {}
    ): Promise<void> {
        try {
            // Get user address from Cavos wallet
            const { cavos } = useAppStore.getState();
            const userAddress = cavos.wallet?.address;

            if (!userAddress) {
                console.warn('⚠️ No wallet address available for system log');
                return;
            }

            // Base metadata with common fields
            const baseMetadata = {
                timestamp: new Date().toISOString(),
                platform: 'web', // Could be enhanced to detect worldapp vs web
                ...customMetadata
            };

            const logData: CreateSystemLogDto = {
                userAddress,
                action,
                entityType,
                description,
                metadata: baseMetadata
            };

            console.log('📝 Creating system log:', {
                action,
                entityType,
                userAddress: userAddress.substring(0, 10) + '...',
                metadataKeys: Object.keys(baseMetadata)
            });

            await systemLogsService.create(logData);
            console.log('✅ System log created successfully');

        } catch (error) {
            // Don't fail the main flow if logging fails
            console.error('⚠️ Failed to create system log (non-critical):', error);
        }
    },

    /**
     * Log beast death with basic metadata
     */
    async logBeastDied(
        beastId: string | number,
        lastStatus?: any,
        beastAge?: number
    ): Promise<void> {
        await this.createLog(
            'BEAST_DIED',
            'beast',
            `Beast ${beastId} died`,
            {
                beastId: beastId.toString(),
                beastAge: beastAge || 0,
                lastStats: lastStatus || {},
                deathTime: new Date().toISOString()
            }
        );
    },

    /**
     * Log beast spawn with metadata
     */
    async logBeastSpawned(
        beastId: string | number,
        beastType: string,
        specie: number,
        transactionHash: string
    ): Promise<void> {
        await this.createLog(
            'SPAWN_BEAST',
            'beast',
            `New ${beastType} beast spawned`,
            {
                beastId: beastId.toString(),
                beastType,
                specie,
                transactionHash,
                spawnTime: new Date().toISOString()
            }
        );
    },

    /**
     * Log beast revival with metadata
     */
    async logBeastRevived(
        beastId: string | number,
        gemsSpent: number,
        transactionHash: string
    ): Promise<void> {
        await this.createLog(
            'REVIVE_BEAST',
            'beast',
            `Beast ${beastId} revived for ${gemsSpent} gems`,
            {
                beastId: beastId.toString(),
                gemsSpent,
                transactionHash,
                reviveTime: new Date().toISOString()
            }
        );
    },

    /**
     * Log food purchase with metadata
     */
    async logFoodPurchase(
        foodId: number,
        foodName: string,
        quantity: number,
        totalCost: number,
        currency: 'coins' | 'gems',
        transactionHash: string
    ): Promise<void> {
        const { player } = useAppStore.getState();
        const balanceBefore = currency === 'coins' ? (player?.total_coins || 0) + totalCost : (player?.total_gems || 0) + totalCost;
        const balanceAfter = currency === 'coins' ? (player?.total_coins || 0) : (player?.total_gems || 0);

        await this.createLog(
            'PURCHASE_FOOD',
            'food',
            `Purchased ${quantity}x ${foodName} for ${totalCost} ${currency}`,
            {
                foodId,
                foodName,
                quantity,
                totalCost,
                currency,
                balanceBefore,
                balanceAfter,
                transactionHash,
                purchaseTime: new Date().toISOString()
            }
        );
    },

    /**
     * Log gem purchase with metadata
     */
    async logGemPurchase(
        packId: number,
        gemAmount: number,
        priceUSD: number,
        paymentMethod: string,
        worldcoinTxId: string,
        transactionHash: string
    ): Promise<void> {
        const { player } = useAppStore.getState();
        const balanceBefore = (player?.total_gems || 0) - gemAmount;
        const balanceAfter = player?.total_gems || 0;

        await this.createLog(
            'PURCHASE_GEMS',
            'gems',
            `Purchased ${gemAmount} gems for $${priceUSD}`,
            {
                packId,
                gemAmount,
                priceUSD,
                paymentMethod,
                worldcoinTxId,
                balanceBefore,
                balanceAfter,
                transactionHash,
                purchaseTime: new Date().toISOString()
            }
        );
    },

    /**
     * Log minigame completion with metadata
     */
    async logMinigameCompleted(
        gameId: string,
        score: number,
        coinsEarned: number,
        isNewHighScore: boolean,
        previousHighScore: number,
        gameDuration: number,
        transactionHash: string
    ): Promise<void> {
        await this.createLog(
            'MINIGAME_COMPLETED',
            'minigame',
            `Completed ${gameId} with score ${score}`,
            {
                gameId,
                score,
                coinsEarned,
                isNewHighScore,
                previousHighScore,
                gameDuration,
                transactionHash,
                completionTime: new Date().toISOString()
            }
        );
    },

    /**
     * Log name change with metadata
     */
    async logNameChanged(
        entityType: 'player' | 'beast',
        entityId: string,
        previousName: string,
        newName: string,
        gemsSpent: number,
        transactionHash: string
    ): Promise<void> {
        await this.createLog(
            'NAME_CHANGED',
            entityType,
            `${entityType} name changed from "${previousName}" to "${newName}"`,
            {
                entityType,
                entityId,
                previousName,
                newName,
                gemsSpent,
                transactionHash,
                changeTime: new Date().toISOString()
            }
        );
    }
};