import { useState, useMemo, useEffect, useCallback } from "react";
import { TamagotchiTopBar } from "../../layout/TopBar";
import { HomeScreenProps, BeastData, PlayerData } from "../../types/home.types";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import { PlayerInfoModal } from "./components/PlayerInfoModal";
import { BeastNameModal } from "./components/BeastNameModal";
import { PlayerNameModal } from "./components/PlayerNameModal";
import forestBackground from "../../../assets/backgrounds/bg-home.webp";
import deadBeastBackground from "../../../assets/backgrounds/bg-dead-beast.webp";
import { MiniKit, RequestPermissionPayload, Permission } from '@worldcoin/minikit-js';
import toast from 'react-hot-toast';

// Universal hook to encapsulate beast display logic
import { useBeastDisplay } from "../../../dojo/hooks/useBeastDisplay";
import { useSetBeastName } from "../../../dojo/hooks/useSetBeastName";
import { useSetPlayerName } from "../../../dojo/hooks/useSetPlayerName";
import { useLiveBeast } from "../../../dojo/hooks/useLiveBeast";
import { usePlayer } from "../../../dojo/hooks/usePlayer";
import { useRealTimeStatus } from "../../../dojo/hooks/useRealTimeStatus";

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
  
  // Track if we've already requested notification permission
  const [hasRequestedPermission, setHasRequestedPermission] = useState(() => {
    return localStorage.getItem('tamagotchi-notification-requested') === 'true';
  });

  // Universal hook to encapsulate beast display logic
  const {
    currentBeastDisplay,
    liveBeastStatus,
    hasLiveBeast,
    isLoading
  } = useBeastDisplay();
  
  // Get real-time status from contract
  const { statusForUI } = useRealTimeStatus();
  
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
  
  // Request notification permission for World App users
  const requestNotificationPermission = useCallback(async () => {
    try {
      if (!MiniKit.isInstalled()) {
        console.log('Not running in World App, skipping notification permission request');
        return;
      }

      console.log('🔔 Requesting notification permission...');
      const requestPermissionPayload: RequestPermissionPayload = {
        permission: Permission.Notifications,
      };
      
      const { finalPayload } = await MiniKit.commandsAsync.requestPermission(requestPermissionPayload);
      
      if (finalPayload.status === 'success') {
        console.log('✅ Notification permission granted');
        toast.success('Notifications enabled! You\'ll be notified when your beast needs attention.', {
          duration: 4000,
          position: 'top-center'
        });
        // Mark as requested so we don't ask again
        localStorage.setItem('tamagotchi-notification-requested', 'true');
        setHasRequestedPermission(true);
      } else if (finalPayload.status === 'error') {
        console.log('❌ Notification permission error:', finalPayload.error_code);
        
        // Handle specific error cases
        switch (finalPayload.error_code) {
          case 'user_rejected':
            toast.error('Notifications declined. You can enable them later in settings.', {
              duration: 4000,
              position: 'top-center'
            });
            break;
          case 'already_granted':
            console.log('Notifications already granted');
            break;
          case 'already_requested':
            toast('You can enable notifications in World App settings', {
              duration: 4000,
              position: 'top-center',
              icon: 'ℹ️'
            });
            break;
          case 'permission_disabled':
            toast('Please enable notifications for World App first', {
              duration: 4000,
              position: 'top-center',
              icon: '⚠️'
            });
            break;
          default:
            toast.error('Could not enable notifications. Please try again later.', {
              duration: 4000,
              position: 'top-center'
            });
        }
        
        // Mark as requested even on error (except for already_granted)
        if (finalPayload.error_code !== 'already_granted') {
          localStorage.setItem('tamagotchi-notification-requested', 'true');
          setHasRequestedPermission(true);
        }
      }
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  }, []);
  
  // Request notification permission on mount for World App users (only once)
  useEffect(() => {
    if (!hasRequestedPermission && MiniKit.isInstalled()) {
      // Delay the request slightly to not overwhelm the user
      const timer = setTimeout(() => {
        requestNotificationPermission();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [hasRequestedPermission, requestNotificationPermission]);

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

  // Beast data para la UI - Use contract data first, Torii as fallback
  const beastData: BeastData = useMemo(() => {
    // Prefer real-time status from contract
    if (statusForUI) {
      return {
        age: currentBeastDisplay?.age || 0,
        energy: statusForUI.energy,
        hunger: statusForUI.hunger,
        happiness: statusForUI.happiness,
        cleanliness: statusForUI.hygiene,
      };
    }
    
    // Fallback to Torii data if no contract data
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
  }, [statusForUI, liveBeastStatus, currentBeastDisplay]);

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
        <div className="flex-grow flex flex-col items-center justify-center w-full px-6 py-8 space-y-6">
          {/* Título por encima de la imagen */}
          <h3 className="text-2xl font-bold text-white drop-shadow-lg font-luckiest text-center">
            {!currentBeastDisplay ? "NO BEAST FOUND" : "BEAST NEEDS CARE"}
          </h3>

          {/* Imagen del corazón roto */}
          <div 
            className="w-full max-w-sm mx-auto"
            style={{
              backgroundImage: `url(${deadBeastBackground})`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              aspectRatio: "1/1",
              height: "200px"
            }}
          />

          {/* Texto descriptivo por debajo de la imagen */}
          <p className="text-base text-white/90 drop-shadow-md leading-relaxed text-center max-w-xs">
            {!currentBeastDisplay 
              ? "Time to hatch your first beast and begin your adventure!" 
              : "Your beloved companion needs your care to return to life"}
          </p>

          {/* Botón */}
          <button 
            onClick={() => onNavigation("hatch")}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg font-luckiest text-lg"
          >
            {!currentBeastDisplay ? "🥚 Hatch New Beast" : "✨ Revive Beast"}
          </button>
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
        status={statusForUI || {
          energy: 0,
          hunger: 0,
          happiness: 0,
          hygiene: 0
        }}
        onNavigateToGemShop={() => onNavigation("gemShop")}
      />

      <PlayerInfoSection
        playerName={playerName}
        age={age}
        onProfileClick={handleProfileClick}
        onNavigateLogin={handleNavigateLogin}
        onEditName={() => setIsPlayerNameModalOpen(true)}
        onAgeLeaderboardClick={() => onNavigation("ageRanking")}
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