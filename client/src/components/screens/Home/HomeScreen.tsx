import { useState, useMemo, useEffect } from "react";
import { TamagotchiTopBar } from "../../layout/TopBar";
import { HomeScreenProps, BeastData, PlayerData } from "../../types/home.types";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import { PlayerInfoModal } from "./components/PlayerInfoModal";
import { BeastNameModal } from "./components/BeastNameModal";
import { PlayerNameModal } from "./components/PlayerNameModal";
import forestBackground from "../../../assets/backgrounds/bg-home.png";

// Universal hook to encapsulate beast display logic
import { useBeastDisplay } from "../../../dojo/hooks/useBeastDisplay";
import { useSetBeastName } from "../../../dojo/hooks/useSetBeastName";
import { useSetPlayerName } from "../../../dojo/hooks/useSetPlayerName";
import { useLiveBeast } from "../../../dojo/hooks/useLiveBeast";
import { usePlayer } from "../../../dojo/hooks/usePlayer";

// Store
import useAppStore from "../../../zustand/store";

// Utils
import { shortString } from "starknet";

// Music Context
import { useMusic } from "../../../context/MusicContext";

// Components y hooks
import { usePlayerModal } from "./components/hooks/usePlayerModal";
import { useHomeNavigation } from "./components/hooks/useHomeNavigation";
import { PlayerInfoSection } from "./components/PlayerInfoSection";
import { BeastHomeDisplay } from "./components/BeastDisplay";

export const HomeScreen = ({ onNavigation }: HomeScreenProps) => {
  const [age] = useState(1);
  const [playerName, setPlayerName] = useState("Player");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [isPlayerNameModalOpen, setIsPlayerNameModalOpen] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [playerNameError, setPlayerNameError] = useState<string | null>(null);
  
  // Get Cavos wallet address instead of Starknet account
  const cavosWallet = useAppStore(state => state.cavos.wallet);

  // Music context
  const { setCurrentScreen } = useMusic();

  // Universal hook to encapsulate beast display logic
  const {
    currentBeastDisplay,
    liveBeastStatus,
    hasLiveBeast,
    isLoading
  } = useBeastDisplay();
  
  // Hook for setting beast name
  const { setBeastName, optimisticName } = useSetBeastName();
  
  // Hook for setting player name
  const { setPlayerName: setPlayerNameAction, optimisticName: optimisticPlayerName } = useSetPlayerName();
  
  // Hook for refetching beast data
  const { refetch: refetchBeast } = useLiveBeast();
  
  // Hook for refetching player data
  const { refetch: refetchPlayer } = usePlayer();
  
  // Get current beast name from store
  const liveBeast = useAppStore(state => state.liveBeast.beast);
  const beastName = useMemo(() => {
    // Use optimistic name if available (during transaction)
    if (optimisticName) return optimisticName;
    
    // Otherwise use name directly from contract (already decoded by Torii)
    if (!liveBeast?.name || liveBeast.name === '' || liveBeast.name === '0x0') return null;
    
    try {
      // Use shortString to decode if it comes as a hex string
      const decodedName = liveBeast.name.startsWith('0x') 
        ? shortString.decodeShortString(liveBeast.name)
        : liveBeast.name;
      
      // Return null if the decoded name is empty
      return decodedName && decodedName.trim().length > 0 ? decodedName.trim() : null;
    } catch (error) {
      console.error('Failed to decode beast name:', error);
      return null;
    }
  }, [liveBeast?.name, optimisticName]);

  // Store data
  const storePlayer = useAppStore(state => state.player);
  
  // Get current player name from store
  const decodedPlayerName = useMemo(() => {
    // Use optimistic name if available (during transaction)
    if (optimisticPlayerName) return optimisticPlayerName;
    
    // Otherwise use name directly from contract (already decoded by Torii)
    if (!storePlayer?.name || storePlayer.name === '' || storePlayer.name === '0x0') return null;
    
    try {
      // Use shortString to decode if it comes as a hex string
      const decodedName = storePlayer.name.startsWith('0x') 
        ? shortString.decodeShortString(storePlayer.name)
        : storePlayer.name;
      
      // Return null if the decoded name is empty
      return decodedName && decodedName.trim().length > 0 ? decodedName.trim() : null;
    } catch (error) {
      console.error('Failed to decode player name:', error);
      return null;
    }
  }, [storePlayer?.name, optimisticPlayerName]);

  // Set current screen for music control
  useEffect(() => {
    setCurrentScreen("home");
  }, [setCurrentScreen]);

  // Username effect using decoded name or Cavos wallet address
  useEffect(() => {
    const updatePlayerName = () => {
      // First priority: Use decoded name from contract
      if (decodedPlayerName) {
        setPlayerName(decodedPlayerName);
        return;
      }

      // Second priority: Use truncated Cavos wallet address
      if (cavosWallet?.address) {
        const truncated = cavosWallet.address.slice(0, 6) + '...' + cavosWallet.address.slice(-4);
        setPlayerName(truncated);
        return;
      }

      // Fallback if no wallet
      setPlayerName('Player');
    };

    updatePlayerName();
  }, [cavosWallet?.address, decodedPlayerName]);

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
  const { handleNavigateLogin } = useHomeNavigation(onNavigation);

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
        beastName={beastName || undefined}
        onEditName={() => setIsNameModalOpen(true)}
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
        onEditName={() => setIsPlayerNameModalOpen(true)}
        beastData={beastData}
      />

      {renderBeastContent()}

      <PlayerInfoModal
        isOpen={isPlayerInfoModalOpen}
        onClose={closePlayerModal}
        playerData={playerData}
      />
      
      <BeastNameModal
        isOpen={isNameModalOpen}
        onClose={() => {
          setIsNameModalOpen(false);
          setNameError(null);
        }}
        onSubmit={async (name) => {
          setNameError(null);
          const result = await setBeastName(name);
          if (result.success) {
            // Refetch both beast and player data after a delay to get updated name and gems from Torii
            setTimeout(() => {
              refetchBeast();
              refetchPlayer();
            }, 3000);
          } else {
            // Reopen modal with error
            setNameError(result.error || 'Failed to set name');
            setIsNameModalOpen(true);
          }
        }}
        currentName={beastName || undefined}
        playerGems={storePlayer?.total_gems || 0}
        error={nameError}
      />
      
      <PlayerNameModal
        isOpen={isPlayerNameModalOpen}
        onClose={() => {
          setIsPlayerNameModalOpen(false);
          setPlayerNameError(null);
        }}
        onSubmit={async (name) => {
          setPlayerNameError(null);
          const result = await setPlayerNameAction(name);
          if (result.success) {
            // Refetch player data after a delay to get updated name and gems from Torii
            setTimeout(() => {
              refetchPlayer();
            }, 3000);
          } else {
            // Reopen modal with error
            setPlayerNameError(result.error || 'Failed to set name');
            setIsPlayerNameModalOpen(true);
          }
        }}
        currentName={decodedPlayerName || undefined}
        playerGems={storePlayer?.total_gems || 0}
        error={playerNameError}
      />
    </div>
  );
};