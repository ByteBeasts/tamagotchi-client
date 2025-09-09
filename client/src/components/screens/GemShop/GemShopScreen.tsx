import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Toaster, toast } from "react-hot-toast";

// Layout components
import { TamagotchiTopBar } from "../../layout/TopBar";

// Shared components
import BackButton from "../../shared/BackButton";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";

// Gem shop components
import { GemPackCard } from "./components/GemPackCard";

// Constants
import { GEM_PACKS, GemPack } from "../../../constants/gemShop.constants";

// Assets
import gemHandfulIcon from "../../../assets/icons/gems/icon-gems-handful.webp";

// Screen props
import type { Screen } from "../../types/screens";

// Store
import useAppStore from "../../../zustand/store";

interface GemShopScreenProps {
  onNavigation: (screen: Screen) => void;
}

export function GemShopScreen({ onNavigation }: GemShopScreenProps) {
  // Responsive state
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= 768);
  
  // Toast position based on screen size
  const position = isMobile ? 'bottom-center' : 'top-right';
  
  // Store player data
  const storePlayer = useAppStore(state => state.player);
  
  // Responsive design
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle gem pack purchase (UX only for now)
  const handlePurchase = async (pack: GemPack) => {
    // For now, just show a coming soon message
    toast.success(
      `Payment integration coming soon! You selected ${pack.gemAmount} gems for ${pack.priceDisplay} USDC`,
      { 
        position,
        duration: 4000,
        icon: '🚀'
      }
    );
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="relative h-screen w-full bg-screen overflow-hidden font-rubik">
      <MagicalSparkleParticles />

      {/* Back Button */}
      <BackButton 
        onClick={() => onNavigation("home")} 
        className="top-12 left-4 left-auto"
      />
      
      {/* Top Bar */}
      <TamagotchiTopBar 
        coins={storePlayer?.total_coins || 0}
        gems={storePlayer?.total_gems || 0}
      />

      {/* Animated banner */}
      <motion.div
        className="relative mt-12 mb-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Animated Gem Icon */}
        <motion.div
          className="absolute -top-11 right-3 z-10 w-40 h-40"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          <img 
            src={gemHandfulIcon}
            alt="Gems"
            className="object-contain"
            onError={(e) => {
              const img = e.currentTarget as HTMLImageElement;
              img.src = "/placeholder.svg?height=80&width=80";
            }}
          />
        </motion.div>

        {/* Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 py-4 px-4 mx-4 relative rounded-[10px] shadow-md">
          <h2 className="font-luckiest text-white text-xl sm:text-2xl lg:text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] tracking-wide text-left">
            ✨ Gem Shop
          </h2>
          <p className="text-white/90 text-sm mt-1 font-rubik">
            Purchase gems to unlock <br/> magical items
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 h-[calc(100%-16rem)] overflow-y-auto pb-16">
        <div className="px-4 py-2">
          <motion.div 
            className="space-y-8"
            initial="hidden"
            animate="show"
            variants={container}
          >
            {/* Section Header */}
            <motion.div 
              className="flex items-center gap-3 mb-4"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-md"
                style={{ 
                  backgroundColor: 'rgba(168, 85, 247, 0.2)', 
                  border: '2px solid rgb(168, 85, 247)' 
                }}
              >
                💎
              </div>
              <div>
                <h3 className="font-luckiest text-xl text-cream mb-1">
                  Gem Packages
                </h3>
                <p className="text-sm text-text-secondary opacity-80">
                  Choose the perfect pack for your needs
                </p>
              </div>
            </motion.div>

            {/* Gem Packs Grid */}
            <motion.div variants={container}>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {GEM_PACKS.map((pack) => (
                  <GemPackCard
                    key={pack.id}
                    pack={pack}
                    onPurchase={() => handlePurchase(pack)}
                  />
                ))}
              </div>
            </motion.div>

            {/* Info Section */}
            <motion.div
              className="bg-cream rounded-xl p-4 mt-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h4 className="font-luckiest text-gray-800 mb-2">What are gems for?</h4>
              <ul className="space-y-1 text-sm text-gray-700 font-rubik">
                <li>✨ Purchase exclusive magic items that instantly boost your beast</li>
                <li>💊 Revive your beast if it gets sick or tired</li>
                <li>🎁 Unlock special cosmetics and decorations (coming soon)</li>
                <li>⚡ Speed up recovery times and skip waiting periods</li>
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <Toaster
        position={position}
        toastOptions={{
          className: 'font-luckiest bg-cream text-dark border border-dark rounded-[5px] shadow-lg p-4',
          error: { duration: 3000 },
          success: { duration: 3000 }
        }}
      />
    </div>
  );
}

export default GemShopScreen;