import { useState } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { HARDCODED_CREDENTIALS, orgSecret, appId, network } from '../../config/cavosConfig';

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
      // TEST CAVOS CON TU ORG_SECRET REAL
      console.log('🧪 Testing CavosAuth.signUp with your real orgSecret...');
      console.log('🔑 Using orgSecret:', orgSecret ? 'LOADED' : 'MISSING');
      const testResult = await CavosAuth.signUp("user91@example.com", "PasswordSegura123", orgSecret);
      console.log('🧪 CAVOS TEST RESULT WITH REAL SECRET:', testResult);
      
      // Debug: Check what's available in the installed version
      console.log('🔍 Investigating CavosAuth v1.2.20...');
      
      // Try static methods first (older API)
      console.log('📋 Static methods available:', {
        signUp: typeof CavosAuth.signUp,
        login: typeof CavosAuth.login,
        register: typeof CavosAuth.register
      });
      
      // Try instance methods
      const cavosAuth = new CavosAuth({
        appId: appId,
        baseURL: 'https://services.cavos.xyz/api/v1/external',
        network: network
      });
      
      console.log('📋 Instance methods available:', {
        signUp: typeof cavosAuth.signUp,
        login: typeof cavosAuth.login,
        register: typeof cavosAuth.register,
        executeTransaction: typeof cavosAuth.executeTransaction
      });
      
      // Try the original static method that was working
      const result = await CavosAuth.signUp(
        HARDCODED_CREDENTIALS.email,
        HARDCODED_CREDENTIALS.password,
        orgSecret, // Use orgSecret since that was working
        network
      );
      
      // Extract the actual user and wallet data from the response
      const userData = result.data || result.user || result;
      const walletData = result.data?.wallet || result.wallet;
      
      setUser(userData);
      setWallet(walletData);
      
      // Store tokens if available from the response (check multiple possible locations)
      const accessToken = result.authData?.accessToken || result.authData?.access_token || 
                         result.data?.authData?.accessToken || result.data?.authData?.access_token ||
                         result.access_token || result.data?.access_token;
      const refreshToken = result.authData?.refreshToken || result.authData?.refresh_token ||
                          result.data?.authData?.refreshToken || result.data?.authData?.refresh_token ||
                          result.refresh_token || result.data?.refresh_token;
      
      if (accessToken) {
        console.log('💾 Storing accessToken in localStorage:', accessToken.substring(0, 20) + '...');
        localStorage.setItem('accessToken', accessToken);
        
        // Verify it was stored
        const storedToken = localStorage.getItem('accessToken');
        console.log('✅ Verified stored accessToken:', !!storedToken, storedToken?.substring(0, 20) + '...');
      } else {
        console.log('⚠️ No accessToken to store');
      }
      if (refreshToken) {
        console.log('💾 Storing refreshToken in localStorage');
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        console.log('⚠️ No refreshToken to store');
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
      // TEST CAVOS CON TU ORG_SECRET REAL  
      console.log('🧪 Testing CavosAuth.signUp with your real orgSecret...');
      console.log('🔑 Using orgSecret:', orgSecret ? 'LOADED' : 'MISSING');
      const testResult = await CavosAuth.signUp("user91@example.com", "PasswordSegura123", orgSecret);
      console.log('🧪 CAVOS TEST RESULT WITH REAL SECRET:', testResult);
      
      console.log('📝 Creating new Cavos account...');
      // Debug: Check what's available in the installed version
      console.log('🔍 Investigating CavosAuth v1.2.20...');
      
      // Try static methods first (older API)
      console.log('📋 Static methods available:', {
        signUp: typeof CavosAuth.signUp,
        login: typeof CavosAuth.login,
        register: typeof CavosAuth.register
      });
      
      // Try instance methods
      const cavosAuth = new CavosAuth({
        appId: appId,
        baseURL: 'https://services.cavos.xyz/api/v1/external',
        network: network
      });
      
      console.log('📋 Instance methods available:', {
        signUp: typeof cavosAuth.signUp,
        login: typeof cavosAuth.login,
        register: typeof cavosAuth.register,
        executeTransaction: typeof cavosAuth.executeTransaction
      });
      
      // Try the original static method that was working
      const result = await CavosAuth.signUp(
        HARDCODED_CREDENTIALS.email,
        HARDCODED_CREDENTIALS.password,
        orgSecret, // Use orgSecret since that was working
        network
      );
      
      // Extract the actual user and wallet data from the response
      const userData = result.data || result.user || result;
      const walletData = result.data?.wallet || result.wallet;
      
      setUser(userData);
      setWallet(walletData);
      
      // Store tokens if available from the response (check multiple possible locations)
      const accessToken = result.authData?.accessToken || result.authData?.access_token || 
                         result.data?.authData?.accessToken || result.data?.authData?.access_token ||
                         result.access_token || result.data?.access_token;
      const refreshToken = result.authData?.refreshToken || result.authData?.refresh_token ||
                          result.data?.authData?.refreshToken || result.data?.authData?.refresh_token ||
                          result.refresh_token || result.data?.refresh_token;
      
      if (accessToken) {
        console.log('💾 Storing accessToken in localStorage:', accessToken.substring(0, 20) + '...');
        localStorage.setItem('accessToken', accessToken);
        
        // Verify it was stored
        const storedToken = localStorage.getItem('accessToken');
        console.log('✅ Verified stored accessToken:', !!storedToken, storedToken?.substring(0, 20) + '...');
      } else {
        console.log('⚠️ No accessToken to store');
      }
      if (refreshToken) {
        console.log('💾 Storing refreshToken in localStorage');
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        console.log('⚠️ No refreshToken to store');
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
          accessToken: accessToken,
          refreshToken: refreshToken
        },
        tokenSearchPaths: {
          'result.authData?.accessToken': result.authData?.accessToken,
          'result.authData?.access_token': result.authData?.access_token,
          'result.data?.authData?.accessToken': result.data?.authData?.accessToken,
          'result.data?.authData?.access_token': result.data?.authData?.access_token,
          'result.access_token': result.access_token,
          'result.data?.access_token': result.data?.access_token
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