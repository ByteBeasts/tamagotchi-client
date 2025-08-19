import type { CircleType } from '../../../types/login.types';
import useAppStore from '../../../../zustand/store';
import { motion } from 'framer-motion';
import bgLoging from '../../../../assets/backgrounds/bg-loging.png';

interface LoginBackgroundProps {
  currentCircle: CircleType;
  onConnect?: () => void;
  isConnecting?: boolean;
  isWorldApp?: boolean;
  worldcoinCredentials?: any;
}

export const LoginBackground = ({ currentCircle, onConnect, isConnecting }: LoginBackgroundProps) => {
  // Get connection state for button styling from Cavos store
  const isAuthenticated = useAppStore(state => state.cavos.isAuthenticated);
  const isLoading = useAppStore(state => state.cavos.loading);

  const handleConnect = () => {
    console.log('🎮 ByteBeasts Connect button clicked');
    onConnect?.();
  };

  // Determine button state and text
  const getButtonState = () => {
    if (isLoading || isConnecting) {
      return { text: 'CONNECTING...', disabled: true };
    }
    
    if (isAuthenticated) {
      return { text: 'CONNECTED', disabled: true };
    }
    
    return { text: 'CONNECT', disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div 
      className="h-screen w-full flex flex-col items-center justify-center absolute top-0 left-0 z-10 opacity-0 translate-y-8 animate-fadeInUp"
      style={{
        backgroundImage: `url(${bgLoging})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-md mx-auto">
        
        {/* Main title */}
        <h1 
          className="font-luckiest text-3xl sm:text-4xl text-center text-text-primary mb-4 opacity-0 translate-y-8 animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
        >
          Beasts Awaits You!
        </h1>
        
        {/* Connect Button with dynamic state */}
        <div 
          className="flex justify-center mt-8 opacity-0 translate-y-8 animate-fadeInUp"
          style={{ animationDelay: '0.6s' }}
        >
          <button
            onClick={handleConnect}
            disabled={buttonState.disabled}
            className={`
              text-lg px-8 py-3 transition-all duration-300 transform
              ${buttonState.disabled 
                ? 'btn-cr-gray cursor-not-allowed opacity-70' 
                : 'btn-cr-yellow hover:scale-105 active:scale-95'
              }
            `}
          >
            {buttonState.text}
          </button>
        </div>

        {/* Loading indicator for connecting state */}
        {(isConnecting || isLoading) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex justify-center mt-4"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
          </motion.div>
        )}
        
      </div>
    </div>
  );
};