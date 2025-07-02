// Simple food configuration that matches contract IDs

import Apple from '../assets/Food/food-apple.svg';
import Banana from '../assets/Food/food-banana.svg';
import Cherry from '../assets/Food/food-cherry.svg';
import Burguer from '../assets/Food/food-burger.svg';
import CakeChoco from '../assets/Food/food-cake-chocolate.svg';
import CakeStrawberry from '../assets/Food/food-cake-strawberry.svg';
import Cheese from '../assets/Food/cheese.svg';
import Chiken from '../assets/Food/chicken.svg';
import Eggs from '../assets/Food/food-eggs-fried.png';
import Fish from '../assets/Food/fish.svg';
import FrenchFries from '../assets/Food/food-fries.svg';
import Blueberry from '../assets/Food/food-blueberry.svg';
import Beef from '../assets/Food/meat.svg';
import Pizza from '../assets/Food/pizza.svg';
import Corn from '../assets/Food/food-corn.svg';
import Potato from '../assets/Food/potato.svg';

/**
 * Food items configuration - IDs match contract exactly
 * This will be replaced by dynamic data from the contract
 */
const initialFoodItems = [
  { name: 'Apple', img: Apple, count: 50, id: 1 },
  { name: 'Banana', img: Banana, count: 50, id: 2 },
  { name: 'Cherry', img: Cherry, count: 50, id: 3 },
  { name: 'Burguer', img: Burguer, count: 50, id: 4 },
  { name: 'Chocolate Cake', img: CakeChoco, count: 50, id: 5 },
  { name: 'Strawberry Cake', img: CakeStrawberry, count: 50, id: 6 },
  { name: 'Cheese', img: Cheese, count: 50, id: 7 },
  { name: 'Chicken', img: Chiken, count: 50, id: 8 },
  { name: 'Eggs', img: Eggs, count: 50, id: 9 },
  { name: 'Fish', img: Fish, count: 50, id: 10 },
  { name: 'French Fries', img: FrenchFries, count: 50, id: 11 },
  { name: 'Blueberry', img: Blueberry, count: 50, id: 12 },
  { name: 'Beef', img: Beef, count: 50, id: 13 },
  { name: 'Pizza', img: Pizza, count: 50, id: 14 },
  { name: 'Corn', img: Corn, count: 50, id: 15 },
  { name: 'Potato', img: Potato, count: 50, id: 16 }
];

/**
 * Food metadata lookup by ID
 * Used to map contract data to UI display data
 */
export const FOOD_ASSETS = {
  1: { name: 'Apple', img: Apple },
  2: { name: 'Banana', img: Banana },
  3: { name: 'Cherry', img: Cherry },
  4: { name: 'Burguer', img: Burguer },
  5: { name: 'Chocolate Cake', img: CakeChoco },
  6: { name: 'Strawberry Cake', img: CakeStrawberry },
  7: { name: 'Cheese', img: Cheese },
  8: { name: 'Chicken', img: Chiken },
  9: { name: 'Eggs', img: Eggs },
  10: { name: 'Fish', img: Fish },
  11: { name: 'French Fries', img: FrenchFries },
  12: { name: 'Blueberry', img: Blueberry },
  13: { name: 'Beef', img: Beef },
  14: { name: 'Pizza', img: Pizza },
  15: { name: 'Corn', img: Corn },
  16: { name: 'Potato', img: Potato },
} as const;

/**
 * UI Configuration for carousel and drag & drop
 */
export const FOOD_UI_CONFIG = {
  // Drag and drop settings
  DROP_TOLERANCE: 150,
  BEAST_DROP_ZONE_ID: 'beast-drop-zone',
  
  // Carousel settings
  SLIDER_SETTINGS: {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    centerMode: false,
    centerPadding: "0px",
    arrows: false,
    autoplay: false,
    dotsClass: "slick-dots custom-dots",
  },
  
  // Toast colors for different foods (can be expanded later)
  FOOD_COLORS: {
    1: "#10B981",  // Apple - Green
    2: "#FDE047",  // Banana - Yellow
    3: "#EC4899",  // Cherry - Pink
    4: "#92400E",  // Burger - Brown
    5: "#7C2D12",  // Chocolate Cake - Dark brown
    6: "#EC4899",  // Strawberry Cake - Pink
    7: "#FED7AA",  // Cheese - Light orange
    8: "#F97316",  // Chicken - Orange
    9: "#FEF3C7",  // Eggs - Light yellow
    10: "#06B6D4", // Fish - Cyan
    11: "#FBBF24", // French Fries - Gold
    12: "#3B82F6", // Blueberry - Blue
    13: "#DC2626", // Beef - Red
    14: "#DC2626", // Pizza - Red
    15: "#FCD34D", // Corn - Yellow-orange
    16: "#A78BFA", // Potato - Purple
  } as Record<number, string>,
} as const;

// Export individual constants for easier importing
export const DROP_TOLERANCE = FOOD_UI_CONFIG.DROP_TOLERANCE;
export const BEAST_DROP_ZONE_ID = FOOD_UI_CONFIG.BEAST_DROP_ZONE_ID;
export const SLIDER_SETTINGS = FOOD_UI_CONFIG.SLIDER_SETTINGS;

/**
 * Carousel custom styles
 */
export const CAROUSEL_STYLES = `
  .custom-dots {
    bottom: -25px !important;
  }
  .custom-dots li button:before {
    color: rgb(230, 220, 199) !important;
    opacity: 0.5 !important;
    font-size: 6px !important;
  }
  .custom-dots li.slick-active button:before {
    opacity: 1 !important;
    color: rgb(251, 191, 36) !important;
  }
`;

export default initialFoodItems;