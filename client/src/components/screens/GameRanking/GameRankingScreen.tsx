import { motion } from "framer-motion";
import { TamagotchiTopBar } from "../../layout/TopBar";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import playBackground from "../../../assets/backgrounds/bg-play.png";
import backIcon from "../../../assets/icons/extras/icon-close.png";
import useAppStore from "../../../zustand/store";

interface GameRankingScreenProps {
  onNavigation: (screen: any) => void;
}

export function GameRankingScreen({ onNavigation }: GameRankingScreenProps) {
  const storePlayer = useAppStore(state => state.player);

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
      <motion.button
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        onClick={() => onNavigation("play")}
        className="absolute top-32 left-4 z-50 flex items-center justify-center hover:scale-105 transition-transform"
        aria-label="Back to Play"
      >
        <img
          src={backIcon}
          alt="Back"
          className="w-12 h-12"
        />
      </motion.button>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-8 mb-6 text-center z-10"
      >
        <h1 className="text-3xl md:text-4xl font-luckiest text-cream drop-shadow-lg">
          Game Rankings
        </h1>
        <p className="text-white/80 text-sm mt-2">
          Compete for the top spots!
        </p>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-4xl px-4 pb-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
        >
          {/* Placeholder for ranking content */}
          <div className="text-center py-12">
            <p className="text-white text-lg">
              Rankings coming soon...
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}