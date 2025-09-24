import { apiClient } from './config';

// Types for Worldcoin service
export interface GetPricesDto {
  fiatCurrencies: string;    // Comma-separated: "USD,EUR,JPY"
  cryptoCurrencies: string;   // Comma-separated: "WLD,USDC"
}

export interface FormattedPriceDto {
  cryptoCurrency: string;     // e.g., "WLD"
  fiatCurrency: string;      // e.g., "USD"
  price: number;             // e.g., 1.2974 (formatted to 4 decimals)
  rawAmount: string;         // e.g., "1297392134399" (raw from API)
}

export interface FormattedPricesResponseDto {
  prices: FormattedPriceDto[];
}

export const worldcoinService = {
  // Get cryptocurrency prices
  async getPrices(params: GetPricesDto): Promise<FormattedPricesResponseDto> {
    const { data } = await apiClient.get<FormattedPricesResponseDto>('/worldcoin/prices', {
      params
    });
    return data;
  },

  // Helper: Get WLD price in USD
  async getWLDPrice(): Promise<number> {
    const response = await this.getPrices({
      fiatCurrencies: 'USD',
      cryptoCurrencies: 'WLD'
    });
    return response.prices[0]?.price || 0;
  },

  // Helper: Get multiple prices
  async getMultiplePrices(cryptos: string[], fiats: string[]): Promise<FormattedPricesResponseDto> {
    return this.getPrices({
      fiatCurrencies: fiats.join(','),
      cryptoCurrencies: cryptos.join(',')
    });
  }
};