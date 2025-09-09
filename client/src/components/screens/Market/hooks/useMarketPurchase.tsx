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
      
      // Optimistic update: immediately reduce coins in the store
      const currentPlayer = useAppStore.getState().player;
      if (currentPlayer) {
        const optimisticPlayer = {
          ...currentPlayer,
          total_coins: Math.max(0, currentPlayer.total_coins - totalCost)
        };
        
        console.log("🔮 [MarketPurchase] Optimistic update:", {
          before: currentPlayer.total_coins,
          after: optimisticPlayer.total_coins,
          spent: totalCost,
          quantity: quantity
        });
        
        // Update store immediately (optimistic)
        useAppStore.getState().setPlayer(optimisticPlayer);
      }
      
      // Execute blockchain transaction using Cavos
      const contractAddresses = getContractAddresses();
      
      const calls = [{
        contractAddress: contractAddresses.player,
        entrypoint: 'add_or_update_food_amount',
        calldata: [
          food.id.toString(),      // food ID
          quantity.toString(),     // amount (buying specified quantity)
          totalCost.toString()     // total price in coins
        ]
      }];
      
      console.log('🛒 Executing purchase transaction...', {
        food: food.name,
        quantity: quantity,
        unitPrice: food.price,
        totalPrice: totalCost,
        coins_before: storePlayer?.total_coins
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
        console.log("💰 [MarketPurchase] Player coins before refetch:", currentPlayerBeforeRefetch?.total_coins);
        
        await refetchPlayer();
        await refetchFoodInventory();
        
        // Log after refetch to see what happened
        const currentPlayerAfterRefetch = useAppStore.getState().player;
        console.log("💰 [MarketPurchase] Player coins after refetch:", currentPlayerAfterRefetch?.total_coins);
        console.log("🍎 [MarketPurchase] Food inventory refreshed after purchase");
        
        // If blockchain hasn't processed yet, keep optimistic state
        if (currentPlayerAfterRefetch && currentPlayerBeforeRefetch && 
            currentPlayerAfterRefetch.total_coins > currentPlayerBeforeRefetch.total_coins) {
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
      
      return true;
      
    } catch (error) {
      console.error("🛒 [MarketPurchase] Error:", error);
      
      // Revert optimistic update on error
      const currentPlayer = useAppStore.getState().player;
      if (currentPlayer) {
        const revertedPlayer = {
          ...currentPlayer,
          total_coins: currentPlayer.total_coins + totalCost // Add back the coins
        };
        
        console.log("↩️ [MarketPurchase] Reverting optimistic update:", {
          before: currentPlayer.total_coins,
          after: revertedPlayer.total_coins,
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