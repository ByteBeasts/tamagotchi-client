import { motion } from "framer-motion";
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

  // Mock data for now - will be replaced with real data later
  const mockRankings = [
    { id: "1", name: "DragonMaster", score: 2450, rank: 1, isCurrentUser: false },
    { id: "2", name: "BeastHunter", score: 2380, rank: 2, isCurrentUser: false },
    { id: "3", name: "SkyRunner", score: 2210, rank: 3, isCurrentUser: false },
    { id: "4", name: "You", score: 1890, rank: 4, isCurrentUser: true },
    { id: "5", name: "FlappyPro", score: 1750, rank: 5, isCurrentUser: false },
    { id: "6", name: "WingMaster", score: 1620, rank: 6, isCurrentUser: false },
    { id: "7", name: "CloudJumper", score: 1580, rank: 7, isCurrentUser: false },
    { id: "8", name: "AirDancer", score: 1450, rank: 8, isCurrentUser: false },
  ];

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
            >
              FlappyBeasts Leaderboard
            </motion.h2>
          </div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl px-4 pb-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <GameRankingTable rankings={mockRankings} isLoading={false} />
        </motion.div>
      </div>
    </div>
  );
}