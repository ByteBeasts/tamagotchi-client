import { motion } from 'framer-motion';
import { useState } from 'react';

// Import assets
import bannerImg from "../../../../assets/banners/banner-dragon.png";
import medalIcon from "../../../../assets/icons/ranking/icon-ranking.webp";
import beastIcon from "../../../../assets/icons/profile/beast.png";
import editIcon from "../../../../assets/icons/profile/edit.png";
import dailyStreakIcon from "../../../../assets/icons/dailyStreak/icon-daily-streak.webp";

interface PlayerInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerData?: {
    username: string;
    points: number;
    currentStreak: number;
    banner?: string;
  };
}

export const PlayerInfoModal = ({
  isOpen,
  onClose,
  playerData = { username: '', points: 0, currentStreak: 0 },
}: PlayerInfoModalProps) => {
  const [selectedEvolution, setSelectedEvolution] = useState<number | null>(null);

  const evolutions = [
    { id: 1, name: "Baby Dragon", type: "Fire", status: "Locked", level: "Level 1" },
    { id: 2, name: "Young Dragon", type: "Fire", status: "Locked", level: "Level 2" },
    { id: 3, name: "Old Dragon", type: "Fire", status: "Locked", level: "Level 3" },
  ];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => {
        setSelectedEvolution(null);
        onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-cream w-[85%] max-w-sm rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] border-4 border-gold/30 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gold-gradient p-3 border-b-4 border-gold/40 flex justify-between items-center rounded-t-[12px]">
          <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            Player Info
          </h2>
          <motion.button
            onClick={onClose}
            className="text-gray-800 transition-colors font-luckiest text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            x
          </motion.button>
        </div>

        {/* Body */}
        <div className="p-4 bg-gradient-to-b from-cream to-cream/80 space-y-4">

          {/* Banner Section */}
          <div className="flex items-center gap-4">
            <img
              src={bannerImg}
              alt="Profile Banner"
              className="h-24 w-full object-cover drop-shadow-lg flex-1"
            />
            <motion.div
              className="bg-gradient-to-b from-cream to-cream/90 p-3 rounded-md border-2 border-stone-400/70 shadow-[0_4px_0_rgba(0,0,0,0.15)] cursor-pointer flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={editIcon}
                alt="Edit Banner"
                className="w-6 h-6"
              />
            </motion.div>
          </div>

          {/* Username Section */}
          <div className="text-center">
            <h3 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              {playerData.username || 'Player'}
            </h3>
          </div>

          {/* Points and Streak Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-b from-cream to-cream/90 rounded-xl px-4 py-1 text-center shadow-[0_4px_0_rgba(0,0,0,0.15)] border-2 border-stone-400/70">
              <div className="text-gray-600 font-rubik text-xs font-medium">Points</div>
              <div className="flex items-center justify-between">
                <div className="text-2xl -mt-1">🏆</div>
                <div className="text-gray-800 font-luckiest text-lg flex-1 text-center">{playerData.points}</div>
                <div className="w-8"></div>
              </div>
            </div>
            <div className="bg-gradient-to-b from-cream to-cream/90 rounded-xl px-4 py-1 text-center shadow-[0_4px_0_rgba(0,0,0,0.15)] border-2 border-stone-400/70">
              <div className="text-gray-600 font-rubik text-xs font-medium">Daily Streak</div>
              <div className="flex items-center justify-between">
                <img
                  src={dailyStreakIcon}
                  alt="Daily Streak"
                  className="w-8 h-8 -mt-1"
                />
                <div className="text-gray-800 font-luckiest text-lg flex-1 text-center">{playerData.currentStreak}</div>
                <div className="w-8"></div>
              </div>
            </div>
          </div>

          {/* Medal Section */}
          <div className="flex items-center justify-center py-0.5 gap-4">
            <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-gray-400"></div>
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring" as const, stiffness: 300 }}
            >
              <img
                src={medalIcon}
                alt="Player Medal"
                className="w-16 h-16 drop-shadow-lg"
              />
            </motion.div>
            <div className="flex-1 h-0.5 bg-gradient-to-l from-transparent via-gray-400 to-gray-400"></div>
          </div>

          {/* Beast Silhouettes */}
          <div className="flex justify-center gap-8 py-2 relative">
            {evolutions.map((evolution, index) => {
              const getPopoverPosition = () => {
                if (index === 0) {
                  return {
                    containerClass: "left-0",
                    arrowClass: "left-6"
                  };
                } else if (index === evolutions.length - 1) {
                  return {
                    containerClass: "right-0",
                    arrowClass: "right-6"
                  };
                }
                return {};
              };

              const popoverPos = getPopoverPosition();

              return (
                <div key={evolution.id} className="relative w-20 h-20 flex items-center justify-center">
                  <motion.img
                    src={beastIcon}
                    alt={`Beast Evolution ${index + 1}`}
                    className="w-20 h-20 opacity-30 grayscale hover:opacity-50 transition-opacity cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setSelectedEvolution(
                        selectedEvolution === evolution.id ? null : evolution.id
                      )
                    }
                  />

                  {selectedEvolution === evolution.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute bottom-full mb-2 z-[100] ${popoverPos.containerClass}`}
                    >
                      <div className="bg-white border-2 border-stone-300 rounded-lg shadow-[0_12px_32px_rgba(0,0,0,0.4)] p-3 w-[130px] backdrop-blur-md relative">
                        <div className={`absolute top-full border-4 border-transparent border-t-stone-300 ${popoverPos.arrowClass}`}></div>
                        <div className={`absolute top-full -mt-px border-4 border-transparent border-t-white ${popoverPos.arrowClass}`}></div>

                        <div className="text-center space-y-1">
                          <img
                            src={beastIcon}
                            alt={evolution.name}
                            className="w-12 h-12 mx-auto opacity-100 grayscale-0"
                          />
                          <h4 className="text-gray-800 font-luckiest text-sm">{evolution.name}</h4>
                          <p className="text-gray-600 font-rubik text-xs">
                            {evolution.type} • {evolution.level}
                          </p>
                          <div
                            className={`text-xs font-medium ${evolution.status === 'Unlocked'
                                ? 'text-green-600'
                                : 'text-gray-500'
                              }`}
                          >
                            {evolution.status}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};