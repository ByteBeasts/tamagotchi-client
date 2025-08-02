import { useEffect, useMemo, useState } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { network, orgSecret, appId } from '../../config/cavosConfig';
import useAppStore from '../../zustand/store';
import { authenticateWithWorldcoin, isRunningInWorldApp, WorldcoinCredentials } from '../../utils/worldcoinAuth';

interface UseWorldcoinCavosAuthReturn {
  user: any;
  wallet: any;
  loading: boolean;
  error: string | null;
  address?: string;
  handleRegister: () => Promise<void>;
  handleLogin: () => Promise<void>;
  handleBrowserLogin: (email: string, password: string) => Promise<void>;
  handleDisconnect: () => void;
  isConnected: boolean;
  testCavosConnection: () => Promise<void>;
  isWorldApp: boolean;
  worldcoinCredentials?: WorldcoinCredentials;
}

/**
 * Combined Worldcoin + Cavos authentication hook
 * Handles Worldcoin wallet auth followed by Cavos authentication using generated credentials
 */
export function useWorldcoinCavosAuth(): UseWorldcoinCavosAuthReturn {
  const [worldcoinCredentials, setWorldcoinCredentials] = useState<WorldcoinCredentials | undefined>();
  const [isWorldApp] = useState(() => isRunningInWorldApp());
  
  const {
    cavos,
    setCavosAuth,
    setCavosLoading,
    setCavosError,
    clearCavosAuth
  } = useAppStore();

  // Create CavosAuth instance
  const cavosAuth = useMemo(() => {
    return new CavosAuth(network, appId);
  }, []);

  // Initialize from persisted state
  useEffect(() => {
    const initializeAuth = () => {
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

  /**
   * Handles Cavos registration with provided credentials
   */
  const handleCavosRegister = async (credentials: WorldcoinCredentials) => {
    try {
      console.log('📝 Registering with Cavos using Worldcoin credentials...', {
        email: credentials.email,
        walletAddress: credentials.walletAddress
      });
      
      const result = await cavosAuth.signUp(
        credentials.email,
        credentials.password,
        orgSecret
      );
      
      console.log('🔍 Raw signUp response:', result);
      
      const userData = {
        email: result.data?.email,
        user_id: result.data?.user_id,
        organization: result.data?.organization,
        user_metadata: result.data?.user_metadata,
        created_at: result.data?.created_at
      };
      
      const walletData = result.data?.wallet;
      const accessToken = result.data?.authData?.accessToken;
      const refreshToken = result.data?.authData?.refreshToken;
      
      console.log('✅ Cavos registration successful:', {
        userEmail: userData.email,
        walletAddress: walletData?.address,
        hasTokens: !!(accessToken && refreshToken)
      });
      
      setCavosAuth(userData, walletData, accessToken, refreshToken);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Registration failed';
      setCavosError(errorMsg);
      console.error('❌ Cavos registration failed:', error);
      throw error;
    }
  };

  /**
   * Handles Cavos login with provided credentials
   */
  const handleCavosLogin = async (credentials: WorldcoinCredentials) => {
    try {
      console.log('🔑 Attempting Cavos login with Worldcoin credentials...', {
        email: credentials.email,
        network
      });
      
      const result = await CavosAuth.signIn(
        credentials.email,
        credentials.password,
        orgSecret
      );
      
      console.log('🔍 Raw signIn response:', result);
      
      const userData = {
        email: result.data?.email,
        user_id: result.data?.user_id,
        organization: result.data?.organization,
        user_metadata: result.data?.user_metadata,
        created_at: result.data?.created_at
      };
      
      const walletData = result.data?.wallet;
      const accessToken = result.data?.authData?.accessToken;
      const refreshToken = result.data?.authData?.refreshToken;
      
      console.log('✅ Cavos login successful:', {
        userEmail: userData.email,
        walletAddress: walletData?.address,
        hasTokens: !!(accessToken && refreshToken)
      });
      
      setCavosAuth(userData, walletData, accessToken, refreshToken);
      
    } catch (error) {
      console.log('⚠️ Cavos login failed, attempting registration...', error);
      await handleCavosRegister(credentials);
    }
  };

  /**
   * Main registration function - combines Worldcoin auth + Cavos registration
   */
  const handleRegister = async () => {
    setCavosLoading(true);
    setCavosError(null);
    
    try {
      let credentials: WorldcoinCredentials;
      
      if (isWorldApp) {
        // If running in World App, use Worldcoin authentication
        console.log('🌍 Running in World App, starting Worldcoin authentication...');
        const worldcoinResult = await authenticateWithWorldcoin();
        
        if (!worldcoinResult.success || !worldcoinResult.credentials) {
          throw new Error(worldcoinResult.error || 'Worldcoin authentication failed');
        }
        
        credentials = worldcoinResult.credentials;
        setWorldcoinCredentials(credentials);
        
      } else {
        // Fallback for development/browser - use timestamp-based credentials
        console.log('🖥️ Running in browser, using fallback credentials...');
        credentials = {
          email: `testuser${Date.now()}@bytebeasts.com`,
          password: 'ByteBeasts2024!',
          walletAddress: '',
          nullifierHash: ''
        };
      }
      
      await handleCavosRegister(credentials);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Registration failed';
      setCavosError(errorMsg);
      console.error('❌ Combined registration failed:', error);
    } finally {
      setCavosLoading(false);
    }
  };

  /**
   * Main login function - only for World App (Worldcoin auth + Cavos login)
   */
  const handleLogin = async () => {
    setCavosLoading(true);
    setCavosError(null);
    
    try {
      if (!isWorldApp) {
        throw new Error('World App authentication not available in browser');
      }

      // Use Worldcoin authentication
      console.log('🌍 Running in World App, starting Worldcoin authentication...');
      const worldcoinResult = await authenticateWithWorldcoin();
      
      if (!worldcoinResult.success || !worldcoinResult.credentials) {
        throw new Error(worldcoinResult.error || 'Worldcoin authentication failed');
      }
      
      const credentials = worldcoinResult.credentials;
      setWorldcoinCredentials(credentials);
      await handleCavosLogin(credentials);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Login failed';
      setCavosError(errorMsg);
      console.error('❌ Worldcoin login failed:', error);
    } finally {
      setCavosLoading(false);
    }
  };

  /**
   * Browser login function - uses provided credentials for Cavos
   */
  const handleBrowserLogin = async (email: string, password: string) => {
    setCavosLoading(true);
    setCavosError(null);
    
    try {
      console.log('🖥️ Browser login with provided credentials...', { email });
      
      const credentials: WorldcoinCredentials = {
        email,
        password,
        walletAddress: '',
        nullifierHash: ''
      };
      
      await handleCavosLogin(credentials);
      
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Browser login failed';
      setCavosError(errorMsg);
      console.error('❌ Browser login failed:', error);
    } finally {
      setCavosLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearCavosAuth();
    setWorldcoinCredentials(undefined);
    console.log('🚪 Disconnected from both Worldcoin and Cavos');
  };

  const testCavosConnection = async () => {
    console.log('🧪 Testing combined Worldcoin + Cavos connection...', {
      isWorldApp,
      worldcoinCredentials: worldcoinCredentials ? {
        email: worldcoinCredentials.email,
        walletAddress: worldcoinCredentials.walletAddress
      } : 'None',
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
    handleBrowserLogin,
    handleDisconnect,
    isConnected: cavos.isAuthenticated,
    testCavosConnection,
    isWorldApp,
    worldcoinCredentials
  };
}