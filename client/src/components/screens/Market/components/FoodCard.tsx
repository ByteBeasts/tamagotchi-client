import { useState } from "react"
import { motion } from "framer-motion"
import coinIcon from "../../../../assets/icons/coins/icon-coin-single.webp"

// Status icons
import energyIcon from "../../../../assets/icons/tobBar/icon-energy.png";
import hungerIcon from "../../../../assets/icons/tobBar/icon-hungry.png";
import happyIcon from "../../../../assets/icons/tobBar/icon-happy.png";

// Quantity selector icons
import minusIcon from "../../../../assets/icons/extras/icon-minus.png";
import plusIcon from "../../../../assets/icons/extras/icon-plus.png";

// Types
import { MarketFoodItem, BeastType, BEAST_FAVORITE_FOODS } from "../../../../constants/foodMarket.constants";

// Beast display hook to get current beast type
import { useBeastDisplay } from "../../../../dojo/hooks/useBeastDisplay";

interface FoodCardProps {
  food: MarketFoodItem
  onPurchase: (quantity: number) => void
}

/**
 * Individual food card component for the marketplace
 * Displays food info, price, and purchase button with stat increments
 */
export function FoodCard({ food, onPurchase }: FoodCardProps) {
  // Quantity state - minimum 1, maximum 10
  const [quantity, setQuantity] = useState(1);
  
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
  
  // Calculate total price
  const totalPrice = food.price * quantity;
  
  // Handle quantity changes
  const increaseQuantity = () => {
    if (quantity < 10) setQuantity(quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

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

      {/* Stat increments - Single badge */}
      <div className={`flex items-center gap-3 px-3 py-1 rounded-full mb-2 ${
        isFavorite 
          ? 'bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-400' 
          : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-300'
      }`}>
        <div className="flex items-center gap-1">
          <img src={hungerIcon} alt="Hunger" className="w-4 h-4" />
          <span className="text-xs font-bold text-gray-700">+{statIncrements.hunger}</span>
        </div>
        <div className="flex items-center gap-1">
          <img src={happyIcon} alt="Happy" className="w-4 h-4" />
          <span className="text-xs font-bold text-gray-700">+{statIncrements.happiness}</span>
        </div>
        <div className="flex items-center gap-1">
          <img src={energyIcon} alt="Energy" className="w-4 h-4" />
          <span className="text-xs font-bold text-gray-700">+{statIncrements.energy}</span>
        </div>
      </div>

      {/* Description */}
      <p className="font-luckiest text-sm text-gray-800 mb-3 text-center h-12 overflow-hidden leading-tight">
        {food.description}
      </p>

      {/* Quantity Selector */}
      <div className="flex items-center justify-center gap-3 mb-3">
        <motion.button
          onClick={decreaseQuantity}
          className="w-8 h-8 flex items-center justify-center transition-colors duration-200"
          whileTap={{ scale: 0.9 }}
          disabled={quantity <= 1}
        >
          <img src={minusIcon} alt="Decrease" className="w-6 h-6" />
        </motion.button>
        
        <div className="px-3 py-1 min-w-[50px] text-center">
          <span className="font-luckiest text-gray-800">{quantity}</span>
        </div>
        
        <motion.button
          onClick={increaseQuantity}
          className="w-8 h-8 flex items-center justify-center transition-colors duration-200"
          whileTap={{ scale: 0.9 }}
          disabled={quantity >= 10}
        >
          <img src={plusIcon} alt="Increase" className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Purchase button - Always "Buy" */}
      <motion.button
        onClick={() => onPurchase(quantity)}
        className="btn-cr-store w-full flex items-center justify-center gap-2"
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        <span>Buy</span>
        <img src={coinIcon} alt="Coin" className="h-5 w-5" />
        <span>{totalPrice}</span>
      </motion.button>
      </motion.div>
    )
  }