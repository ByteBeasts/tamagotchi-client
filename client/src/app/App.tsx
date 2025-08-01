import { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { CoverScreen } from "../components/screens/Cover/CoverScreen";
import { HatchEggScreen } from "../components/screens/Hatch/HatchEggScreen";
import { HomeScreen } from "../components/screens/Home/HomeScreen";
import { SleepScreen } from "../components/screens/Sleep/SleepScreen";
import { FeedScreen } from "../components/screens/Feed/FeedScreen";
import { CleanScreen } from "../components/screens/Clean/CleanScreen";
import { PlayScreen } from "../components/screens/Play/PlayScreen";
import { GameScreen } from "../components/screens/Play/components/GameScreen";
import { MarketScreen } from "../components/screens/Market/MarketScreen";
import { LoginScreen } from "../components/screens/Login/LoginScreen";
import { NavBar } from "../components/layout/NavBar";
import type { Screen } from "../components/types/screens";
import { GameId } from "../components/types/play.types";

// Beast params generation imports
import { generateRandomBeastParams } from "../utils/beastHelpers";
import type { BeastSpawnParams } from "../utils/beastHelpers";

// Sleep logic for navigation blocking - temporarily disabled for Cavos migration
// import { useSleepLogic } from "../components/screens/Sleep/components/hooks/useSleepLogic";

// Wallet and cache management  
import { useCavosAccount } from "../dojo/hooks/useCavosAccount";
import useAppStore from "../zustand/store";

function AppContent() {
  const [currentScreen, setCurrentScreenState] = useState<Screen>("login");
  const [playerAddress] = useState("0x123"); // Temporary address
  const [currentGameId, setCurrentGameId] = useState<GameId | null>(null);
  
  // State for predefined beast parameters
  const [pendingBeastParams, setPendingBeastParams] = useState<BeastSpawnParams | null>(null);

  // Get sleep logic for navigation blocking - temporarily disabled
  // const { shouldBlockNavigation } = useSleepLogic();
  const shouldBlockNavigation = false; // Temporary fix

  // Wallet and cache management
  const { account } = useCavosAccount();
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  const resetStore = useAppStore(state => state.resetStore);

  // Clear cache on wallet change
  useEffect(() => {
    if (account?.address) {
      console.log('🔄 Wallet connected/changed, cleaning cache for:', account.address);
      
      // Clear all tamagotchi localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tamagotchi-store')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log('🧹 Clearing cache:', key);
        localStorage.removeItem(key);
      });
      
      // Reset Zustand store to prevent contamination
      resetStore();
      
      if (keysToRemove.length > 0) {
        console.log('✅ Cache cleanup completed for wallet:', account.address);
      }
    }
  }, [account?.address, resetStore]);

  // Clear cache on app start (aggressive approach)
  useEffect(() => {
    console.log('🚀 App started, performing initial cache cleanup...');
    
    // Clear all tamagotchi cache on app start
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tamagotchi-store')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Reset store
    resetStore();
    
    if (keysToRemove.length > 0) {
      console.log('✅ Initial cache cleanup completed');
    }
  }, []); // Only run once on mount

  // Updated navigation handler to support games
  const handleNavigation = (screen: Screen, gameId?: GameId) => {
    // Block navigation when beast is sleeping, except to sleep screen
    if (shouldBlockNavigation && screen !== "sleep") {
      toast.error("Your beast is sleeping! 😴 Wake them up first.", {
        duration: 4000,
        style: {
          background: '#1f2937',
          color: '#f3f4f6',
          border: '1px solid #374151',
          borderRadius: '8px',
          fontSize: '14px',
        },
        icon: '🌙',
        position: 'top-center',
      });
      return; // Block navigation
    }

    // Handle game navigation
    if (screen === "game" && gameId) {
      console.log(`🎮 Navigating to game: ${gameId}`);
      setCurrentGameId(gameId);
      setCurrentScreenState("game");
      return;
    }

    // Generate parameters when navigating to hatch
    if (screen === "hatch") {
      const beastParams = generateRandomBeastParams();
      setPendingBeastParams(beastParams);
    }
    
    // Clear game state when leaving game screen
    if (currentScreen === "game") {
      setCurrentGameId(null);
    }
    
    // NORMAL NAVIGATION
    setCurrentScreenState(screen);
  };

  // Handle exiting games back to play screen
  const handleExitGame = useCallback(() => {
    console.log('🔙 Exiting game, returning to play screen');
    setCurrentGameId(null);
    setCurrentScreenState("play");
  }, []);

  // Callback for when Login completes - dynamic navigation based on beast status
  const handleLoginComplete = useCallback((destination: 'hatch' | 'cover') => {
    if (destination === 'cover') {
      // Player has live beast - go directly to home
      setPendingBeastParams(null);
      setCurrentScreenState("cover");
    } else {
      // Player needs to spawn beast - generate params and go to hatch
      const beastParams = generateRandomBeastParams();
      setPendingBeastParams(beastParams);
      setCurrentScreenState("hatch");
    }
  }, []);

  // Specific callback for when HatchEgg completes
  const handleHatchComplete = useCallback(() => {
    // Clear used parameters
    setPendingBeastParams(null);
    setCurrentScreenState("cover");
  }, []);

  // Specific callback for when Cover completes
  const handleCoverComplete = useCallback(() => {
    setCurrentScreenState("home");
  }, []);

  return (
    <div className="relative min-h-screen pb-16">
      {currentScreen === "login" && (
        <LoginScreen 
          onLoginSuccess={handleLoginComplete}
        />
      )}

      {/* Pass beastParams instead of hardcoded eggType */}
      {currentScreen === "hatch" && pendingBeastParams && (
        <HatchEggScreen
          onLoadingComplete={handleHatchComplete}  
          beastParams={pendingBeastParams} 
        />
      )}

      {/* Safety: If no params available, show loading or redirect */}
      {currentScreen === "hatch" && !pendingBeastParams && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white">Preparing beast hatching...</p>
          </div>
        </div>
      )}

      {currentScreen === "cover" && (
        <CoverScreen
          onLoadingComplete={handleCoverComplete}  
        />
      )}

      {currentScreen === "home" && (
        <HomeScreen
          onNavigation={handleNavigation}
          playerAddress={cavosWallet?.address || ""}
        />
      )}

      {currentScreen === "sleep" && (
        <SleepScreen
          onNavigation={handleNavigation}
          playerAddress={playerAddress}
        />
      )}

      {currentScreen === "feed" && (
        <FeedScreen
          onNavigation={handleNavigation}
        />
      )}

      {currentScreen === "clean" && (
        <CleanScreen
          onNavigation={handleNavigation}
          playerAddress={playerAddress}
        />
      )}

      {currentScreen === "play" && (
        <PlayScreen
          onNavigation={handleNavigation}
          playerAddress={cavosWallet?.address || ""}
        />
      )}

      {/* Game Screen for mini-games */}
      {currentScreen === "game" && currentGameId && (
        <GameScreen
          gameId={currentGameId}
          onExitGame={handleExitGame}
        />
      )}

      {currentScreen === "market" && (
        <MarketScreen
          onNavigation={handleNavigation}
        />
      )}

      {/* NavBar - Hide on game screen for fullscreen experience */}
      {currentScreen !== "cover" && 
       currentScreen !== "login" && 
       currentScreen !== "hatch" && 
       currentScreen !== "game" && (
        <NavBar
          activeTab={currentScreen as "home" | "sleep" | "feed" | "clean" | "play"}
          onNavigation={handleNavigation}
          shouldBlockNavigation={shouldBlockNavigation}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}