import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Import types from generated bindings
import { 
  Player, 
  Beast, 
  BeastStatus, 
  Food, 
  HighestScore 
} from '../dojo/models.gen';

// Import transaction states
import { FeedTransactionState } from '../components/types/feed.types';
import { CleanTransactionState } from '../components/types/clean.types';

// Simplified Beast State - only what we actually need
interface LiveBeastData {
  beast: Beast | null;
  status: BeastStatus | null;
  isAlive: boolean;
}

// App State Interface
interface AppStore {
  // Player state
  player: Player | null;
  
  // Single live beast data instead of arrays
  liveBeast: LiveBeastData;
  
  // Food state
  foods: Food[];

  // Transaction states
  feedTransaction: FeedTransactionState;
  cleanTransaction: CleanTransactionState;
  
  // Scores state
  highestScores: HighestScore[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  gameStarted: boolean;
  
  // Real-time status state
  realTimeStatus: number[];
  lastStatusUpdate: number | null;
  isStatusLoading: boolean;
  
  // Player actions
  setPlayer: (player: Player | null) => void;
  updatePlayerStreak: (daily_streak: number) => void;
  updatePlayerPoints: (total_points: number) => void;
  updateCurrentBeastId: (current_beast_id: number) => void;
  
  // Simplified beast actions for live beast only
  setLiveBeast: (beast: Beast | null, status: BeastStatus | null) => void;
  updateLiveBeastStatus: (statusUpdate: Partial<BeastStatus>) => void;
  clearLiveBeast: () => void;
  
  // Real-time status actions
  setRealTimeStatus: (status: number[]) => void;
  updateStatusOptimistic: (statusUpdate: Partial<{
    energy: number;
    hunger: number;
    happiness: number;
    hygiene: number;
  }>) => void;
  clearRealTimeStatus: () => void;
  getRealTimeStatusForUI: () => {
    energy: number;
    hunger: number;
    happiness: number;
    hygiene: number;
    isAwake: boolean;
  } | null;
  validateStatusForCurrentBeast: (status: number[]) => boolean;
  
  // Contract-first sync functions
  syncWithContractData: (contractStatus: number[]) => void;
  
  // Food actions
  setFoods: (foods: Food[]) => void;
  updateFoodAmount: (player: string, id: number, amount: number) => void;
  addFood: (food: Food) => void;
  
  // Transaction actions
  setFeedTransaction: (transaction: Partial<FeedTransactionState>) => void;
  resetFeedTransaction: () => void;
  
  setCleanTransaction: (transaction: Partial<CleanTransactionState>) => void;
  resetCleanTransaction: () => void;
  
  // Score actions
  setHighestScores: (scores: HighestScore[]) => void;
  updateHighestScore: (minigameId: number, score: number) => void;
  
  // UI actions
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setConnected: (isConnected: boolean) => void;
  startGame: () => void;
  endGame: () => void;
  
  // Utility actions
  resetStore: () => void;
  
  // Convenience getters
  hasLiveBeast: () => boolean;
  getCurrentBeastId: () => number | null;

  // Simple getter to check if any actions are in progress
  canFeedBeast: () => boolean;
}

// Initial state
const initialState = {
  player: null,
  liveBeast: {
    beast: null,
    status: null,
    isAlive: false
  },
  foods: [],

  // Transaction initial states
  feedTransaction: {
    isFeeding: false,
    feedingFoodId: null,
    transactionHash: null,
    error: null,
  },
  
  cleanTransaction: {
    isCleaningInProgress: false,
    transactionHash: null,
    error: null,
  },
  
  highestScores: [],
  isLoading: false,
  error: null,
  isConnected: false,
  gameStarted: false,
  realTimeStatus: [],
  lastStatusUpdate: null,
  isStatusLoading: false,
};

// Create the store
const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Player actions
      setPlayer: (player) => {
        set({ player });
      },
      
      updatePlayerStreak: (daily_streak) => set((state) => ({
        player: state.player ? { ...state.player, daily_streak } : null
      })),
      
      updatePlayerPoints: (total_points) => set((state) => ({
        player: state.player ? { ...state.player, total_points } : null
      })),
      
      updateCurrentBeastId: (current_beast_id) => {
        set((state) => ({
          player: state.player ? { ...state.player, current_beast_id } : null
        }));
      },
      
