// Network configuration
export const network = import.meta.env.VITE_CAVOS_DEFAULT_NETWORK === 'mainnet' ? 'mainnet' : 'sepolia';

// Organization secret from environment
export const orgSecret = import.meta.env.VITE_CAVOS_ORG_SECRET;

// Hardcoded credentials for testing
export const HARDCODED_CREDENTIALS = {
  email: 'test@bytebeasts.com',
  password: 'ByteBeasts2024!'
};