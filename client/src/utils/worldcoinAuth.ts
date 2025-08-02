import { MiniKit, MiniAppWalletAuthSuccessPayload } from '@worldcoin/minikit-js';

export interface WorldcoinCredentials {
  email: string;
  password: string;
  walletAddress: string;
  nullifierHash: string;
}

/**
 * Generates email and password from Worldcoin wallet address and nullifier hash
 * @param nullifierHash - The nullifier hash from Worldcoin verification  
 * @param walletAddress - The wallet address from Worldcoin
 * @returns Credentials object with email and password
 */
export function generateCredentialsFromNullifier(nullifierHash: string, walletAddress: string): WorldcoinCredentials {
  // Remove '0x' prefix from wallet address if present
  const cleanAddress = walletAddress.replace('0x', '');
  
  // Generate email using wallet address with bytebeasts.io domain
  const email = `${cleanAddress}@bytebeasts.io`;
  
  // Generate password using 'WorldID' + first 10 characters of nullifier hash
  const cleanHash = nullifierHash.replace('0x', '');
  const passwordSuffix = cleanHash.substring(0, 10);
  const password = `WorldID${passwordSuffix}`;
  
  return {
    email,
    password,
    walletAddress,
    nullifierHash
  };
}

/**
 * Creates a nonce for SIWE authentication
 * @returns Promise with nonce
 */
export async function createSIWENonce(): Promise<string> {
  // For now, generate a client-side nonce
  // In production, this should come from your backend
  const nonce = crypto.randomUUID().replace(/-/g, "");
  return nonce;
}

/**
 * Verifies SIWE message payload
 * @param payload - The wallet auth payload from MiniKit
 * @param nonce - The original nonce
 * @returns Promise with verification result
 */
export async function verifySIWEMessage(payload: MiniAppWalletAuthSuccessPayload, nonce: string): Promise<{isValid: boolean}> {
  // For now, return true for client-side validation
  // In production, this should verify on your backend
  console.log('📝 Verifying SIWE message:', { payload, nonce });
  
  // Basic client-side validation
  const isValid = payload.status === 'success' && 
                  !!payload.address && 
                  !!payload.signature && 
                  !!payload.message;
  
  return { isValid };
}

/**
 * Performs Worldcoin wallet authentication using MiniKit
 * @returns Promise with authentication result and credentials
 */
export async function authenticateWithWorldcoin(): Promise<{
  success: boolean;
  credentials?: WorldcoinCredentials;
  error?: string;
}> {
  try {
    // Check if MiniKit is installed (running in World App)
    if (!MiniKit.isInstalled()) {
      return {
        success: false,
        error: 'Not running in World App'
      };
    }

    console.log('🌍 Starting Worldcoin authentication...');

    // Generate nonce for SIWE
    const nonce = await createSIWENonce();

    // Perform wallet authentication
    const { finalPayload } = await MiniKit.commandsAsync.walletAuth({
      nonce: nonce,
      requestId: '0',
      expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
      notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), // 24 hours ago
      statement: 'Sign in to ByteBeasts Tamagotchi game'
    });

    if (finalPayload.status === 'error') {
      return {
        success: false,
        error: 'Wallet authentication failed'
      };
    }

    // Verify the SIWE message
    const verification = await verifySIWEMessage(finalPayload, nonce);
    
    if (!verification.isValid) {
      return {
        success: false,
        error: 'Invalid signature verification'
      };
    }

    // Get the nullifier hash from MiniKit user data
    // Note: You might need to adjust this based on how Worldcoin provides the nullifier
    const nullifierHash = finalPayload.address; // Using address as fallback, adjust as needed
    
    // Generate credentials from nullifier hash
    const credentials = generateCredentialsFromNullifier(nullifierHash, finalPayload.address);

    console.log('✅ Worldcoin authentication successful:', {
      email: credentials.email,
      walletAddress: credentials.walletAddress
    });

    return {
      success: true,
      credentials
    };

  } catch (error) {
    console.error('❌ Worldcoin authentication error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    };
  }
}

/**
 * Checks if the app is running in World App
 * @returns boolean indicating if MiniKit is available
 */
export function isRunningInWorldApp(): boolean {
  try {
    console.log('🌍 === WORLD APP DETECTION ===');
    console.log('🔍 typeof MiniKit:', typeof MiniKit);
    console.log('🔍 MiniKit available:', !!MiniKit);
    console.log('🔍 MiniKit.isInstalled available:', typeof MiniKit?.isInstalled);
    
    if (MiniKit && typeof MiniKit.isInstalled === 'function') {
      try {
        const isInstalled = MiniKit.isInstalled();
        console.log('🔍 MiniKit.isInstalled() result:', isInstalled);
        return isInstalled;
      } catch (miniKitError) {
        console.log('🔧 MiniKit.isInstalled() threw error:', miniKitError);
        return false;
      }
    } else {
      console.log('❌ MiniKit.isInstalled not available');
      return false;
    }
  } catch (error) {
    console.error('❌ Error in World App detection:', error);
    return false;
  }
}