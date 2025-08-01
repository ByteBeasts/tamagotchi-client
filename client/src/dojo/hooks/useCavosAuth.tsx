import { useEffect, useMemo } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { HARDCODED_CREDENTIALS, network, orgSecret, appId } from '../../config/cavosConfig';
import useAppStore from '../../zustand/store';

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
 * Cavos authentication hook using SDK and centralized Zustand store
 */
export function useCavosAuth(): UseCavosAuthReturn {
  const {
    cavos,
    setCavosAuth,
    setCavosLoading,
    setCavosError,
    clearCavosAuth
  } = useAppStore();

  // Create CavosAuth instance for signUp, refreshToken, executeCalls
  const cavosAuth = useMemo(() => {
    return new CavosAuth(network, appId);
  }, []);

  // Initialize from persisted state
  useEffect(() => {
    const initializeAuth = () => {
      // Check if we have persisted auth data in Zustand
      if (cavos.isAuthenticated && cavos.user && cavos.wallet && cavos.accessToken) {
        console.log('✅ Cavos auth restored from store:', {
          email: cavos.user.email,
          walletAddress: cavos.wallet.address,
          hasAccessToken: !!cavos.accessToken
        });
      }
    };
    
    initializeAuth();
  }, [cavos]);

  const handleRegister = async () => {
    setCavosLoading(true);
    setCavosError(null);
    
    try {
      console.log('📝 Registering new user with Cavos SDK...');
      
      const result = await cavosAuth.signUp(
        HARDCODED_CREDENTIALS.email,
        HARDCODED_CREDENTIALS.password,
        orgSecret
      );
      
      console.log('✅ Registration successful:', {
        userEmail: result.user?.email,
        walletAddress: result.wallet?.address,
        hasTokens: !!(result.access_token && result.refresh_token)
      });
      
      // Update Zustand store with auth data
      setCavosAuth(
        result.user,
        result.wallet,
        result.access_token,
        result.refresh_token
      );
      
      console.log('✅ Registration and wallet deployment completed successfully');
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Registration failed';
      setCavosError(errorMsg);
      console.error('❌ Registration failed:', error);
    }
  };

  const handleLogin = async () => {
    setCavosLoading(true);
    setCavosError(null);
    
    const email = HARDCODED_CREDENTIALS.email;
    const password = HARDCODED_CREDENTIALS.password;
    
    console.log('🔑 Attempting login with Cavos SDK...', { email, network });
    
    try {
      const result = await CavosAuth.signIn(
        email,
        password,
        orgSecret
      );
      
      console.log('✅ Login successful - existing user:', {
        userEmail: result.user?.email,
        walletAddress: result.wallet?.address,
        hasTokens: !!(result.access_token && result.refresh_token)
      });
      
      // Update Zustand store with auth data
      setCavosAuth(
        result.user,
        result.wallet,
        result.access_token,
        result.refresh_token
      );
      
    } catch (error) {
      console.log('⚠️ Login failed, user may not exist. Attempting registration...', error);
      
      // Call register function if login fails
      await handleRegister();
    }
  };

  const handleDisconnect = () => {
    clearCavosAuth();
    console.log('🚪 Disconnected');
  };

  // Debug function to test Cavos connection
  const testCavosConnection = async () => {
    console.log('🧪 Testing Cavos SDK connection...', {
      email: HARDCODED_CREDENTIALS.email,
      network: network,
      orgSecret: orgSecret ? 'LOADED' : 'MISSING',
      currentAuth: {
        isAuthenticated: cavos.isAuthenticated,
        hasUser: !!cavos.user,
        hasWallet: !!cavos.wallet,
        hasTokens: !!(cavos.accessToken && cavos.refreshToken)
      }
    });
  };

  return {
    user: cavos.user,
    wallet: cavos.wallet,
    loading: cavos.loading,
    error: cavos.error,
    address: cavos.wallet?.address || undefined,
    handleRegister,
    handleLogin,
    handleDisconnect,
    isConnected: cavos.isAuthenticated,
    testCavosConnection
  };
}