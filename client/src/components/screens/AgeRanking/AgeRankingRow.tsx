import { motion } from "framer-motion";
import goldenTrophy from "../../../assets/icons/ranking/icon-golden-trophy.webp";
import silverTrophy from "../../../assets/icons/ranking/icon-silver-trophy.webp";
import bronzeTrophy from "../../../assets/icons/ranking/BronzeTrophyIcon.webp";
import { LeaderboardBeast } from "../../../dojo/hooks/useAgeLeaderboard";

interface AgeRankingRowProps {
  beast: LeaderboardBeast;
  isTop3: boolean;
  index: number;
  isUserBestNotInTop10?: boolean;
}

export function AgeRankingRow({
  beast,
  isTop3,
  index,
  isUserBestNotInTop10 = false,
}: AgeRankingRowProps) {
  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, delay: index * 0.05 },
    },
  };

  const getRowClasses = () => {
    if (beast.isCurrentUserBeast) return "bg-yellow-500/20 font-medium border-yellow-500/30";
    if (isTop3) return "bg-gold-gradient/10 font-bold border-yellow-400/20";
    return "border-white/10";
  };

  const getTextClasses = () => {
    if (beast.isCurrentUserBeast) return "text-yellow-200";
    return "text-white";
  };

  const renderTrophy = () => {
    switch (beast.rank) {
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

  const renderRankContent = () => {
    if (isTop3) {
      return renderTrophy();
    }
    
    // Special styling for user's best beast not in top 10
    if (isUserBestNotInTop10) {
      return (
        <span className="text-yellow-200 font-bold">
          #{beast.rank}
        </span>
      );
    }
    
    return (
      <span className={getTextClasses()}>
        #{beast.rank}
      </span>
    );
  };

  const renderUserBadge = () => {
    if (!beast.isCurrentUserBeast) return null;
    
    return (
      <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded-full font-bold">
        YOU
      </span>
    );
  };

  const renderSeparator = () => {
    // Add visual separator if this is user's best beast not in top 10
    if (isUserBestNotInTop10 && index === 10) {
      return (
        <div className="w-full border-t-2 border-dashed border-yellow-500/50 my-2">
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {renderSeparator()}
      <motion.div
        className={`grid grid-cols-10 gap-3 items-center p-4 border-b ${getRowClasses()}`}
        variants={rowVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Rank / Trophy */}
        <div className="col-span-1 font-luckiest text-lg flex items-center justify-center">
          {renderRankContent()}
        </div>

        {/* Player Name */}
        <div className={`col-span-3 font-rubik text-base ${getTextClasses()}`}>
          <div className="truncate">
            {beast.playerName}
            {renderUserBadge()}
          </div>
        </div>

        {/* Beast Image */}
        <div className="col-span-4 flex items-center justify-center">
          <img 
            src={beast.beastAsset} 
            alt={`Beast Type ${beast.beastType}`}
            className="w-12 h-12 object-contain"
          />
        </div>

        {/* Age */}
        <div className={`col-span-1 font-rubik text-base text-center ${getTextClasses()}`}>
          {beast.age}
        </div>

        {/* Live Status */}
        <div className="col-span-1 text-center text-xl">
          {beast.isAlive ? '❤️' : '💀'}
        </div>
      </motion.div>
    </>
  );
}