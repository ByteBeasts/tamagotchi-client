import { motion } from "framer-motion";
import { PlayerInfoSectionProps } from "../../../types/home.types";
import { DropdownMenu } from "./DropDownMenu";
import bannerImg from "../../../../assets/banners/banner-dragon.webp";
import treeOfLifeIcon from "../../../../assets/icons/age/icon-age-tree-of-life.webp";

const buttonInteractionProps = {
  whileHover: { scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 15 } },
  whileTap: { scale: 0.95, transition: { type: "spring", stiffness: 400, damping: 20 } },
};

export const PlayerInfoSection = ({
  playerName,
  age,
  onProfileClick,
  onNavigateLogin,
}: PlayerInfoSectionProps) => {
  return (
    <div className="w-full px-4 md:px-6 lg:px-8 flex justify-between items-start mt-3 md:mt-4 z-10">
      {/* Left: Banner & Player Name */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0, transition: { delay: 0.2, duration: 0.5, ease: "easeOut" } }}
        className="flex flex-col items-center space-y-1 md:space-y-1.5"
      >
        <motion.button
          onClick={onProfileClick}
          {...buttonInteractionProps}
          className="focus:outline-none active:scale-95"
          aria-label="Player Profile"
        >
          <img src={bannerImg} alt="Profile Banner" className="h-16 sm:h-20 md:h-24 w-auto" />
        </motion.button>
        <p className="text-sm md:text-base font-rubik text-cream font-semibold select-none drop-shadow-sm">
          {playerName}
        </p>
      </motion.div>

      {/* Right: Age & Dropdown */}
      <div className="flex items-center space-x-3 md:space-x-4 lg:space-x-5 pt-1">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.3, duration: 0.5, ease: "easeOut" } }}
          className="flex items-center space-x-1 md:space-x-1.5"
        >
          <img src={treeOfLifeIcon} alt="Tree of Life" className="h-10 w-10 lg:h-12 lg:w-12" />
          <span className="text-xl md:text-2xl lg:text-3xl font-luckiest text-cream select-none">
            {age}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.35, duration: 0.5, ease: "easeOut" } }}
          className="z-50"
        >
          <DropdownMenu 
            onNavigateLogin={onNavigateLogin}
          />
        </motion.div>
      </div>
    </div>
  );
};
