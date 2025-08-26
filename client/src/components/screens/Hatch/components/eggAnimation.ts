// WOLF frames (specie 1)
import EggShadowFrame0 from "../../../../assets/eggs/egg-wolf/egg-wolf-frame-0.png";
import EggShadowFrame1 from "../../../../assets/eggs/egg-wolf/egg-wolf-frame-1.png";
import EggShadowFrame2 from "../../../../assets/eggs/egg-wolf/egg-wolf-frame-2.png";
import EggShadowFrame3 from "../../../../assets/eggs/egg-wolf/egg-wolf-frame-3.png";
import EggShadowFrame4 from "../../../../assets/eggs/egg-wolf/egg-wolf-frame-4.png";
import EggShadowFrame5 from "../../../../assets/eggs/egg-wolf/egg-wolf-frame-5.png";

// DRAGON frames (specie 2)
import EggDragonFrame0 from "../../../../assets/eggs/egg-dragon/egg-dragon-frame-0.png";
import EggDragonFrame1 from "../../../../assets/eggs/egg-dragon/egg-dragon-frame-1.png";
import EggDragonFrame2 from "../../../../assets/eggs/egg-dragon/egg-dragon-frame-2.png";
import EggDragonFrame3 from "../../../../assets/eggs/egg-dragon/egg-dragon-frame-3.png";
import EggDragonFrame4 from "../../../../assets/eggs/egg-dragon/egg-dragon-frame-4.png";
import EggDragonFrame5 from "../../../../assets/eggs/egg-dragon/egg-dragon-frame-5.png";

// SNAKE frames (specie 3)
import EggWaterFrame0 from "../../../../assets/eggs/egg-snake/egg-snake-frame-0.png";
import EggWaterFrame1 from "../../../../assets/eggs/egg-snake/egg-snake-frame-1.png";
import EggWaterFrame2 from "../../../../assets/eggs/egg-snake/egg-snake-frame-2.png";
import EggWaterFrame3 from "../../../../assets/eggs/egg-snake/egg-snake-frame-3.png";
import EggWaterFrame4 from "../../../../assets/eggs/egg-snake/egg-snake-frame-4.png";
import EggWaterFrame5 from "../../../../assets/eggs/egg-snake/egg-snake-frame-5.png";

// Beast assets
import BabyWolf from "../../../../assets/beasts/baby-wolf.webp";
import BabyDragon from "../../../../assets/beasts/baby-dragon.webp";
import BabySnake from "../../../../assets/beasts/baby-snake.webp";

// Sleeping beast assets
import BabyWolfSleeping from "../../../../assets/beasts-sleeping/baby-wolf-sleeping.png";
import BabyDragonSleeping from "../../../../assets/beasts-sleeping/baby-dragon-sleeping.webp";
import BabySnakeSleeping from "../../../../assets/beasts-sleeping/baby-snake-sleeping.webp";

export type EggType = 'shadow' | 'dragon' | 'water';
export type BeastType = 'wolf' | 'dragon' | 'snake';

// Direct mapping from contract specie to egg type
export const SPECIE_TO_EGG_TYPE: Record<number, EggType> = {
  1: 'shadow',  // Shadow Beast (specie 1) → Shadow Egg
  2: 'dragon',  // Fire Beast (specie 2) → Dragon Egg  
  3: 'water'    // Water Beast (specie 3) → Water Egg
};

// Reverse mapping from egg type to specie
export const EGG_TYPE_TO_SPECIE: Record<EggType, number> = {
  shadow: 1,
  dragon: 2,
  water: 3
};

// Mapping of egg types to beast types (for UI)
export const EGG_TO_BEAST_MAP: Record<EggType, BeastType> = {
  shadow: 'wolf',    // Shadow egg → Wolf
  dragon: 'dragon',  // Dragon egg → Dragon
  water: 'snake'     // Water egg → Snake
};

// Beast assets mapping
export const BEAST_ASSETS: Record<BeastType, string> = {
  wolf: BabyWolf,
  dragon: BabyDragon, 
  snake: BabySnake  
};

// Sleeping beast assets mapping
export const BEAST_SLEEPING_ASSETS: Record<BeastType, string> = {
  wolf: BabyWolfSleeping,
  dragon: BabyDragonSleeping,
  snake: BabySnakeSleeping
};

// Interface with specie information
export interface EggAnimation {
  eggType: EggType;
  beastType: BeastType;
  specie: number;           // Corresponding specie (1-3)
  idleFrame: string;
  hatchFrames: string[];
  beastAsset: string;
}

// Complete configurations with specie mapping
export const EGG_ANIMATIONS: Record<EggType, EggAnimation> = {
  shadow: {
    eggType: 'shadow',
    beastType: 'wolf',
    specie: 1,                // Shadow Beast = specie 1
    idleFrame: EggShadowFrame0,
    hatchFrames: [
      EggShadowFrame0,
      EggShadowFrame1,
      EggShadowFrame2,
      EggShadowFrame3,
      EggShadowFrame4,
      EggShadowFrame5
    ],
    beastAsset: BabyWolf
  },
  
  dragon: {
    eggType: 'dragon',
    beastType: 'dragon',
    specie: 2,                // Fire Beast = specie 2
    idleFrame: EggDragonFrame0,
    hatchFrames: [
      EggDragonFrame0,
      EggDragonFrame1,
      EggDragonFrame2,
      EggDragonFrame3,
      EggDragonFrame4,
      EggDragonFrame5
    ],
    beastAsset: BabyDragon
  },
  
  water: {
    eggType: 'water',
    beastType: 'snake',
    specie: 3,                // Water Beast = specie 3
    idleFrame: EggWaterFrame0,
    hatchFrames: [
      EggWaterFrame0,
      EggWaterFrame1,
      EggWaterFrame2,
      EggWaterFrame3,
      EggWaterFrame4,
      EggWaterFrame5
    ],
    beastAsset: BabySnake
  }
};

// Animation configuration
export const EGG_ANIMATION_CONFIG = {
  FRAME_DURATION: 150,       // ms per frame
  TOTAL_DURATION: 900,       // 6 frames * 150ms
  BEAST_REVEAL_DELAY: 800,   // Delay before showing the beast
} as const;

// Helper functions

/**
 * Gets animation configuration based on contract specie
 */
export const getEggAnimationBySpecie = (specie: number): EggAnimation => {
  const eggType = SPECIE_TO_EGG_TYPE[specie] || 'shadow';
  return EGG_ANIMATIONS[eggType];
};

/**
 * Gets egg type based on contract specie
 */
export const getEggTypeBySpecie = (specie: number): EggType => {
  return SPECIE_TO_EGG_TYPE[specie] || 'shadow';
};

/**
 * Gets specie based on egg type
 */
export const getSpecieByEggType = (eggType: EggType): number => {
  return EGG_TYPE_TO_SPECIE[eggType] || 1;
};

/**
 * Validates that an egg type is valid
 */
export const isValidEggType = (eggType: string): eggType is EggType => {
  return ['shadow', 'dragon', 'water'].includes(eggType);
};

/**
 * Gets complete beast information based on egg type
 */
export const getBeastInfoByEggType = (eggType: EggType) => {
  const animation = EGG_ANIMATIONS[eggType];
  return {
    eggType: animation.eggType,
    beastType: animation.beastType,
    specie: animation.specie,
    beastAsset: animation.beastAsset
  };
};