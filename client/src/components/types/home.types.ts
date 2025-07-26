import type { Screen } from "../types/screens";

export interface HomeScreenProps {
  onNavigation: (screen: Screen) => void;
  playerAddress: string;
}

export interface BeastData {
  age: number;
  energy: number;
  hunger: number;
  happiness: number;
  cleanliness: number;
}

export interface PlayerData {
  username: string;
  points: number;
  currentStreak: number;
  banner?: string;
}

export interface PlayerInfoSectionProps {
  playerName: string;
  age: number;
  onProfileClick: () => void;
  onNavigateLogin: () => void;
  beastData: BeastData;
  onEmotionalTrackerClick: () => void;
}

export interface ActionButtonsProps {
  onShopClick: () => void;
  onDailyQuestsClick: () => void;
}

export interface BeastHomeDisplayProps {
  beastImage: string;
  altText: string;
  speechMessage?: string;
  showSpeech?: boolean;
  onSpeechComplete?: () => void;
}