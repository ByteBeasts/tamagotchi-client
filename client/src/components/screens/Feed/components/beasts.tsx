import { motion } from "framer-motion";
import { FOOD_UI_CONFIG } from '../../../../constants/feed.constants';

// Fallback image for when beast image is not available
import babyWolfBeast from "../../../../assets/beasts/baby-wolf.webp";

// Props interface for Beast component
interface BeastAnimationProps {
  isDragging: boolean;
  isFeeding?: boolean; 
  beastImage?: string;
  beastName?: string;
}

/**
 * Beast component that displays the player's beast and acts as a drop zone for food items
 * Receives beast data as props to avoid multiple hook consumptions
 * Supports feeding animations and visual feedback
 */
export const Beast = ({ 
  isDragging, 
  isFeeding = false, // NEW: Default to false
  beastImage, 
  beastName 
}: BeastAnimationProps) => {
  
  // Enhanced animation configuration for the beast
  const beastAnimation = {
    initial: { scale: 0.8, opacity: 0 },
    animate: {
      scale: isDragging ? 1.1 : isFeeding ? 1.05 : 1, // Different scales for different states
      opacity: 1,
      rotate: isFeeding ? [0, -2, 2, -2, 0] : 0, // Gentle shake when feeding
      transition: {
        type: "spring",
        stiffness: isFeeding ? 200 : 150, // More responsive when feeding
        damping: isFeeding ? 15 : 12,
        rotate: isFeeding ? {
          repeat: Infinity,
          duration: 0.5,
          ease: "easeInOut"
        } : {}
      },
    },
    whileHover: { 
      scale: isDragging ? 1.15 : isFeeding ? 1.08 : 1.05 // Slight scale on hover
    },
  };

  // Use provided beast image or fallback to default
  const finalBeastImage = beastImage || babyWolfBeast;
  const finalBeastAltText = beastName || "Tamagotchi Beast";

  return (
    <div className="flex-grow flex items-center justify-center w-full relative" style={{ zIndex: 5 }}>
      <motion.div
        id={FOOD_UI_CONFIG.BEAST_DROP_ZONE_ID} // ID used for drop detection in feeding logic
        className="relative"
      >
        {/* Beast Image */}
        <motion.img
          src={finalBeastImage}
          alt={finalBeastAltText}
          className={`h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-[280px] lg:w-[280px] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] relative transition-all duration-300 ${
            isFeeding ? 'brightness-110 saturate-110' : '' // Brighten when feeding
          }`}
          style={{ zIndex: 7 }}
          initial={beastAnimation.initial}
          animate={beastAnimation.animate}
          whileHover={beastAnimation.whileHover}
        />

        {/* Drag Target Indicator */}
        {isDragging && !isFeeding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 border-4 border-dashed border-yellow-400 rounded-full bg-yellow-400/10 backdrop-blur-sm flex items-center justify-center z-8"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="text-yellow-400 text-4xl font-bold drop-shadow-lg"
            >
              🎯
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};