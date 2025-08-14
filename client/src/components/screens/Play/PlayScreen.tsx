import { motion } from "framer-motion";
import { useEffect } from "react";
import { TamagotchiTopBar } from "../../layout/TopBar";
import { NavBar } from "../../layout/NavBar";
import { GameId, PlayScreenProps } from "../../types/play.types";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import playBackground from "../../../assets/backgrounds/bg-play.png";

// Universal hook for beast display
import { useBeastDisplay } from "../../../dojo/hooks/useBeastDisplay";

// Music Context
import { useMusic } from "../../../context/MusicContext";

// Store
import useAppStore from "../../../zustand/store";

// Data
import { isGameAvailable, getAvailableGames } from "./components/data/miniGames";

// Components
import { BeastPlayDisplay } from "./components/BeastDisplay";
import { GameCarousel } from "./components/GameCarousel";

export const PlayScreen = ({ onNavigation, isBeastSleeping = false }: PlayScreenProps) => {
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
    setCurrentScreen("play");
  }, [setCurrentScreen]);

  const handleMiniGameSelect = (gameId: GameId) => {
    console.log(`Selected mini-game: ${gameId}`);
    
    // Block game selection if beast is sleeping
    if (isBeastSleeping) {
      console.warn('Cannot play games while beast is sleeping');
      return;
    }
    
    // Check if game is available
    if (!isGameAvailable(gameId)) {
      console.warn(`Game ${gameId} is not available`);
      return;
    }

    // Navigate to game screen with the selected game
    onNavigation("game", gameId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-900 to-blue-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
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
          backgroundImage: `url(${playBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <MagicalSparkleParticles />
        
        {/* Top Bar with empty status */}
        <TamagotchiTopBar
          coins={storePlayer?.total_coins || 0}
          gems={storePlayer?.total_gems || 0}
          status={{ energy: 0, hunger: 0, happiness: 0, hygiene: 0 }}
        />

        <div className="flex-grow flex items-center justify-center w-full">
          <div className="text-center space-y-6 z-10">
            <div className="text-6xl opacity-50">🎮</div>
            <h2 className="text-2xl font-luckiest text-cream drop-shadow-lg">
              No Beast to Play With!
            </h2>
            <p className="text-white/80 drop-shadow-md">
              You need a beast to play mini-games
            </p>
            <button 
              onClick={() => onNavigation("hatch")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              Hatch New Beast
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <NavBar onNavigation={onNavigation} activeTab="play" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
      style={{
        backgroundImage: `url(${playBackground})`,
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

      {/* Play Title - Dynamic with beast's name */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mt-4 z-10 text-center"
      >
        <h1 className="text-2xl md:text-3xl font-luckiest text-cream drop-shadow-lg">
          {isBeastSleeping ? "Your Beast is Sleeping" : "Play With Your Beast"}
        </h1>
        {isBeastSleeping && (
          <p className="text-white/80 text-sm mt-2">
            Wake them up to play
          </p>
        )}
      </motion.div>

      {/* Center: Beast Display - Using the player's real beast image */}
      <BeastPlayDisplay 
        beastImage={currentBeastDisplay.asset}
        altText={`${currentBeastDisplay.displayName} ready to play`}
      />

      {/* Mini-Games Carousel */}
      <GameCarousel 
        games={getAvailableGames()}
        onGameSelect={handleMiniGameSelect}
      />

      {/* Navigation Bar */}
      <NavBar onNavigation={onNavigation} activeTab="play" />
    </div>
  );
};