import { useCavosAuth } from '../../../dojo/hooks/useCavosAuth';
import { usePlayerInitializationCavos } from '../../../dojo/hooks/usePlayerInitializationCavos';
import { useLoginAnimations } from './components/useLoginAnimations';
import { UniverseView, GameView } from './components/CoverViews';
import { VennDiagram } from './components/VennDiagram';
import { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import useAppStore from '../../../zustand/store'; 

interface LoginScreenProps {
  onLoginSuccess: (destination: 'hatch' | 'cover') => void;
}

/**
 * Enhanced Login/Cover component that handles the intro sequence
 * and redirects to appropriate screen based on VALIDATED player's beast status
 * includes fetchStatus + updateBeast validation before navigation
 */
export const LoginScreen = ({ onLoginSuccess }: LoginScreenProps) => {
  const { view, currentCircle } = useLoginAnimations();
  const [isConnecting, setIsConnecting] = useState(false);
  
  // Integrate Cavos authentication hook
  const { 
    error: connectionError,
    address,
    handleLogin,
    isConnected
  } = useCavosAuth();

  // Integrate real Cavos player initialization
  const { 
    initializeComplete,
    error: initializationError,
    completed,
    playerExists,
    hasLiveBeast,
    shouldGoToHatch,
    shouldGoToHome,
    playerSpawnTxHash,
    playerSpawnTxStatus,
  } = usePlayerInitializationCavos();

  // Get player from store 
  const storePlayer = useAppStore(state => state.player);

  // Ref to prevent multiple initializations 
  const hasInitialized = useRef(false);

  // Handle connect button click - trigger Cavos authentication
  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await handleLogin();
    } catch (error) {
      console.error('Cavos authentication failed:', error);
      setIsConnecting(false);
    }
  };

  // Trigger complete player initialization on Cavos authentication
  useEffect(() => {
    console.log('🔄 Initialization effect triggered:', {
      isConnected,
      address: !!address,
      hasInitialized: hasInitialized.current
    });
    
    if (isConnected && address && !hasInitialized.current) {
      console.log('🎯 Starting initialization process...');
      hasInitialized.current = true;
      
      // Enhanced: Show validation loading toast
      toast.loading('Setting up your game...', {
        id: 'init-validation',
        duration: 0
      });
      
      initializeComplete(address).then(() => {
        console.log('✅ initializeComplete promise resolved');
        // Enhanced: Dismiss loading toast and show success
        toast.dismiss('init-validation');
        toast.success('Welcome back!', { duration: 2000 });
      }).catch(error => {
        console.error("❌ Initialization failed:", error);
        toast.dismiss('init-validation');
        toast.error('Something went wrong. Please try again!');
        hasInitialized.current = false; // Reset on error
      });
    }
  }, [isConnected, address, initializeComplete]);

  /**
   * Enhanced navigation logic with validated beast status
   * Now the beast status has been validated with fetchStatus + updateBeast
   */
  useEffect(() => {
    // Only navigate when initialization is complete
    console.log('🔍 Navigation check:', {
      isConnected,
      address: !!address,
      completed,
      storePlayer: !!storePlayer,
      shouldGoToHome,
      shouldGoToHatch,
      canNavigate: isConnected && address && completed
    });
    
    // Navigation based on completed initialization (storePlayer not required for new players)
    if (isConnected && address && completed) {
      console.log('🎯 Navigation with validated beast status:', {
        shouldGoToHome,
        shouldGoToHatch,
        hasLiveBeast
      });
      
      // Navigate based on VALIDATED beast status
      setTimeout(() => {
        if (shouldGoToHome) {
          console.log('✅ Navigating to cover - beast validated as alive');
          onLoginSuccess('cover');
        } else if (shouldGoToHatch) {
          console.log('🥚 Navigating to hatch - beast validated as dead/nonexistent');
          onLoginSuccess('hatch');
        }
      }, 1500);
    }
  }, [
    isConnected, 
    address, 
    completed, 
    storePlayer, 
    playerExists, 
    hasLiveBeast, 
    shouldGoToHatch, 
    shouldGoToHome, 
    onLoginSuccess
  ]);

  /**
   * Handle connection errors 
   */
  useEffect(() => {
    if (connectionError) {
      console.error('Connection error:', connectionError);
      toast.error('Unable to connect. Please try again!', {
        duration: 4000,
        position: 'top-center'
      });
      setIsConnecting(false);
    }
  }, [connectionError]);

  /**
   * Handle initialization errors 
   */
  useEffect(() => {
    if (initializationError && initializationError !== "Already initializing") {
      console.error('Initialization error:', initializationError);
      toast.error('Having trouble loading your game. Please refresh!', {
        duration: 4000,
        position: 'top-center'
      });
    }
  }, [initializationError]);

  /**
   * Show transaction progress toasts 
   */
  useEffect(() => {
    if (playerSpawnTxHash && playerSpawnTxStatus === 'SUCCESS') {
      toast.success('Your adventure begins!', {
        duration: 3000,
        position: 'top-center'
      });
    } else if (playerSpawnTxHash && playerSpawnTxStatus === 'REJECTED') {
      toast.error('Unable to start your adventure. Please try again!', {
        duration: 4000,
        position: 'top-center'
      });
    }
  }, [playerSpawnTxHash, playerSpawnTxStatus]);

  /**
   * Enhanced beast status information with validation context
   */
  useEffect(() => {
    if (completed) {
      if (hasLiveBeast) {
        toast.success('🐾 Your beast is waiting for you!', {
          duration: 2000,
          position: 'top-center'
        });
      } else {
        toast('🥚 Time to hatch your first beast!', {
          duration: 2000,
          position: 'top-center',
          icon: '🥚'
        });
      }
    }
  }, [completed, hasLiveBeast]);

  // Render different views based on animation state 
  switch (view) {
    case 'universe':
      return <UniverseView />;
    case 'game':
      return <GameView />;
    case 'cover':
      return (
        <>
          <VennDiagram 
            currentCircle={currentCircle} 
            onConnect={handleConnect}
            isConnecting={isConnecting}
          />
          
          {/* Enhanced Toast Container with loading support */}
          <Toaster
            toastOptions={{
              className: 'bg-white/95 text-gray-800 border border-gray-200 rounded-lg shadow-xl backdrop-blur-sm font-medium',
              success: { 
                iconTheme: { primary: '#10B981', secondary: '#FFFFFF' }
              },
              error: { 
                iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' }
              },
              loading: {
                iconTheme: { primary: '#3B82F6', secondary: '#FFFFFF' }
              }
            }}
          />
        </>
      );
    default:
      return null;
  }
};