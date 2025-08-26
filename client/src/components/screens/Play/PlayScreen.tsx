import { motion } from "framer-motion";
import { useEffect } from "react";
import { TamagotchiTopBar } from "../../layout/TopBar";
import { NavBar } from "../../layout/NavBar";
import { GameId, PlayScreenProps } from "../../types/play.types";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import playBackground from "../../../assets/backgrounds/bg-play.png";
import deadBeastBackground from "../../../assets/backgrounds/bg-dead-beast.png";
import rankingIcon from "../../../assets/icons/ranking/icon-ranking.webp";

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

        <div className="flex-grow flex flex-col items-center justify-center w-full px-6 py-8 space-y-6">
          {/* Título por encima de la imagen */}
          <h3 className="text-2xl font-bold text-white drop-shadow-lg font-luckiest text-center">
            NO BEAST TO PLAY WITH
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
            You need a beast to play mini-games
          </p>

          {/* Botón */}
          <button 
            onClick={() => onNavigation("hatch")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg font-luckiest text-lg"
          >
            🥚 Hatch New Beast
          </button>
        </div>

        {/* Navigation Bar */}
        <NavBar onNavigation={onNavigation} activeTab="play" hasLiveBeast={hasLiveBeast} />
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

      {/* Ranking Button - Top-right corner like dropdown menu */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: "easeOut" }}
        className="absolute top-32 right-4 z-50"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          onClick={() => onNavigation("gameRanking")}
          className="flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Open Rankings"
        >
          <img 
            src={rankingIcon} 
            alt="Rankings" 
            className="w-16 h-16"
          />
        </motion.button>
      </motion.div>

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
      <NavBar onNavigation={onNavigation} activeTab="play" hasLiveBeast={hasLiveBeast} />
    </div>
  );
};