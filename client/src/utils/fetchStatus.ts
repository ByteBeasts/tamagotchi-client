import { AccountInterface, CallData, RpcProvider } from 'starknet';
import { getContractAddresses } from '../config/cavosConfig';

// Type for simple account objects from Cavos
interface SimpleAccount {
  address: string;
  chainId: string;
}

// Type for Cavos wallet objects
interface CavosWallet {
  address: string;
  // Add other Cavos wallet properties if needed
}

// Union type to accept either full AccountInterface, simple account, or Cavos wallet
type AccountLike = AccountInterface | SimpleAccount | CavosWallet;

/**
 * Converts hex array to decimal numbers
 */
const hexToDecimalArray = (hexArray: string[] | undefined): number[] | undefined => {
  if (!hexArray) return undefined;
  return hexArray.map(hexString => parseInt(hexString, 16));
};

/**
 * Check if account is a full AccountInterface with callContract method
 */
const isFullAccount = (account: AccountLike): account is AccountInterface => {
  return 'callContract' in account && typeof account.callContract === 'function';
};

/**
 * Fetches real-time beast status from contract using read call
 * This is a gas-free call that can be made frequently
 * 
 * Enhanced to handle the "Option::unwrap failed" error gracefully
 * This error occurs when a player has no live beast, which is a valid state
 * 
 * @param account - Connected Starknet account interface or simple account object
 * @returns Array of status values as numbers, undefined if no beast exists, or null if error
 */
const fetchStatus = async (account: AccountLike): Promise<number[] | undefined | null> => {
  console.info('📡 Fetching real-time status for:', String(account?.address));
  
  try {
    let response: string[];
    const contractAddresses = getContractAddresses();

    if (isFullAccount(account)) {
      // Use the full account's callContract method
      response = await account.callContract({
        contractAddress: contractAddresses.game,
        entrypoint: "get_timestamp_based_status_with_address", 
        calldata: [String(account.address)],
      });
    } else {
      // Use RpcProvider for simple account objects
      const provider = new RpcProvider({
        nodeUrl: import.meta.env.VITE_PUBLIC_NODE_URL || "https://api.cartridge.gg/x/starknet/mainnet",
      });

      response = await provider.callContract({
        contractAddress: contractAddresses.game,
        entrypoint: "get_timestamp_based_status_with_address",
        calldata: CallData.compile([account.address])
      });
    }
    
    const result = hexToDecimalArray(response);
    return result;
    
  } catch (err: any) {
    // Check if this is the expected "no beast" error
    const errorMessage = err?.message || '';
    const isNoBeastError = errorMessage.includes('Option::unwrap failed');
    
    if (isNoBeastError) {
      console.info('No live beast found for player (Option::unwrap failed) - this is expected');
      return undefined; // undefined = no beast exists (expected)
    }
    
    // For other errors, log as actual errors
    console.error('❌ Unexpected error fetching status:', err);
    return null; // null = actual error occurred
  }
};

export default fetchStatus;