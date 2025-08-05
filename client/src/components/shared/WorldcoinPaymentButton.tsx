import React, { useState, useEffect } from 'react';
import { createConfig, WagmiProvider, useAccount, useConnect, useDisconnect, useWriteContract, useBalance } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { walletConnect } from 'wagmi/connectors';
import { optimism } from 'wagmi/chains';
import { http } from 'viem';
import { parseEther, formatEther, getAddress } from 'viem';

// WLD Token contract address on Optimism
const WLD_TOKEN_ADDRESS = '0x5033833c9fe8B9d3E09EEd2f73d2aaF7E3872fd1' as const;

// ERC20 ABI for WLD token
const ERC20_ABI = [
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
  {
    type: 'function',
    name: 'decimals',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint8' }],
  },
] as const;

// WalletConnect configuration
const projectId = 'your_project_id_here'; // You'll need to get this from WalletConnect

const config = createConfig({
  chains: [optimism],
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'Tamagotchi Worldcoin Payment',
        description: 'Worldcoin payment integration for Tamagotchi',
        url: 'https://localhost:3000',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
      },
    }),
  ],
  transports: {
    [optimism.id]: http(),
  },
});

const queryClient = new QueryClient();

interface WorldcoinPaymentButtonProps {
  recipientAddress?: string;
  amount?: string;
  onSuccess?: (txHash: string) => void;
  onError?: (error: Error) => void;
}

const PaymentComponent: React.FC<WorldcoinPaymentButtonProps> = ({
  recipientAddress = '0x742d35Cc6644C0532925a3b8D8B78C67A9C8c3Bb', // Default recipient
  amount = '0.01',
  onSuccess,
  onError,
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const [wldBalance, setWldBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string>('');
  
  const { writeContract, isPending: isWritePending } = useWriteContract();

  // Get WLD balance
  const { data: balanceData, refetch: refetchBalance } = useBalance({
    address,
    token: WLD_TOKEN_ADDRESS,
    chainId: optimism.id,
  });

  useEffect(() => {
    if (balanceData) {
      setWldBalance(formatEther(balanceData.value));
    }
  }, [balanceData]);

  const connectWallet = async () => {
    try {
      const walletConnectConnector = connectors.find(
        (connector) => connector.id === 'walletConnect'
      );
      if (walletConnectConnector) {
        connect({ connector: walletConnectConnector });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      onError?.(error as Error);
    }
  };

  const sendPayment = async () => {
    if (!address || !isConnected) {
      console.error('Wallet not connected');
      return;
    }

    setIsLoading(true);
    try {
      // Convert amount to wei (WLD has 18 decimals)
      const amountInWei = parseEther(amount);
      
      console.log('Sending payment:', {
        from: address,
        to: recipientAddress,
        amount: amount + ' WLD',
        amountInWei: amountInWei.toString(),
      });

      writeContract({
        address: WLD_TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'transfer',
        args: [getAddress(recipientAddress), amountInWei],
      }, {
        onSuccess: (hash) => {
          console.log('Transaction hash:', hash);
          setTxHash(hash);
          onSuccess?.(hash);
          // Refetch balance after successful transaction
          setTimeout(() => {
            refetchBalance();
          }, 2000);
        },
        onError: (error) => {
          console.error('Transaction failed:', error);
          onError?.(error);
        }
      });

    } catch (error) {
      console.error('Failed to send payment:', error);
      onError?.(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Worldcoin Payment</h2>
      
      {!isConnected ? (
        <div className="space-y-4">
          <p className="text-gray-600">Connect your World App to make payments</p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect World App'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Connected Address:</p>
            <p className="font-mono text-sm break-all">{address}</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">WLD Balance:</p>
            <p className="text-lg font-semibold">{wldBalance} WLD</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Payment Details:</p>
            <p className="text-sm">Amount: {amount} WLD</p>
            <p className="text-sm font-mono break-all">To: {recipientAddress}</p>
          </div>

          {txHash && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">Transaction Hash:</p>
              <p className="font-mono text-xs break-all text-green-700">{txHash}</p>
              <a
                href={`https://optimistic.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                View on Etherscan
              </a>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={sendPayment}
              disabled={isLoading || isWritePending}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading || isWritePending ? 'Sending...' : `Pay ${amount} WLD`}
            </button>
            
            <button
              onClick={() => disconnect()}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const WorldcoinPaymentButton: React.FC<WorldcoinPaymentButtonProps> = (props) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <PaymentComponent {...props} />
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default WorldcoinPaymentButton; 