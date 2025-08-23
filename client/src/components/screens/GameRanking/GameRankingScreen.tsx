import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { TamagotchiTopBar } from "../../layout/TopBar";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import { BackButton } from "../../shared/BackButton";
import { GameRankingTable } from "./GameRankingTable";
import playBackground from "../../../assets/backgrounds/bg-play.png";
import babyDragonAvatar from "../../../assets/icons/ranking/baby-dragon-ranking-avatar.png";
import useAppStore from "../../../zustand/store";

// Real data integration
import { useGameLeaderboard } from "../../../dojo/hooks/useGameLeaderboard";
import { GAME_IDS } from "../../types/game.types";

interface GameRankingScreenProps {
  onNavigation: (screen: any) => void;
}

export function GameRankingScreen({ onNavigation }: GameRankingScreenProps) {
  const storePlayer = useAppStore(state => state.player);
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // TEST: Probar el hook useGameLeaderboard
  const { 
    topPlayers, 
    currentUserRanking, 
    isLoading, 
    error, 
    refetch 
  } = useGameLeaderboard(GAME_IDS.FLAPPY_BEASTS, cavosWallet?.address);


  // Available games - expandable for future games
  const games = [
    {
      id: "flappy_beasts",
      name: "FlappyBeasts",
      description: "Top runners competing for glory!",
      isAvailable: true,
    },
    {
      id: "platform_jump",
      name: "Sky Jump",
      description: "Coming soon...",
      isAvailable: false,
    },
    {
      id: "beast_runner",
      name: "Beast Runner",
      description: "Coming soon...",
      isAvailable: false,
    },
  ];

  // Combine real data for FlappyBeasts (top players + current user if not in top 10)
  const getRankingsForGame = (gameId: string) => {
    if (gameId === "flappy_beasts") {
      // Combine top players with current user ranking if not in top 10
      const combinedRankings = currentUserRanking 
        ? [...topPlayers, currentUserRanking]
        : topPlayers;
      
      // Convert to the format expected by GameRankingTable
      return combinedRankings.map(player => ({
        id: player.address,
        name: player.name,
        score: player.score,
        rank: player.rank,
        isCurrentUser: player.isCurrentUser
      }));
    }
    return []; // Empty for other games
  };

  const getCurrentGame = () => games[activeIndex];

  // Update active index on scroll
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIndex(index);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

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

      {/* Top Bar */}
      <TamagotchiTopBar
        coins={storePlayer?.total_coins || 0}
        gems={storePlayer?.total_gems || 0}
        status={{
          energy: 0,
          hunger: 0,
          happiness: 0,
          hygiene: 0
        }}
      />

      {/* Back Button */}
      <BackButton onClick={() => onNavigation("play")} variant="floating" className="!left-auto !right-2" />


      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="font-semibold">Error loading FlappyBeasts rankings:</div>
          <div className="text-sm">{error.message}</div>
          <button 
            onClick={refetch}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* Banner with gradient and mascot */}
      <motion.div
        className="relative mt-12 mb-6 w-full max-w-4xl px-4"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Baby Dragon Avatar */}
        <motion.div
          className="absolute -top-8 left-8 z-20 w-32 h-32"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <img
            src={babyDragonAvatar}
            alt="Ranking Dragon"
            className="object-contain drop-shadow-lg"
          />
        </motion.div>

        {/* Banner Background */}
        <div
          className="bg-gold-gradient py-2 px-4 pl-40 relative rounded-2xl shadow-xl"
          style={{ minHeight: '100px' }}
        >
          <div className="flex flex-col justify-center h-full">
            <motion.h2
              className="font-luckiest text-cream text-2xl md:text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] tracking-wide"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              key={`title-${activeIndex}`}
            >
              {getCurrentGame().name} Leaderboard
            </motion.h2>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard Type Tabs */}
      <div className="flex justify-center space-x-2 mb-4 z-10">
        <button
          onClick={() => onNavigation("ageRanking")}
          className="px-6 py-2 rounded-full text-sm font-rubik transition-all bg-white/20 text-white hover:bg-white/30"
        >
          Age Leaderboard
        </button>
        <button
          className="px-6 py-2 rounded-full text-sm font-rubik transition-all bg-gold-gradient text-black font-bold"
        >
          Mini Games Leaderboard
        </button>
      </div>

      {/* Carousel Dots Indicator */}
      <div className="flex justify-center space-x-2 mb-4 z-10">
        {games.map((game, index) => (
          <button
            key={game.id}
            onClick={() => {
              if (game.isAvailable) {
                carouselRef.current?.scrollTo({
                  left: index * (carouselRef.current?.clientWidth || 0),
                  behavior: 'smooth'
                });
              }
            }}
            className={`transition-all ${
              activeIndex === index
                ? 'w-8 h-2 bg-gold-gradient rounded-full'
                : 'w-2 h-2 bg-white/40 rounded-full hover:bg-white/60'
            } ${!game.isAvailable ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={!game.isAvailable}
            aria-label={game.name}
          />
        ))}
      </div>

      {/* Main Content Area with Carousel */}
      <div className="flex-1 w-full max-w-4xl pb-20 z-10">
        <div
          ref={carouselRef}
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth h-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {games.map((game) => (
            <div key={game.id} className="snap-center flex-shrink-0 w-full px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <GameRankingTable 
                  rankings={getRankingsForGame(game.id)} 
                  isLoading={game.id === "flappy_beasts" ? isLoading : false}
                  gameName={game.name}
                  isAvailable={game.isAvailable}
                />
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}