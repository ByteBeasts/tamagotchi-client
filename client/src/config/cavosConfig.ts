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
    world: '0x704cc05e4974d5bcd88a960a1809660602d43e32cf14c84c884d96e95ba2624',
    player: '0x31429e16f63a7a21b7afd445ac7edb8db8cb704f8b3b7830d9db869da50686e',
    game: '0x1546213e4cd62f596f80f4db6bd44cd5ca21433e8ec26ecd4ee40cdb38ab896',
    achieve: '0x12531472a9d5231853dd827f25c5d0c2b7e47e8c370ce85caf17a1bfe31648c'
  },
  mainnet_staging: {
    world: '0x605715b84ddacd1997810c948ad07867b69e664012559f0dd4b515034ce6cd9',
    player: '0x6f621ebc5b36103e52c9e4b574a876d66bdc01655e5805dfd0f1fee4202e38b',
    game: '0x344973876a611563b73a09c978261960b0bb7954194b05b5c40d3287b1ef870',
    achieve: '0x61535293bc907763f832ad67e89cdfcd21ee575aa995a737454c8af38720349'
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