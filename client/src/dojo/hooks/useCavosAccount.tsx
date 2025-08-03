import { network } from '../../config/cavosConfig';

/**
 * Cavos account hook to replace useAccount from Starknet React
 * Returns the wallet address from Cavos stored authentication
 */
export function useCavosAccount() {
  // Get wallet address from stored Cavos auth data
  const getAddress = (): string | undefined => {
    try {
      const storedAuth = localStorage.getItem('cavos_auth_data');
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        return authData.wallet?.address;
      }
    } catch {
      // Fall back to simple storage
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        // Token exists but we don't have the full auth data
        // This shouldn't happen in normal flow, but just in case
        return undefined;
      }
    }
    return undefined;
  };

  const address = getAddress();
  const isConnected = !!address;

  // Mock account object similar to Starknet's AccountInterface
  const account = address ? {
    address,
    // Add other properties that hooks might expect
    chainId: network === 'mainnet' ? 'SN_MAIN' : 'SN_SEPOLIA',
  } : undefined;

  return {
    address,
    account,
    isConnected,
    status: isConnected ? 'connected' : 'disconnected'
  };
}