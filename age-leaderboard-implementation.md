# Age Leaderboard Implementation Guide

## Overview
Implement a leaderboard system for ByteBeasts showing the top 10 oldest beasts (by age) in the game. This follows the same architecture and design patterns as the existing minigame leaderboard.

## Data Models

### Backend Models (Cairo/Starknet)
```rust
pub struct Beast {
    #[key]
    pub player: ContractAddress, 
    #[key]
    pub beast_id: u16,
    pub age: u16,
    pub birth_date: u64,
    pub specie: u8,
    pub beast_type: u8,
    pub name: felt252, // max 32 characters
}

pub struct BeastStatus {
    #[key]
    pub player: ContractAddress, 
    #[key]
    pub beast_id: u16,
    pub is_alive: bool,
    pub is_awake: bool,
    pub hunger: u8,
    pub energy: u8,
    pub happiness: u8,
    pub hygiene: u8,
    pub clean_status: u8,
    pub last_timestamp: u64,
}
```

## Requirements

### Leaderboard Display Columns
1. **Rank**: Position in leaderboard (1-10)
2. **Player**: Player name (decoded from Player model) or truncated address if no name
3. **Beasts**: Beast name (decoded from felt252) or truncated beast_id if no name
4. **Age**: Simple number (e.g., "45")
5. **Live**: ❤️ for alive, 💀 for dead

### Business Logic
- Show top 10 beasts by age regardless of alive/dead status
- A player can have multiple beasts in the top 10
- Sort by `age` DESC, then by `birth_date` ASC (older first) for ties
- Mark all beasts belonging to current user (not just active beast)
- Always query BeastStatus (it always exists in the contract)

## Implementation Architecture

### 1. Hook: `useAgeLeaderboard.tsx`
Create in `client/src/dojo/hooks/useAgeLeaderboard.tsx`

Reference implementation: `client/src/dojo/hooks/useGameLeaderboard.tsx`

#### GraphQL Queries Needed

```typescript
// Query 1: Top 10 beasts by age
const TOP_BEASTS_BY_AGE_QUERY = `
  query GetTopBeastsByAge {
    tamagotchiBeastModels(
      order: { field: AGE, direction: DESC }
      limit: 10
    ) {
      edges {
        node {
          player
          beast_id
          age
          birth_date
          specie
          beast_type
          name
        }
      }
    }
  }
`;

// Query 2: Get beast status (for is_alive)
const BEAST_STATUS_QUERY = `
  query GetBeastStatus($player: ContractAddress!, $beastId: Int!) {
    tamagotchiBeastStatusModels(
      where: { 
        player: $player,
        beast_id: $beastId 
      }
    ) {
      edges {
        node {
          is_alive
        }
      }
    }
  }
`;

// Query 3: Get player name (reuse from useGameLeaderboard)
const PLAYER_NAME_QUERY = `
  query GetPlayerName($address: ContractAddress!) {
    tamagotchiPlayerModels(where: { address: $address }) {
      edges {
        node {
          address
          name
        }
      }
    }
  }
`;

// Query 4: Count beasts with higher age for ranking (if user's oldest beast not in top 10)
// IMPORTANT: Use 'ageGT' not 'age_gt' - Torii uses camelCase for comparison operators
const COUNT_OLDER_BEASTS_QUERY = `
  query CountOlderBeasts($userAge: Int!) {
    tamagotchiBeastModels(
      where: { 
        ageGT: $userAge 
      }
    ) {
      totalCount
    }
  }
`;
```

#### Hook Interface

