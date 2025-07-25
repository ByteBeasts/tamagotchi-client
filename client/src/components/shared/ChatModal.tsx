import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useBeastDisplay } from '../../dojo/hooks/useBeastDisplay';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! 👋 Soy tu asistente virtual de ByteBeasts. ¿En qué puedo ayudarte?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get beast display information
  const { currentBeastDisplay } = useBeastDisplay();

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "¡Interesante! 🤔 ¿Te gustaría saber más sobre cuidar a tu ByteBeast?",
        "¡Genial! 🎮 ¿Necesitas ayuda con algún mini-juego?",
        "¡Perfecto! 💫 Tu ByteBeast está creciendo muy bien.",
        "¡Excelente pregunta! 🌟 Déjame ayudarte con eso.",
        "¡Me alegra que preguntes! 🚀 ¿Qué más te gustaría saber?"
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const botMessage: Message = {
        id: Date.now() + 1,
        text: randomResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCloseClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onTouchStart={handleBackdropClick}
      style={{ 
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-cream w-[90%] max-w-lg h-[80vh] max-h-[600px] rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] overflow-hidden border-4 border-gold/30 flex flex-col"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Header */}
        <div className="bg-gold/20 p-4 border-b-4 border-gold/40 flex justify-between items-center flex-shrink-0">
          <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            💬 CHAT ASISTENTE
          </h2>
          <motion.button 
            onClick={handleCloseClick}
            onTouchStart={handleCloseClick}
            className="text-gray-800 transition-colors font-luckiest text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10 touch-manipulation"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ×
          </motion.button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-cream to-cream/80 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start items-start space-x-2'}`}
            >
              {/* Beast Avatar for bot messages */}
              {message.sender === 'bot' && (
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold/30 bg-gold/10 flex items-center justify-center">
                    {currentBeastDisplay?.asset ? (
                      <img
                        src={currentBeastDisplay.asset}
                        alt="Beast Avatar"
                        className="w-12 h-12 object-cover object-center"
                        style={{ transform: 'translateY(10%)' }}
                      />
                    ) : (
                      <span className="text-xs">🐾</span>
                    )}
                  </div>
                </div>
              )}
              
              <div
                className={`max-w-[80%] p-3 rounded-lg font-rubik text-sm ${
                  message.sender === 'user'
                    ? 'bg-gold text-gray-800 rounded-br-none shadow-[0_2px_0_rgba(0,0,0,0.1)]'
                    : 'bg-surface/40 text-gray-700 rounded-bl-none border border-gold/20'
                }`}
              >
                <p>{message.text}</p>
                <span className="text-xs opacity-60 mt-1 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start items-start space-x-2">
              {/* Beast Avatar for typing indicator */}
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold/30 bg-gold/10 flex items-center justify-center">
                  {currentBeastDisplay?.asset ? (
                    <img
                      src={currentBeastDisplay.asset}
                      alt="Beast Avatar"
                      className="w-12 h-12 object-cover object-center"
                      style={{ transform: 'translateY(10%)' }}
                    />
                  ) : (
                    <span className="text-xs">🐾</span>
                  )}
                </div>
              </div>
              
              <div className="bg-surface/40 text-gray-700 rounded-lg rounded-bl-none border border-gold/20 p-3 font-rubik text-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gold/10 border-t-4 border-gold/30 flex-shrink-0">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="flex-1 bg-surface/20 rounded-xl p-3 text-gray-800 font-rubik focus:outline-none 
                border-2 border-gold/30 shadow-inner backdrop-blur-sm
                placeholder:text-gray-500 text-sm"
              style={{ touchAction: 'manipulation' }}
            />
            <motion.button
              onClick={handleSendMessage}
              className="bg-gold text-gray-800 font-luckiest text-sm py-3 px-4 rounded-xl
                shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] 
                active:shadow-none active:translate-y-1
                transition-all duration-150 touch-manipulation
                disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!inputMessage.trim() || isTyping}
              style={{ 
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                cursor: 'pointer'
              }}
            >
              <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
                ENVIAR
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 