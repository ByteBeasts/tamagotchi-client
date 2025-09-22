import { useState } from 'react';
import { toast } from 'react-hot-toast';

// Cavos transaction hook
import { useCavosTransaction } from '../../../../dojo/hooks/useCavosTransaction';
import { usePlayer } from '../../../../dojo/hooks/usePlayer';
import { useFoodInventory } from '../../../../dojo/hooks/useFoodInventory';
import { getContractAddresses } from '../../../../config/cavosConfig';

// Types
import { MarketFoodItem } from '../../../../constants/foodMarket.constants';

// Store
import useAppStore from '../../../../zustand/store';

// API Services
import { userBalanceService, systemLogsHelper } from '../../../../services/api';

interface UseMarketPurchaseProps {
  toastPosition?: 'top-center' | 'top-right' | 'bottom-center';
}

interface UseMarketPurchaseReturn {
  purchaseFood: (food: MarketFoodItem, quantity?: number) => Promise<boolean>;
  isPurchasing: boolean;
  canPurchase: (food: MarketFoodItem, quantity?: number) => boolean;
}

export const useMarketPurchase = ({ 
  toastPosition = 'top-right' 
}: UseMarketPurchaseProps = {}): UseMarketPurchaseReturn => {
  const { executeTransaction } = useCavosTransaction();
  const { refetch: refetchPlayer } = usePlayer();
  const { silentRefetch: refetchFoodInventory } = useFoodInventory();
  
  // Get Cavos auth state and player data
  const cavosAuth = useAppStore(state => state.cavos);
  const storePlayer = useAppStore(state => state.player);
  
  const [isPurchasing, setIsPurchasing] = useState(false);

  /**
   * Check if player can purchase a food item
   */
  const canPurchase = (food: MarketFoodItem, quantity: number = 1): boolean => {
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) return false;
    
    // Check for coming soon items
    if (food.isComingSoon) return false;
    
    // Check balance based on price type
    const playerBalance = food.priceType === 'gems' 
      ? (storePlayer?.total_gems || 0)
      : (storePlayer?.total_coins || 0);
    const totalPrice = food.price * quantity;
    return playerBalance >= totalPrice;
  };

  /**
   * Purchase a food item from the market
   */
  const purchaseFood = async (food: MarketFoodItem, quantity: number = 1): Promise<boolean> => {
    // Validation checks
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      toast.error("Please login with ByteBeasts to make purchases", { position: toastPosition });
      return false;
    }

    if (!canPurchase(food, quantity)) {
      const currency = food.priceType === 'gems' ? 'gems' : 'coins';
      toast.error(`Insufficient ${currency} for this purchase`, { position: toastPosition });
      return false;
    }

    if (isPurchasing) {
      toast.error("Please wait for the current purchase to complete", { position: toastPosition });
      return false;
    }

    // Calculate total cost
    const totalCost = food.price * quantity;

    try {
      setIsPurchasing(true);

      // Optimistic update: immediately reduce currency in the store
      const currentPlayer = useAppStore.getState().player;
      if (currentPlayer) {
        const optimisticPlayer = food.priceType === 'gems'
          ? {
              ...currentPlayer,
              total_gems: Math.max(0, currentPlayer.total_gems - totalCost)
            }
          : {
              ...currentPlayer,
              total_coins: Math.max(0, currentPlayer.total_coins - totalCost)
            };

        console.log("🔮 [MarketPurchase] Optimistic update:", {
          currency: food.priceType,
          before: food.priceType === 'gems' ? currentPlayer.total_gems : currentPlayer.total_coins,
          after: food.priceType === 'gems' ? optimisticPlayer.total_gems : optimisticPlayer.total_coins,
          spent: totalCost,
          quantity: quantity
        });

        // Update store immediately (optimistic)
        useAppStore.getState().setPlayer(optimisticPlayer);
      }
      
      // Execute blockchain transaction using Cavos
      const contractAddresses = getContractAddresses();

      let calls: any[];

      if (food.priceType === 'gems') {
        // For magic items: purchase with gems then add the item
        calls = [
          // First: Deduct gems using purchase_with_gems
          {
            contractAddress: contractAddresses.player,
            entrypoint: 'purchase_with_gems',
            calldata: [totalCost.toString()] // gems amount
          },
          // Second: Add the magic item to inventory
          {
            contractAddress: contractAddresses.player,
            entrypoint: 'add_or_update_food_amount',
            calldata: [
              food.id.toString(),      // food ID (17-20 for magic items)
              quantity.toString(),     // amount
              '0'                      // price 0 because gems already deducted
            ]
          }
        ];
      } else {
        // For normal items: use existing logic with coins
        calls = [{
          contractAddress: contractAddresses.player,
          entrypoint: 'add_or_update_food_amount',
          calldata: [
            food.id.toString(),      // food ID
            quantity.toString(),     // amount (buying specified quantity)
            totalCost.toString()     // total price in coins
          ]
        }];
      }
      
      console.log('🛒 Executing purchase transaction...', {
        food: food.name,
        quantity: quantity,
        unitPrice: food.price,
        totalPrice: totalCost,
        currency: food.priceType,
        balance_before: food.priceType === 'gems' ? storePlayer?.total_gems : storePlayer?.total_coins,
        calls: calls.length
      });
      
      const transactionHash = await executeTransaction(calls);
      const result = { transaction_hash: transactionHash };

      console.log("🛒 [MarketPurchase] Transaction result:", result);
      
      // Schedule a background refresh to sync with blockchain
      // This will correct any discrepancies after Torii updates
      setTimeout(async () => {
        console.log("🔄 [MarketPurchase] Background sync with blockchain...");
        
        // Get current store state before refetch
        const currentPlayerBeforeRefetch = useAppStore.getState().player;
        const currencyField = food.priceType === 'gems' ? 'total_gems' : 'total_coins';
        console.log(`💰 [MarketPurchase] Player ${food.priceType} before refetch:`, currentPlayerBeforeRefetch?.[currencyField]);

        await refetchPlayer();
        await refetchFoodInventory();

        // Log after refetch to see what happened
        const currentPlayerAfterRefetch = useAppStore.getState().player;
        console.log(`💰 [MarketPurchase] Player ${food.priceType} after refetch:`, currentPlayerAfterRefetch?.[currencyField]);
        console.log("🍎 [MarketPurchase] Food inventory refreshed after purchase");

        // If blockchain hasn't processed yet, keep optimistic state
        if (currentPlayerAfterRefetch && currentPlayerBeforeRefetch &&
            currentPlayerAfterRefetch[currencyField] > currentPlayerBeforeRefetch[currencyField]) {
          console.log("⚠️ [MarketPurchase] Blockchain not processed yet, keeping optimistic state");
          useAppStore.getState().setPlayer(currentPlayerBeforeRefetch);
        }
      }, 8000); // Wait 8 seconds for Torii to process
      
      // Success notification
      const successMessage = quantity > 1 
        ? `${quantity}x ${food.name} purchased successfully!` 
        : `${food.name} purchased successfully!`;
      
      toast.success(successMessage, {
        position: toastPosition,
        duration: 3000
      });

      // Sync balance to Supabase based on currency type (non-blocking, background process)
      if (food.priceType === 'gems') {
        userBalanceService.syncGemsBalance().then(() => {
          console.log('📊 Gems balance synced to Supabase after food purchase');
        }).catch((error) => {
          console.error('📊 Failed to sync gems balance after food purchase (non-critical):', error);
        });
      } else {
        userBalanceService.syncCoinsBalance().then(() => {
          console.log('📊 Coins balance synced to Supabase after food purchase');
        }).catch((error) => {
          console.error('📊 Failed to sync coins balance after food purchase (non-critical):', error);
        });
      }

      // Log food purchase to Supabase (separate API call)
      systemLogsHelper.logFoodPurchase(
        food.id,
        food.name,
        quantity,
        totalCost,
        food.priceType as 'coins' | 'gems',
        transactionHash
      ).then(() => {
        console.log('📝 Food purchase logged to Supabase');
      }).catch((error) => {
        console.error('📝 Failed to log food purchase (non-critical):', error);
      });

      return true;
      
    } catch (error) {
      console.error("🛒 [MarketPurchase] Error:", error);
      
      // Revert optimistic update on error
      const currentPlayer = useAppStore.getState().player;
      if (currentPlayer) {
        const revertedPlayer = food.priceType === 'gems'
          ? {
              ...currentPlayer,
              total_gems: currentPlayer.total_gems + totalCost // Add back the gems
            }
          : {
              ...currentPlayer,
              total_coins: currentPlayer.total_coins + totalCost // Add back the coins
            };

        const currencyField = food.priceType === 'gems' ? 'total_gems' : 'total_coins';

        console.log("↩️ [MarketPurchase] Reverting optimistic update:", {
          currency: food.priceType,
          before: currentPlayer[currencyField],
          after: revertedPlayer[currencyField],
          refunded: totalCost
        });

        useAppStore.getState().setPlayer(revertedPlayer);
      }
      
      toast.error("Purchase failed. Please try again.", { 
        position: toastPosition,
        duration: 4000
      });
      return false;
    } finally {
      setIsPurchasing(false);
    }
  };

  return {
    purchaseFood,
    isPurchasing,
    canPurchase
  };
};