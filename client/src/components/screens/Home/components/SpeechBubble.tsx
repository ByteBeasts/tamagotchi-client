import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import dialogIcon from "../../../../assets/icons/dialog/dialog.png";

interface SpeechBubbleProps {
  message: string;
  isVisible: boolean;
  onComplete?: () => void;
}

export const SpeechBubble = ({ message, isVisible, onComplete }: SpeechBubbleProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (!isVisible || !message) {
      setDisplayedText('');
      setCurrentIndex(0);
      return;
    }

    if (currentIndex < message.length) {
      const timer = setTimeout(() => {
        setDisplayedText(prev => prev + message[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 50); // Speed of typewriter effect

      return () => clearTimeout(timer);
    }
    // Removed auto-hide functionality - message stays visible
  }, [currentIndex, message, isVisible, onComplete]);

  // Reset when message changes
  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [message]);

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 20,
            duration: 0.3 
          }}
          className="relative z-50 mb-4"
          style={{ 
            zIndex: 1000, 
            width: '200px',
            margin: '0 auto'
          }}
        >
          {/* Dialog background */}
          <div className="relative w-full">
            <img 
              src={dialogIcon} 
              alt="Speech bubble" 
              className="w-full h-auto object-contain drop-shadow-lg mx-auto block"
            />
            
            {/* Text content - positioned to fit within the speech bubble */}
            <div className="absolute top-3 left-3 right-3 bottom-6 flex items-center justify-center">
              <motion.p 
                className="text-gray-800 font-luckiest text-xs text-center leading-tight px-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{ maxWidth: '160px' }}
              >
                {displayedText}
                {currentIndex < message.length && (
                  <motion.span
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="ml-1"
                  >
                    |
                  </motion.span>
                )}
              </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpeechBubble; 