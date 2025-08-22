import { motion } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { TamagotchiTopBar } from "../../layout/TopBar";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import { BackButton } from "../../shared/BackButton";
import { GameRankingTable } from "./GameRankingTable";
import playBackground from "../../../assets/backgrounds/bg-play.png";
import babyDragonAvatar from "../../../assets/icons/ranking/baby-dragon-ranking-avatar.png";
import useAppStore from "../../../zustand/store";

interface GameRankingScreenProps {
  onNavigation: (screen: any) => void;
}

export function GameRankingScreen({ onNavigation }: GameRankingScreenProps) {
  const storePlayer = useAppStore(state => state.player);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  // Mock data for FlappyBeasts - others will be empty for now
  const mockRankingsFlappy = [
    { id: "1", name: "DragonMaster", score: 2450, rank: 1, isCurrentUser: false },
    { id: "2", name: "BeastHunter", score: 2380, rank: 2, isCurrentUser: false },
    { id: "3", name: "SkyRunner", score: 2210, rank: 3, isCurrentUser: false },
    { id: "4", name: "You", score: 1890, rank: 4, isCurrentUser: true },
    { id: "5", name: "FlappyPro", score: 1750, rank: 5, isCurrentUser: false },
    { id: "6", name: "WingMaster", score: 1620, rank: 6, isCurrentUser: false },
    { id: "7", name: "CloudJumper", score: 1580, rank: 7, isCurrentUser: false },
    { id: "8", name: "AirDancer", score: 1450, rank: 8, isCurrentUser: false },
    { id: "9", name: "SkyWalker", score: 1350, rank: 9, isCurrentUser: false },
    { id: "10", name: "WindRider", score: 1280, rank: 10, isCurrentUser: false },
    { id: "11", name: "FeatherFly", score: 1210, rank: 11, isCurrentUser: false },
    { id: "12", name: "SwiftWing", score: 1150, rank: 12, isCurrentUser: false },
    { id: "13", name: "GlideMaster", score: 1080, rank: 13, isCurrentUser: false },
    { id: "14", name: "AeroAce", score: 1020, rank: 14, isCurrentUser: false },
    { id: "15", name: "FlightKing", score: 980, rank: 15, isCurrentUser: false },
    { id: "16", name: "TurboPilot", score: 920, rank: 16, isCurrentUser: false },
    { id: "17", name: "JetStream", score: 860, rank: 17, isCurrentUser: false },
    { id: "18", name: "SoarHigh", score: 810, rank: 18, isCurrentUser: false },
    { id: "19", name: "FlyBoy", score: 750, rank: 19, isCurrentUser: false },
    { id: "20", name: "WingTip", score: 690, rank: 20, isCurrentUser: false },
  ];

  const getRankingsForGame = (gameId: string) => {
    if (gameId === "flappy_beasts") return mockRankingsFlappy;
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

      {/* Game Tabs/Indicators */}
      <div className="flex justify-center space-x-2 mb-4 z-10">
        {games.map((game, index) => (
          <button
            key={game.id}
            onClick={() => {
              carouselRef.current?.scrollTo({
                left: index * (carouselRef.current?.clientWidth || 0),
                behavior: 'smooth'
              });
            }}
            className={`px-4 py-2 rounded-full text-sm font-rubik transition-all ${
              activeIndex === index
                ? 'bg-gold-gradient text-black font-bold'
                : 'bg-white/20 text-white hover:bg-white/30'
            } ${!game.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!game.isAvailable}
          >
            {game.name}
          </button>
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
                  isLoading={false}
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