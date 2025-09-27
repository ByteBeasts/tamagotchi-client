import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Tournament } from "../../types/api.types";
import closeIcon from "../../assets/icons/extras/icon-close.webp";
import trophyIcon from "../../assets/icons/ranking/icon-golden-trophy.webp";

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournaments: Tournament[];
  onNavigateToRanking?: (tournamentType: string) => void;
}

export function TournamentModal({ isOpen, onClose, tournaments, onNavigateToRanking }: TournamentModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  const getCountdown = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleViewRankings = (tournament: Tournament) => {
    const tournamentType = tournament.config?.tournamentType;
    if (onNavigateToRanking && tournamentType) {
      onNavigateToRanking(tournamentType);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-cream w-full max-w-lg rounded-3xl shadow-2xl border-4 border-gold/40 relative overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gold-gradient p-4 border-b-4 border-gold/50 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-shimmer" />
            <div className="flex items-center gap-3 relative z-10">
              <img src={trophyIcon} alt="Trophy" className="w-10 h-10" />
              <h2 className="text-black font-luckiest text-2xl md:text-3xl tracking-wide drop-shadow-md">
                Tournaments
              </h2>
            </div>
            <motion.button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors relative z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={closeIcon} alt="Close" className="w-8 h-8" />
            </motion.button>
          </div>

          {tournaments.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-lg text-gray-600 font-rubik">No active tournaments</p>
            </div>
          ) : (
            <>
              {tournaments.length > 1 && (
                <div className="flex justify-center gap-2 py-3 bg-cream/50">
                  {tournaments.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        carouselRef.current?.scrollTo({
                          left: index * (carouselRef.current?.clientWidth || 0),
                          behavior: 'smooth'
                        });
                      }}
                      className={`transition-all ${activeIndex === index
                          ? 'w-8 h-2 bg-gold-gradient rounded-full'
                          : 'w-2 h-2 bg-gray-400 rounded-full hover:bg-gray-500'
                        }`}
                    />
                  ))}
                </div>
              )}

              <div
                ref={carouselRef}
                className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {tournaments.map((tournament) => (
                  <div key={tournament.id} className="snap-center flex-shrink-0 w-full p-6 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="text-center space-y-2">
                        <h3 className="font-luckiest text-2xl text-black">
                          {tournament.name}
                        </h3>
                        {tournament.description && (
                          <p className="font-rubik text-sm text-gray-600">
                            {tournament.description}
                          </p>
                        )}
                      </div>

                      <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-4 border-2 border-yellow-300/50 shadow-md">
                        <div className="text-center">
                          <p className="text-xs text-gray-600 font-rubik mb-1">Time Remaining</p>
                          <p className="font-luckiest text-3xl text-black">
                            {getCountdown(tournament.endDate)}
                          </p>
                          <p className="text-xs text-gray-500 font-rubik mt-1">
                            Ends: {formatDate(tournament.endDate)}
                          </p>
                        </div>
                      </div>

                      {tournament.prizes && (
                        <div className="bg-gradient-to-br from-purple-100 to-pink-50 rounded-xl p-4 border-2 border-purple-300/50">
                          <h4 className="font-luckiest text-lg text-black mb-3">Prizes</h4>
                          <div className="space-y-2">
                            {Object.entries(tournament.prizes).map(([place, prize]: [string, any]) => (
                              <div key={place} className="bg-white/60 rounded-lg p-3 border border-purple-200">
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-bold text-sm text-black capitalize">
                                      {prize.title || place}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      {prize.description}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-luckiest text-lg text-purple-700">
                                      ${prize.amount}
                                    </p>
                                    {prize.currency && (
                                      <p className="text-xs text-gray-500 uppercase">
                                        {prize.currency}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {tournament.config?.rules && tournament.config.rules.length > 0 && (
                        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200/50">
                          <h4 className="font-luckiest text-lg text-black mb-2">Rules</h4>
                          <ul className="space-y-1">
                            {tournament.config.rules.map((rule: string, idx: number) => (
                              <li key={idx} className="text-sm text-gray-700 font-rubik flex items-start gap-2">
                                <span className="text-blue-600 font-bold mt-0.5">•</span>
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {tournament.entryFee !== undefined && tournament.entryFee !== null && tournament.entryFee > 0 && (
                        <div className="bg-orange-50 rounded-xl p-3 border-2 border-orange-200/50 text-center">
                          <p className="text-sm text-gray-600 font-rubik">Entry Fee</p>
                          <p className="font-luckiest text-xl text-orange-700">
                            {tournament.entryFee} Coins
                          </p>
                        </div>
                      )}

                      <motion.button
                        onClick={() => handleViewRankings(tournament)}
                        className="w-full bg-gold-gradient text-black font-luckiest text-lg py-3 rounded-xl shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        View Rankings 🏆
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}