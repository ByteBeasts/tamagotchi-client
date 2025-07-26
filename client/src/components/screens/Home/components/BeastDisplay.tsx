import { motion } from "framer-motion";
import { BeastHomeDisplayProps } from "../../../types/home.types";
import { SpeechBubble } from "./SpeechBubble";

const beastAnimation = {
  initial: { scale: 0.3, opacity: 0, rotate: -15 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
      delay: 0.6,
      scale: { delay: 0.6, duration: 0.5 },
      opacity: { delay: 0.6, duration: 0.4 },
    },
  },
  whileHover: { scale: 1.03, rotate: 2 },
};

export const BeastHomeDisplay = ({ 
  beastImage, 
  altText, 
  speechMessage, 
  showSpeech, 
  onSpeechComplete 
}: BeastHomeDisplayProps) => {
  return (
    <div className="flex-grow flex items-center justify-center w-full pointer-events-none select-none z-0 relative">
      <div className="relative flex flex-col items-center w-full">
        {/* Speech Bubble */}
        <div className="relative" style={{ width: '65%' }}>
          <SpeechBubble 
            message={speechMessage || ''} 
            isVisible={showSpeech || false}
            onComplete={onSpeechComplete}
          />
        </div>
        
        {/* Beast Image */}
        <motion.img
          src={beastImage}
          alt={altText}
          className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-[280px] lg:w-[280px] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] pointer-events-auto"
          initial={beastAnimation.initial}
          animate={beastAnimation.animate}
          whileHover={beastAnimation.whileHover}
        />
      </div>
    </div>
  );
};