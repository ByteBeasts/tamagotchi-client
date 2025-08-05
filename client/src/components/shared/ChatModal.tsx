import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '@starknet-react/core';
import { useBeastDisplay } from '../../dojo/hooks/useBeastDisplay';
import { ChatService } from '../../services/chatService';

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

const INITIAL_MESSAGE: Message = {
  id: 1,
  text: "¡Hola! 👋 Soy tu asistente virtual de ByteBeasts. ¿En qué puedo ayudarte?",
  sender: 'bot',
  timestamp: new Date()
};

const ERROR_MESSAGE = "Lo siento, hubo un problema al procesar tu mensaje. ¿Puedes intentar de nuevo? 😅";

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { currentBeastDisplay } = useBeastDisplay();
  const { account } = useAccount();

  const currentAgent = ChatService.getAgentForBeastType(currentBeastDisplay?.beastTypeString);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const addMessage = useCallback((text: string, sender: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now() + (sender === 'bot' ? 1 : 0),
      text,
      sender,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputMessage.trim() || isTyping) return;

    const messageText = inputMessage.trim();
    addMessage(messageText, 'user');
    setInputMessage('');
    setIsTyping(true);

    try {
      const userId = account?.address || 'anonymous';
      const response = await ChatService.sendMessage(messageText, userId, currentAgent);
      addMessage(response, 'bot');
    } catch (error) {
      console.error('Chat error:', error);
      addMessage(ERROR_MESSAGE, 'bot');
    } finally {
      setIsTyping(false);
    }
  }, [inputMessage, isTyping, account?.address, currentAgent, addMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleClose = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  }, [onClose]);

  const handleBackdropClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  }, [handleClose]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const bodyStyle = document.body.style;
    if (isOpen) {
      bodyStyle.overflow = 'hidden';
      bodyStyle.touchAction = 'none';
    } else {
      bodyStyle.overflow = '';
      bodyStyle.touchAction = '';
    }
    
    return () => {
      bodyStyle.overflow = '';
      bodyStyle.touchAction = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const BeastAvatar = () => (
    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gold/30 bg-gold/10 flex items-center justify-center flex-shrink-0">
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
  );

  const TypingIndicator = () => (
    <div className="bg-surface/40 text-gray-700 rounded-lg rounded-bl-none border border-gold/20 p-3 font-rubik text-sm">
      <div className="flex space-x-1">
        {[0, 0.1, 0.2].map((delay, i) => (
          <div 
            key={i}
            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" 
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </div>
    </div>
  );

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
        <div className="bg-gold/20 p-4 border-b-4 border-gold/40 flex justify-between items-center flex-shrink-0">
          <div className="flex flex-col">
            <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              💬 CHAT ASISTENTE
            </h2>
            <span className="text-gray-600 font-rubik text-sm">
              Hablando con: {currentAgent}
            </span>
          </div>
          <motion.button 
            onClick={handleClose}
            onTouchStart={handleClose}
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

        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-cream to-cream/80 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start items-start space-x-2'}`}
            >
              {message.sender === 'bot' && <BeastAvatar />}
              
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
              <BeastAvatar />
              <TypingIndicator />
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

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
              disabled={isTyping}
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
                {isTyping ? 'ENVIANDO...' : 'ENVIAR'}
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}; 