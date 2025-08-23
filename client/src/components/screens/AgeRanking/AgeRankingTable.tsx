import { motion } from "framer-motion";
import { AgeRankingRow } from "./AgeRankingRow";
import { LeaderboardBeast } from "../../../dojo/hooks/useAgeLeaderboard";

interface AgeRankingTableProps {
  topBeasts: LeaderboardBeast[];
  currentUserBestBeast: LeaderboardBeast | null;
  isLoading?: boolean;
}

export function AgeRankingTable({ 
  topBeasts = [], 
  currentUserBestBeast = null,
  isLoading = false
}: AgeRankingTableProps) {
  // Animation container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  // Combine top beasts with user's best beast if not in top 10
  const allBeasts = currentUserBestBeast 
    ? [...topBeasts, currentUserBestBeast]
    : topBeasts;

  const getContainerHeight = () => {
    // Si está cargando o no hay beasts, usa altura más pequeña
    if (isLoading || allBeasts.length === 0) {
      return { height: '300px' };
    }
    // Si hay beasts, usa altura completa para permitir scroll
    return { height: '60vh', maxHeight: '500px' };
  };

  return (
    <motion.div
      className="bg-black/40 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate={isLoading ? "hidden" : "visible"}
      style={getContainerHeight()}
    >
      {/* Table Header */}
      <div className="bg-gold-gradient p-4 border-b border-yellow-400/30">
        <div className="grid grid-cols-10 gap-3 items-center">
          <div className="col-span-1 font-luckiest text-lg text-cream text-center drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            Rank
          </div>
          <div className="col-span-3 font-luckiest text-lg text-cream drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            Player
          </div>
          <div className="col-span-4 font-luckiest text-lg text-cream drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            Beast
          </div>
          <div className="col-span-1 font-luckiest text-lg text-cream text-center drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            Age
          </div>
          <div className="col-span-1 font-luckiest text-lg text-cream text-center drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            Live
          </div>
        </div>
      </div>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center p-12">
          <motion.div 
            className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-white font-rubik text-sm">
            Loading age leaderboard...
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && allBeasts.length === 0 && (
        <div className="text-center py-12 text-white font-luckiest">
          <div className="text-4xl mb-4">🏆</div>
          <div className="text-lg mb-2">No beasts found!</div>
          <div className="text-sm font-rubik opacity-70">
            Be the first to hatch a beast and claim your place in the leaderboard!
          </div>
        </div>
      )}

      {/* TABLE ROWS */}
      {!isLoading && allBeasts.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {allBeasts.map((beast, idx) => (
              <AgeRankingRow
                key={`${beast.playerAddress}-${beast.beastId}`}
                beast={beast}
                isTop3={beast.rank <= 3}
                index={idx}
                isUserBestNotInTop10={beast === currentUserBestBeast}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}