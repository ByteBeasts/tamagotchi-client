import { motion } from "framer-motion";
import goldenTrophy from "../../../assets/icons/ranking/icon-golden-trophy.webp";
import silverTrophy from "../../../assets/icons/ranking/icon-silver-trophy.webp";
import bronzeTrophy from "../../../assets/icons/ranking/BronzeTrophyIcon.webp";

interface GameRankingRowProps {
  rank: number;
  name: string;
  score: number;
  isTop3: boolean;
  isCurrentUser: boolean;
  index: number;
}

export function GameRankingRow({
  rank,
  name,
  score,
  isTop3,
  isCurrentUser,
  index,
}: GameRankingRowProps) {
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: index * 0.05 },
    },
  };

  const getRowClasses = () => {
    if (isCurrentUser) return "bg-yellow-500/20 font-medium border-yellow-500/30";
    if (isTop3) return "bg-gold-gradient/10 font-bold border-yellow-400/20";
    return "border-white/10";
  };

  const getTextClasses = () => {
    if (isCurrentUser) return "text-yellow-200";
    return "text-white";
  };

  const renderTrophy = () => {
    switch (rank) {
      case 1:
        return <img src={goldenTrophy} alt="Gold Trophy" className="h-8 w-8" />;
      case 2:
        return <img src={silverTrophy} alt="Silver Trophy" className="h-8 w-8" />;
      case 3:
        return <img src={bronzeTrophy} alt="Bronze Trophy" className="h-8 w-8" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      className={`flex justify-between items-center p-4 border-b ${getRowClasses()}`}
      variants={rowVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Rank / Trophy */}
      <div className="font-luckiest text-lg w-16 flex items-center justify-center">
        {isTop3 ? (
          renderTrophy()
        ) : (
          <span className={getTextClasses()}>
            {rank}
          </span>
        )}
      </div>

      {/* Name */}
      <div className={`font-rubik text-base flex-1 px-4 ${getTextClasses()}`}>
        {name}
        {isCurrentUser && (
          <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
            YOU
          </span>
        )}
      </div>

      {/* Score */}
      <div className={`font-rubik text-base w-24 text-right ${getTextClasses()}`}>
        {score.toLocaleString()}
      </div>
    </motion.div>
  );
}