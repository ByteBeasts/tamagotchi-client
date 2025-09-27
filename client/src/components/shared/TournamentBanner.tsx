import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Tournament } from "../../types/api.types";
import rankingIcon from "../../assets/icons/ranking/icon-ranking.webp";

interface TournamentBannerProps {
    tournaments: Tournament[];
    onBannerClick?: () => void;
}

export function TournamentBanner({ tournaments, onBannerClick }: TournamentBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [countdown, setCountdown] = useState<string>("");

    const nextEndingTournament = useMemo(() => {
        if (tournaments.length === 0) return null;

        const now = new Date();
        const activeTournaments = tournaments.filter(t => new Date(t.endDate) > now);

        if (activeTournaments.length === 0) return null;

        return activeTournaments.reduce((closest, current) => {
            const closestEnd = new Date(closest.endDate);
            const currentEnd = new Date(current.endDate);
            return currentEnd < closestEnd ? current : closest;
        });
    }, [tournaments]);

    useEffect(() => {
        if (!nextEndingTournament) return;

        const showDuration = 5000;

        const showBanner = () => setIsVisible(true);
        const hideBanner = () => setIsVisible(false);

        showBanner();
        const hideTimer = setTimeout(hideBanner, showDuration);

        return () => {
            clearTimeout(hideTimer);
        };
    }, [nextEndingTournament]);

    useEffect(() => {
        if (!nextEndingTournament) return;

        const updateCountdown = () => {
            const now = new Date();
            const end = new Date(nextEndingTournament.endDate);
            const diff = end.getTime() - now.getTime();

            if (diff <= 0) {
                setCountdown("Ended");
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

            if (days > 0) {
                setCountdown(`${days}d ${hours}h ${minutes}m`);
            } else if (hours > 0) {
                setCountdown(`${hours}h ${minutes}m`);
            } else {
                setCountdown(`${minutes}m`);
            }
        };

        updateCountdown();
        const interval = setInterval(updateCountdown, 60000);

        return () => clearInterval(interval);
    }, [nextEndingTournament]);

    if (!nextEndingTournament) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed top-20 left-0 right-0 mx-auto w-[90%] max-w-md z-[100]"
                    style={{ transform: 'none' }}
                >
                    <motion.button
                        onClick={onBannerClick}
                        className="w-full bg-gold-gradient rounded-2xl shadow-2xl p-2 relative overflow-hidden cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-shimmer" />

                        <div className="relative z-10 flex flex-col items-center text-center gap-2">
                            <div className="flex items-center gap-2">
                                <img src={rankingIcon} alt="Tournament" className="w-12 h-12" />
                                <h3 className="font-luckiest text-black text-base md:text-lg leading-tight">
                                    {nextEndingTournament.name}
                                </h3>
                            </div>

                            <div className="text-center">
                                <div className="font-luckiest text-black text-xl md:text-2xl">
                                    {countdown}
                                </div>
                            </div>
                        </div>
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}