import { useCallback } from 'react';
import { useLiveBeast } from './useLiveBeast';
import useAppStore from '../../zustand/store';
import fetchStatus from '../../utils/fetchStatus';
import { network } from '../../config/cavosConfig';

interface PostSpawnSyncResult {
  success: boolean;
  syncType: 'complete' | 'partial' | 'failed';
  finalBeastId: number | null;
  error?: string;
}

export const usePostSpawnSync = () => {
  // Get Cavos wallet address instead of Starknet account
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  
  // Use correct function name from useLiveBeast
  const { forceRefetch: refetchLiveBeast } = useLiveBeast();
  const clearRealTimeStatus = useAppStore(state => state.clearRealTimeStatus);
  const setRealTimeStatus = useAppStore(state => state.setRealTimeStatus);
  
  const syncAfterSpawn = useCallback(async (
    txHash?: string, 
    expectedParams?: { specie: number; beast_type: number }
  ): Promise<PostSpawnSyncResult> => {
    console.log('🎉 Starting post-spawn sync process...', { 
      txHash: txHash?.slice(0, 10) + '...', 
      expectedParams 
    });
    
    if (!cavosWallet?.address) {
      return {
        success: false,
        syncType: 'failed',
        finalBeastId: null,
        error: 'No Cavos wallet available'
      };
    }
    
    try {
      // Clear previous state to force fresh fetch
      console.log('🧹 Clearing previous state...');
      clearRealTimeStatus();
      
      // Wait for transaction confirmation (increased wait time)
      console.log('⏳ Waiting for transaction processing...');
      await new Promise(resolve => setTimeout(resolve, 8000)); // Increased from 4s to 8s
      
      // Fetch fresh contract state (with more retries)
      console.log('📡 Fetching fresh contract status...');
      let contractRetries = 6; // Increased from 3 to 6
      let contractBeastId = null;
      
      while (contractRetries > 0 && !contractBeastId) {
        try {
          // Use direct fetchStatus with Cavos wallet address
          const contractStatus = await fetchStatus({ address: cavosWallet.address, chainId: network });
          
          // Handle fetchStatus results properly
          if (contractStatus && contractStatus.length >= 10) {
            contractBeastId = contractStatus[1];
            const isAlive = Boolean(contractStatus[2]);
            
            if (contractBeastId && isAlive) {
              console.log('✅ Contract status fetched successfully:', {
                beast_id: contractBeastId,
                is_alive: isAlive
              });
              
              // Update store with fresh contract data
              setRealTimeStatus(contractStatus);
              break;
            }
          } else if (contractStatus === undefined) {
            console.log('⚠️ No beast found in contract yet...');
          } else {
            console.log('❌ Contract call failed');
          }
          
          contractRetries--;
          if (contractRetries > 0) {
            console.log(`⚠️ Contract data not ready, retrying... (${contractRetries} left)`);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Increased from 2s to 3s
          }
        } catch (error) {
          contractRetries--;
          console.log(`❌ Contract fetch failed, retrying... (${contractRetries} left)`, error);
          if (contractRetries > 0) {
            await new Promise(resolve => setTimeout(resolve, 3000)); // Increased from 2s to 3s
          }
        }
      }
      
      if (!contractBeastId) {
        throw new Error('Failed to fetch contract status after retries');
      }
      
      // Small delay to stabilize
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Refetch Torii data (with aggressive retry for beast indexing)
      console.log('🔄 Refetching beast data from Torii...');
      let toriiRetries = 10; // More attempts
      let toriiSuccess = false;
      
      while (toriiRetries > 0 && !toriiSuccess) {
        try {
          await refetchLiveBeast();
          
          // Check if Torii synced correctly
          const currentState = useAppStore.getState();
          const hasLiveBeast = currentState.hasLiveBeast();
          const storeBeastId = currentState.getCurrentBeastId();
          
          console.log(`🔍 Torii sync check (attempt ${10 - toriiRetries + 1}):`, {
            hasLiveBeast,
            storeBeastId,
            contractBeastId,
            match: storeBeastId === contractBeastId
          });
          
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
            // Shorter wait times for faster response
            const waitTime = toriiRetries > 5 ? 1500 : 2000; // 1.5s first 5, then 2s
            console.log(`⚠️ Torii not synchronized yet, retrying... (${toriiRetries} left) - waiting ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        } catch (error) {
          toriiRetries--;
          console.log(`❌ Torii refetch failed, retrying... (${toriiRetries} left)`, error);
          if (toriiRetries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1500)); // Shorter wait on error
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
          syncType: 'complete',
          finalBeastId: finalBeastId
        };
      } else {
        // Partial success - contract OK but Torii lag (contract-first approach)
        if (contractBeastId && realTimeStatusValid) {
          console.log('✅ Partial success: Contract OK, Torii will sync eventually');
          console.log('📊 Beast will be available - forcing UI update with contract data');
          
          // The real-time status is already set from contract, this will trigger UI updates
          if (realTimeStatusValid) {
            console.log('🔄 Real-time status already updated for UI');
          }
          
          return {
            success: true, // Contract-first approach: this is enough for UI
            syncType: 'partial',
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
        syncType: 'failed',
        finalBeastId: null,
        error: errorMessage
      };
    }
  }, [cavosWallet?.address, refetchLiveBeast, clearRealTimeStatus, setRealTimeStatus]);
  
  return { syncAfterSpawn };
};