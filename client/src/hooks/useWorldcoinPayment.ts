import { useEffect, useCallback } from 'react';
import { MiniKit, MiniAppPaymentSuccessPayload } from '@worldcoin/minikit-js';
import { worldcoinPaymentService } from '../services/worldcoin/payment.service';
import { toast } from 'react-hot-toast';
import useAppStore from '../zustand/store';

interface UseWorldcoinPaymentOptions {
  onSuccess?: (gems: number) => void;
  onError?: (error: Error) => void;
}

export function useWorldcoinPayment(options?: UseWorldcoinPaymentOptions) {
  const setPlayer = useAppStore(state => state.setPlayer);
  const player = useAppStore(state => state.player);

  // Handle successful payment callback
  const handlePaymentSuccess = useCallback(async (_payload: MiniAppPaymentSuccessPayload, gemAmount: number) => {
    try {
      if (!gemAmount || gemAmount <= 0) {
        throw new Error('Invalid gem amount');
      }

      // Update player gems
      if (player) {
        const updatedPlayer = {
          ...player,
          total_gems: player.total_gems + gemAmount
        };
        setPlayer(updatedPlayer);
      }

      // Call success callback
      options?.onSuccess?.(gemAmount);

      // Show success toast
      toast.success(
        `Successfully purchased ${gemAmount} gems! 💎`,
        {
          duration: 5000
        }
      );
    } catch (error) {
      console.error('Payment processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment processing failed';

      options?.onError?.(error as Error);

      toast.error(errorMessage, {
        duration: 4000
      });
    }
  }, [player, setPlayer, options]);

  // Set up event listener for payment responses
  useEffect(() => {
    if (!MiniKit.isInstalled()) {
      return;
    }

    const unsubscribe = worldcoinPaymentService.subscribeToPaymentEvents(
      handlePaymentSuccess,
      (error) => {
        console.error('Payment error:', error);
        options?.onError?.(new Error('Payment failed'));

        toast.error('Payment failed. Please try again.', {
          duration: 4000
        });
      }
    );

    return unsubscribe;
  }, [handlePaymentSuccess, options]);

  return {
    isWorldAppInstalled: MiniKit.isInstalled(),
  };
}