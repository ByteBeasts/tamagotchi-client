import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useAppStore from '../../../zustand/store';

interface AuthCallbackProps {
  onAuthComplete: (success: boolean, data?: any) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onAuthComplete }) => {
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing authentication...");
  const setCavosAuth = useAppStore(state => state.setCavosAuth);

  useEffect(() => {
    const handleCallback = () => {
      try {
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const userData = urlParams.get("user_data");
        const error = urlParams.get("error");

        // Handle errors
        if (error) {
          setStatus("error");
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => onAuthComplete(false), 3000);
          return;
        }

        // Process user data
        if (userData) {
          const decodedUserData = decodeURIComponent(userData);
          const parsedUserData = JSON.parse(decodedUserData);
          
          console.log('📦 Received Google OAuth data:', parsedUserData);
          
          // Extract the necessary data for Cavos auth state
          const cavosUser = {
            email: parsedUserData.email || 'google-user@bytebeasts.com',
            user_id: parsedUserData.user_id || parsedUserData.id,
            organization: parsedUserData.organization,
            user_metadata: parsedUserData.user_metadata || {},
            created_at: parsedUserData.created_at || new Date().toISOString()
          };
          
          const cavosWallet = parsedUserData.wallet || {
            address: parsedUserData.wallet_address,
            network: parsedUserData.network || 'sepolia'
          };
          
          const accessToken = parsedUserData.authData?.accessToken || parsedUserData.access_token;
          const refreshToken = parsedUserData.authData?.refreshToken || parsedUserData.refresh_token;
          
          console.log('✅ Setting Cavos auth state:', {
            user: cavosUser.email,
            wallet: cavosWallet.address,
            hasTokens: !!(accessToken && refreshToken)
          });
          
          // Update Cavos auth state in store
          setCavosAuth(cavosUser, cavosWallet, accessToken, refreshToken);
          
          // Show success and redirect
          setStatus("success");
          setMessage("Authentication successful! Welcome to ByteBeasts!");
          setTimeout(() => onAuthComplete(true, parsedUserData), 1500);
          
        } else {
          setStatus("error");
          setMessage("No authentication data received");
          setTimeout(() => onAuthComplete(false), 3000);
        }
      } catch (error) {
        console.error('❌ Callback processing error:', error);
        setStatus("error");
        setMessage("An error occurred during authentication");
        setTimeout(() => onAuthComplete(false), 3000);
      }
    };

    // Small delay to ensure URL params are available
    setTimeout(handleCallback, 100);
  }, [onAuthComplete, setCavosAuth]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-hidden">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-cream w-[90%] max-w-md rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] overflow-hidden border-4 border-gold/30 mx-4"
        style={{ maxHeight: '80vh', maxWidth: '90vw' }}
      >
        {/* Header */}
        <div className="bg-gold-gradient p-4 border-b-4 border-gold/40">
          <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)] text-center">
            AUTHENTICATION
          </h2>
        </div>

        {/* Body */}
        <div className="p-8 text-center">
          {/* Visual status indicators */}
          {status === "processing" && (
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gold/30 border-t-gold mx-auto mb-6"></div>
          )}
          {status === "success" && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-full h-12 w-12 bg-green-500 flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
          {status === "error" && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="rounded-full h-12 w-12 bg-red-500 flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.div>
          )}
          
          <p className={`font-rubik text-base ${
            status === "success" ? "text-green-600" : 
            status === "error" ? "text-red-600" : 
            "text-gray-700"
          }`}>
            {message}
          </p>
        </div>
      </motion.div>
    </div>
  );
};