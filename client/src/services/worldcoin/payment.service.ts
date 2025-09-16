import {
  MiniKit,
  tokenToDecimals,
  Tokens,
  PayCommandInput,
  MiniAppPaymentSuccessPayload,
  ResponseEvent
} from '@worldcoin/minikit-js';
import { GemPack } from '../../constants/gemShop.constants';

class WorldcoinPaymentService {

  /**
   * Generate unique payment reference with gem amount encoded
   */
  private generateReference(pack: GemPack): string {
    // Create a unique reference with pack info encoded
    const timestamp = Date.now();
    const reference = `${pack.id}_${pack.gemAmount}_${timestamp}_${crypto.randomUUID().slice(0, 8)}`;
    return reference;
  }

  /**
   * Send payment command to World App
   */
  async sendPayment(pack: GemPack): Promise<MiniAppPaymentSuccessPayload | null> {
    try {
      // Check if MiniKit is installed (we're in World App)
      if (!MiniKit.isInstalled()) {
        throw new Error('This feature is only available in World App');
      }

      // Get payment address from env
      const paymentAddress = import.meta.env.VITE_WORLDCOIN_PAYMENTS_ADDRESS;
      if (!paymentAddress) {
        throw new Error('Payment address not configured');
      }

      // Generate unique reference
      const reference = this.generateReference(pack);

      // Create payment payload with both USDC and WLD options
      const payload: PayCommandInput = {
        reference,
        to: paymentAddress,
        tokens: [
          {
            symbol: Tokens.USDC,
            token_amount: tokenToDecimals(pack.price, Tokens.USDC).toString(),
          }
        ],
        description: `Purchase ${pack.gemAmount} gems - ${pack.name}`,
      };

      console.log('Sending payment request:', {
        reference,
        gems: pack.gemAmount,
        price: pack.price
      });

      // Send payment command using async method
      const { finalPayload } = await MiniKit.commandsAsync.pay(payload);

      if (finalPayload.status === 'success') {
        return finalPayload as MiniAppPaymentSuccessPayload;
      }

      return null;
    } catch (error) {
      console.error('Payment error:', error);
      throw error;
    }
  }

  /**
   * Parse gem amount from payment reference
   */
  parseGemAmountFromReference(reference: string): number {
    try {
      // Reference format: packId_gemAmount_timestamp_uuid
      const parts = reference.split('_');
      if (parts.length >= 2) {
        return parseInt(parts[1], 10);
      }
      return 0;
    } catch (error) {
      console.error('Error parsing reference:', error);
      return 0;
    }
  }


  /**
   * Subscribe to payment events
   */
  subscribeToPaymentEvents(
    onSuccess: (payload: MiniAppPaymentSuccessPayload, gemAmount: number) => void,
    onError?: (error: any) => void
  ): () => void {
    if (!MiniKit.isInstalled()) {
      console.warn('MiniKit not installed, skipping event subscription');
      return () => {};
    }

    MiniKit.subscribe(
      ResponseEvent.MiniAppPayment,
      async (response: any) => {
        if (response.status === 'success') {
          const gemAmount = this.parseGemAmountFromReference(response.reference);
          onSuccess(response as MiniAppPaymentSuccessPayload, gemAmount);
        } else if (onError) {
          onError(response);
        }
      }
    );

    // Return unsubscribe function
    return () => {
      MiniKit.unsubscribe(ResponseEvent.MiniAppPayment);
    };
  }
}

export const worldcoinPaymentService = new WorldcoinPaymentService();