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
      
      // Extract the actual user and wallet data from the response
      const userData = result.data || result.user || result;
      const walletData = result.data?.wallet || result.wallet;
      
      setUser(userData);
      setWallet(walletData);
      
      // Store tokens if available from the response
      const accessToken = result.data?.access_token || result.access_token;
      const refreshToken = result.data?.refresh_token || result.refresh_token;
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      console.log('✅ Registration successful:', walletData?.address);
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
      
      // Extract the actual user and wallet data from the response
      const userData = result.data || result.user || result;
      const walletData = result.data?.wallet || result.wallet;
      
      setUser(userData);
      setWallet(walletData);
      
      // Store tokens if available from the response
      const accessToken = result.data?.access_token || result.access_token;
      const refreshToken = result.data?.refresh_token || result.refresh_token;
      
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
      }
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      
      // Store complete auth data for Cavos
      if (userData && walletData) {
        localStorage.setItem('cavos_auth_data', JSON.stringify({
          user: userData,
          wallet: walletData
        }));
      }
      
      console.log('✅ Cavos account created successfully:', {
        userExists: !!userData,
        walletExists: !!walletData,
        walletAddress: walletData?.address,
        accessToken: !!accessToken,
        resultStructure: {
          hasData: !!result.data,
          hasUser: !!result.user,
          hasWallet: !!result.wallet,
          hasAuthData: !!result.authData,
          dataKeys: result.data ? Object.keys(result.data) : [],
          topLevelKeys: Object.keys(result)
        },
        extractedData: {
          userData: userData,
          walletData: walletData,
          accessToken: accessToken
        },
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