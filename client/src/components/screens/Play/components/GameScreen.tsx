import { useEffect, useState } from 'react';
import { GameId } from '../../../types/play.types';
import { getGameById } from './data/miniGames';
import { useBeastDisplay } from '../../../../dojo/hooks/useBeastDisplay';
import useAppStore from '../../../../zustand/store';

// Game Components
import FlappyBeastsScreen from './minigames/flappybeast/FlappyBeastsScreen';

interface GameScreenProps {
  gameId: GameId;
  onExitGame: () => void;
}

export const GameScreen = ({ gameId, onExitGame }: GameScreenProps) => {
  // Get Cavos auth state
  const cavosAuth = useAppStore(state => state.cavos);
  const { currentBeastDisplay, hasLiveBeast, isLoading } = useBeastDisplay();
  
  // Track if the game has been successfully initialized to prevent interruption
  const [gameInitialized, setGameInitialized] = useState(false);
  // Store initial beast data to prevent loss during game
  const [initialBeastData, setInitialBeastData] = useState<typeof currentBeastDisplay | null>(null);

  // Debug: Check what we have
  console.log('🔍 GameScreen Debug:', {
    cavosWallet: cavosAuth.wallet?.address,
    isAuthenticated: cavosAuth.isAuthenticated,
    gameId,
    hasLiveBeast,
    currentBeastDisplay: !!currentBeastDisplay,
    gameInitialized,
    isLoading
  });

  // Initialize the game if we have valid beast data
  useEffect(() => {
    if (hasLiveBeast && currentBeastDisplay && !gameInitialized) {
      console.log('🎮 Initializing game with beast data:', currentBeastDisplay.displayName);
      setGameInitialized(true);
      setInitialBeastData(currentBeastDisplay);
    }
  }, [hasLiveBeast, currentBeastDisplay, gameInitialized]);

  // Prevent body scroll when game is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // No Cavos authentication available
  if (!cavosAuth.isAuthenticated || !cavosAuth.wallet) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔑</div>
          <h2 className="text-xl font-bold text-white mb-4">Not Logged In</h2>
          <p className="text-gray-300 mb-6">Please login with ByteBeasts to play games</p>
          <button
            onClick={onExitGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Loading game...</p>
        </div>
      </div>
    );
  }

  // No beast validation - show error only if we don't have beast data AND game hasn't been initialized
  if (!hasLiveBeast && !currentBeastDisplay && !gameInitialized) {
    console.log('❌ Blocking game - no beast data and not initialized');
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-xl font-bold text-white mb-4">No Beast Available</h2>
          <p className="text-gray-300 mb-6">You need a live beast to play games</p>
          <button
            onClick={onExitGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  // Game validation
  const gameConfig = getGameById(gameId);
  if (!gameConfig || !gameConfig.isActive) {
    return (
      <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-white mb-4">Game Not Available</h2>
          <p className="text-gray-300 mb-6">This game is currently unavailable</p>
          <button
            onClick={onExitGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Back to Play
          </button>
        </div>
      </div>
    );
  }

  // Render the appropriate game based on gameId
  const renderGame = () => {
    // Use initialBeastData to prevent null reference during game
    const beastData = initialBeastData || currentBeastDisplay;
    
    console.log('🎯 renderGame called:', {
      gameInitialized,
      beastData: !!beastData,
      gameId
    });
    
    if (!beastData) {
      console.log('❌ No beast data available for game rendering');
      return null; // This shouldn't happen if gameInitialized is true
    }
    
    switch (gameId) {
      case GameId.FLAPPY_BEASTS:
        return (
          <FlappyBeastsScreen
            onExitGame={onExitGame}
            gameId={gameId}
            beastId={beastData.beast_id}
            beastImage={beastData.asset}
            beastDisplayName={beastData.displayName}
            playerAddress={cavosAuth.wallet?.address || ""}
          />
        );
      
      case GameId.PLATFORM_JUMP:
        return (
          <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🚧</div>
              <h2 className="text-xl font-bold text-white mb-4">Coming Soon</h2>
              <p className="text-gray-300 mb-6">Platform Jump is under development</p>
              <button
                onClick={onExitGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Play
              </button>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">❓</div>
              <h2 className="text-xl font-bold text-white mb-4">Unknown Game</h2>
              <p className="text-gray-300 mb-6">Game ID: {gameId}</p>
              <button
                onClick={onExitGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Play
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-screen">
      {renderGame()}
    </div>
  );
};