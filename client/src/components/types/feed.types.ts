import type { Screen } from "./screens";

/**
 * Enhanced FoodItem interface with blockchain integration
 * Matches the structure from your existing types but with contract data
 */
export interface FoodItem {
  id: number;        
  name: string;
  icon: string;
  count: number;     
  hungerRestore: number;  
  color: string;
}

export interface FeedScreenProps {
  onNavigation: (screen: Screen) => void;
  isBeastSleeping?: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedFood: FoodItem | null;
  portalPosition: { x: number; y: number };
}

export interface BeastAnimationProps {
  isDragging: boolean;
  isFeeding?: boolean;  
}

/**
 * Enhanced carousel props with transaction state
 */
export interface FoodCarouselProps {
  foods: FoodItem[];
  isDragging: boolean;
  isDisabled?: boolean;  
  onDragStart: (food: FoodItem) => void;
  onDrag: (event: any, info: any) => void;
  onDragEnd: (event: any, info: any) => void;
}

/**
 * Enhanced food item props with transaction state
 */
export interface FoodItemProps {
  food: FoodItem;
  isDragging: boolean;
  draggedFood: FoodItem | null;
  isDisabled?: boolean;     
  isBeingFed?: boolean;     
  onDragStart: (food: FoodItem) => void;
  onDrag: (event: any, info: any) => void;
  onDragEnd: (event: any, info: any) => void;
}

export interface DragPortalProps {
  isDragging: boolean;
  draggedFood: FoodItem | null;
  portalPosition: { x: number; y: number };
  portalRoot: HTMLDivElement | null;
}

/**
 * Transaction state for feeding system
 * Simple interface for managing feeding in progress
 */
export interface FeedTransactionState {
  isFeeding: boolean;
  feedingFoodId: number | null;
  transactionHash: string | null;
  error: string | null;
}