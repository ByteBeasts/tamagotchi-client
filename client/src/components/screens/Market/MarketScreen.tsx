import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

// Market purchase hook migrated to Cavos internally

// Market purchase hook
import { useMarketPurchase } from "./hooks/useMarketPurchase";

// Layout components
import { TamagotchiTopBar } from "../../layout/TopBar";

// Shared components
import BackButton from "../../shared/BackButton";

// Background components
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";

// Market components
import { FoodCategorySection } from "./components/FoodCategorySection";
import { FoodPurchaseAnimation } from "./components/FoodPurchaseAnimation";
import { FoodInsufficientBalanceAnimation } from "./components/FoodInsufficientBalanceAnimation";

// Constants and types
import { 
  FOOD_MARKET_DATA, 
  CATEGORY_DISPLAY_ORDER,
  MarketFoodItem,
  FoodCategory,
} from "../../../constants/foodMarket.constants";

// Assets
import sellertIcon from "../../../assets/icons/market/DragonSeller.png"; 

// Screen props
import type { Screen } from "../../types/screens";

// Store
import useAppStore from "../../../zustand/store";

interface MarketScreenProps {
  onNavigation: (screen: Screen) => void;
}

export function MarketScreen({onNavigation}: MarketScreenProps) {
  // Responsive state
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  
  // Toast position based on screen size
  const position = isMobile ? 'bottom-center' : 'top-right';
  
  // Market purchase hook
  const { purchaseFood, isPurchasing, canPurchase } = useMarketPurchase({ 
    toastPosition: position 
  });
  
  // Store player data
  const storePlayer = useAppStore(state => state.player);
  
  // Market animation state
  const [selectedFood, setSelectedFood] = useState<MarketFoodItem | null>(null);
  const [purchasedQuantity, setPurchasedQuantity] = useState<number>(1);
  const [showPurchaseAnimation, setShowPurchaseAnimation] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  // Responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Static food data - no inventory integration
  const marketFoods: MarketFoodItem[] = useMemo(() => {
    return Object.values(FOOD_MARKET_DATA).map(foodData => ({
      ...foodData,
      owned: false, // Always false since we're not checking inventory
      ownedAmount: 0 // Always 0
    }));
  }, []);

  // Group foods by category
  const foodsByCategory = useMemo(() => {
    const grouped: Record<FoodCategory, MarketFoodItem[]> = {
      fruits: [],
      vegetables: [],
      meats: [],
      sweets: [],
      fast_food: []
    };

    marketFoods.forEach(food => {
      grouped[food.category].push(food);
    });

    // Sort each category by price (ascending)
    Object.keys(grouped).forEach(category => {
      grouped[category as FoodCategory].sort((a, b) => a.price - b.price);
    });

    return grouped;
  }, [marketFoods]);

  // Handle food purchase using the custom hook
  const handlePurchase = async (food: MarketFoodItem, quantity: number = 1) => {
    // Check if player can afford the item first
    if (!canPurchase(food, quantity)) {
      setSelectedFood(food);
      setShowInsufficientBalance(true);
      return;
    }

    // Execute purchase using the hook
    const success = await purchaseFood(food, quantity);
    
    if (success) {
      // Show success animation on successful purchase
      setSelectedFood(food);
      setPurchasedQuantity(quantity);
      setShowPurchaseAnimation(true);
    }
  };

  const handleCloseAnimation = () => {
    setShowPurchaseAnimation(false);
    setShowInsufficientBalance(false);
    setSelectedFood(null);
    setPurchasedQuantity(1);
  };

  return (
    <div className="relative h-screen w-full bg-screen overflow-hidden font-rubik">
      <MagicalSparkleParticles />

      {/* Back Button */}
      <BackButton onClick={() => onNavigation("feed")} 
        className="top-12 left-4 left-auto"
      />
      
      {/* Top Bar */}
      <TamagotchiTopBar 
        coins={storePlayer?.total_coins || 0}
        gems={storePlayer?.total_gems || 0}
      />

      {/* Animated banner */}
      <motion.div
        className="relative mt-12 mb-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Animated Chef Icon */}
        <motion.div
          className="absolute -top-11 right-3 z-10 w-40 h-40"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <img 
            src={sellertIcon}
            alt="Chef"
            className="object-contain"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              img.src = "/placeholder.svg?height=80&width=80"
            }}
          />
        </motion.div>

        {/* Banner */}
        <div className="bg-gold-gradient py-4 px-4 mx-4 relative rounded-[10px] shadow-md">
          <h2 className="font-luckiest text-cream text-xl sm:text-2xl lg:text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] tracking-wide text-left">
            🍽️ Food Market
          </h2>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100%-16rem)] overflow-y-auto pb-16">
        <div className="px-4 py-2">
          <div className="space-y-8">
            {CATEGORY_DISPLAY_ORDER.map(category => {
              const categoryFoods = foodsByCategory[category];
              if (categoryFoods.length === 0) return null;

              return (
                <FoodCategorySection
                  key={category}
                  category={category}
                  foods={categoryFoods}
                  onPurchase={handlePurchase}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Animations */}
      {selectedFood && (
        <>
          {showPurchaseAnimation && (
            <FoodPurchaseAnimation
              food={selectedFood}
              quantity={purchasedQuantity}
              onClose={handleCloseAnimation}
            />
          )}
          {showInsufficientBalance && (
            <FoodInsufficientBalanceAnimation
              food={selectedFood}
              currentBalance={storePlayer?.total_coins || 0}
              onClose={handleCloseAnimation}
            />
          )}
        </>
      )}

      {/* Loading indicator for transaction */}
      {isPurchasing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-cream p-6 rounded-xl shadow-lg">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="font-luckiest text-gray-800">Processing Purchase...</p>
            </div>
          </div>
        </div>
      )}

      <Toaster
        position={position}
        toastOptions={{
          className: 'font-luckiest bg-cream text-dark border border-dark rounded-[5px] shadow-lg p-4',
          error: { duration: 3000 },
          success: { duration: 3000 }
        }}
      />
    </div>
  );
}

export default MarketScreen;