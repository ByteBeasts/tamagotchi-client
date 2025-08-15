// Network configuration
export const network = import.meta.env.VITE_CAVOS_DEFAULT_NETWORK === 'mainnet' ? 'mainnet' : 'sepolia';

// Organization secret from environment (backend only)
export const orgSecret = import.meta.env.VITE_CAVOS_ORG_SECRET;

// App ID from environment (frontend)
export const appId = import.meta.env.VITE_CAVOS_APP_ID;

// Debug environment variables
console.log('🔧 Cavos Config Debug:', {
  network,
  orgSecret: orgSecret ? 'LOADED' : 'MISSING',
  appId: import.meta.env.VITE_CAVOS_APP_ID ? 'LOADED' : 'MISSING',
  networkRaw: import.meta.env.VITE_CAVOS_DEFAULT_NETWORK
});

// Chain verification
console.log(`⛓️ Current Chain: ${network.toUpperCase()} ${network === 'sepolia' ? '🧪' : '🌐'}`);
console.log(`📍 Chain Details:`, {
  isMainnet: network === 'mainnet',
  isSepolia: network === 'sepolia',
  envValue: import.meta.env.VITE_CAVOS_DEFAULT_NETWORK
});

// Contract addresses per network
export const CONTRACT_ADDRESSES = {
  mainnet: {
    world: '0x79b0f0159ae6655ace0db5efc04f261340dc3e6f22e59c0b46237b5e9ced055',
    player: '0x38e837b4e9e5f2c08acecca5c464740d2fd35fb500b0914a4962e8d59ee0d8b',
    game: '0x2d4ac6b623b25e2af63b861ee1fc7c7a41d135f9d29577cb4e6f6a934c0564d',
    achieve: '0x44c537565cd0b4e571614b3491fc949889cbcf0b14e17789357260cae2efff1'
  },
  sepolia: {
    world: '0x1e87c289aacc73a6b5ac33688097cc13de58b7b5da2168573bd610e859fd9a9',
    player: '0x5e79b9650cb00d19d21601c9c712654cb13daa3007fd78cce0e90051e46ec8a',
    game: '0x8efc9411c660ef584995d8f582a13cac41aeddb6b9245b4715aa1e9e6a201e',
    achieve: '0x6846e1d528421a1569e36a3f80613f77e0d9f927e50967ada831347513f4c85'
  }
};

// Get contract addresses for current network
export const getContractAddresses = () => {
  return CONTRACT_ADDRESSES[network];
};

// Hardcoded credentials for testing
export const HARDCODED_CREDENTIALS = {
  email: `testuser${Date.now()}@bytebeasts.com`, // Use unique email to avoid conflicts
  password: 'ByteBeasts2024!'
};