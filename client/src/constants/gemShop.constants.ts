// Import gem pack assets
import gemSingleIcon from '../assets/icons/gems/icon-gem-single.webp';
import gemSetIcon from '../assets/icons/gems/icon-gem-set-of-gems.webp';
import gemBagIcon from '../assets/icons/gems/icon-gems-bag-of-gem.webp';
import gemHandfulIcon from '../assets/icons/gems/icon-gems-handful.webp';

export interface GemPack {
  id: number;
  name: string;
  description: string;
  image: string;
  gemAmount: number;
  price: number; // in USDC
  priceDisplay: string;
  discount?: string; // e.g., "20% OFF"
  popular?: boolean;
  bestValue?: boolean;
}

export const GEM_PACKS: GemPack[] = [
  {
    id: 1,
    name: 'Starter Pack',
    description: 'Perfect for trying out magic items',
    image: gemSingleIcon,
    gemAmount: 25,
    price: 0.99,
    priceDisplay: '$0.99',
  },
  {
    id: 2,
    name: 'Standard Pack',
    description: 'Most popular choice for regular players',
    image: gemSetIcon,
    gemAmount: 80,
    price: 2.99,
    priceDisplay: '$2.99',
    discount: '7% Bonus',
    popular: true,
  },
  {
    id: 3,
    name: 'Value Pack',
    description: 'Great value for dedicated players',
    image: gemBagIcon,
    gemAmount: 200,
    price: 6.99,
    priceDisplay: '$6.99',
    discount: '15% Bonus',
    bestValue: true,
  },
  {
    id: 4,
    name: 'Mega Pack',
    description: 'Maximum gems for power users',
    image: gemHandfulIcon,
    gemAmount: 500,
    price: 10.99,
    priceDisplay: '$10.99',
    discount: '25% Bonus',
  },
];

export const getGemPackById = (id: number): GemPack | undefined => {
  return GEM_PACKS.find(pack => pack.id === id);
};