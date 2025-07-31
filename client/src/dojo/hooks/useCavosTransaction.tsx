import { useState } from 'react';
import { network } from '../../config/cavosConfig';

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
      console.log('🔑 FULL ACCESS TOKEN:', accessToken);
      
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

      // Use direct API call to /execute/session endpoint instead of SDK
      console.log('🧪 Making direct API call to Cavos /execute/session endpoint...');
      
      const response = await fetch('https://services.cavos.xyz/api/v1/external/execute/session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address,
          org_id: "113",
          calls,
          network
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Transaction execution failed');
      }

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