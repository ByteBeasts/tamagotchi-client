import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import type { Engine, Container, IOptions, RecursivePartial } from "@tsparticles/engine"
import { MoveDirection } from "@tsparticles/engine"
import { loadSlim } from "@tsparticles/slim"

// Types
import { MarketFoodItem, FOOD_CATEGORIES_CONFIG } from "../../../../constants/foodMarket.constants";

interface FoodPurchaseAnimationProps {
  food: MarketFoodItem;
  onClose: () => void;
}

/**
 * Success animation for food purchases
 * Shows food with particles and celebration effects
 */
export function FoodPurchaseAnimation({ food, onClose }: FoodPurchaseAnimationProps): JSX.Element | null {
  const [engineLoaded, setEngineLoaded] = useState(false)

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
  
  const healthinessColors: Record<number, string> = {
    1: "bg-red-600",        // Unhealthy
    2: "bg-orange-500",     // Poor  
    3: "bg-yellow-500",     // Okay
    4: "bg-emerald",        // Good - using your emerald variable
    5: "bg-emerald",        // Excellent - using your emerald variable
  }
  const healthinessColor = healthinessColors[food.healthiness] || "bg-gray-500";

  const healthinessText: Record<number, string> = {
    1: "Unhealthy",
    2: "Poor",
    3: "Okay", 
    4: "Good",
    5: "Excellent",
  }
  const healthinessLabel = healthinessText[food.healthiness] || "Unknown";

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
          className="relative w-32 h-32 mb-4 flex items-center justify-center"
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
          {food.name} Purchased!
        </h2>

        {/* Category and healthiness badges */}
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`inline-block ${healthinessColor} text-cream font-bold tracking-wide rounded-full px-3 py-1 text-sm`}
          >
            {healthinessLabel}
          </span>
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