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
          className="absolute -top-20 left-1/2 transform -translate-x-1/2 z-20"
        >
          {/* Dialog background */}
          <div className="relative">
            <img 
              src={dialogIcon} 
              alt="Speech bubble" 
              className="w-48 h-32 object-contain drop-shadow-lg"
            />
            
            {/* Text content */}
            <div className="absolute inset-0 flex items-center justify-center px-6 py-4">
              <motion.p 
                className="text-gray-800 font-rubik text-sm font-medium text-center leading-tight max-w-32"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
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