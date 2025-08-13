import { useMemo } from "react";
import { useLiveBeast } from "./useLiveBeast";
import { getBeastDisplayInfo, type BeastSpecies, type BeastType } from "../../utils/beastHelpers";
import { BEAST_ASSETS, BEAST_SLEEPING_ASSETS, type BeastType as EggBeastType } from "../../components/screens/Hatch/components/eggAnimation";
import useAppStore from "../../zustand/store";

// Types for the hook
export interface BeastDisplayInfo {
    asset: string;
    displayName: string;
    specieName: string;
    typeName: string;
    age: number;
    beast_id: string | number; 
    specie: BeastSpecies;
    beastType: BeastType;
    beastTypeString: EggBeastType;
}

export interface UseBeastDisplayReturn {
    currentBeastDisplay: BeastDisplayInfo | null;
    liveBeast: any; // Your beast type from the store
    liveBeastStatus: any; 
    hasLiveBeast: boolean;
    isLoading: boolean;
}

/**
 * Universal hook to get display information for the beast
 * Encapsulates all logic for mapping assets and display information
 */
export const useBeastDisplay = (): UseBeastDisplayReturn => {
    // Get data for the live beast
    const { 
        liveBeast, 
        liveBeastStatus, 
        hasLiveBeast,
        isLoading 
    } = useLiveBeast();
    
    // Get sleep state from store
    const realTimeStatusUI = useAppStore(state => state.getRealTimeStatusForUI());
    const isBeastSleeping = realTimeStatusUI ? !realTimeStatusUI.isAwake : false;

    // Process display information
    const currentBeastDisplay = useMemo((): BeastDisplayInfo | null => {
        if (!liveBeast) return null;
        
        // Get display information based on specie and beast_type
        const displayInfo = getBeastDisplayInfo(
            liveBeast.specie as BeastSpecies, 
            liveBeast.beast_type as BeastType
        );
        
        // Map numeric beast_type to string for BEAST_ASSETS
        const getBeastTypeString = (beastType: number): EggBeastType => {
            switch (beastType) {
                case 1: return 'wolf';
                case 2: return 'dragon';  
                case 3: return 'snake';
                default: return 'wolf';
            }
        };
        
        const beastTypeString = getBeastTypeString(displayInfo.beastType as number);
        // Use sleeping asset if beast is sleeping, otherwise use normal asset
        const beastAsset = isBeastSleeping 
            ? BEAST_SLEEPING_ASSETS[beastTypeString]
            : BEAST_ASSETS[beastTypeString];
        
        return {
            asset: beastAsset,
            displayName: displayInfo.displayName,
            specieName: displayInfo.specieName,
            typeName: displayInfo.typeName,
            age: liveBeast.age || 0,
            beast_id: liveBeast.beast_id || '',
            specie: displayInfo.specie,
            beastType: displayInfo.beastType,
            beastTypeString
        };
    }, [liveBeast, isBeastSleeping]);

    return {
        currentBeastDisplay,
        liveBeast,
        liveBeastStatus,
        hasLiveBeast,
        isLoading
    };
};