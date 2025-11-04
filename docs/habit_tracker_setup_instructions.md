# Habit Tracker - Setup Instructions

## ✅ Files Created

### **Types**
- `client/src/types/habit.types.ts` - TypeScript type definitions

### **Constants**
- `client/src/constants/habitTemplates.ts` - Pre-configured habit templates and reward calculations

### **Services**
- `client/src/lib/supabaseClient.ts` - Supabase client configuration
- `client/src/services/habitService.ts` - CRUD operations for habits

### **Hooks**
- `client/src/dojo/hooks/useHabitCompletion.ts` - Hook for completing habits with rewards
- `client/src/dojo/hooks/useHabits.ts` - Hook for fetching and managing habits data

### **Database**
- `docs/supabase_habits_schema.sql` - Database schema (already executed in Supabase)

---

## 📦 Installation Steps

### 1. Install Supabase Client

```bash
cd client
pnpm add @supabase/supabase-js
```

### 2. Add Environment Variables

Add these to your `.env` file (or create `.env.local`):

```bash
# Supabase Config
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Where to find these values:**
1. Go to your Supabase Dashboard
2. Click on your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 🧪 Testing the Setup

### Test 1: Create a habit

```typescript
import { habitService } from './services/habitService';

const habit = await habitService.createHabit({
  player_id: '0x123...', // Your wallet address
  name: 'Drink 8 glasses of water',
  category: 'health',
  difficulty: 1
});

console.log('Created habit:', habit);
```

### Test 2: Fetch habits

```typescript
const habits = await habitService.getPlayerHabits('0x123...');
console.log('My habits:', habits);
```

### Test 3: Complete a habit (using hook)

```tsx
import { useHabitCompletion } from './dojo/hooks/useHabitCompletion';

function MyComponent() {
  const { completeHabit, isCompleting } = useHabitCompletion();

  const handleComplete = async (habitId: string) => {
    const result = await completeHabit(habitId, 1); // difficulty: 1=Easy
    if (result.success) {
      console.log('Earned:', result.rewards);
      console.log('Streak:', result.streak);
    }
  };

  return (
    <button onClick={() => handleComplete('habit-id')} disabled={isCompleting}>
      Complete Habit
    </button>
  );
}
```

---

## 🎨 Next Steps: UI Components

The core backend logic is ready. Next you'll need to create:

1. **HabitTrackerScreen.tsx** - Main screen showing daily habits
2. **HabitCard.tsx** - Individual habit card with checkbox
3. **HabitCreationModal.tsx** - Modal to create new habits
4. **HabitCompletionAnimation.tsx** - Celebration animation on completion

These will be in:
```
client/src/components/screens/HabitTracker/
├── HabitTrackerScreen.tsx
└── components/
    ├── HabitCard.tsx
    ├── HabitCreationModal.tsx
    └── HabitCompletionAnimation.tsx
```

---

## 📝 How It Works

### Data Flow:

```
1. User clicks "Complete Habit"
   ↓
2. useHabitCompletion hook triggers
   ↓
3. Calculate current streak (habitService.calculateStreak)
   ↓
4. Calculate rewards based on difficulty + streak bonuses
   ↓
5. Save completion to Supabase (habitService.completeHabit)
   ↓
6. Update player balance optimistically (Zustand store)
   ↓
7. TODO: Sync to blockchain (future step)
   ↓
8. Show success toast with rewards
```

### Reward System:

| Difficulty | Coins | Gem Chance |
|------------|-------|------------|
| Easy (1⭐)  | 10    | 1%         |
| Medium (2⭐)| 25    | 5%         |
| Hard (3⭐)  | 50    | 10%        |

### Streak Bonuses:

| Streak | Bonus |
|--------|-------|
| 7 days | 2x coins for 24h |
| 14 days | +1 gem |
| 30 days | +5 gems |
| 100 days | +20 gems |

---

## 🔧 Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart Vite dev server after adding env vars

### Error: "Failed to fetch habits"
- Check that RLS policies are enabled in Supabase
- Verify the tables were created successfully
- Check browser console for detailed error

### Error: "Habit already completed today"
- This is expected! Users can only complete a habit once per day
- Check `habit_completions` table for today's date

---

## 🚀 Ready to Build UI

All backend logic is ready. You can now start building the UI components!

The hooks provide everything you need:
- `useHabits()` - Get all habits with completion status
- `useHabitCompletion()` - Complete habits and get rewards

Check `habitTemplates.ts` for pre-configured habits you can use in the UI.
