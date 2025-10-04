import { useState, useCallback, useEffect } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { CoverScreen } from "../components/screens/Cover/CoverScreen";
import { HatchEggScreen } from "../components/screens/Hatch/HatchEggScreen";
import { HomeScreen } from "../components/screens/Home/HomeScreen";
import { SleepScreen } from "../components/screens/Sleep/SleepScreen";
import { FeedScreen } from "../components/screens/Feed/FeedScreen";
import { CleanScreen } from "../components/screens/Clean/CleanScreen";
import { PlayScreen } from "../components/screens/Play/PlayScreen";
import { GameScreen } from "../components/screens/Play/components/GameScreen";
import { GameRankingScreen } from "../components/screens/GameRanking/GameRankingScreen";
import { AgeRankingScreen } from "../components/screens/AgeRanking/AgeRankingScreen";
import { MarketScreen } from "../components/screens/Market/MarketScreen";
import { GemShopScreen } from "../components/screens/GemShop/GemShopScreen";
import { LoginScreen } from "../components/screens/Login/LoginScreen";
import { NavBar } from "../components/layout/NavBar";
import { MaintenanceModal } from "../components/modals/MaintenanceModal";
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
import { AuthCallback } from "./auth/callback/AuthCallback";

function AppContent() {
  const [currentScreen, setCurrentScreenState] = useState<Screen>("login");
  const [playerAddress] = useState("0x123"); // Temporary address
  const [currentGameId, setCurrentGameId] = useState<GameId | null>(null);
  const [isGoogleCallback, setIsGoogleCallback] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  // State for predefined beast parameters
  const [pendingBeastParams, setPendingBeastParams] = useState<BeastSpawnParams | null>(null);

  // Get sleep logic for navigation blocking - temporarily disabled
  // const { shouldBlockNavigation } = useSleepLogic();
  const shouldBlockNavigation = false; // Temporary fix

  // Wallet and cache management
  const { account } = useCavosAccount();
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  const resetStore = useAppStore(state => state.resetStore);
  
  // Get sleep state from store for global darkening effect
  const realTimeStatusUI = useAppStore(state => state.getRealTimeStatusForUI());
  const isBeastSleeping = realTimeStatusUI ? !realTimeStatusUI.isAwake : false;
  
  // Get beast status for navigation blocking
  const hasLiveBeast = useAppStore(state => state.hasLiveBeast());

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

  // Clear cache on app start (aggressive approach) and check for Google callback
  useEffect(() => {
    console.log('🚀 App started, performing initial cache cleanup...');

    // Check if this is a Google OAuth callback
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);
    const hasCallbackData = urlParams.has('user_data') || urlParams.has('error');

    console.log('🔍 Route detection:', {
      currentPath,
      hasCallbackData,
      fullUrl: window.location.href
    });

    if (currentPath === '/auth/callback' || hasCallbackData) {
      console.log('🎯 Detected Google OAuth callback');
      setIsGoogleCallback(true);

      // Force the browser to stay on this page
      window.history.replaceState(null, '', '/auth/callback' + window.location.search);
      return; // Don't clear cache during callback processing
    }

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

    // Show maintenance modal on app start
    setShowMaintenanceModal(true);
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

  // Handle Google OAuth callback completion
  const handleGoogleAuthComplete = useCallback((success: boolean, data?: any) => {
    console.log('🎯 Google auth callback complete:', { success, hasData: !!data });
    setIsGoogleCallback(false);
    
    // Clean up URL
    window.history.replaceState({}, document.title, '/');
    
    if (success) {
      // The AuthCallback component will have updated the Zustand store
      // The LoginScreen will pick up the auth state and proceed with initialization
      toast.success('🎉 Successfully signed in with Google!');
    } else {
      toast.error('❌ Google authentication failed. Please try again.');
    }
  }, []);

  return (
    <div className="relative min-h-screen pb-16">
      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
      />

      {/* Google OAuth Callback Handler */}
      {isGoogleCallback && (
        <AuthCallback onAuthComplete={handleGoogleAuthComplete} />
      )}
      
      {/* Normal App Screens */}
      {!isGoogleCallback && currentScreen === "login" && (
        <LoginScreen 
          onLoginSuccess={handleLoginComplete}
        />
      )}

      {/* Pass beastParams instead of hardcoded eggType */}
      {!isGoogleCallback && currentScreen === "hatch" && pendingBeastParams && (
        <HatchEggScreen
          onLoadingComplete={handleHatchComplete}  
          beastParams={pendingBeastParams} 
        />
      )}

      {/* Safety: If no params available, show loading or redirect */}
      {!isGoogleCallback && currentScreen === "hatch" && !pendingBeastParams && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-white">Preparing beast hatching...</p>
          </div>
        </div>
      )}

      {!isGoogleCallback && currentScreen === "cover" && (
        <CoverScreen
          onLoadingComplete={handleCoverComplete}  
        />
      )}

      {!isGoogleCallback && currentScreen === "home" && (
        <HomeScreen
          onNavigation={handleNavigation}
          playerAddress={cavosWallet?.address || ""}
        />
      )}

      {!isGoogleCallback && currentScreen === "sleep" && (
        <SleepScreen
          onNavigation={handleNavigation}
          playerAddress={playerAddress}
        />
      )}

      {!isGoogleCallback && currentScreen === "feed" && (
        <FeedScreen
          onNavigation={handleNavigation}
          isBeastSleeping={isBeastSleeping}
        />
      )}

      {!isGoogleCallback && currentScreen === "clean" && (
        <CleanScreen
          onNavigation={handleNavigation}
          playerAddress={playerAddress}
          isBeastSleeping={isBeastSleeping}
        />
      )}

      {!isGoogleCallback && currentScreen === "play" && (
        <PlayScreen
          onNavigation={handleNavigation}
          playerAddress={cavosWallet?.address || ""}
          isBeastSleeping={isBeastSleeping}
        />
      )}

      {/* Game Screen for mini-games */}
      {!isGoogleCallback && currentScreen === "game" && currentGameId && (
        <GameScreen
          gameId={currentGameId}
          onExitGame={handleExitGame}
        />
      )}

      {/* Game Ranking Screen */}
      {!isGoogleCallback && currentScreen === "gameRanking" && (
        <GameRankingScreen
          onNavigation={handleNavigation}
        />
      )}

      {/* Age Ranking Screen */}
      {!isGoogleCallback && currentScreen === "ageRanking" && (
        <AgeRankingScreen
          onNavigation={handleNavigation}
        />
      )}

      {!isGoogleCallback && currentScreen === "market" && (
        <MarketScreen
          onNavigation={handleNavigation}
        />
      )}

      {!isGoogleCallback && currentScreen === "gemShop" && (
        <GemShopScreen
          onNavigation={handleNavigation}
        />
      )}

      {/* Global dark overlay when beast is sleeping - applies to all screens */}
      <AnimatePresence>
        {!isGoogleCallback && isBeastSleeping && currentScreen !== "login" && currentScreen !== "hatch" && (
          <motion.div
            className="fixed inset-0 bg-black pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 1.5, 
              ease: "easeInOut" 
            }}
            style={{ zIndex: 100 }}
          />
        )}
      </AnimatePresence>

      {/* NavBar - Hide on game screen, ranking screen, and market for fullscreen experience */}
      {!isGoogleCallback && 
       currentScreen !== "cover" && 
       currentScreen !== "login" && 
       currentScreen !== "hatch" && 
       currentScreen !== "game" && 
       currentScreen !== "gameRanking" && 
       currentScreen !== "ageRanking" && 
       currentScreen !== "market" && 
       currentScreen !== "gemShop" && (
        <NavBar
          activeTab={currentScreen as "home" | "sleep" | "feed" | "clean" | "play"}
          onNavigation={handleNavigation}
          shouldBlockNavigation={shouldBlockNavigation}
          hasLiveBeast={hasLiveBeast}
        />
      )}
    </div>
  );
}

export default function App() {
  return <AppContent />;
}