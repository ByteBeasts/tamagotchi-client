import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Tournament } from "../../types/api.types";

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

        const showDuration = 30000;
        const hideDuration = 270000;
        const totalCycle = showDuration + hideDuration;

        const showBanner = () => setIsVisible(true);
        const hideBanner = () => setIsVisible(false);

        showBanner();
        const hideTimer = setTimeout(hideBanner, showDuration);

        const cycleInterval = setInterval(() => {
            showBanner();
            setTimeout(hideBanner, showDuration);
        }, totalCycle);

        return () => {
            clearTimeout(hideTimer);
            clearInterval(cycleInterval);
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
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full max-w-lg mx-auto px-4 mb-4 z-20"
                >
                    <motion.button
                        onClick={onBannerClick}
                        className="w-full bg-gold-gradient rounded-2xl shadow-2xl p-4 relative overflow-hidden cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-shimmer" />

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="text-3xl">🏆</div>
                                <div className="text-left">
                                    <h3 className="font-luckiest text-black text-sm md:text-base leading-tight">
                                        {nextEndingTournament.name}
                                    </h3>
                                    <p className="font-rubik text-black/70 text-xs mt-0.5">
                                        {tournaments.length > 1
                                            ? `${tournaments.length} active tournaments`
                                            : 'Tournament active'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="font-luckiest text-black text-lg md:text-xl">
                                    {countdown}
                                </div>
                                <p className="font-rubik text-black/70 text-xs">
                                    remaining
                                </p>
                            </div>
                        </div>
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}