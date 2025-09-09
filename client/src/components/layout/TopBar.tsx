import { motion } from "framer-motion";
import { useState, useEffect } from "react";

// Assets - Coins and Gems
import coinIcon from "../../assets/icons/coins/icon-coin-single.webp";
import gemIcon from "../../assets/icons/gems/icon-gem-single.webp";

// Assets - Status Icons
import energyIcon from "../../assets/icons/tobBar/icon-energy.webp";
import hungerIcon from "../../assets/icons/tobBar/icon-hungry.webp";
import hygieneIcon from "../../assets/icons/tobBar/icon-clean.webp";

// Assets - Plus Icon
import plusIcon from "../../assets/icons/tobBar/icon-plus.webp";

// Assets - Happiness Icons (3 states)
import happyIcon from "../../assets/icons/tobBar/icon-happy.webp";
import neutralIcon from "../../assets/icons/tobBar/icon-neutral.webp";
import sadIcon from "../../assets/icons/tobBar/icon-sad.webp";

// Internal components
import CircularProgressBar from "../utils/CircularProgressBar";

// Real-time status hook
import { useRealTimeStatus } from "../../dojo/hooks/useRealTimeStatus";

interface TamagotchiStatus {
  energy: number;    // 0-100
  hunger: number;    // 0-100  
  happiness: number; // 0-100
  hygiene: number;   // 0-100
}

interface TamagotchiTopBarProps {
  coins: number;
  gems: number;
  status?: TamagotchiStatus;
  onNavigateToGemShop?: () => void;
}

