import { motion } from "framer-motion"
import coinIcon from "../../../../assets/icons/coins/icon-coin-single.webp"

// Types
import { MarketFoodItem, BeastType, BEAST_FAVORITE_FOODS } from "../../../../constants/foodMarket.constants";

// Beast display hook to get current beast type
import { useBeastDisplay } from "../../../../dojo/hooks/useBeastDisplay";

interface FoodCardProps {
  food: MarketFoodItem
  onPurchase: () => void
}

/**
 * Individual food card component for the marketplace
 * Displays food info, price, and purchase button with stat increments
 */
export function FoodCard({ food, onPurchase }: FoodCardProps) {
  // Get current beast type to determine stat increments
  const { liveBeast } = useBeastDisplay();
  const currentBeastType = (liveBeast?.beast_type || 1) as BeastType;
  
  // Get stat increments for this food based on current beast type
  const statIncrements = food.statIncrements?.[currentBeastType] || {
    hunger: 4,
    happiness: 4,
    energy: 2
  };
  
  // Check if this food is a favorite for the current beast
  const isFavorite = BEAST_FAVORITE_FOODS[currentBeastType]?.includes(food.id) || false;

  const item = {
    hidden: { y: 20, opacity: 0 },
    show:   { y: 0,  opacity: 1 },
  }

  return (
    <motion.div
      className="bg-cream p-4 rounded-xl shadow-md flex flex-col items-center"
      variants={item}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Food image - Using transform scale to enlarge it */}
      <div className="h-32 flex items-center justify-center mb-2 overflow-visible">
        <div className="transform scale-150">
          <img
            src={food.image || "/placeholder.svg"}
            alt={food.name}
            className="w-12 h-12 object-contain"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              img.src = "/placeholder.svg?height=128&width=128"
            }}
          />
        </div>
      </div>

      {/* Name */}
      <h3 className="font-luckiest text-lg text-gray-800 mb-1 text-center">
        {food.name}
        {isFavorite && (
          <span className="ml-1 text-yellow-500 text-sm">⭐</span>
        )}
      </h3>

      {/* Stat increments */}
      <div className="flex gap-2 mb-2">
        <span className="bg-orange-500 text-cream font-bold text-xs rounded-full px-2 py-0.5">
          +{statIncrements.hunger} 🍖
        </span>
        <span className="bg-pink-500 text-cream font-bold text-xs rounded-full px-2 py-0.5">
          +{statIncrements.happiness} 😊
        </span>
        <span className="bg-blue-500 text-cream font-bold text-xs rounded-full px-2 py-0.5">
          +{statIncrements.energy} ⚡
        </span>
      </div>

      {/* Description */}
      <p className="font-luckiest text-sm text-gray-800 mb-3 text-center h-12 overflow-hidden leading-tight">
        {food.description}
      </p>

      {/* Purchase button - Always "Buy" */}
      <motion.button
        onClick={onPurchase}
        className="btn-cr-store w-full flex items-center justify-center gap-2"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <span>Buy</span>
        <img src={coinIcon} alt="Coin" className="h-5 w-5" />
        <span>{food.price}</span>
      </motion.button>
      </motion.div>
    )
  }