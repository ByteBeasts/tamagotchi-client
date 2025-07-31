import { useState } from 'react';
import { HARDCODED_CREDENTIALS, network } from '../../config/cavosConfig';

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
      // Use REST API for registration
      const response = await fetch('https://services.cavos.xyz/api/v1/external/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: HARDCODED_CREDENTIALS.email,
          password: HARDCODED_CREDENTIALS.password,
          network
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Registration failed: ${errorData}`);
      }

      const result = await response.json();
      
      // Extract user and wallet data from REST API response
      const userData = result.user;
      const walletData = result.wallet;
      
      setUser(userData);
      setWallet(walletData);
      
      // Extract tokens from REST API response
      const accessToken = result.authData?.accessToken;
      const refreshToken = result.authData?.refreshToken;
      
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

  // Smart registration/login flow using REST API
  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    
    const email = HARDCODED_CREDENTIALS.email;
    const password = HARDCODED_CREDENTIALS.password;
    
    console.log('🔐 Starting Cavos REST API authentication flow...', {
      email,
      network
    });
    
    try {
      let result;
      let isNewUser = false;
      
      // First, try registration (wallet gets deployed automatically)
      try {
        console.log('📝 Attempting registration (wallet deploy)...');
        
        const registerResponse = await fetch('https://services.cavos.xyz/api/v1/external/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password,
            network
          })
        });

        if (!registerResponse.ok) {
          const errorData = await registerResponse.text();
          throw new Error(`Registration failed: ${errorData}`);
        }

        result = await registerResponse.json();
        isNewUser = true;
        console.log('✅ Registration successful - new user created with deployed wallet');
        
      } catch (registrationError) {
        console.log('⚠️ Registration failed, attempting login...', registrationError);
        
        // If registration fails (user exists), try login
        try {
          console.log('🔑 Attempting login with existing account...');
          
          const loginResponse = await fetch('https://services.cavos.xyz/api/v1/external/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email,
              password,
              network
            })
          });

          if (!loginResponse.ok) {
            const errorData = await loginResponse.text();
            throw new Error(`Login failed: ${errorData}`);
          }

          result = await loginResponse.json();
          isNewUser = false;
          console.log('✅ Login successful - existing user');
          
        } catch (loginError) {
          console.error('❌ Both registration and login failed:', loginError);
          throw loginError;
        }
      }
      
      // Extract user and wallet data from REST API response
      const userData = result.user;
      const walletData = result.wallet;
      
      setUser(userData);
      setWallet(walletData);
      
      // Extract tokens from REST API response
      const accessToken = result.authData?.accessToken;
      const refreshToken = result.authData?.refreshToken;
      
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
    console.log('🧪 Testing Cavos REST API connection...', {
      email: HARDCODED_CREDENTIALS.email,
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