```typescript
export interface LeaderboardBeast {
  rank: number;
  playerAddress: string;
  playerName: string;
  beastId: number;
  beastName: string;
  age: number;
  isAlive: boolean;
  isCurrentUserBeast: boolean;
}

export interface UseAgeLeaderboardReturn {
  topBeasts: LeaderboardBeast[];
  currentUserBestBeast: LeaderboardBeast | null; // User's oldest beast if not in top 10
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

#### Implementation Steps

1. **Fetch top 10 beasts** ordered by age
2. **For each beast**, fetch BeastStatus individually to get `is_alive`
3. **Collect unique player addresses** and fetch names individually (GraphQL doesn't support array parameters)
4. **Decode names**:
   - Player names: Use `shortString.decodeShortString()` from 'starknet'
   - Beast names: Use `shortString.decodeShortString()` from 'starknet'
   - Fallback to truncated address/ID format: `0x1234...abcd`
5. **Sort results** if needed (by age DESC, then birth_date ASC)
6. **Mark current user's beasts** by comparing addresses (normalized and padded)
7. **Find user's best beast** if not in top 10 (optional query)

### 2. UI Components

#### File Structure
```
client/src/components/screens/AgeRanking/
├── AgeRankingScreen.tsx     # Main screen component
├── AgeRankingTable.tsx      # Table component
└── AgeRankingRow.tsx        # Individual row component
```

#### Component Guidelines

Follow the exact same patterns as the minigame leaderboard:
- Reference: `client/src/components/screens/GameRanking/`
- Use same styling, animations, and layout
- Reuse shared components like `BackButton`, `MagicalSparkleParticles`, `TamagotchiTopBar`

#### Key Differences from Game Leaderboard

1. **No carousel**: Single leaderboard (not multiple games)
2. **Different columns**: Rank, Player, Beasts, Age, Live (instead of score)
3. **Live indicator**: Use ❤️/💀 emojis instead of score numbers
4. **Beast highlighting**: Highlight rows for current user's beasts

#### AgeRankingScreen.tsx Structure

```typescript
export function AgeRankingScreen({ onNavigation }: AgeRankingScreenProps) {
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  
  const { 
    topBeasts, 
    currentUserBestBeast, 
    isLoading, 
    error, 
    refetch 
  } = useAgeLeaderboard(cavosWallet?.address);

  // Similar structure to GameRankingScreen but without carousel
  // Single banner saying "Oldest Beasts Leaderboard"
  // Dragon avatar from existing assets
  // AgeRankingTable component
}
```

#### AgeRankingTable.tsx Headers

```typescript
const headers = [
  { key: 'rank', label: 'Rank', width: 'w-1/12' },
  { key: 'player', label: 'Player', width: 'w-3/12' },
  { key: 'beast', label: 'Beast', width: 'w-3/12' },
  { key: 'age', label: 'Age', width: 'w-2/12' },
  { key: 'live', label: 'Live', width: 'w-1/12' }
];
```

### 3. Integration Points

#### Navigation
1. Add "ageRanking" to `client/src/components/types/screens.ts`
2. Add screen routing in `client/src/app/App.tsx`
3. Add navigation button somewhere logical (maybe in Home screen or as another button in Play screen)

#### Styling
- Use existing gold gradient for headers: `bg-gold-gradient`
- Use existing color scheme for highlighting current user
- Follow responsive design patterns from GameRankingScreen

## Testing Checklist

- [ ] Top 10 beasts load correctly sorted by age
- [ ] Ties in age are resolved by birth_date (older first)
- [ ] Player names decode correctly from felt252
- [ ] Beast names decode correctly from felt252
- [ ] Unknown names fallback to truncated format (0x1234...abcd)
- [ ] is_alive status shows correct emoji (❤️/💀)
- [ ] Current user's beasts are highlighted
- [ ] Loading and error states work
- [ ] Refetch functionality works
- [ ] Responsive design matches game leaderboard

## Important Notes

1. **GraphQL Limitations**: Cannot use array parameters, must fetch names individually
2. **GraphQL Operators**: Torii uses camelCase for comparison operators (e.g., `scoreGT`, `ageGT`, not `score_gt`, `age_gt`)
3. **Address Comparison**: Always compare both normalized and padded addresses
4. **Name Decoding**: Use `shortString.decodeShortString()` for felt252 conversion
5. **Error Handling**: Handle cases where queries fail gracefully
6. **Performance**: Use Promise.all for concurrent individual queries
7. **User Ranking**: If user's beast is not in top 10, show as 11th row with real rank (e.g., #35)

## Reference Files

Study these files for patterns and implementation details:
- `client/src/dojo/hooks/useGameLeaderboard.tsx` - Hook pattern and GraphQL queries
- `client/src/components/screens/GameRanking/GameRankingScreen.tsx` - Screen structure
- `client/src/components/screens/GameRanking/GameRankingTable.tsx` - Table implementation
- `client/src/components/screens/GameRanking/GameRankingRow.tsx` - Row component
- `client/src/dojo/hooks/usePlayer.tsx` - Player name fetching pattern
- `client/src/components/types/game.types.ts` - Type definitions pattern