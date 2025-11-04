import { motion } from "framer-motion";
import { ActionButtonsProps } from "../../../types/home.types";

const buttonInteractionProps = {
  whileHover: { scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 15 } },
  whileTap: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

export const ActionButtons = ({ onHabitsClick }: ActionButtonsProps) => {
  return (
    <motion.button
      onClick={onHabitsClick}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0, transition: { delay: 0.45, duration: 0.5, ease: "easeOut" } }}
      {...buttonInteractionProps}
      className="fixed bottom-[calc(theme(spacing.16)+0.75rem+env(safe-area-inset-bottom))] right-3 sm:right-4 md:right-5 lg:right-6 z-30 p-3 bg-cream/80 rounded-full focus:outline-none active:scale-90"
      aria-label="Open Habits"
    >
      <span className="text-4xl sm:text-5xl md:text-6xl">🎯</span>
    </motion.button>
  );
};