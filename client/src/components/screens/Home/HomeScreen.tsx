import { useState, useMemo, useEffect } from "react";
import { TamagotchiTopBar } from "../../layout/TopBar";
import { HomeScreenProps, BeastData, PlayerData } from "../../types/home.types";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import { PlayerInfoModal } from "./components/PlayerInfoModal";
import forestBackground from "../../../assets/backgrounds/bg-home.png";
import { lookupAddresses } from '@cartridge/controller';
import { useCavosAccount } from "../../../dojo/hooks/useCavosAccount";

// Universal hook to encapsulate beast display logic
import { useBeastDisplay } from "../../../dojo/hooks/useBeastDisplay";

// Store
import useAppStore from "../../../zustand/store";

// Music Context
import { useMusic } from "../../../context/MusicContext";

// Components y hooks
import { usePlayerModal } from "./components/hooks/usePlayerModal";
import { useHomeNavigation } from "./components/hooks/useHomeNavigation";
import { PlayerInfoSection } from "./components/PlayerInfoSection";
import { ActionButtons } from "./components/ActionButtons";
import { BeastHomeDisplay } from "./components/BeastDisplay";

export const HomeScreen = ({ onNavigation }: HomeScreenProps) => {
  const [age] = useState(1);
  const [playerName, setPlayerName] = useState("Player");
  
  // Account from Starknet
  const { account } = useCavosAccount();

  // Music context
  const { setCurrentScreen } = useMusic();

  // Universal hook to encapsulate beast display logic
  const {
    currentBeastDisplay,
    liveBeastStatus,
    hasLiveBeast,
    isLoading
  } = useBeastDisplay();

  // Set current screen for music control
  useEffect(() => {
    setCurrentScreen("home");
  }, [setCurrentScreen]);

  // Username lookup effect
  useEffect(() => {
    const fetchPlayerName = async () => {
      if (!account?.address) {
        setPlayerName('Player');
        return;
      }

      try {
        console.log("🔍 Looking up username for address:", account.address);
        
        // Use lookupAddresses with the current account address
        const addressMap = await lookupAddresses([account.address]);
        
        // Get the username from the map
        const username = addressMap.get(account.address);
        
        console.log("📋 Username lookup result:", username);
        
        if (username) {
          setPlayerName(username);
        } else {
          // Fallback to truncated address if no username found
          const truncated = account.address.slice(0, 6) + '...' + account.address.slice(-4);
          setPlayerName(truncated);
        }
      } catch (error) {
        console.error("❌ Error looking up username:", error);
        // Fallback to truncated address on error
        const truncated = account.address.slice(0, 6) + '...' + account.address.slice(-4);
        setPlayerName(truncated);
      }
    };

    fetchPlayerName();
  }, [account?.address]);

  // Store data
  const storePlayer = useAppStore(state => state.player);

  // Beast data para la UI
  const beastData: BeastData = useMemo(() => {
    if (!liveBeastStatus) {
      return {
        age: 0,
        energy: 0,
        hunger: 0,
        happiness: 0,
        cleanliness: 0,
      };
    }

    return {
      age: currentBeastDisplay?.age || 0,
      energy: liveBeastStatus.energy,
      hunger: liveBeastStatus.hunger,
      happiness: liveBeastStatus.happiness,
      cleanliness: liveBeastStatus.hygiene,
    };
  }, [liveBeastStatus, currentBeastDisplay]);

  // Custom hooks
  const { isPlayerInfoModalOpen, openPlayerModal, closePlayerModal } = usePlayerModal();
  const { handleShopClick, handleDailyQuestsClick, handleNavigateLogin } = useHomeNavigation(onNavigation);

  // Player data
  const playerData: PlayerData = {
    username: playerName,
    points: storePlayer?.total_points || 0,
    currentStreak: storePlayer?.daily_streak || 0,
    banner: "dragon",
  };

  const handleProfileClick = () => {
    openPlayerModal();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white">Loading your beast...</p>
        </div>
      </div>
    );
  }

  // Render beast content
  const renderBeastContent = () => {
    // No live beast case
    if (!hasLiveBeast || !currentBeastDisplay) {
      return (
        <div className="flex-grow flex items-center justify-center w-full">
          <div className="text-center space-y-4">
            <div className="text-6xl opacity-50">💔</div>
            <h3 className="text-xl font-semibold text-white/90 drop-shadow-lg">
              {!currentBeastDisplay ? "No Beast Found" : "Beast Needs Attention"}
            </h3>
            <p className="text-sm text-white/70 drop-shadow-md">
              {!currentBeastDisplay 
                ? "Time to hatch your first beast!" 
                : "Your beast needs care to come back to life"}
            </p>
            <button 
              onClick={() => onNavigation("hatch")}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              {!currentBeastDisplay ? "Hatch New Beast" : "Revive Beast"}
            </button>
          </div>
        </div>
      );
    }

    // Live beast display
    return (
      <BeastHomeDisplay 
        beastImage={currentBeastDisplay.asset}
        altText={currentBeastDisplay.displayName}
      />
    );
  };

  return (
    <div
      className="relative min-h-screen w-full flex flex-col items-center overflow-hidden font-rubik"
      style={{
        backgroundImage: `url(${forestBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <MagicalSparkleParticles />
       
      <TamagotchiTopBar
        coins={storePlayer?.total_coins || 0}
        gems={storePlayer?.total_gems || 0}
        status={{
          energy: liveBeastStatus?.energy || 0,
          hunger: liveBeastStatus?.hunger || 0,
          happiness: liveBeastStatus?.happiness || 0,
          hygiene: liveBeastStatus?.hygiene || 0
        }}
      />

      <PlayerInfoSection
        playerName={playerName}
        age={age}
        onProfileClick={handleProfileClick}
        onNavigateLogin={handleNavigateLogin}
        beastData={beastData}
      />

      {renderBeastContent()}

      {hasLiveBeast && currentBeastDisplay && (
        <ActionButtons
          onShopClick={handleShopClick}
          onDailyQuestsClick={handleDailyQuestsClick}
        />
      )}

      <PlayerInfoModal
        isOpen={isPlayerInfoModalOpen}
        onClose={closePlayerModal}
        playerData={playerData}
      />
    </div>
  );
};