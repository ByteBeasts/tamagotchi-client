import { motion } from "framer-motion";
import { TamagotchiTopBar } from "../../layout/TopBar";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import { BackButton } from "../../shared/BackButton";
import { AgeRankingTable } from "./AgeRankingTable";
import forestBackground from "../../../assets/backgrounds/bg-home.png";
import babyDragonAvatar from "../../../assets/icons/ranking/baby-dragon-ranking-avatar.png";
import useAppStore from "../../../zustand/store";

// Age leaderboard hook
import { useAgeLeaderboard } from "../../../dojo/hooks/useAgeLeaderboard";

interface AgeRankingScreenProps {
  onNavigation: (screen: any) => void;
}

export function AgeRankingScreen({ onNavigation }: AgeRankingScreenProps) {
  const storePlayer = useAppStore(state => state.player);
  const cavosWallet = useAppStore(state => state.cavos.wallet);

  // Use age leaderboard hook
  const { 
    topBeasts, 
    currentUserBestBeast, 
    isLoading, 
    error, 
    refetch 
  } = useAgeLeaderboard(cavosWallet?.address);

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
      style={{
        backgroundImage: `url(${forestBackground})`,
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
      <BackButton onClick={() => onNavigation("home")} variant="floating" className="!left-auto !right-2" />

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <div className="font-semibold">Error loading Age Leaderboard:</div>
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
            >
              Oldest Beasts Leaderboard
            </motion.h2>
          </div>
        </div>
      </motion.div>

      {/* Leaderboard Type Tabs */}
      <div className="flex justify-center space-x-2 mb-4 z-10">
        <button
          className="px-6 py-2 rounded-full text-sm font-rubik transition-all bg-gold-gradient text-black font-bold"
        >
          Age Leaderboard
        </button>
        <button
          onClick={() => onNavigation("gameRanking")}
          className="px-6 py-2 rounded-full text-sm font-rubik transition-all bg-white/20 text-white hover:bg-white/30"
        >
          Mini Games Leaderboard
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl pb-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="px-4"
        >
          <AgeRankingTable 
            topBeasts={topBeasts}
            currentUserBestBeast={currentUserBestBeast}
            isLoading={isLoading}
          />
        </motion.div>
      </div>
    </div>
  );
}