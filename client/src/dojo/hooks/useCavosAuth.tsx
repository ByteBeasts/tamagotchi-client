import { useState } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { HARDCODED_CREDENTIALS, orgSecret, network } from '../../config/cavosConfig';

interface UseCavosAuthReturn {
  user: any;
  wallet: any;
  loading: boolean;
  error: string | null;
  address?: string;
  handleRegister: () => Promise<void>;
  handleLogin: () => Promise<void>;
  handleDisconnect: () => void;
  isConnected: boolean;
  testCavosConnection: () => Promise<void>;
}

/**
 * Simple Cavos authentication hook using static methods
 */
export function useCavosAuth(): UseCavosAuthReturn {
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await CavosAuth.signUp(
        HARDCODED_CREDENTIALS.email,
        HARDCODED_CREDENTIALS.password,
        orgSecret,
        network
      );
      
      setUser(result.user);
      setWallet(result.wallet);
      
      // Store tokens if available
      if (result.access_token) {
        localStorage.setItem('accessToken', result.access_token);
      }
      if (result.refresh_token) {
        localStorage.setItem('refreshToken', result.refresh_token);
      }
      
      console.log('✅ Registration successful:', result.wallet?.address);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Registration failed';
      setError(errorMsg);
      console.error('❌ Registration failed:', error);
    }
    setLoading(false);
  };

  // Simple registration-only flow to avoid login conflicts
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔐 Starting Cavos authentication...', {
      email: HARDCODED_CREDENTIALS.email,
      orgSecret: orgSecret ? 'LOADED' : 'MISSING',
      network
    });
    
    // For testing, go straight to registration with unique email
    try {
      console.log('📝 Creating new Cavos account...');
      const result = await CavosAuth.signUp(
        HARDCODED_CREDENTIALS.email,
        HARDCODED_CREDENTIALS.password,
        orgSecret,
        network
      );
      
      setUser(result.user);
      setWallet(result.wallet);
      
      // Store tokens if available
      if (result.access_token) {
        localStorage.setItem('accessToken', result.access_token);
      }
      if (result.refresh_token) {
        localStorage.setItem('refreshToken', result.refresh_token);
      }
      
      // Store complete auth data for Cavos
      if (result.user && result.wallet) {
        localStorage.setItem('cavos_auth_data', JSON.stringify({
          user: result.user,
          wallet: result.wallet
        }));
      }
      
      console.log('✅ Cavos account created successfully:', {
        userExists: !!result.user,
        walletExists: !!result.wallet,
        walletAddress: result.wallet?.address,
        accessToken: !!result.access_token,
        fullResult: result
      });
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Cavos authentication failed';
      setError(errorMsg);
      console.error('❌ Cavos authentication failed:', error);
    }
    setLoading(false);
  };

  const handleDisconnect = () => {
    setUser(null);
    setWallet(null);
    setError(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('cavos_auth_data');
    console.log('🚪 Disconnected');
  };

  // Debug function to test Cavos connection
  const testCavosConnection = async () => {
    console.log('🧪 Testing Cavos connection...', {
      email: HARDCODED_CREDENTIALS.email,
      orgSecret: orgSecret,
      network: network,
      envVars: {
        VITE_CAVOS_APP_ID: import.meta.env.VITE_CAVOS_APP_ID,
        VITE_CAVOS_ORG_SECRET: import.meta.env.VITE_CAVOS_ORG_SECRET,
        VITE_CAVOS_DEFAULT_NETWORK: import.meta.env.VITE_CAVOS_DEFAULT_NETWORK
      }
    });
  };

  return {
    user,
    wallet,
    loading,
    error,
    address: (wallet as any)?.address || undefined,
    handleRegister,
    handleLogin,
    handleDisconnect,
    isConnected: !!(user && wallet),
    testCavosConnection
  };
}