      setLiveBeast: (beast, status) => {
        const isAlive = status?.is_alive || false;
        set((state) => {
          // AUTO-SYNC: Always sync player.current_beast_id with beast.beast_id
          const updatedPlayer = beast && state.player 
            ? { ...state.player, current_beast_id: beast.beast_id }
            : state.player;
          
          return {
            player: updatedPlayer,
            liveBeast: {
              beast,
              status,
              isAlive
            }
          };
        });
      },
      
      updateLiveBeastStatus: (statusUpdate) => {
        set((state) => ({
          liveBeast: {
            ...state.liveBeast,
            status: state.liveBeast.status 
              ? { ...state.liveBeast.status, ...statusUpdate }
              : null,
            isAlive: statusUpdate.is_alive !== undefined 
              ? statusUpdate.is_alive 
              : state.liveBeast.isAlive
          }
        }));
      },
      
      clearLiveBeast: () => {
        set({
          liveBeast: {
            beast: null,
            status: null,
            isAlive: false
          }
        });
      },
      
      // Contract sync function
      syncWithContractData: (contractStatus) => {
        if (!contractStatus || contractStatus.length < 10) return;
        
        const contractBeastId = contractStatus[1];
        const state = get();
        
        // Update player.current_beast_id if different
        if (state.player && state.player.current_beast_id !== contractBeastId) {
          set((state) => ({
            player: state.player ? { ...state.player, current_beast_id: contractBeastId } : null
          }));
        }
        
        // Update liveBeast if exists but has different ID
        if (state.liveBeast.beast && state.liveBeast.beast.beast_id !== contractBeastId) {
          set((state) => ({
            liveBeast: {
              ...state.liveBeast,
              beast: state.liveBeast.beast ? 
                { ...state.liveBeast.beast, beast_id: contractBeastId } : null,
              status: state.liveBeast.status ? 
                { ...state.liveBeast.status, beast_id: contractBeastId } : null
            }
          }));
        }
      },
      
      // Real-time status actions with auto-sync
      setRealTimeStatus: (status) => {
        // AUTO-SYNC before setting status
        const state = get();
        state.syncWithContractData(status);
        
        set({ 
          realTimeStatus: status,
          lastStatusUpdate: Date.now(),
          isStatusLoading: false
        });
      },
      
      updateStatusOptimistic: (statusUpdate) => set((state) => {
        if (state.realTimeStatus.length === 0) return state;
        
        const newStatus = [...state.realTimeStatus];
        
        // Array structure: [player, beast_id, is_alive, is_awake, hunger, energy, happiness, hygiene, clean_status, last_timestamp]
        // Indices:         [0]     [1]       [2]       [3]       [4]     [5]     [6]         [7]      [8]           [9]
        
        if (statusUpdate.hunger !== undefined) newStatus[4] = statusUpdate.hunger;
        if (statusUpdate.energy !== undefined) newStatus[5] = statusUpdate.energy;
        if (statusUpdate.happiness !== undefined) newStatus[6] = statusUpdate.happiness;
        if (statusUpdate.hygiene !== undefined) newStatus[7] = statusUpdate.hygiene;
        
        return {
          realTimeStatus: newStatus,
          lastStatusUpdate: Date.now()
        };
      }),
      
      clearRealTimeStatus: () => {
        set({ 
          realTimeStatus: [],
          lastStatusUpdate: null,
          isStatusLoading: false
        });
      },
      
      // Contract-first validation with auto-sync
      validateStatusForCurrentBeast: (status) => {
        const state = get();
        
        if (!status || status.length < 10) {
          return false;
        }
        
        const statusBeastId = status[1];
        const currentBeastId = state.getCurrentBeastId();
        
        // AUTO-SYNC: If there's a mismatch, sync automatically
        if (statusBeastId !== currentBeastId) {
          // Sync store with contract data
          state.syncWithContractData(status);
          
          // After sync, the status should be valid
          const newCurrentBeastId = state.getCurrentBeastId();
          return statusBeastId === newCurrentBeastId;
        }
        
        // If already matching, it's valid
        return true;
      },
      
