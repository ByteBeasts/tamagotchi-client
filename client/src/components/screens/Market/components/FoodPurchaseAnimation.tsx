import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import type { Engine, Container, IOptions, RecursivePartial } from "@tsparticles/engine"
import { MoveDirection } from "@tsparticles/engine"
import { loadSlim } from "@tsparticles/slim"

// Status icons
import energyIcon from "../../../../assets/icons/tobBar/icon-energy.webp";
import hungerIcon from "../../../../assets/icons/tobBar/icon-hungry.webp";
import happyIcon from "../../../../assets/icons/tobBar/icon-happy.webp";

// Types
import { MarketFoodItem, FOOD_CATEGORIES_CONFIG, BeastType, BEAST_FAVORITE_FOODS } from "../../../../constants/foodMarket.constants";

// Beast display hook to get current beast type
import { useBeastDisplay } from "../../../../dojo/hooks/useBeastDisplay";

interface FoodPurchaseAnimationProps {
  food: MarketFoodItem;
  quantity: number;
  onClose: () => void;
}

/**
 * Success animation for food purchases
 * Shows food with particles and celebration effects
 */
export function FoodPurchaseAnimation({ food, quantity, onClose }: FoodPurchaseAnimationProps): JSX.Element | null {
  const [engineLoaded, setEngineLoaded] = useState(false)
  
  // Get current beast type to determine stat increments - MUST be before any conditional returns
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

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      // ✅ Load slim version instead of full
      await loadSlim(engine)
    }).then(() => setEngineLoaded(true))
  }, [])

  // Effect to automatically close after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  // Play purchase success sound
  useEffect(() => {
    const audio = new Audio("/purchase-success.mp3")
    audio.volume = 0.5
    audio.play().catch((err) => console.log("Audio play failed:", err))
    return () => {
      audio.pause()
      audio.currentTime = 0
    }
  }, [])

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log("Food purchase confetti particles loaded", container)
  }

  // ✅ Updated particles configuration for slim version
  const options = useMemo<RecursivePartial<IOptions>>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: { 
          value: 80, 
          density: { 
            enable: true, 
            width: 1920,
            height: 1080
          } 
        },
        color: {
          value: ["#10B981", "#F59E0B", "#DC2626", "#EC4899", "#059669"],
        },
        shape: { 
          type: "circle" 
        },
        opacity: {
          value: { min: 0.1, max: 0.8 },
          animation: { 
            enable: true, 
            speed: 1, 
            startValue: "max",
            destroy: "min"
          },
        },
        size: { 
          value: { min: 3, max: 8 },
          animation: { 
            enable: false 
          } 
        },
        move: {
          enable: true,
          speed: 5,
          direction: MoveDirection.none,
          random: true,
          straight: false,
          outModes: { 
            default: "destroy",
            bottom: "destroy",
            left: "destroy",
            right: "destroy",
            top: "destroy"
          },
          attract: {
            enable: false
          }
        },
        life: {
          duration: {
            sync: false,
            value: 3
          },
          count: 1
        }
      },
      detectRetina: true,
      background: {
        color: "transparent"
      },
      interactivity: {
        detectsOn: "window",
        events: {
          resize: {
            enable: true,
            delay: 0.5
          }
        }
      },
      emitters: {
        direction: "top",
        life: {
          count: 0,
          duration: 0.1,
          delay: 0.1
        },
        rate: {
          delay: 0.05,
          quantity: 5
        },
        size: {
          width: 50,
          height: 0
        },
        position: {
          x: 50,
          y: 100
        }
      }
    }),
    []
  )

  if (!engineLoaded) return null

  const categoryConfig = FOOD_CATEGORIES_CONFIG[food.category];

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      {/* Particle background */}
      <Particles
        id="foodPurchaseParticles"
        className="absolute inset-0 z-0"
        options={options}
        particlesLoaded={particlesLoaded}
      />

      {/* Confirmation card */}
      <motion.div
        className="bg-cream p-8 rounded-xl shadow-lg z-10 flex flex-col items-center max-w-xs w-full mx-4"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ 
          scale: 1, 
          y: 0,
          transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 15
          } 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Food image with glow and bounce effect - ✅ Fixed centering */}
        <motion.div
          initial={{ rotate: -10, scale: 0.9 }}
          animate={{
            rotate: [0, -5, 5, -5, 0],
            scale: [1, 1.05, 1, 1.05, 1],
            transition: { duration: 1.5, repeat: Infinity, repeatType: "reverse" },
          }}
          className="relative w-32 h-32 mb-2 flex items-center justify-center"
        >
          <img
            src={food.image || "/placeholder.svg"}
            alt={food.name}
            className="w-16 h-16 object-contain"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement
              img.src = "/placeholder.svg?height=128&width=128"
            }}
          />
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{
              boxShadow: [
                `0 0 20px ${categoryConfig.color}50`,
                `0 0 40px ${categoryConfig.color}70`,
                `0 0 20px ${categoryConfig.color}50`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />
        </motion.div>

        {/* Success message */}
        <h2 className="font-luckiest text-xl text-primary mb-2 text-center">
          {quantity > 1 ? `${quantity}x ${food.name}` : food.name} Purchased!
          {isFavorite && (
            <span className="ml-1 text-yellow-500 text-base">⭐</span>
          )}
        </h2>

        {/* Stat increments badge */}
        <div className={`flex items-center gap-3 px-3 py-1 rounded-full mb-3 ${
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

        {/* Food description */}
        <p className="text-gray-800 font-luckiest text-center mb-3 text-sm">
          {food.description}
        </p>

        {/* Success message */}
        <motion.p
          className="text-secondary font-bold font-luckiest text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Added to your inventory!
        </motion.p>
      </motion.div>
    </motion.div>
  )
}

export default FoodPurchaseAnimation