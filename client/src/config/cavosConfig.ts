// Network configuration - staging uses mainnet network for Cavos compatibility
const deployType = import.meta.env.VITE_PUBLIC_DEPLOY_TYPE as string;
export const network = (import.meta.env.VITE_CAVOS_DEFAULT_NETWORK === 'mainnet' || deployType === 'mainnet_staging') ? 'mainnet' : 'sepolia';
export const isStaging = deployType === 'mainnet_staging';

// Organization secret from environment (backend only)
export const orgSecret = import.meta.env.VITE_CAVOS_ORG_SECRET;

// App ID from environment (frontend)
export const appId = import.meta.env.VITE_CAVOS_APP_ID;

// Debug environment variables
console.log('🔧 Cavos Config Debug:', {
  network,
  deployType,
  isStaging,
  orgSecret: orgSecret ? 'LOADED' : 'MISSING',
  appId: import.meta.env.VITE_CAVOS_APP_ID ? 'LOADED' : 'MISSING',
  networkRaw: import.meta.env.VITE_CAVOS_DEFAULT_NETWORK
});

// Chain verification
const chainEmoji = isStaging ? '🔄' : (network === 'sepolia' ? '🧪' : '🌐');
console.log(`⛓️ Current Chain: ${network.toUpperCase()} ${isStaging ? '(STAGING)' : ''} ${chainEmoji}`);
console.log(`📍 Chain Details:`, {
  isMainnet: network === 'mainnet',
  isSepolia: network === 'sepolia',
  isStaging,
  deployType,
  envValue: import.meta.env.VITE_CAVOS_DEFAULT_NETWORK
});

// Contract addresses per network
export const CONTRACT_ADDRESSES = {
  mainnet: {
    world: '0x29ac3fd304d4e8bf2151fd309a96dbd978a2d11754ac61c490acf7094e295fe',
    player: '0x3977f6a250118029560e5d2555961c35f2aa990dd1a5242e977978b0679965b',
    game: '0x4d49e9ba63966f2d5058d9609c7c442a08bbd117bab16ce088c8de35d4dc151',
    achieve: ''
  },
  mainnet_staging: {
    world: '0x29ac3fd304d4e8bf2151fd309a96dbd978a2d11754ac61c490acf7094e295fe',
    player: '0x3977f6a250118029560e5d2555961c35f2aa990dd1a5242e977978b0679965b',
    game: '0x4d49e9ba63966f2d5058d9609c7c442a08bbd117bab16ce088c8de35d4dc151',
    achieve: ''
  },
  sepolia: {
    world: '0x1e87c289aacc73a6b5ac33688097cc13de58b7b5da2168573bd610e859fd9a9',
    player: '0x5e79b9650cb00d19d21601c9c712654cb13daa3007fd78cce0e90051e46ec8a',
    game: '0x8efc9411c660ef584995d8f582a13cac41aeddb6b9245b4715aa1e9e6a201e',
    achieve: '0x6846e1d528421a1569e36a3f80613f77e0d9f927e50967ada831347513f4c85'
  }
};

// Get contract addresses for current deployment type
export const getContractAddresses = () => {
  // Use staging contracts if explicitly set, otherwise use network-based lookup
  const addresses = isStaging
    ? CONTRACT_ADDRESSES.mainnet_staging
    : CONTRACT_ADDRESSES[network as keyof typeof CONTRACT_ADDRESSES];

  console.log('🎯 Contract Addresses Selection:', {
    isStaging,
    network,
    deployType,
    selectedEnvironment: isStaging ? 'mainnet_staging' : network,
    worldAddress: addresses.world
  });

  return addresses;
};

// Execute and log immediately on module load
const currentAddresses = getContractAddresses();
console.log('🚀 Initial Contract Addresses loaded:', currentAddresses);

// Hardcoded credentials for testing
export const HARDCODED_CREDENTIALS = {
  email: `testuser${Date.now()}@bytebeasts.com`, // Use unique email to avoid conflicts
  password: 'ByteBeasts2024!'
};