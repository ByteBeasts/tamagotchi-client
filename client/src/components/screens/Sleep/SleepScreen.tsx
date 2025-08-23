import { TamagotchiTopBar } from "../../layout/TopBar";
import { motion } from "framer-motion";
import { useEffect } from "react";
import sleepBackground from "../../../assets/backgrounds/bg-sleep.png";
import deadBeastBackground from "../../../assets/backgrounds/bg-dead-beast.png";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import { SleepScreenProps } from "../../types/sleep.types";

// Universal hook for beast display
import { useBeastDisplay } from "../../../dojo/hooks/useBeastDisplay";

// Music Context
import { useMusic } from "../../../context/MusicContext";

// Store
import useAppStore from "../../../zustand/store";

// Main sleep logic hook
import { useSleepLogic } from "./components/hooks/useSleepLogic";

// Animation hook (kept for campfire animations)
import { useCampfireAnimation } from "./components/hooks/useCampfireAnimation";

// Components
import { CampfireController } from "./components/CampfireController";
import { BeastSleepDisplay } from "./components/BeastDisplay";

// Campfire animation assets
import extinguishedFrame0 from "../../../assets/icons/campfire/Animation/extinguished/extinguished-frame-0.png";
import extinguishedFrame1 from "../../../assets/icons/campfire/Animation/extinguished/extinguished-frame-1.png";
import extinguishedFrame2 from "../../../assets/icons/campfire/Animation/extinguished/extinguished-frame-4.png";
import extinguishedFrame3 from "../../../assets/icons/campfire/Animation/extinguished/extinguished-frame-3.png";
import extinguishedFrame4 from "../../../assets/icons/campfire/Animation/extinguished/extinguished-frame-4.png";
import extinguishedFrame5 from "../../../assets/icons/campfire/Animation/extinguished/extinguished-frame-5.png";

import litFrame0 from "../../../assets/icons/campfire/Animation/lit/lit-frame-0.png";
import litFrame1 from "../../../assets/icons/campfire/Animation/lit/lit-frame-1.png";
import litFrame2 from "../../../assets/icons/campfire/Animation/lit/lit-frame-2.png";
import litFrame3 from "../../../assets/icons/campfire/Animation/lit/lit-frame-3.png";
import litFrame4 from "../../../assets/icons/campfire/Animation/lit/lit-frame-4.png";
import litFrame5 from "../../../assets/icons/campfire/Animation/lit/lit-frame-5.png";

import trunkIcon from "../../../assets/icons/campfire/icon-trunk.png";

export const SleepScreen = ({ onNavigation }: SleepScreenProps) => {
  // Music context
  const { setCurrentScreen } = useMusic();

  // Store player data
  const storePlayer = useAppStore(state => state.player);

  // Universal hook - gets the player's current beast
  const {
    currentBeastDisplay,
    liveBeastStatus,
    hasLiveBeast,
    isLoading
  } = useBeastDisplay();

  // Set current screen for music control
  useEffect(() => {
    setCurrentScreen("sleep");
  }, [setCurrentScreen]);

  // Main sleep logic hook
  const {
    isBeastSleeping,
    isSleepTransactionInProgress,
    handleCampfireClick,
    isInteractionDisabled
  } = useSleepLogic();

  // Frame configuration
  const extinguishedFrames = [
    extinguishedFrame0,
    extinguishedFrame1,
    extinguishedFrame2,
    extinguishedFrame3,
    extinguishedFrame4,
    extinguishedFrame5,
  ];

  const litFrames = [
    litFrame0,
    litFrame1,
    litFrame2,
    litFrame3,
    litFrame4,
    litFrame5,
  ];

  // Animation hook (kept for frame cycling)
  const {
    litFrameIndex,
    extinguishedFrameIndex,
    startLitAnimation,
    startExtinguishedAnimation
  } = useCampfireAnimation({
    litFrames,
    extinguishedFrames,
    animationInterval: 700
  });

  // Current campfire state for UI
  const isCampfireOn = !isBeastSleeping; // Awake = lit, Sleeping = extinguished

  // Only start animation when beast state changes, not constantly
  useEffect(() => {
    if (isBeastSleeping) {
      startExtinguishedAnimation();
    } else {
      startLitAnimation();
    }
  }, [isBeastSleeping]);

  // Simple click handler - no animation manipulation
  const handleCampfireClickWithAnimation = async () => {
    if (isInteractionDisabled) return;
    await handleCampfireClick();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-900 to-purple-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading your beast...</p>
        </div>
      </div>
    );
  }

  // No beast case
  if (!hasLiveBeast || !currentBeastDisplay) {
    return (
      <div 
        className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden font-rubik"
        style={{
          backgroundImage: `url(${sleepBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <MagicalSparkleParticles />
        
        <div className="flex flex-col items-center justify-center space-y-6 z-10">
          {/* Título por encima de la imagen */}
          <h3 className="text-2xl font-bold text-white drop-shadow-lg font-luckiest text-center">
            BEAST NEEDS CARE
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
            Your beloved companion needs your care to return to life
          </p>
          
          {/* Botón */}
          <button 
            onClick={() => onNavigation("hatch")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg font-luckiest text-lg"
          >
            ✨ Revive Beast
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
      style={{
        backgroundImage: `url(${sleepBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Magical Sparkle Particles */}
      <MagicalSparkleParticles />

      {/* Top Bar - Using real data from liveBeastStatus */}
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

      {/* Sleep Title - Updated to show current state */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-4 z-10"
      >
        <h1 className="text-2xl md:text-3xl font-luckiest text-cream drop-shadow-lg text-center">
          {isBeastSleeping ? (
            <>Your Beast is Sleeping. Tap the campfire to Wake Them Up!</>
          ) : (
            <>Tap the campfire to Sleep Your Beast</>
          )}
        </h1>
      </motion.div>

      {/* Center: Beast and Campfire together */}
      <div className="flex-grow flex items-center justify-center w-full pointer-events-none select-none z-0 relative">
        {/* Beast Display - Using the actual image of the player's beast */}
        <BeastSleepDisplay 
          beastImage={currentBeastDisplay.asset}
          altText={`${isBeastSleeping ? 'Sleeping' : 'Awake'} ${currentBeastDisplay.displayName}`}
        />

        {/* Campfire Controller */}
        <CampfireController
          isCampfireOn={isCampfireOn}
          onCampfireClick={handleCampfireClickWithAnimation} 
          litFrames={litFrames}
          extinguishedFrames={extinguishedFrames}
          litFrameIndex={litFrameIndex}
          extinguishedFrameIndex={extinguishedFrameIndex}
          trunkImage={trunkIcon}
        />
      </div>

      {/* Loading indicator during transactions */}
      {isSleepTransactionInProgress && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30"
        >
          <div className="bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cream"></div>
          </div>
        </motion.div>
      )}
    </div>
  );
};