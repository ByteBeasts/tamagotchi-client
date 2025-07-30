import { useState, useCallback } from "react";
import { useCavosAccount } from "./useCavosAccount";

interface UseStarknetConnectReturn {
  status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
  handleConnect: () => Promise<void>;
  handleDisconnect: () => Promise<void>;
  hasTriedConnect: boolean;
  setHasTriedConnect: (value: boolean) => void;
  address?: string;
  isConnecting: boolean;
  error?: string;
}

/**
 * Legacy hook maintained for compatibility
 * Now just wraps Cavos authentication
 */
export function useStarknetConnect(): UseStarknetConnectReturn {
  const { account, isConnected } = useCavosAccount();
  
  // Local state for compatibility
  const [hasTriedConnect, setHasTriedConnect] = useState(false);

  const handleConnect = useCallback(async () => {
    console.log("useStarknetConnect.handleConnect: This is a legacy function, use Cavos auth instead");
    setHasTriedConnect(true);
  }, []);

  const handleDisconnect = useCallback(async () => {
    console.log("useStarknetConnect.handleDisconnect: This is a legacy function, use Cavos auth instead");
    setHasTriedConnect(false);
  }, []);

  return {
    status: isConnected ? 'connected' : 'disconnected',
    handleConnect,
    handleDisconnect,
    hasTriedConnect,
    setHasTriedConnect,
    address: account?.address,
    isConnecting: false,
    error: undefined
  };
}