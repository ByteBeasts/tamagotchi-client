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
    world: '0x20f246f511e93764ee7f174f5ece78c9dfafe1d537bbf05c48c59134b5de4f3',
    player: '0x2277356f235adb1550f3e18d5f93b0903cec390335967c3ddba7b446638fbac',
    game: '0x217331080ea988e121cbe284bfe9b2504d9e78c363234abd57c260f7b3621a8',
    achieve: '0x33a445fc403762f42140ac6ca02b0d37882a39d68c5f8c9c037bf7e2238a463'
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