import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

// Layout and shared components
import { TamagotchiTopBar } from "../../layout/TopBar";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";

// Universal hook for beast display
import { useBeastDisplay } from "../../../dojo/hooks/useBeastDisplay";

// Store
import useAppStore from "../../../zustand/store";

// Music Context
import { useMusic } from "../../../context/MusicContext";

// Feed components
import { Beast } from "./components/beasts";
import { FoodCarousel } from "./components/FoodCarousel";
import { DragPortal } from "./components/DragPortal";

// Main feed logic hook (includes all food inventory + transaction logic)
import { useFeedLogic, usePortal } from "./components/hooks/useFeedLogic";
import { FeedScreenProps } from "../../types/feed.types";

// Assets
import forestBackground from "../../../assets/backgrounds/bg-home.png";
import deadBeastBackground from "../../../assets/backgrounds/bg-dead-beast.png";
import shopIcon from "../../../assets/icons/shop/icon-food-shop.webp";

export const FeedScreen = ({ onNavigation, isBeastSleeping = false }: FeedScreenProps) => {
  const constraintsRef = useRef(null);
  const portalRoot = usePortal();
  
  // Music context
  const { setCurrentScreen } = useMusic();
  
  // Store player data
  const storePlayer = useAppStore(state => state.player);
  
  // Get current beast data
  const {
    currentBeastDisplay,
    liveBeastStatus,
    hasLiveBeast,
    isLoading: beastLoading
  } = useBeastDisplay();
  
  // Set current screen for music control
  useEffect(() => {
    setCurrentScreen("feed");
  }, [setCurrentScreen]);
  
  // Get complete feeding logic (includes food inventory + transactions)
  const {
    foods,
    isLoading: foodLoading,
    dragState,
    isFeeding,
    isCarouselDisabled,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  } = useFeedLogic();

  // Computed states
  const hasFoodAvailable = foods.some(food => food.count > 0);
  const isLoading = beastLoading || foodLoading;
  
  // Enhanced drag handler that checks if beast is sleeping
  const handleDragStartWithSleepCheck = (food: any) => {
    if (isBeastSleeping) {
      // Don't start drag if beast is sleeping, but don't show any feedback
      return;
    }
    handleDragStart(food);
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-900 to-orange-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-white">
            {beastLoading ? "Loading your beast..." : "Loading your food inventory..."}
          </p>
        </div>
      </div>
    );
  }

  // Show empty state when no beast is available
  if (!hasLiveBeast || !currentBeastDisplay) {
    return (
      <div 
        ref={constraintsRef}
        className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
        style={{
          backgroundImage: `url(${forestBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <MagicalSparkleParticles />
        
        <TamagotchiTopBar
          coins={1250}
          gems={45}
          status={{ energy: 0, hunger: 0, happiness: 0, hygiene: 0 }}
        />

        <div className="flex-grow flex flex-col items-center justify-center w-full px-6 py-8 space-y-6">
          {/* Título por encima de la imagen */}
          <h3 className="text-2xl font-bold text-white drop-shadow-lg font-luckiest text-center">
            NO BEAST TO FEED
          </h3>
          
          {/* Imagen del corazón roto */}
          <div 
            className="w-full max-w-sm mx-auto"
            style={{
              backgroundImage: `url(${deadBeastBackground})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              aspectRatio: "1/1",
              height: "200px"
            }}
          />
          
          {/* Texto descriptivo por debajo de la imagen */}
          <p className="text-base text-white/90 drop-shadow-md leading-relaxed text-center max-w-xs">
            You need a beast to use the feeding feature
          </p>
          
          {/* Botón */}
          <button 
            onClick={() => onNavigation("hatch")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg font-luckiest text-lg"
          >
            🥚 Hatch New Beast
          </button>
        </div>
      </div>
    );
  }

  // Show no food available state
  if (!hasFoodAvailable) {
    return (
      <div 
        ref={constraintsRef}
        className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
        style={{
          backgroundImage: `url(${forestBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <MagicalSparkleParticles />
        
        <TamagotchiTopBar
          coins={1250}
          gems={45}
          status={{
            energy: liveBeastStatus?.energy || 0,
            hunger: liveBeastStatus?.hunger || 0,
            happiness: liveBeastStatus?.happiness || 0,
            hygiene: liveBeastStatus?.hygiene || 0
          }}
        />

        <div className="flex-grow flex items-center justify-center w-full">
          <div className="text-center space-y-6 z-10">
            <div className="text-6xl opacity-50">🍽️</div>
            <h2 className="text-2xl font-luckiest text-cream drop-shadow-lg">
              No Food Available!
            </h2>
            <p className="text-white/80 drop-shadow-md px-4">
              Go to the shop to buy more food for your beast
            </p>
            
            {/* Shop Button */}
            <motion.button
              onClick={() => onNavigation("market")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="bg-cream/90 hover:bg-cream p-4 transition-all transform hover:shadow-xl"
              aria-label="Go to Shop"
            >
              <img src={shopIcon} alt="Shop" className="h-20 w-2o" />
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  // Render main feeding interface
  return (
    <div
      ref={constraintsRef}
      className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
      style={{
        backgroundImage: `url(${forestBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* Background particle effects */}
      <MagicalSparkleParticles />

      {/* Top status bar with coins, gems, and beast stats */}
      <TamagotchiTopBar
        coins={storePlayer?.total_coins || 0}
        gems={storePlayer?.total_gems || 0}
        status={{
          energy: liveBeastStatus?.energy || 0,
          hunger: liveBeastStatus?.hunger || 0,
          happiness: liveBeastStatus?.happiness || 0,
          hygiene: liveBeastStatus?.hygiene || 0
        }}
      />

      {/* Screen title with beast name */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-4 z-10"
      >
        <h1 className="text-2xl md:text-3xl font-luckiest text-cream drop-shadow-lg text-center">
          {isBeastSleeping ? "Your Beast is Sleeping" : "Feed Your Beast"}
        </h1>
        {isBeastSleeping && (
          <p className="text-white/80 text-sm mt-2 text-center">
            Wake them up to feed it
          </p>
        )}
      </motion.div>

      {/* Shop Button - Top Right */}
      <motion.button
        onClick={() => onNavigation("market")}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="absolute top-28 right-3 sm:right-4 md:right-5 lg:right-6 z-30 p-3"
        aria-label="Open Shop"
      >
        <img src={shopIcon} alt="Shop" className="h-14 w-14 sm:h-12 sm:w-12" />
      </motion.button>

      {/* Beast display - acts as drop zone for food items */}
      <Beast 
        isDragging={dragState.isDragging}
        isFeeding={isFeeding} // NEW: Pass feeding state to beast
        beastImage={currentBeastDisplay.asset}
        beastName={currentBeastDisplay.displayName}
      />

      {/* Food carousel with draggable items */}
      <FoodCarousel
        foods={foods}
        isDragging={dragState.isDragging}
        isDisabled={isCarouselDisabled}
        onDragStart={handleDragStartWithSleepCheck}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
      />

      {/* Portal for rendering dragged food item outside normal DOM hierarchy */}
      <DragPortal
        isDragging={dragState.isDragging}
        draggedFood={dragState.draggedFood}
        portalPosition={dragState.portalPosition}
        portalRoot={portalRoot.current}
      />
    </div>
  );
};