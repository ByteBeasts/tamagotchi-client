import { motion } from "framer-motion"
import { FoodCard } from "./FoodCard"

// Types
import { MarketFoodItem, FoodCategory, FOOD_CATEGORIES_CONFIG } from "../../../../constants/foodMarket.constants";

interface FoodCategorySectionProps {
  category: FoodCategory
  foods: MarketFoodItem[]
  onPurchase: (food: MarketFoodItem, quantity: number) => void
}

/**
 * Food category section component
 * Groups foods by category with animated header and grid
 */
export function FoodCategorySection({ category, foods, onPurchase }: FoodCategorySectionProps) {
  const categoryConfig = FOOD_CATEGORIES_CONFIG[category];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const sectionHeader = {
    hidden: { x: -50, opacity: 0 },
    show: { x: 0, opacity: 1 }
  }

  return (
    <motion.div 
      className="mb-8"
      initial="hidden"
      animate="show"
      variants={container}
    >
      {/* Category Header */}
      <motion.div 
        className="flex items-center gap-3 mb-4"
        variants={sectionHeader}
      >
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md"
          style={{ backgroundColor: categoryConfig.color + '20', border: `2px solid ${categoryConfig.color}` }}
        >
          {categoryConfig.emoji}
        </div>
        <div>
          <h3 className="font-luckiest text-xl text-cream mb-1">
            {categoryConfig.name}
          </h3>
          <p className="text-sm text-text-secondary opacity-80">
            {categoryConfig.description}
          </p>
        </div>
      </motion.div>

      {/* Foods Grid */}
      <motion.div variants={container}>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onPurchase={(quantity) => onPurchase(food, quantity)}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}