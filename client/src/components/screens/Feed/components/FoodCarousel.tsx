import { useRef } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { FoodCarouselProps } from '../../../types/feed.types';
import { SLIDER_SETTINGS, CAROUSEL_STYLES } from '../../../../constants/feed.constants';
import { FoodItem } from './FoodItem';
import ArrowLeftIcon from '../../../../assets/icons/extras/icon-arrow-left.webp';
import ArrowRightIcon from '../../../../assets/icons/extras/icon-arrow-right.webp';

export const FoodCarousel = ({
  foods,
  isDragging,
  isDisabled = false, 
  onDragStart,
  onDrag,
  onDragEnd
}: FoodCarouselProps) => {
  const sliderRef = useRef<Slider>(null);

  // Dynamic infinite setting based on number of items
  // Prevents duplication issues when there are few items
  const shouldInfiniteScroll = foods.length > 3;

  // Enhanced slider settings with disabled state and dynamic infinite
  const sliderSettings = {
    ...SLIDER_SETTINGS,
    infinite: shouldInfiniteScroll, // Dynamic based on item count
    touchMove: !isDragging && !isDisabled, // Disable touch when disabled
    swipe: !isDragging && !isDisabled,     // Disable swipe when disabled
    draggable: !isDragging && !isDisabled, // Disable dragging when disabled
    slidesToShow: Math.min(3, foods.length), // Never show more slides than items
    slidesToScroll: Math.min(3, foods.length), // Adjust scroll amount too
  };

  const goToPrevious = () => {
    if (!isDisabled) {
      sliderRef.current?.slickPrev();
    }
  };

  const goToNext = () => {
    if (!isDisabled) {
      sliderRef.current?.slickNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: isDisabled ? 0.5 : 1, // Dim when disabled
        y: 0 
      }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className={`fixed bottom-[calc(theme(spacing.16)+0.5rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 ${
        isDisabled ? 'pointer-events-none' : '' // Disable pointer events when disabled
      }`}
    >
      <div className="flex items-center justify-center space-x-2 px-2">
        {/* Previous Button */}
        <motion.button
          onClick={goToPrevious}
          disabled={isDisabled}
          whileHover={!isDisabled ? { scale: 1.1 } : {}} // No hover effect when disabled
          whileTap={!isDisabled ? { scale: 0.95 } : {}}  // No tap effect when disabled
          className={`p-1 sm:p-1 z-40 flex items-center justify-center transition-opacity ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <img 
            src={ArrowLeftIcon} 
            alt="Previous" 
            className="h-8 w-8 sm:h-10 sm:w-12 md:h-12 md:w-12"
          />
        </motion.button>

        {/* Carousel Container */}
        <div className={`w-[22rem] h-28 max-w-[calc(100vw-120px)] relative ${
          isDisabled ? 'overflow-hidden' : ''
        }`}>
          <Slider ref={sliderRef} {...sliderSettings}>
            {foods.map((food) => (
              <FoodItem
                key={food.id}
                food={food}
                isDragging={isDragging}
                draggedFood={null} // This should be passed from parent
                isDisabled={isDisabled}
                onDragStart={onDragStart}
                onDrag={onDrag}
                onDragEnd={onDragEnd}
              />
            ))}
          </Slider>
          
          {/* Disabled overlay */}
          {isDisabled && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center z-10">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Next Button */}
        <motion.button
          onClick={goToNext}
          disabled={isDisabled}
          whileHover={!isDisabled ? { scale: 1.1 } : {}} // No hover effect when disabled
          whileTap={!isDisabled ? { scale: 0.95 } : {}}  // No tap effect when disabled
          className={`p-1 sm:p-1 z-40 flex items-center justify-center transition-opacity ${
            isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          <img 
            src={ArrowRightIcon} 
            alt="Next" 
            className="h-8 w-8 sm:h-11 sm:w-12 md:h-12 md:w-12"
          />
        </motion.button>
      </div>

      {/* Custom Carousel Dots Styling */}
      <style>{CAROUSEL_STYLES}</style>
    </motion.div>
  );
};