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
      // Usar método estático como funciona ahora
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

  // Smart login/registration flow
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    const email = HARDCODED_CREDENTIALS.email;
    const password = HARDCODED_CREDENTIALS.password;
    
    console.log('🔐 Starting Cavos authentication flow...', {
      email,
      orgSecret: orgSecret ? 'LOADED' : 'MISSING',
      network
    });
    
    try {
      let result;
      let isNewUser = false;
      
      // First, try to login with existing account
      try {
        console.log('🔑 Attempting login with existing account...');
        result = await CavosAuth.signIn(email, password, orgSecret);
        console.log('✅ Login successful - user exists');
      } catch (loginError) {
        console.log('⚠️ Login failed, attempting registration...', loginError);
        
        // If login fails, try registration
        try {
          console.log('📝 Creating new Cavos account...');
          result = await CavosAuth.signUp(email, password, orgSecret, network);
          isNewUser = true;
          console.log('✅ Registration successful - new user created');
        } catch (registrationError) {
          console.error('❌ Both login and registration failed:', registrationError);
          throw registrationError;
        }
      }
      
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
          wallet: walletData,
          isNewUser // Flag to indicate if user was just registered
        }));
      }
      
      console.log(`✅ Cavos authentication successful (${isNewUser ? 'NEW USER' : 'EXISTING USER'}):`, {
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
      const errorMsg = error instanceof Error ? error.message : 'Cavos login failed';
      setError(errorMsg);
      console.error('❌ Cavos login failed:', error);
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