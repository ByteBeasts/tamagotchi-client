import { useState, useMemo } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { network, appId } from '../../config/cavosConfig';
import useAppStore from '../../zustand/store';

interface CavosTransactionCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

interface UseCavosTransactionReturn {
  executeTransaction: (calls: CavosTransactionCall[]) => Promise<string>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for executing transactions using Cavos SDK
 */
export function useCavosTransaction(): UseCavosTransactionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { cavos, setCavosTokens, setCavosError } = useAppStore();

  // Create CavosAuth instance for executeCalls and refreshToken
  const cavosAuth = useMemo(() => {
    return new CavosAuth(network, appId);
  }, []);

  const refreshAccessToken = async (): Promise<string> => {
    if (!cavos.refreshToken) {
      throw new Error('No refresh token found. Please login again.');
    }

    console.log('🔄 Refreshing access token with SDK instance...');
    
    try {
      // Use instance method for refreshToken
      const result = await cavosAuth.refreshToken(
        cavos.refreshToken,
        network
      );
      
      console.log('✅ Access token refreshed successfully');
      
      // Update tokens in store
      setCavosTokens(result.access_token, result.refresh_token);
      
      return result.access_token;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      throw new Error('Token refresh failed. Please login again.');
    }
  };

  const executeTransaction = async (calls: CavosTransactionCall[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      if (!cavos.isAuthenticated || !cavos.accessToken || !cavos.wallet) {
        throw new Error('Not authenticated. Please login first.');
      }

      console.log('📝 Executing Cavos transaction with SDK:', {
        network,
        walletAddress: cavos.wallet.address,
        callsCount: calls.length,
        calls: calls.map(call => ({
          contract: call.contractAddress,
          entrypoint: call.entrypoint,
          calldataLength: call.calldata.length
        }))
      });

      let accessToken = cavos.accessToken;

      try {
        // Execute transaction using SDK instance method
        const result = await cavosAuth.executeCalls(
          cavos.wallet.address,
          calls,
          accessToken
        );

        console.log('📦 Cavos transaction result:', result);
        
        // Check if result contains an error first
        if (result && typeof result === 'object' && result.error) {
          console.error('❌ Cavos transaction failed with error:', result.error);
          throw new Error(`Transaction failed: ${result.error}`);
        }

        // Extract transaction hash
        const transactionHash = result?.transaction_hash || result;
        
        if (!transactionHash || typeof transactionHash !== 'string') {
          console.error('❌ No valid transaction hash returned:', result);
          throw new Error('No valid transaction hash returned');
        }

        console.log('✅ Cavos transaction successful:', transactionHash);
        return transactionHash;

      } catch (err) {
        // Check if it's an authentication error
        if (err instanceof Error && err.message.includes('401')) {
          console.log('🔄 Token expired, attempting refresh...');
          
          try {
            accessToken = await refreshAccessToken();
            
            // Retry transaction with new token
            const result = await cavosAuth.executeCalls(
              cavos.wallet.address,
              calls,
              accessToken
            );

            console.log('📦 Cavos transaction result after token refresh:', result);
            
            // Check if result contains an error first
            if (result && typeof result === 'object' && result.error) {
              console.error('❌ Cavos transaction failed with error after refresh:', result.error);
              throw new Error(`Transaction failed: ${result.error}`);
            }

            // Extract transaction hash
            const transactionHash = result?.transaction_hash || result;
            
            if (!transactionHash || typeof transactionHash !== 'string') {
              console.error('❌ No valid transaction hash returned after refresh:', result);
              throw new Error('No valid transaction hash returned');
            }

            console.log('✅ Cavos transaction successful after token refresh:', transactionHash);
            return transactionHash;

          } catch (refreshError) {
            console.error('❌ Token refresh failed:', refreshError);
            setCavosError('Session expired. Please login again.');
            throw new Error('Session expired. Please login again.');
          }
        }
        
        throw err;
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setError(errorMsg);
      console.error('❌ Cavos transaction failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    executeTransaction,
    loading,
    error
  };
}