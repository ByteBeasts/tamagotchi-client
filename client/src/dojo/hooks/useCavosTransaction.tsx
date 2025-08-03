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
  const { setCavosTokens } = useAppStore();

  // Create CavosAuth instance for executeCalls
  const cavosAuth = useMemo(() => {
    console.log('🔧 Creating CavosAuth instance with:', { network, appId });
    return new CavosAuth(network, appId);
  }, []);


  const executeTransaction = async (calls: CavosTransactionCall[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      // Get the latest state from the store
      const currentState = useAppStore.getState();
      const currentCavos = currentState.cavos;
      
      if (!currentCavos.isAuthenticated || !currentCavos.accessToken || !currentCavos.wallet) {
        throw new Error('Not authenticated. Please login first.');
      }

      console.log('📝 Executing Cavos transaction with SDK:', {
        network,
        appId,
        walletAddress: currentCavos.wallet.address,
        callsCount: calls.length,
        hasAccessToken: !!currentCavos.accessToken,
        hasRefreshToken: !!currentCavos.refreshToken,
        calls: calls.map(call => ({
          contract: call.contractAddress,
          entrypoint: call.entrypoint,
          calldataLength: call.calldata.length
        }))
      });

      let accessToken = currentCavos.accessToken;

      // Execute transaction using SDK instance method
      const result = await cavosAuth.executeCalls(
        currentCavos.wallet.address,
        calls,
        accessToken
      );

      console.log('📦 Cavos transaction result:', result);
      
      // Check if result contains an error first
      if (result && typeof result === 'object' && result.error) {
        console.error('❌ Cavos transaction failed with error:', result.error);
        throw new Error(`Transaction failed: ${result.error}`);
      }

      // Extract transaction hash (SDK now returns it as 'txHash')
      const transactionHash = result?.txHash || result?.transaction_hash || result;
      
      if (!transactionHash || typeof transactionHash !== 'string') {
        console.error('❌ No valid transaction hash returned:', result);
        throw new Error('No valid transaction hash returned');
      }

      // The server handles token refresh automatically and returns a new access token if needed
      if (result?.accessToken) {
        console.log('🔑 Access token received in response, updating store');
        setCavosTokens(result.accessToken, currentCavos.refreshToken);
      }

      console.log('✅ Cavos transaction successful:', transactionHash);
      return transactionHash;


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