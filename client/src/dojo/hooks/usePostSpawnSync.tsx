import { useCallback } from 'react';
import { useRealTimeStatus } from './useRealTimeStatus';
import { useLiveBeast } from './useLiveBeast';
import useAppStore from '../../zustand/store';

interface PostSpawnSyncResult {
  success: boolean;
  finalBeastId: number | null;
  error?: string;
}

export const usePostSpawnSync = () => {
  const { fetchLatestStatus } = useRealTimeStatus();
  const { forceRefetch: refetchLiveBeast } = useLiveBeast();
  const clearRealTimeStatus = useAppStore(state => state.clearRealTimeStatus);
  
  const syncAfterSpawn = useCallback(async (
    txHash?: string, 
    expectedParams?: { specie: number; beast_type: number }
  ): Promise<PostSpawnSyncResult> => {
    console.log('🎉 Starting post-spawn sync process...', { 
      txHash: txHash?.slice(0, 10) + '...', 
      expectedParams 
    });
    
    try {
      // Clear previous state to force fresh fetch
      console.log('🧹 Clearing previous state...');
      clearRealTimeStatus();
      
      // Wait for transaction confirmation
      console.log('⏳ Waiting for transaction processing...');
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Fetch fresh contract state (with retry)
      console.log('📡 Fetching fresh contract status...');
      let contractRetries = 3;
      let contractBeastId = null;
      
      while (contractRetries > 0 && !contractBeastId) {
        try {
          await fetchLatestStatus();
          
          // Check if we have contract data
          const currentState = useAppStore.getState();
          if (currentState.realTimeStatus.length >= 10) {
            contractBeastId = currentState.realTimeStatus[1];
            const isAlive = Boolean(currentState.realTimeStatus[2]);
            
            if (contractBeastId && isAlive) {
              console.log('✅ Contract status fetched successfully:', {
                beast_id: contractBeastId,
                is_alive: isAlive
              });
              break;
            }
          }
          
          contractRetries--;
          if (contractRetries > 0) {
            console.log(`⚠️ Contract data not ready, retrying... (${contractRetries} left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (error) {
          contractRetries--;
          console.log(`❌ Contract fetch failed, retrying... (${contractRetries} left)`, error);
          if (contractRetries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (!contractBeastId) {
        throw new Error('Failed to fetch contract status after retries');
      }
      
      // Small delay to stabilize
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refetch Torii data (with smart retry)
      console.log('🔄 Refetching beast data from Torii...');
      let toriiRetries = 4;
      let toriiSuccess = false;
      
      while (toriiRetries > 0 && !toriiSuccess) {
        try {
          await refetchLiveBeast();
          
          // Check if Torii synced correctly
          const currentState = useAppStore.getState();
          const hasLiveBeast = currentState.hasLiveBeast();
          const storeBeastId = currentState.getCurrentBeastId();
          
          if (hasLiveBeast && storeBeastId === contractBeastId) {
            console.log('✅ Torii data synchronized successfully:', {
              beast_id: storeBeastId,
              has_live_beast: hasLiveBeast
            });
            toriiSuccess = true;
            break;
          }
          
          toriiRetries--;
          if (toriiRetries > 0) {
            console.log(`⚠️ Torii not synchronized yet, retrying... (${toriiRetries} left)`);
            await new Promise(resolve => setTimeout(resolve, 2500));
          }
        } catch (error) {
          toriiRetries--;
          console.log(`❌ Torii refetch failed, retrying... (${toriiRetries} left)`, error);
          if (toriiRetries > 0) {
            await new Promise(resolve => setTimeout(resolve, 2500));
          }
        }
      }
      
      // Final verification and result
      const finalState = useAppStore.getState();
      const finalBeastId = finalState.getCurrentBeastId();
      const finalHasLiveBeast = finalState.hasLiveBeast();
      const realTimeStatusValid = finalState.realTimeStatus.length >= 10;
      
      console.log('🔍 Post-spawn verification:', {
        final_beast_id: finalBeastId,
        has_live_beast: finalHasLiveBeast,
        real_time_status_valid: realTimeStatusValid,
        contract_beast_id: contractBeastId,
        torii_synchronized: finalBeastId === contractBeastId,
        overall_success: finalHasLiveBeast && finalBeastId === contractBeastId
      });
      
      const overallSuccess = finalHasLiveBeast && finalBeastId === contractBeastId && realTimeStatusValid;
      
      if (overallSuccess) {
        console.log('✅ Post-spawn sync completed successfully');
        return {
          success: true,
          finalBeastId: finalBeastId
        };
      } else {
        // Partial success - contract OK but Torii lag
        if (contractBeastId && !toriiSuccess) {
          console.log('⚠️ Partial success: Contract OK, Torii will sync eventually');
          return {
            success: true, // Contract-first approach: this is enough
            finalBeastId: contractBeastId
          };
        }
        
        throw new Error('Synchronization validation failed');
      }
      
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Unknown sync error';
      console.error('❌ Post-spawn sync failed:', errorMessage);
      
      return {
        success: false,
        finalBeastId: null,
        error: errorMessage
      };
    }
  }, [fetchLatestStatus, refetchLiveBeast, clearRealTimeStatus]);
  
  return { syncAfterSpawn };
};