import { useState, useCallback, useRef } from 'react';
import { useCavosTransaction } from './useCavosTransaction';

// Types
export interface OptimisticConfig<T> {
  // Function to capture current state before update
  captureState: () => T;
  // Function to apply optimistic update
  onOptimisticUpdate: () => void;
  // Function to rollback to original state
  onRollback: (originalState: T) => void;
  // Optional success callback
  onSuccess?: (txHash: string) => void;
  // Optional error handler
  onError?: (error: any) => void;
  // Skip waiting for confirmation (default true for optimistic)
  skipWaitForConfirmation?: boolean;
}

interface CavosTransactionCall {
  contractAddress: string;
  entrypoint: string;
  calldata: string[];
}

interface OptimisticTransactionResult {
  success: boolean;
  txHash?: string;
  error?: any;
  rolledBack?: boolean;
}

interface UseOptimisticTransactionReturn {
  executeOptimistic: <T>(
    calls: CavosTransactionCall[],
    config: OptimisticConfig<T>
  ) => Promise<OptimisticTransactionResult>;
  isProcessing: boolean;
  lastError: any | null;
}

/**
 * Hook for executing blockchain transactions with optimistic updates
 * Provides immediate UI feedback while processing transactions in background
 */
export function useOptimisticTransaction(): UseOptimisticTransactionReturn {
  const { executeTransaction } = useCavosTransaction();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<any | null>(null);
  
  // Track if we've already rolled back to prevent double rollback
  const hasRolledBack = useRef(false);

  const executeOptimistic = useCallback(async <T,>(
    calls: CavosTransactionCall[],
    config: OptimisticConfig<T>
  ): Promise<OptimisticTransactionResult> => {
    // Reset rollback tracker for new transaction
    hasRolledBack.current = false;
    setIsProcessing(true);
    setLastError(null);

    // Step 1: Capture original state BEFORE any changes
    const originalState = config.captureState();
    console.log('🎯 Optimistic TX: Captured original state', originalState);

    // Step 2: Apply optimistic update immediately
    try {
      config.onOptimisticUpdate();
      console.log('⚡ Optimistic TX: Applied optimistic update');
    } catch (updateError) {
      console.error('❌ Failed to apply optimistic update:', updateError);
      setIsProcessing(false);
      return {
        success: false,
        error: updateError,
        rolledBack: false
      };
    }

    // Step 3: Execute blockchain transaction in background
    try {
      console.log('📝 Optimistic TX: Executing blockchain transaction...');
      const txHash = await executeTransaction(calls);
      
      if (!txHash) {
        throw new Error('No transaction hash returned');
      }

      console.log('✅ Optimistic TX: Transaction successful:', txHash);
      
      // Success - keep optimistic state and run success callback
      if (config.onSuccess) {
        try {
          config.onSuccess(txHash);
        } catch (successError) {
          console.warn('⚠️ Success callback failed:', successError);
        }
      }

      setIsProcessing(false);
      return {
        success: true,
        txHash,
        rolledBack: false
      };

    } catch (error: any) {
      console.error('❌ Optimistic TX: Transaction failed:', error);
      setLastError(error);

      // Step 4: Rollback on failure (but only once)
      if (!hasRolledBack.current) {
        hasRolledBack.current = true;
        console.log('🔄 Optimistic TX: Rolling back to original state');
        
        try {
          config.onRollback(originalState);
          console.log('✅ Optimistic TX: Rollback completed');
        } catch (rollbackError) {
          console.error('❌ Optimistic TX: Rollback failed:', rollbackError);
          // This is critical - UI might be in inconsistent state
        }
      }

      // Run error handler if provided
      if (config.onError) {
        try {
          config.onError(error);
        } catch (errorHandlerError) {
          console.warn('⚠️ Error handler failed:', errorHandlerError);
        }
      }

      setIsProcessing(false);
      return {
        success: false,
        error,
        rolledBack: true
      };
    }
  }, [executeTransaction]);

  return {
    executeOptimistic,
    isProcessing,
    lastError
  };
}

// Re-export for convenience
export type { OptimisticTransactionResult };