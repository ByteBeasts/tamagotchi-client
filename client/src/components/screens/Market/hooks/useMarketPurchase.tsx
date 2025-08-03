import { useState } from 'react';
import { toast } from 'react-hot-toast';

// Cavos transaction hook
import { useCavosTransaction } from '../../../../dojo/hooks/useCavosTransaction';
import { usePlayer } from '../../../../dojo/hooks/usePlayer';
import { getContractAddresses } from '../../../../config/cavosConfig';

// Types
import { MarketFoodItem } from '../../../../constants/foodMarket.constants';

// Store
import useAppStore from '../../../../zustand/store';

interface UseMarketPurchaseProps {
  toastPosition?: 'top-center' | 'top-right' | 'bottom-center';
}

interface UseMarketPurchaseReturn {
  purchaseFood: (food: MarketFoodItem) => Promise<boolean>;
  isPurchasing: boolean;
  canPurchase: (food: MarketFoodItem) => boolean;
}

export const useMarketPurchase = ({ 
  toastPosition = 'top-right' 
}: UseMarketPurchaseProps = {}): UseMarketPurchaseReturn => {
  const { executeTransaction } = useCavosTransaction();
  const { refetch: refetchPlayer } = usePlayer();
  
  // Get Cavos auth state and player data
  const cavosAuth = useAppStore(state => state.cavos);
  const storePlayer = useAppStore(state => state.player);
  
  const [isPurchasing, setIsPurchasing] = useState(false);

  /**
   * Check if player can purchase a food item
   */
  const canPurchase = (food: MarketFoodItem): boolean => {
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) return false;
    
    const playerBalance = storePlayer?.total_coins || 0;
    return playerBalance >= food.price;
  };

  /**
   * Purchase a food item from the market
   */
  const purchaseFood = async (food: MarketFoodItem): Promise<boolean> => {
    // Validation checks
    if (!cavosAuth.isAuthenticated || !cavosAuth.wallet || !cavosAuth.accessToken) {
      toast.error("Please login with ByteBeasts to make purchases", { position: toastPosition });
      return false;
    }

    if (!canPurchase(food)) {
      toast.error("Insufficient coins for this purchase", { position: toastPosition });
      return false;
    }

    if (isPurchasing) {
      toast.error("Please wait for the current purchase to complete", { position: toastPosition });
      return false;
    }

    try {
      setIsPurchasing(true);
      
      // Optimistic update: immediately reduce coins in the store
      const currentPlayer = useAppStore.getState().player;
      if (currentPlayer) {
        const optimisticPlayer = {
          ...currentPlayer,
          total_coins: Math.max(0, currentPlayer.total_coins - food.price)
        };
        
        console.log("🔮 [MarketPurchase] Optimistic update:", {
          before: currentPlayer.total_coins,
          after: optimisticPlayer.total_coins,
          spent: food.price
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
          '1',                     // amount (buying 1 unit)
          food.price.toString()    // price in coins
        ]
      }];
      
      console.log('🛒 Executing purchase transaction...', {
        food: food.name,
        price: food.price,
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
        
        // Log after refetch to see what happened
        const currentPlayerAfterRefetch = useAppStore.getState().player;
        console.log("💰 [MarketPurchase] Player coins after refetch:", currentPlayerAfterRefetch?.total_coins);
        
        // If blockchain hasn't processed yet, keep optimistic state
        if (currentPlayerAfterRefetch && currentPlayerBeforeRefetch && 
            currentPlayerAfterRefetch.total_coins > currentPlayerBeforeRefetch.total_coins) {
          console.log("⚠️ [MarketPurchase] Blockchain not processed yet, keeping optimistic state");
          useAppStore.getState().setPlayer(currentPlayerBeforeRefetch);
        }
      }, 8000); // Wait 8 seconds for Torii to process
      
      // Success notification
      toast.success(`${food.name} purchased successfully!`, { 
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
          total_coins: currentPlayer.total_coins + food.price // Add back the coins
        };
        
        console.log("↩️ [MarketPurchase] Reverting optimistic update:", {
          before: currentPlayer.total_coins,
          after: revertedPlayer.total_coins,
          refunded: food.price
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