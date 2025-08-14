import { motion } from "framer-motion";
import { BeastHomeDisplayProps } from "../../../types/home.types";
import editIcon from "../../../../assets/icons/profile/edit.png";

const beastAnimation = {
  initial: { scale: 0.3, opacity: 0, rotate: -15 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      delay: 0.6,
      scale: { delay: 0.6, duration: 0.5 },
      opacity: { delay: 0.6, duration: 0.4 },
    },
  },
  whileHover: { scale: 1.03, rotate: 2 },
};

export const BeastHomeDisplay = ({ beastImage, altText, beastName, onEditName }: BeastHomeDisplayProps) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center w-full pointer-events-none select-none z-0 relative">
      <motion.img
        src={beastImage}
        alt={altText}
        className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-[280px] lg:w-[280px] object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] pointer-events-auto"
        initial={beastAnimation.initial}
        animate={beastAnimation.animate}
        whileHover={beastAnimation.whileHover}
      />
      
      <motion.div 
        className="mt-4 pointer-events-auto flex items-center gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {beastName ? (
          <>
            <h2 className="text-2xl sm:text-3xl font-luckiest text-cream drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {beastName}
            </h2>
            {onEditName && (
              <button
                onClick={onEditName}
                className="p-1 hover:scale-110 transition-transform"
                aria-label="Edit beast name"
              >
                <img src={editIcon} alt="Edit name" className="w-6 h-6" />
              </button>
            )}
          </>
        ) : onEditName ? (
          <button
            onClick={onEditName}
            className="p-2"
            aria-label="Name your beast"
          >
            <img src={editIcon} alt="Name beast" className="w-10 h-10" />
          </button>
        ) : null}
      </motion.div>
    </div>
  );
};