      getRealTimeStatusForUI: () => {
        const state = get();
        if (state.realTimeStatus.length < 10) {
          // Fallback to liveBeast status if no real-time data
          if (state.liveBeast.status) {
            return {
              energy: state.liveBeast.status.energy,
              hunger: state.liveBeast.status.hunger,
              happiness: state.liveBeast.status.happiness,
              hygiene: state.liveBeast.status.hygiene,
              isAwake: true,
            };
          }
          return null;
        }
        
        // Array structure: [player, beast_id, is_alive, is_awake, hunger, energy, happiness, hygiene, clean_status, last_timestamp]
        // Indices:         [0]     [1]       [2]       [3]       [4]     [5]     [6]         [7]      [8]           [9]
        
        return {
          energy: state.realTimeStatus[5] || 0,
          hunger: state.realTimeStatus[4] || 0,
          happiness: state.realTimeStatus[6] || 0,
          hygiene: state.realTimeStatus[7] || 0,
          isAwake: Boolean(state.realTimeStatus[3]), 
        };
      },
      
      // Food actions
      setFoods: (foods) => set({ foods }),
      
      updateFoodAmount: (player, id, amount) => set((state) => ({
        foods: state.foods.map(food => 
          food.player === player && food.id === id ? { ...food, amount } : food
        )
      })),
      
      addFood: (food) => set((state) => ({
        foods: [...state.foods, food]
      })),
      
      // Transaction actions
      setFeedTransaction: (transaction) => set((state) => ({
        feedTransaction: { ...state.feedTransaction, ...transaction }
      })),
      
      resetFeedTransaction: () => set({
        feedTransaction: {
          isFeeding: false,
          feedingFoodId: null,
          transactionHash: null,
          error: null,
        }
      }),
      
      setCleanTransaction: (transaction) => set((state) => ({
        cleanTransaction: { ...state.cleanTransaction, ...transaction }
      })),
      
      resetCleanTransaction: () => set({
        cleanTransaction: {
          isCleaningInProgress: false,
          transactionHash: null,
          error: null,
        }
      }),
      
      // Score actions
      setHighestScores: (highestScores) => set({ highestScores }),
      
      updateHighestScore: (minigameId, score) => set((state) => {
        const existingIndex = state.highestScores.findIndex(
          s => s.minigame_id === minigameId && s.player === state.player?.address
        );
        
        if (existingIndex !== -1) {
          // Update existing score
          const newScores = [...state.highestScores];
          newScores[existingIndex] = { ...newScores[existingIndex], score };
          return { highestScores: newScores };
        } else {
          // Add new score
          const newScore: HighestScore = {
            minigame_id: minigameId,
            player: state.player?.address || '',
            score
          };
          return { highestScores: [...state.highestScores, newScore] };
        }
      }),
      
      // UI actions
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setConnected: (isConnected) => set({ isConnected }),
      startGame: () => set({ gameStarted: true }),
      endGame: () => set({ gameStarted: false }),
      
      // Convenience getters
      hasLiveBeast: () => {
        const state = get();
        return state.liveBeast.isAlive && 
               state.liveBeast.beast !== null && 
               state.liveBeast.status !== null;
      },
      
      // Contract-first getCurrentBeastId
      getCurrentBeastId: () => {
        const state = get();
        
        // PRIORITY: realTimeStatus (contract) > liveBeast > player
        const contractBeastId = state.realTimeStatus.length >= 10 ? state.realTimeStatus[1] : null;
        const liveBeastId = state.liveBeast.beast?.beast_id;
        const playerBeastId = state.player?.current_beast_id;
        
        // Contract-first: use contract ID if available
        return contractBeastId || liveBeastId || playerBeastId || null;
      },
      
      // Simple getter to check if any actions are in progress
      canFeedBeast: () => {
        const state = get();
        return !state.feedTransaction.isFeeding && 
               !state.cleanTransaction.isCleaningInProgress &&
               state.hasLiveBeast() && 
               state.foods.some(food => food.amount > 0);
      },
      
      // Utility actions
      resetStore: () => set(initialState),
    }),
    {
      name: 'tamagotchi-store',
      partialize: (state) => ({
        // Only persist certain parts of the state
        player: state.player,
        liveBeast: state.liveBeast,
        foods: state.foods,
        highestScores: state.highestScores,
        isConnected: state.isConnected,
        realTimeStatus: state.realTimeStatus,
        lastStatusUpdate: state.lastStatusUpdate,
      }),
    }
  )
);

export default useAppStore;