export function TamagotchiTopBar({ 
  coins, 
  gems, 
  status: fallbackStatus,
  onNavigateToGemShop
}: TamagotchiTopBarProps) {

  // Use real-time status hook
  const { statusForUI } = useRealTimeStatus();
  
  // Popup states
  const [showCoinsPopup, setShowCoinsPopup] = useState(false);
  const [showGemsPopup, setShowGemsPopup] = useState(false);
  
  // Auto-close popups after 5 seconds
  useEffect(() => {
    if (showCoinsPopup) {
      const timer = setTimeout(() => {
        setShowCoinsPopup(false);
      }, 5000); // 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showCoinsPopup]);
  
  useEffect(() => {
    if (showGemsPopup) {
      const timer = setTimeout(() => {
        setShowGemsPopup(false);
      }, 5000); // 5 seconds
      
      return () => clearTimeout(timer);
    }
  }, [showGemsPopup]);

  // Determine which status to use: real-time first, then fallback
  const currentStatus: TamagotchiStatus = statusForUI || fallbackStatus || {
    energy: 0,
    hunger: 0,
    happiness: 0,
    hygiene: 0,
  };

  const isAwake = statusForUI?.isAwake ?? true;

  // Determine happiness icon
  const getHappinessIcon = (happiness: number) => {
    if (happiness >= 70) return happyIcon;
    if (happiness >= 30) return neutralIcon;
    return sadIcon;
  };

  // 🆕 Color based on energy and sleep state
  const getEnergyColor = (energy: number, awake: boolean) => {
    if (!awake) return "#6B7280";           // Gray when sleeping
    if (energy >= 70) return "#FFC107";      // Yellow when high
    if (energy >= 30) return "#FF8F00";      // Orange medium
    return "#E91E63";                       // Red when low
  };

  const statusItems = [
    {
      icon: energyIcon,
      value: currentStatus.energy,
      label: "Energy",
      color: getEnergyColor(currentStatus.energy, isAwake),
    },
    {
      icon: hungerIcon,
      value: currentStatus.hunger,
      label: "Hunger",
      color: isAwake ? "#E91E63" : "#6B7280",
    },
    {
      icon: getHappinessIcon(currentStatus.happiness),
      value: currentStatus.happiness,
      label: "Happiness",
      color: isAwake ? "#FF8F00" : "#6B7280",
    },
    {
      icon: hygieneIcon,
      value: currentStatus.hygiene,
      label: "Hygiene",
      color: isAwake ? "#0288D1" : "#6B7280",
    }
  ];

  return (
    <div className="relative z-[9999] w-full px-2 py-2">
      <div className="flex items-center gap-1 sm:gap-2">

        {/* Left Section - Coins */}
        <motion.div
          className="flex items-center bg-black/50 pl-0.5 pr-0.5 py-1.5 rounded-lg shadow-md backdrop-blur-sm flex-shrink-0 relative z-[10000]"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowCoinsPopup(!showCoinsPopup)}
            className="mr-0.5 flex items-center justify-center rounded-full h-8 w-8 sm:h-6 sm:w-6 drop-shadow-sm transition-colors flex-shrink-0 p-0.5"
          >
            <img src={plusIcon} alt="Add coins" className="h-full w-full object-contain" />
          </button>
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => setShowCoinsPopup(!showCoinsPopup)}
          >
            <span className="text-white font-bold text-xs sm:text-sm truncate drop-shadow-md min-w-0 flex-1 text-center">
              {coins.toLocaleString()}
            </span>
            <img 
              src={coinIcon} 
              alt="Coins" 
              className="h-8 w-8 sm:h-7 sm:w-7 ml-0.5 flex-shrink-0" 
            />
          </div>
          
          {/* Coins Popup */}
          {showCoinsPopup && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 bg-cream rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] 
                border-4 border-gold/30 z-[10001] w-64 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gold/20 p-3 border-b-2 border-gold/40">
                <h3 className="text-gray-800 font-luckiest text-base">COINS</h3>
              </div>
              <div className="p-4 bg-gradient-to-b from-cream to-cream/80">
                <p className="text-gray-800 font-rubik text-sm">
                  Earn coins by playing the Flappy Beasts mini-game. You can use coins to buy food in the store.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Center Section - Status */}
        <motion.div
          className="flex items-center justify-center flex-1 min-w-0"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center space-x-1 sm:space-x-1.5 bg-black/50 backdrop-blur-sm px-1.5 sm:px-2 py-1.5 rounded-lg shadow-md w-full max-w-[180px] sm:max-w-[220px] relative">
            {statusItems.map((item, idx) => (
              <motion.div
                key={item.label}
                className="flex items-center justify-center flex-shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8">
                  <CircularProgressBar
                    progress={item.value}
                    pic={item.icon}
                    color={item.color}
                    name={item.label}
                    size="sm"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Section - Gems */}
        <motion.div
          className="flex items-center bg-black/50 pl-0.5 pr-0.5 py-1.5 rounded-lg shadow-md backdrop-blur-sm flex-shrink-0 relative z-[10000]"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => {
              if (onNavigateToGemShop) {
                onNavigateToGemShop();
              } else {
                setShowGemsPopup(!showGemsPopup);
              }
            }}
            className="mr-0.5 flex items-center justify-center rounded-full h-8 w-8 sm:h-6 sm:w-6 drop-shadow-sm transition-colors flex-shrink-0 p-0.5"
          >
            <img src={plusIcon} alt="Add gems" className="h-full w-full object-contain" />
          </button>
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => setShowGemsPopup(!showGemsPopup)}
          >
            <span className="text-white font-bold text-xs sm:text-sm truncate drop-shadow-md min-w-0 flex-1 text-center">
              {gems.toLocaleString()}
            </span>
            <img 
              src={gemIcon} 
              alt="Gems" 
              className="h-8 w-8 sm:h-7 sm:w-7 ml-0.5 flex-shrink-0" 
            />
          </div>
          
          {/* Gems Popup */}
          {showGemsPopup && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 bg-cream rounded-xl shadow-[0_4px_0_rgba(0,0,0,0.2)] 
                border-4 border-gold/30 z-[10001] w-64 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gold/20 p-3 border-b-2 border-gold/40">
                <h3 className="text-gray-800 font-luckiest text-base">GEMS</h3>
              </div>
              <div className="p-4 bg-gradient-to-b from-cream to-cream/80">
                <p className="text-gray-800 font-rubik text-sm">
                  You earn gems by playing the Flappy Beasts mini-game. We'll enable gem usage soon for interesting features like reviving your beast.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
