import { useState } from 'react';
import { CavosAuth } from 'cavos-service-sdk';
import { network, orgSecret } from '../../config/cavosConfig';

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
 * Hook for executing transactions using Cavos invisible wallet
 */
export function useCavosTransaction(): UseCavosTransactionReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const executeTransaction = async (calls: CavosTransactionCall[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Looking for accessToken in localStorage...');
      const accessToken = localStorage.getItem('accessToken');
      
      console.log('📋 AccessToken found:', !!accessToken, accessToken?.substring(0, 20) + '...');
      
      if (!accessToken) {
        console.log('❌ No accessToken found in localStorage. Keys available:', Object.keys(localStorage));
        throw new Error('No access token found. Please login first.');
      }

      // Get wallet address from localStorage
      const storedAuth = localStorage.getItem('cavos_auth_data');
      let address = '';
      
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          address = authData.wallet?.address;
        } catch {
          // Try to get address from simpler storage
          address = '';
        }
      }

      if (!address) {
        throw new Error('No wallet address found. Please login first.');
      }

      console.log('📝 Executing Cavos transaction:', {
        network,
        callsCount: calls.length,
        calls: calls.map(call => ({
          contract: call.contractAddress,
          entrypoint: call.entrypoint,
          calldataLength: call.calldata.length
        }))
      });

      // Use static method for executeTransaction (as instructed by Cavos team)
      console.log('🧪 Testing CavosAuth.executeTransaction as static method...');
      
      const result = await CavosAuth.executeTransaction(
        accessToken,
        calls,
        orgSecret,
        network
      );

      console.log('✅ Cavos transaction successful:', result);
      return result.transaction_hash;

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