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

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await CavosAuth.signIn(
        HARDCODED_CREDENTIALS.email,
        HARDCODED_CREDENTIALS.password,
        orgSecret
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
      
      console.log('✅ Login successful:', result.wallet?.address);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      setError(errorMsg);
      console.error('❌ Login failed:', error);
    }
    setLoading(false);
  };

  const handleDisconnect = () => {
    setUser(null);
    setWallet(null);
    setError(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    console.log('🚪 Disconnected');
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
    isConnected: !!(user && wallet)
  };
}