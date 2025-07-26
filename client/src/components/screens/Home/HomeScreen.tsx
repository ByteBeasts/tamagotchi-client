import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TamagotchiTopBar } from "../../layout/TopBar";
import { HomeScreenProps, BeastData, PlayerData } from "../../types/home.types";
import MagicalSparkleParticles from "../../shared/MagicalSparkleParticles";
import { PlayerInfoModal } from "./components/PlayerInfoModal";
import { EmotionalTrackerModal } from "./components/EmotionalTrackerModal";
import forestBackground from "../../../assets/backgrounds/bg-home.png";
import microphoneIcon from "../../../assets/icons/microphone/micro.png";
import { lookupAddresses } from '@cartridge/controller';
import { useAccount } from "@starknet-react/core";
import { motion } from "framer-motion";

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

interface TranscriptionResponse {
  text: string;
}

export const HomeScreen = ({ onNavigation }: HomeScreenProps) => {
  const [age] = useState(1);
  const [playerName, setPlayerName] = useState("Player");
  const [isEmotionalTrackerModalOpen, setIsEmotionalTrackerModalOpen] = useState(false);
  
  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Speech bubble states - with permanent test message
  const [speechMessage, setSpeechMessage] = useState<string>('Hello! I am your virtual dragon companion. How are you feeling today?');
  const [showSpeech, setShowSpeech] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Account from Starknet
  const { account } = useAccount();

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

  const handleEmotionalTrackerClick = () => {
    setIsEmotionalTrackerModalOpen(true);
  };

  const closeEmotionalTrackerModal = () => {
    setIsEmotionalTrackerModalOpen(false);
  };

  // Voice recording functions
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        transcribeAudio();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer for recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Error starting recording:', err);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const transcribeAudio = useCallback(async () => {
    if (audioChunksRef.current.length === 0) {
      console.error('No audio data available');
      return;
    }

    setIsTranscribing(true);

    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY || 'your-api-key-here'}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data: TranscriptionResponse = await response.json();
      
      // Console log for debugging/testing
      console.log('🎤 Voice Transcription Result:', data.text);

      // Show the transcribed text in the speech bubble
      if (data.text.trim()) {
        setSpeechMessage(data.text.trim());
        setShowSpeech(true);
      }

    } catch (err) {
      console.error('Transcription error:', err);
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  const handleSpeechComplete = () => {
    // Keep speech bubble visible permanently for UI testing
    // setShowSpeech(false);
    // setSpeechMessage('');
    console.log('Speech completed but keeping visible for testing');
  };

  const handleVoiceRecorderClick = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isTranscribing) {
      startRecording();
    }
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
        speechMessage={speechMessage}
        showSpeech={showSpeech}
        onSpeechComplete={handleSpeechComplete}
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
        onEmotionalTrackerClick={handleEmotionalTrackerClick}
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
        beastDisplay={currentBeastDisplay}
      />

      <EmotionalTrackerModal 
        isOpen={isEmotionalTrackerModalOpen} 
        onClose={() => setIsEmotionalTrackerModalOpen(false)}
        beastDisplay={currentBeastDisplay}
      />

      {/* Voice Recorder Button (floating bottom right) */}
      {hasLiveBeast && currentBeastDisplay && (
        <motion.button
          onClick={handleVoiceRecorderClick}
          disabled={isTranscribing}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0, transition: { delay: 0.45, duration: 0.5, ease: "easeOut" } }}
          whileHover={{ scale: isTranscribing ? 1 : 1.1 }}
          whileTap={{ scale: isTranscribing ? 1 : 0.95 }}
          className={`fixed bottom-[calc(theme(spacing.16)+0.75rem+env(safe-area-inset-bottom))] right-3 sm:right-4 md:right-5 lg:right-6 z-30 p-3 rounded-full focus:outline-none active:scale-90 transition-colors ${
            isRecording 
              ? 'bg-red-500 animate-pulse' 
              : isTranscribing 
                ? 'bg-blue-500' 
                : 'bg-cream/80 hover:bg-cream'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-label={isRecording ? 'Stop Recording' : isTranscribing ? 'Transcribing...' : 'Start Recording'}
        >
          {isTranscribing ? (
            <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 border-4 border-white border-t-transparent"></div>
          ) : (
            <img 
              src={microphoneIcon} 
              alt="Voice Recorder" 
              className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 ${isRecording ? 'filter brightness-0 invert' : ''}`} 
            />
          )}
        </motion.button>
      )}

      {/* Recording time indicator */}
      {isRecording && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-[calc(theme(spacing.16)+5rem+env(safe-area-inset-bottom))] right-3 sm:right-4 md:right-5 lg:right-6 z-30 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-luckiest"
        >
          {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
        </motion.div>
      )}
    </div>
  );
};