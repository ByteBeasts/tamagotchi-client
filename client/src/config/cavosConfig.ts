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

// Hardcoded credentials for testing
export const HARDCODED_CREDENTIALS = {
  email: `testuser${Date.now()}@bytebeasts.com`, // Use unique email to avoid conflicts
  password: 'ByteBeasts2024!'
};