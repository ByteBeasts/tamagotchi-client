import { TamagotchiTopBar } from "../../layout/TopBar";
import { useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import cleanBackground from "../../../assets/backgrounds/bg-clean.png";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import RainParticles from "./components/RainParticles";
import { CleanScreenProps } from "../../types/clean.types";

// Universal hook for beast display
import { useBeastDisplay } from "../../../dojo/hooks/useBeastDisplay";

// Music Context
import { useMusic } from "../../../context/MusicContext";

// Store
import useAppStore from "../../../zustand/store";

// Clean logic integration hook
import { useCleanLogic } from "./components/hooks/useCleanLogic";

// Components
import { CloudController } from "./components/CloudController";
import { BeastDisplay } from "./components/BeastDisplay";

// Assets
import cloudOff from "../../../assets/icons/cloud/icon-cloud.png";

export const CleanScreen = ({ 
  onNavigation,
  rainDuration = 3,
  isBeastSleeping = false
}: CleanScreenProps) => {
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
    setCurrentScreen("clean");
  }, [setCurrentScreen]);

  // Integrated clean logic hook
  const {
    isRainActive,
    handleCloudClick,
    isInteractionDisabled,
    isProcessingClean
  } = useCleanLogic(rainDuration);

  // Cloud frames for animation
  const cloudFrames = [cloudOff];

  /**
   * Handle rain complete - cleanup after animation
   */
  const handleRainComplete = useCallback(() => {
    // Additional cleanup if needed
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cyan-900 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-white">Loading your beast...</p>
        </div>
      </div>
    );
  }

  // No beast case
  if (!hasLiveBeast || !currentBeastDisplay) {
    return (
      <div 
        className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
        style={{
          backgroundImage: `url(${cleanBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <MagicalSparkleParticles />
        
        <TamagotchiTopBar
          coins={storePlayer?.total_coins || 0}
          gems={storePlayer?.total_gems || 0}
          status={{ energy: 0, hunger: 0, happiness: 0, hygiene: 0 }}
        />

        <div className="flex-grow flex items-center justify-center w-full">
          <div className="text-center space-y-6 z-10">
            <div className="text-6xl opacity-50">🧼</div>
            <h2 className="text-2xl font-luckiest text-cream drop-shadow-lg">
              No Beast to Clean!
            </h2>
            <p className="text-white/80 drop-shadow-md">
              You need a beast to use the cleaning feature
            </p>
            <button 
              onClick={() => onNavigation("home")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
      style={{
        backgroundImage: `url(${cleanBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Particle Effects */}
      <MagicalSparkleParticles />
      <RainParticles
        isActive={isRainActive}
        duration={rainDuration}
        onComplete={handleRainComplete}
      />

      {/* Top Bar */}
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

      {/* Main Content */}
      <div className="flex flex-col items-center mt-8 space-y-6 z-10 pointer-events-none select-none">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="pointer-events-auto text-center"
        >
          <h1 className="text-2xl md:text-3xl font-luckiest text-cream drop-shadow-lg">
            {isBeastSleeping ? "Your Beast is Sleeping" : "Tap the Cloud to Clean Your Beast"}
          </h1>
          {isBeastSleeping && (
            <p className="text-white/80 text-sm mt-2">
              Wake them up to clean it
            </p>
          )}
        </motion.div>
        
        {/* Cloud Controller */}
        <CloudController
          onCloudClick={handleCloudClick}
          cloudFrames={cloudFrames}
          currentFrameIndex={0}
          isCloudOn={!isInteractionDisabled}
          isAnimating={isRainActive}
          disabled={isInteractionDisabled || isBeastSleeping}
        />
        
        {/* Beast Display */}
        <BeastDisplay 
          beastImage={currentBeastDisplay.asset}
          altText={`${currentBeastDisplay.displayName} ready for cleaning`}
        />
        
        {/* Loading indicator when processing */}
        {isProcessingClean && !isRainActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto"></div>
          </motion.div>
        )}

      </div>
    </div>
  );
};