import type { CircleType } from '../../../types/login.types';
import { SVGDefinitions, BackgroundElements } from './SVGComponents';
import { InteractiveCircles } from './InteractiveCircles';
import useAppStore from '../../../../zustand/store';

interface VennDiagramProps {
  currentCircle: CircleType;
  onConnect?: () => void;
}

export const VennDiagram = ({ currentCircle, onConnect }: VennDiagramProps) => {
  // Get connection state for button styling from Cavos store
  const isAuthenticated = useAppStore(state => state.cavos.isAuthenticated);
  const isLoading = useAppStore(state => state.cavos.loading);

  const handleConnect = () => {
    console.log('🎮 ByteBeasts Connect button clicked');
    onConnect?.();
  };

  // Determine button state and text
  const getButtonState = () => {
    if (isLoading) {
      return { text: 'CONNECTING...', disabled: true };
    }
    
    if (isAuthenticated) {
      return { text: 'CONNECTED', disabled: true };
    }
    
    return { text: 'CONNECT', disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <div className="h-screen w-full bg-screen flex flex-col items-center justify-center absolute top-0 left-0 z-10 opacity-0 translate-y-8 animate-fadeInUp">
      <div className="max-w-md mx-auto">
        
        {/* Main title */}
        <h1 
          className="font-luckiest text-3xl sm:text-4xl text-center text-text-primary mb-8 opacity-0 translate-y-8 animate-fadeInUp"
          style={{ animationDelay: '0.2s' }}
        >
          Beasts Awaits You!
        </h1>
        
        {/* Interactive diagram */}
        <div 
          className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 mx-auto opacity-0 translate-y-8 animate-fadeInUp"
          style={{ animationDelay: '0.4s' }}
        >
          <svg viewBox="0 0 400 400" className="w-full h-full">
            <SVGDefinitions />
            <BackgroundElements />
            <InteractiveCircles currentCircle={currentCircle} />
          </svg>
        </div>
        
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
        {isLoading && (
          <div className="flex justify-center mt-4">
            <div className="flex items-center space-x-2 text-text-primary/80">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-text-primary"></div>
              <span className="text-sm font-medium">Opening Cartridge Controller...</span>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};