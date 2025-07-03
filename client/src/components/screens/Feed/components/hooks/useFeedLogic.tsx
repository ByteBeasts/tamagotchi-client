import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

// Types and constants
import { FoodItem, DragState } from '../../../../types/feed.types';
import { DROP_TOLERANCE, BEAST_DROP_ZONE_ID, FOOD_UI_CONFIG } from '../../../../../constants/feed.constants';

// Hooks
import { useFoodInventory } from '../../../../../dojo/hooks/useFoodInventory';
import { useFeedBeast } from '../../../../../dojo/hooks/useFeedBeast';
import { useRealTimeStatus } from '../../../../../dojo/hooks/useRealTimeStatus';
import { useUpdateBeast } from '../../../../../dojo/hooks/useUpdateBeast';

// Hook return interface
interface UseFeedLogicReturn {
  // Data from blockchain
  foods: FoodItem[];
  isLoading: boolean;
  
  // Drag state
  dragState: DragState;
  
  // Transaction state
  isFeeding: boolean;
  canFeed: boolean;
  
  // Actions
  handleDragStart: (food: FoodItem) => void;
  handleDrag: (event: any, info: any) => void;
  handleDragEnd: (event: any, info: any) => void;
  
  // Computed
  isCarouselDisabled: boolean;
}

export const useFeedLogic = (): UseFeedLogicReturn => {
  // Get food inventory from blockchain
  const {
    foods,
    isLoading,
    refetch: refetchFood,
    hasFoodAvailable
  } = useFoodInventory();
  
  // Get feed transaction capabilities
  const {
    feedBeast,
    isFeeding,
    canFeed
  } = useFeedBeast();
  
  // Get real-time status management
  const { fetchLatestStatus } = useRealTimeStatus();
  
  // Get beast update capabilities
  const { updateBeast } = useUpdateBeast();
  
  // Drag state management
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedFood: null,
    portalPosition: { x: 0, y: 0 }
  });
  
  const draggedFoodRef = useRef<FoodItem | null>(null);

  // Handle drag start - with validation for feeding state
  const handleDragStart = (food: FoodItem) => {
    // Prevent drag if feeding in progress or no food available
    if (food.count <= 0 || isFeeding || !canFeed) {
      if (isFeeding) {
        toast.error('Please wait for current feeding to complete', {
          duration: 2000,
          position: 'top-center',
        });
      }
      return;
    }
    
    setDragState(prev => ({
      ...prev,
      isDragging: true,
      draggedFood: food
    }));
    draggedFoodRef.current = food;
  };

  // Handle drag movement
  const handleDrag = (_: any, info: any) => {
    setDragState(prev => ({
      ...prev,
      portalPosition: { x: info.point.x - 24, y: info.point.y - 24 }
    }));
  };

  // Handle drag end - with contract integration
  const handleDragEnd = async (_event: any, info: any) => {
    setDragState(prev => ({ ...prev, isDragging: false }));

    const currentDraggedFood = draggedFoodRef.current;
    const beastElement = document.getElementById(BEAST_DROP_ZONE_ID);

    if (!beastElement || !currentDraggedFood) {
      resetDragState();
      return;
    }

    // Calculate drop distance
    const beastRect = beastElement.getBoundingClientRect();
    const dropX = info.point.x;
    const dropY = info.point.y;
    const beastCenterX = beastRect.left + beastRect.width / 2;
    const beastCenterY = beastRect.top + beastRect.height / 2;

    const distance = Math.sqrt(
      Math.pow(dropX - beastCenterX, 2) + Math.pow(dropY - beastCenterY, 2)
    );

    // Check if drop is within tolerance and food is available
    if (distance < DROP_TOLERANCE && currentDraggedFood.count > 0 && canFeed) {
      await handleSuccessfulFeed(currentDraggedFood);
    } else {
      handleFailedFeed();
    }

    resetDragState();
  };

  // Handle successful feed with blockchain transaction
  const handleSuccessfulFeed = async (food: FoodItem) => {
    try {
      // Execute blockchain transaction
      const result = await feedBeast(food.id);
      
      if (result.success) {
        // Show single success toast here
        toast.success(`🎉 ${food.name} fed to your beast!`, {
          duration: 3000,
          position: 'top-center',
          style: {
            background: FOOD_UI_CONFIG.FOOD_COLORS[food.id] || '#10B981',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: '12px',
            padding: '12px 16px',
            fontSize: '16px',
          },
        });
        
        // Post-feeding sequence: Update beast → Fetch status → Refetch food
        setTimeout(async () => {
          try {
            console.log('🔄 Starting post-feeding updates...');
            
            // Step 1: Update beast (this triggers contract status recalculation)
            const updateSuccess = await updateBeast();
            
            if (updateSuccess) {
              console.log('✅ Beast updated successfully');
              
              // Step 2: Fetch latest status SILENTLY (no loading states to avoid re-renders)
              console.log('🔄 Fetching updated status...');
              await fetchLatestStatus();
              console.log('✅ Status fetched and updated in background');
            } else {
              console.warn('⚠️ Beast update failed, fetching status anyway');
              await fetchLatestStatus();
            }
            
            // Step 3: Refetch food inventory SILENTLY
            console.log('🔄 Refreshing food inventory...');
            await refetchFood();
            console.log('✅ Food inventory refreshed');
            
          } catch (error) {
            console.error('❌ Error in post-feeding updates:', error);
            // Still try to refetch food even if status update fails
            await refetchFood();
          }
        }, 1500); // Reduced delay for faster feedback
        
      } else {
        // Error handled by useFeedBeast hook (revert + error toast)
        console.error('Feed transaction failed:', result.error);
      }
      
    } catch (error) {
      console.error('Unexpected error in handleSuccessfulFeed:', error);
      toast.error('An unexpected error occurred');
    }
  };

  // Handle failed feed (missed drop zone)
  const handleFailedFeed = () => {
    if (isFeeding) {
      toast.error('Feeding in progress, please wait!', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#F59E0B',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '16px',
        },
      });
    } else {
      toast.error('Drop food on your beast to feed it! 🎯', {
        duration: 2000,
        position: 'top-center',
        style: {
          background: '#EF4444',
          color: 'white',
          fontWeight: 'bold',
          borderRadius: '12px',
          padding: '12px 16px',
          fontSize: '16px',
        },
      });
    }
  };

  // Reset drag state
  const resetDragState = () => {
    setDragState(prev => ({ ...prev, draggedFood: null }));
    draggedFoodRef.current = null;
  };

  // Computed values
  const isCarouselDisabled = isFeeding || isLoading || !hasFoodAvailable;

  return {
    // Data from blockchain
    foods,
    isLoading,
    
    // Drag state
    dragState,
    
    // Transaction state
    isFeeding,
    canFeed,
    
    // Actions
    handleDragStart,
    handleDrag,
    handleDragEnd,
    
    // Computed
    isCarouselDisabled,
  };
};

// hooks/usePortal.ts - No changes needed
export const usePortal = () => {
  const portalRoot = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const div = document.createElement("div");
    div.style.position = "fixed";
    div.style.top = "0";
    div.style.left = "0";
    div.style.pointerEvents = "none";
    div.style.zIndex = "99999";
    document.body.appendChild(div);
    portalRoot.current = div;

    return () => {
      if (portalRoot.current && document.body.contains(portalRoot.current)) {
        document.body.removeChild(portalRoot.current);
      }
    };
  }, []);

  return portalRoot;
};