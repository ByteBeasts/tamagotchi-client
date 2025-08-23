import { motion } from "framer-motion";
import { GameRankingRow } from "./GameRankingRow";

interface RankingPlayer {
  id: string;
  name: string;
  score: number;
  rank: number;
  isCurrentUser: boolean;
}

interface GameRankingTableProps {
  rankings: RankingPlayer[];
  isLoading?: boolean;
  gameName?: string;
  isAvailable?: boolean;
}

export function GameRankingTable({ 
  rankings = [], 
  isLoading = false, 
  gameName,
  isAvailable = true 
}: GameRankingTableProps) {
  // Animation container variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const getContainerHeight = () => {
    // Si está cargando, no hay rankings, o no está disponible, usa altura más pequeña
    if (isLoading || rankings.length === 0 || !isAvailable) {
      return { height: '300px' };
    }
    // Si hay rankings, usa altura completa para permitir scroll
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
        <div className="flex justify-between items-center">
          <div className="font-luckiest text-lg text-cream w-16 text-center drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            Rank
          </div>
          <div className="font-luckiest text-lg text-cream flex-1 px-4 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            Player
          </div>
          <div className="font-luckiest text-lg text-cream w-24 text-right drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]">
            Score
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
            Loading {gameName || 'game'} rankings...
          </p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!isLoading && rankings.length === 0 && (
        <div className="text-center py-12 text-white font-luckiest">
          <div className="text-4xl mb-4">
            {isAvailable ? '🏆' : '🚧'}
          </div>
          <div className="text-lg mb-2">
            {isAvailable ? 'No rankings yet!' : `${gameName} Coming Soon!`}
          </div>
          <div className="text-sm font-rubik opacity-70">
            {isAvailable 
              ? `Be the first to set a high score in ${gameName || 'this game'}!`
              : 'This game mode is under development.'
            }
          </div>
        </div>
      )}

      {/* TABLE ROWS */}
      {!isLoading && rankings.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col">
            {rankings.map((player, idx) => (
              <GameRankingRow
                key={`${player.id}-${idx}`}
                rank={player.rank}
                name={player.name}
                score={player.score}
                isTop3={player.rank <= 3}
                isCurrentUser={player.isCurrentUser}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}