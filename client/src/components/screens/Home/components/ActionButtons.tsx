import { motion } from "framer-motion";
import { ActionButtonsProps } from "../../../types/home.types";
//import dailyQuestIcon from "../../../../assets/icons/daily-quests/icon-daily-quests.png";
import shopIcon from "../../../../assets/icons/shop/icon-food-shop.webp";

const buttonInteractionProps = {
  whileHover: { scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 15 } },
  whileTap: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

export const ActionButtons = ({ onShopClick }: ActionButtonsProps) => {
//export const ActionButtons = ({ onShopClick, onDailyQuestsClick }: ActionButtonsProps) => {
 
  return (
    <>
      {/* Shop Button (enters from left) */}
      <motion.button
        onClick={onShopClick}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.4, duration: 0.5, ease: "easeOut" } }}
        {...buttonInteractionProps}
        className="fixed bottom-[calc(theme(spacing.16)+0.75rem+env(safe-area-inset-bottom))] left-3 sm:left-4 md:left-5 lg:left-6 z-30 p-3 bg-cream/80 rounded-full focus:outline-none active:scale-90"
        aria-label="Open Shop"
      >
        <img src={shopIcon} alt="Shop" className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16" />
      </motion.button>

      {/* Daily Quests Button (enters from right) */}
      {/* <motion.button
        onClick={onDailyQuestsClick}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.45, duration: 0.5, ease: "easeOut" } }}
        {...buttonInteractionProps}
        className="fixed bottom-[calc(theme(spacing.16)+0.75rem+env(safe-area-inset-bottom))] right-3 sm:right-4 md:right-5 lg:right-6 z-30 p-3 bg-cream/80 rounded-full focus:outline-none active:scale-90"
        aria-label="Open Daily Quests"
      >
        <img src={dailyQuestIcon} alt="Daily Quests" className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16" />
      </motion.button> */}
    </>
  );
};