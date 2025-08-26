import { motion } from "framer-motion";
import Slider from "react-slick";
import { GameCarouselProps } from "../../../types/play.types";
import { useGameCarousel } from "./hooks/useGameCarousel";
import { GAME_CAROUSEL_STYLES } from "./config/carousel.config";
import ArrowLeftIcon from "../../../../assets/icons/extras/icon-arrow-left.webp";
import ArrowRightIcon from "../../../../assets/icons/extras/icon-arrow-right.webp";

export const GameCarousel = ({ games, onGameSelect }: GameCarouselProps) => {
  const {
    sliderRef,
    sliderSettings,
    goToPrevious,
    goToNext,
    hasMultipleGames
  } = useGameCarousel(games);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.8, duration: 0.6, ease: "easeOut" } }}
      className="w-full max-w-sm px-2 pb-32 z-10"
    >
      <div className="flex items-center justify-center space-x-1">
        {/* Previous Button */}
        {hasMultipleGames && (
          <motion.button
            onClick={goToPrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="z-40 flex items-center justify-center"
          >
            <img 
              src={ArrowLeftIcon} 
              alt="Previous" 
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
            />
          </motion.button>
        )}

        {/* Carousel Container */}
        <div className="w-full max-w-[280px] h-32">
          <Slider ref={sliderRef} {...sliderSettings}>
            {games.map((game) => (
              <div key={game.id} className="px-2">
                <div
                  onClick={() => onGameSelect(game.id)}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <motion.div 
                    className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-3"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={game.icon}
                      alt={game.title}
                      className="w-16 h-16 md:w-20 md:h-20 object-contain"
                    />
                  </motion.div>
                  <p className="text-sm md:text-base font-rubik font-semibold text-cream text-center drop-shadow-sm">
                    {game.title}
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>

        {/* Next Button */}
        {hasMultipleGames && (
          <motion.button
            onClick={goToNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="z-40 flex items-center justify-center"
          >
            <img 
              src={ArrowRightIcon} 
              alt="Next" 
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14"
            />
          </motion.button>
        )}
      </div>

      {/* Custom Carousel Dots Styling */}
      <style>{GAME_CAROUSEL_STYLES}</style>
    </motion.div>
  );
};