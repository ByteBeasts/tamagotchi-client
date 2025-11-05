# ByteBeasts Goal Tracker - Product Specification

## 📋 Executive Summary

ByteBeasts evoluciona de un Tamagotchi blockchain a una **productivity companion app** que gamifica el desarrollo de hábitos saludables. Los usuarios cuidan su bestia virtual **cuidándose a sí mismos** mediante el tracking y completion de objetivos diarios.

---

## 💭 Product Vision

### Core Concept
**"Cuida tu bestia cuidándote a ti mismo"**

Los usuarios registran hábitos y objetivos diarios. Por completarlos, reciben rewards (coins, gems, alimentos, magic items) para su Tamagotchi. La bestia reacciona a tu productividad, creando un loop emocional poderoso.

### Strategic Value

**✅ Solves the "Why Return?" Problem**
- El Tamagotchi actual tiene buen engagement corto plazo
- Necesita un **propósito externo** más allá del cuidado básico
- Goal tracking da **motivación real diaria**

**✅ Proven Gamification Model**
- Apps como Habitica, Duolingo, Streaks han validado este approach
- Diferencial: **blockchain incentives reales** (NFT beasts, tradeable rewards)

**✅ Natural Retention Booster**
- Hábitos diarios crean **rutinas**
- Dual loop: Habit completion + Beast care = **doble engagement**

**✅ Expanded Monetization**
- Free: tracking básico + standard rewards
- Premium: AI insights, custom habits, bonus multipliers
- Whales: Exclusive magic items, beast skins por achievements

**✅ Powerful Narrative**
- No es solo un juego, es un **productivity companion**
- Emotional connection: tu bestia refleja tu progreso personal

---

## ⚠️ Key Risks & Mitigations

### Risk 1: Product Complexity
**Issue:** Mezcla 3 verticales (Tamagotchi + Habit Tracker + Blockchain)

**Mitigation:**
- Onboarding progresivo
- Primera semana: solo Tamagotchi
- Segunda semana: introduce 1-2 habits simples
- Tercera semana: unlock advanced features

### Risk 2: Habit Validation
**Issue:** ¿Cómo evitar fake completions?

**Mitigation Fase 1:**
- Honor system + social proof (friends see your streak)

**Mitigation Fase 2:**
- AI agent detecta patrones sospechosos
- Integrations con third-party apps (Strava, RescueTime, etc)

### Risk 3: Economic Balance
**Issue:** Rewards demasiado generosas → devaluación de economía. Muy pocas → no hay incentivo.

**Mitigation:**
```
Easy habits (1⭐) = coins moderados
Medium habits (2⭐) = más coins + chance de gems
Hard habits (3⭐) = coins + gems + magic items
```

### Risk 4: Competition
**Issue:** Habitica, Todoist, Notion tienen años de ventaja en UX

**Our Competitive Edge:**
- ✅ True ownership (NFT beast)
- ✅ Blockchain rewards
- ✅ Web3 community
- ✅ Emotional companion (bestia reacciona a ti)

---

## 🌟 Phase 1: Goal Tracker MVP

### 1. HABIT/GOAL MANAGEMENT

#### 1.1 Habit Creation
**Features:**
- Quick Add: Input simple con nombre del hábito
- Pre-defined Categories:
  - 💪 Health & Fitness (ejercicio, agua, sueño)
  - 🧠 Learning (lectura, cursos, idiomas)
  - 💼 Work & Productivity (deep work, emails, meetings)
  - 🎨 Creativity (escribir, dibujar, música)
  - 🧘 Mindfulness (meditación, journaling, gratitud)
  - 🏠 Life Admin (limpieza, finanzas, llamadas)
- Frequency Options: Daily, Weekly, Custom (X veces por semana)
- Difficulty Levels: Easy (1⭐), Medium (2⭐), Hard (3⭐) → affects rewards
- Icons/Emojis: Para personalización visual

#### 1.2 Habit Templates
Pre-configured examples para quick start:
```
"Drink 8 glasses of water" (Easy, Daily) → 10 coins
"30 min exercise" (Medium, Daily) → 20 coins + 5% chance 1 gem
"Read 1 hour" (Medium, Daily) → 15 coins
"Deep work 2 hours" (Hard, Daily) → 30 coins + 10% chance magic item
"Meditate 10 min" (Easy, Daily) → 10 coins + happiness boost
"Learn new language 30min" (Medium, Daily) → 25 coins
"Journal before bed" (Easy, Daily) → 10 coins + energy boost
```

#### 1.3 Habit Tracking UI
**Daily View:**
- Lista de hábitos del día con checkboxes
- Completion Animation: Burst de confetti + sound effect + reward popup
- Progress Bar: % de hábitos completados hoy
- Streak Counter: Días consecutivos completando X hábito
- Calendar View: Visualización mensual con días completados (GitHub-style heatmap)

**Files to Create:**
- `client/src/components/screens/HabitTracker/HabitTrackerScreen.tsx`
- `client/src/components/screens/HabitTracker/components/HabitCreationModal.tsx`
- `client/src/components/screens/HabitTracker/components/HabitCard.tsx`
- `client/src/components/screens/HabitTracker/components/HabitCompletionAnimation.tsx`
- `client/src/components/screens/HabitTracker/components/HabitTemplateSelector.tsx`

---

### 2. REWARD SYSTEM INTEGRATION

#### 2.1 Reward Tiers by Difficulty
```typescript
Easy Habits (1⭐):
- 50 coins guaranteed
- 0.1% chance of 1 gem
- 5% chance of food

Medium Habits (2⭐):
- 100 coins guaranteed
- 5% chance of 5 gems
- 10% chance of food
- Beast happiness +2

Hard Habits (3⭐):
- 150 coins guaranteed
- 10% chance of 10 gems
- 15% chance of food
- 5% chance of magic food
```

#### 2.2 Streak Bonuses
```
7-day streak:  2x coin multiplier for 24h
14-day streak: 1 guaranteed gem + special food
30-day streak: 5 gems + rare magic item + "Streak Master" badge
60-day streak: 10 gems + exclusive beast skin
100-day streak: 25 gems + legendary magic item + "Century Club" badge
365-day streak: 100 gems + NFT achievement badge + exclusive beast evolution
```

#### 2.3 Daily Quest System
Each day generates 3 daily quests:
```
- Complete 3 habits today → 50 coins bonus
- Maintain 5-day streak → Feed your beast automatically
- Complete all habits → Mystery reward box (gacha mechanics)
- Complete 1 hard habit → Guaranteed gem
- Complete habits before 12pm → Early bird bonus (1.5x coins)
```

**Files to Create:**
- `client/src/utils/rewardCalculator.ts`
- `client/src/components/screens/HabitTracker/components/RewardPopup.tsx`
- `client/src/components/screens/HabitTracker/components/StreakBadge.tsx`
- `client/src/components/screens/HabitTracker/components/DailyQuestsPanel.tsx`
- `client/src/components/screens/HabitTracker/components/MysteryRewardBox.tsx`

---

### 3. TAMAGOTCHI-HABIT INTEGRATION

#### 3.1 Beast Reaction System
**On Habit Completion:**
- Beast hace animación de celebración
- Sound effects positivos
- Visual sparkles alrededor de la bestia

**On Streak Milestone:**
- Beast evoluciona expresión (más feliz, brillos)
- Special animation para 7/14/30 day streaks
- Beast "levels up" visualmente

**On Missed Habits:**
- Beast se pone triste (sad animation)
- Gentle reminder sin ser punitivo
- Encouragement message

**End of Day Summary:**
- Beast te "cuenta" cómo fue tu día
- Stats summary screen
- Tomorrow's preview

#### 3.2 Auto-Care Features
Habits específicos benefician a la bestia directamente:
```
"Drink water" habit → Beast hygiene +1
"Exercise" habit → Beast energy +2
"Healthy meal" habit → Beast hunger -3
"8h sleep" habit → Beast energy +5
"Meditation" habit → Beast happiness +3
"Reading" habit → Beast intelligence stat +1 (future)
```

#### 3.3 Habit-Unlocked Content
Milestones unlock exclusive content:
```
50 habits completed → Unlock new beast skin
100 habits completed → Unlock new mini-game
200 habits completed → Unlock rare food category
30-day streak → Unlock "Productivity Beast" exclusive species
100-day streak → Unlock custom beast color picker
365-day streak → Unlock legendary beast evolution
```

**Files to Create:**
- `client/src/components/screens/Home/components/BeastReactionController.tsx`
- `client/src/utils/habitBeastIntegration.ts`
- `client/src/components/screens/HabitTracker/components/MilestoneUnlockModal.tsx`
- `client/src/components/screens/HabitTracker/components/EndOfDaySummary.tsx`

---

### 4. ANALYTICS & PROGRESS TRACKING

#### 4.1 Personal Dashboard
Stats displayed:
```
- Total habits completed (all-time)
- Current active streaks
- Longest streak ever
- Completion rate this week/month
- Most completed habit category
- Total rewards earned
- Best day of the week
- Most productive time of day
```

#### 4.2 Progress Visualization
**Heatmap Calendar:**
- GitHub-style contribution graph
- Color intensity = completion rate
- Click on day → see completed habits

**Category Breakdown:**
- Pie chart de hábitos por categoría
- Bar chart de completion rate por categoría

**Streak Timeline:**
- Gráfico de streaks a lo largo del tiempo
- Highlight longest streaks

**Rewards History:**
- Log de todas las rewards recibidas
- Filterable por tipo (coins, gems, items)

#### 4.3 Achievements System
Badges desbloqueables:
```
🔥 "Week Warrior" - 7-day streak
💪 "Iron Will" - Complete 100 hard habits
🌟 "Early Bird" - Complete habits before 9am for 7 days
🎯 "Perfectionist" - 100% completion rate for 1 month
🏆 "Legend" - 365-day streak
🌈 "Well-Rounded" - Complete habits in all 6 categories in 1 week
⚡ "Speed Demon" - Complete 10 habits in 1 day
🧘 "Zen Master" - 30-day streak in Mindfulness category
📚 "Bookworm" - 30-day streak in Learning category
💼 "Hustler" - 30-day streak in Work category
```

**Files to Create:**
- `client/src/components/screens/HabitTracker/ProgressDashboard.tsx`
- `client/src/components/screens/HabitTracker/components/HeatmapCalendar.tsx`
- `client/src/components/screens/HabitTracker/components/AchievementBadge.tsx`
- `client/src/components/screens/HabitTracker/components/StatsCard.tsx`
- `client/src/components/screens/HabitTracker/components/CategoryBreakdown.tsx`

---

### 5. SOCIAL & COMPETITIVE FEATURES

#### 5.1 Leaderboards
**Daily Completions:**
- Top players who completed most habits today
- Resets daily at midnight

**Longest Streaks:**
- Hall of fame de streaks activos
- All-time longest streaks

**Category Masters:**
- Top players por categoría (fitness, learning, etc)
- Monthly rotation

**Total Habits Completed:**
- All-time leaderboard
- Filters: weekly, monthly, all-time

#### 5.2 Accountability Features
**Habit Sharing:**
- Share tu streak en Twitter/Discord
- Auto-generated image with beast + stats
- Deep link para que amigos se unan

**Accountability Partners:**
- Conecta con un amigo
- Se notifican mutuamente de completions
- Shared streak counter
- Can see each other's daily progress

**Public Commitments:**
- Declara tu meta públicamente (social pressure)
- Example: "I commit to 30-day meditation streak"
- Community can react/support

#### 5.3 Guilds/Teams (Phase 1.5)
**Future feature:**
- Form teams of 5-10 people
- Group goals: "Complete 500 habits as a team this week"
- Shared rewards if team hits goal
- Guild chat for support

**Files to Create:**
- `client/src/components/screens/HabitTracker/HabitLeaderboard.tsx`
- `client/src/components/screens/HabitTracker/components/ShareHabitModal.tsx`
- `client/src/components/screens/HabitTracker/components/AccountabilityPartner.tsx`
- `client/src/components/screens/HabitTracker/components/PublicCommitmentCard.tsx`

---

### 6. SMART FEATURES (Pre-AI Phase)

#### 6.1 Habit Recommendations
Based on existing habits, suggest:
```
"Users like you also complete: Meditation 10min"
"Complete your Health category: Add 'Stretch routine'"
"You complete morning habits well. Try adding: 'Morning journaling'"
```

#### 6.2 Time Intelligence
```
- Detect best time of day for each habit
  (analyze AM vs PM completion rates)
- Suggest rescheduling habits consistently failed at certain times
- "You complete 'Exercise' 80% of the time at 7am. Set a reminder?"
```

#### 6.3 Difficulty Auto-Adjustment
```
- Si completas un hábito 30 días seguidos → suggest increasing difficulty
  "30-day streak! Ready to level up? '30min exercise' → '45min exercise'"

- Si fallas un hábito 7 días seguidos → suggest easier version
  "Struggling with '2h deep work'? Try starting with '1h deep work'"
```

#### 6.4 Pattern Recognition
```
- "You complete 90% of habits on weekdays but only 40% on weekends"
- "Your productivity drops every Thursday. Need a motivation boost?"
- "You're 3x more likely to complete habits when you start before 9am"
```

**Files to Create:**
- `client/src/utils/habitRecommendationEngine.ts`
- `client/src/components/screens/HabitTracker/components/SmartSuggestionsPanel.tsx`
- `client/src/utils/timeIntelligence.ts`
- `client/src/utils/patternRecognition.ts`

---

### 7. UX/UI ESSENTIALS

#### 7.1 Onboarding Flow
```
Step 1: "Welcome! Let's set up your first habits"
  - Show value prop: "Complete habits → Earn rewards → Care for beast"

Step 2: Choose 3 starter habits from templates
  - Categorized templates
  - One-tap add
  - Visual preview of rewards

Step 3: "Complete 1 habit to feed your beast!" (interactive tutorial)
  - Guided first completion
  - Celebrate with animation
  - Show reward popup

Step 4: First reward celebration animation
  - Confetti + sound
  - Beast reaction
  - "You earned 10 coins!"

Step 5: "Check back tomorrow for daily quests!"
  - Set reminder notification
  - Preview tomorrow's quests
  - Show streak potential
```

#### 7.2 Notifications
**Morning:**
```
"Good morning! You have 5 habits to complete today 🌅"
"Your beast is waiting for you! Complete habits to earn rewards 🐉"
```

**Afternoon:**
```
"Don't forget: 2 habits remaining ⏰"
"You're 2 habits away from today's bonus! Keep going 💪"
```

**Evening:**
```
"Last chance to complete today's habits! 🌙"
"Save your streak! 1 habit to maintain 7-day streak 🔥"
```

**Streak at Risk:**
```
"⚠️ Your 14-day streak is at risk! Complete 1 habit to save it."
"🔥 Don't break the chain! Your beast believes in you."
```

**Milestones:**
```
"🎉 7-day streak! You earned 2x coins for 24h!"
"🏆 30-day streak! You unlocked a legendary badge!"
```

#### 7.3 Empty States
**No habits yet:**
- Illustrated prompt to create first habit
- "Start your journey" CTA
- Show example habits

**All habits done:**
- Celebration screen: "You crushed it today! 🎉"
- Show rewards earned
- Beast celebration animation
- Preview tomorrow

**Missed day:**
- Gentle encouragement: "Tomorrow is a fresh start 💪"
- Show current stats (not punitivo)
- "Your beast still believes in you"

**No streaks:**
- "Start building your first streak today!"
- Show benefits of streaks
- Motivational quote

**Files to Create:**
- `client/src/components/screens/HabitTracker/onboarding/HabitOnboarding.tsx`
- `client/src/utils/notificationScheduler.ts`
- `client/src/components/screens/HabitTracker/components/EmptyStateIllustrations.tsx`
- `client/src/components/screens/HabitTracker/components/CelebrationScreen.tsx`

---

## 🗂️ Data Architecture

### Database Schema (Supabase)

#### Habit Table
```typescript
interface Habit {
  id: string;                    // UUID
  player_id: string;             // FK to players
  name: string;                  // "Exercise 30min"
  description?: string;          // Optional details
  category: HabitCategory;       // enum: health, learning, work, creativity, mindfulness, life
  difficulty: 1 | 2 | 3;        // Easy, Medium, Hard
  frequency: 'daily' | 'weekly' | 'custom';
  frequency_count?: number;      // For custom (e.g., 3x per week)
  icon: string;                  // Emoji or icon identifier
  color: string;                 // Hex color for UI
  created_at: timestamp;
  is_active: boolean;            // Soft delete
  is_template: boolean;          // True for system templates
}
```

#### HabitCompletion Table
```typescript
interface HabitCompletion {
  id: string;                    // UUID
  habit_id: string;              // FK to habits
  player_id: string;             // FK to players
  completed_at: timestamp;
  reward_coins: number;          // Coins earned
  reward_gems: number;           // Gems earned
  reward_items?: string[];       // Array of item IDs received
  streak_count: number;          // Streak at moment of completion
  was_on_time: boolean;          // Completed before deadline
  notes?: string;                // Optional user notes
}
```

#### PlayerHabitStats Table
```typescript
interface PlayerHabitStats {
  player_id: string;             // PK
  total_completions: number;
  total_coins_earned: number;
  total_gems_earned: number;
  current_streaks: {             // JSON object
    habit_id: string;
    count: number;
    last_completed: timestamp;
  }[];
  longest_streak_ever: number;
  longest_streak_habit_id: string;
  achievements_unlocked: string[]; // Array of achievement IDs
  last_completion_date: timestamp;
  completion_rate_7d: number;    // % last 7 days
  completion_rate_30d: number;   // % last 30 days
  favorite_category: HabitCategory;
  updated_at: timestamp;
}
```

#### DailyQuest Table
```typescript
interface DailyQuest {
  id: string;
  player_id: string;
  quest_type: string;            // "complete_3_habits", "maintain_streak", etc
  quest_description: string;
  target_count: number;
  current_count: number;
  reward_coins: number;
  reward_gems?: number;
  reward_items?: string[];
  expires_at: timestamp;         // End of day
  completed: boolean;
  completed_at?: timestamp;
}
```

#### Achievement Table
```typescript
interface Achievement {
  id: string;
  player_id: string;
  achievement_type: string;      // "week_warrior", "iron_will", etc
  name: string;
  description: string;
  icon: string;
  unlocked_at: timestamp;
  progress_current?: number;     // For progressive achievements
  progress_target?: number;
}
```

### Blockchain Integration (Starknet)

**On-chain data:**
- Player total coins/gems (sync with Supabase)

**Off-chain data (Supabase):**
- Habit definitions
- Completion history
- Daily quests
- Analytics data
- Notifications

**Sync Strategy:**
- Habits completions → coins/gems update → Optimistic UI → Blockchain tx → Supabase sync
- Daily summary batch update to blockchain (reduce gas)

---

## 🚀 Implementation Phases

### MUST HAVE - Week 1-2 (Core MVP)
```
Priority 1 - Critical Path:
✅ Create custom habits (name, category, frequency)
✅ Daily view with checkboxes to mark completed
✅ Basic reward system (coins only)
✅ Streak counter per habit
✅ Integration: coins go to player balance
✅ Simple navigation from Home to Habit Tracker
✅ Persistence in Supabase
```

**Deliverables:**
- User can create a habit
- User can mark habit as complete
- User sees coins added to balance
- User sees streak count increment

**Files:**
- `HabitTrackerScreen.tsx` - main screen
- `HabitCreationModal.tsx` - create/edit habits
- `HabitCard.tsx` - individual habit display
- `useHabitCompletion.tsx` - hook for marking complete
- `habitService.ts` - Supabase CRUD operations

---

### SHOULD HAVE - Week 3-4 (Enhanced Experience)
```
Priority 2 - Core Features:
✅ Habit templates (pre-configured options)
✅ Difficulty system → tiered rewards
✅ Completion animation with confetti
✅ Calendar heatmap view
✅ Daily quests (3 quests per day)
✅ Gems and items as rewards (not just coins)
✅ Beast reactions to habit completions
```

**Deliverables:**
- User can quick-add from templates
- User sees celebration animation on completion
- User earns gems/items based on difficulty
- User sees visual calendar of completions
- Beast reacts when habits are completed

**Files:**
- `HabitTemplateSelector.tsx`
- `HabitCompletionAnimation.tsx`
- `HeatmapCalendar.tsx`
- `DailyQuestsPanel.tsx`
- `BeastReactionController.tsx`
- `rewardCalculator.ts`

---

### NICE TO HAVE - Week 5-6 (Engagement Boosters)
```
Priority 3 - Retention Features:
✅ Achievements/badges system
✅ Habit leaderboard (simple)
✅ Push notifications (morning/evening reminders)
✅ Progress dashboard with stats
✅ Streak bonuses (7/14/30 day rewards)
✅ Auto-care features (habits → beast stats)
```

**Deliverables:**
- User earns badges for milestones
- User sees their rank vs others
- User receives timely reminders
- User can view detailed analytics
- Beast auto-benefits from certain habits

**Files:**
- `AchievementBadge.tsx`
- `HabitLeaderboard.tsx`
- `ProgressDashboard.tsx`
- `notificationScheduler.ts`
- `StatsCard.tsx`
- `habitBeastIntegration.ts`

---

### FUTURE - Post-MVP (Phase 1.5+)
```
Priority 4 - Advanced Features:
○ Accountability partners
○ Guilds/Teams
○ Social sharing (Twitter, Discord)
○ Smart recommendations (pre-AI)
○ Time intelligence
○ Habit fusion (combine 2 habits)
○ Challenge mode (weekly events)
○ Habit NFTs (365-day streak badge)
○ Third-party integrations (Strava, RescueTime)
```

---

## 💡 Unique Differentiators

### 1. Beast Mood Board
**Concept:** La expresión de tu bestia cambia según tus hábitos del día
```
0-25% completion: Beast is sad/sleepy
26-50% completion: Beast is neutral
51-75% completion: Beast is happy
76-100% completion: Beast is ecstatic/glowing
```

### 2. Productivity Potions
**Concept:** Magic items que dan boosts temporales
```
"Focus Elixir" → 2x coins for next 24h
"Time Warp" → Auto-complete 1 easy habit
"Streak Shield" → Protect 1 missed day from breaking streak
"Gem Multiplier" → 3x gem chance for next 10 completions
```

### 3. Habit Fusion
**Concept:** Combine 2 related habits → create super habit with mega rewards
```
"Exercise 30min" + "Healthy meal" = "Fitness Lifestyle" (3⭐ difficulty)
→ Rewards: 80 coins + 2 gems guaranteed + magic item

"Reading 1h" + "Journaling 15min" = "Mindful Learning" (3⭐)
→ Rewards: 70 coins + beast intelligence +3
```

### 4. Challenge Mode
**Concept:** Weekly events with exclusive rewards
```
Week 1: "Fitness Week" - Complete 50 health habits → exclusive Dragon skin
Week 2: "Learning Sprint" - Read 10h total → legendary book item
Week 3: "Zen Master" - 21-day meditation streak → enlightenment badge
```

### 5. Habit NFTs
**Concept:** Mint major achievements as NFT badges
```
365-day streak → Mintable "Year of Discipline" NFT badge
1000 habits completed → "Habit Master" NFT
All 6 categories 30-day streak → "Renaissance Person" NFT
```

### 6. Beast Training Stats
**Concept:** Habits train specific beast attributes
```
Exercise habits → Strength stat
Reading habits → Intelligence stat
Meditation habits → Wisdom stat
Creative habits → Creativity stat
Social habits → Charisma stat

→ Stats affect mini-game performance
→ Stats visible on beast profile
→ Unlocks special beast evolutions at milestones
```

---

## ⚡ Success Metrics (KPIs)

### Engagement Metrics
```
- Habit creation rate (habits created per user)
- Daily active users (DAU)
- Habit completion rate overall
- Completion rate by difficulty (easy vs hard)
- Average habits per user
- Time spent in habit tracker screen
```

### Retention Metrics
```
- Day 1 retention (% who return next day)
- Day 7 retention
- Day 30 retention
- Streak maintenance (% users with 7+ day streak)
- Churn rate after missed day
- Average streak length
```

### Monetization Metrics
```
- Conversion rate (free → paying)
- Average revenue per user (ARPU)
- Gem purchase frequency
- Magic item sales
- Premium feature adoption
```

### Social Metrics
```
- Habit shares (social media)
- Accountability partner adoption
- Leaderboard participation rate
- Guild/team formation rate (Phase 1.5)
```

### Technical Metrics
```
- API response time (Supabase)
- Blockchain transaction success rate
- Notification delivery rate
- App crash rate
- Load time (habit tracker screen)
```

---

## 🎯 Next Steps / Action Items

### 1. User Validation (Week 0)
**10 User Interviews:**
```
Questions to ask:
- Do you use habit trackers currently? Which ones?
- What frustrates you about existing trackers?
- Would virtual rewards motivate you?
- How do you feel about blockchain/NFT incentives?
- What features would make you switch from current app?
```

### 2. Competitive Analysis Deep Dive
**Apps to analyze:**
```
- Habitica: RPG gamification, what works/doesn't?
- Streaks: Minimalist iOS, UX patterns
- Notion: Flexibility, database approach
- Todoist: Power user features
- Duolingo: Retention tactics, notifications

→ Identify gaps in market
→ Find opportunities for differentiation
```

### 3. UI/UX Prototyping
**Figma/Design screens:**
```
- Habit creation flow (3-step wizard)
- Daily checklist view (card-based)
- Completion animation (confetti + rewards)
- Dashboard stats (graphs, heatmap)
- Beast reaction integration
```

### 4. Economic Balancing
**Design reward economy:**
```
- Calculate coin earn rate vs spend rate
- Balance free vs premium value prop
- Ensure hard habits feel rewarding
- Prevent gem farming exploits
- Model long-term inflation
```

### 5. Analytics Setup
**Implement tracking from Day 1:**
```
Events to track:
- habit_created
- habit_completed
- streak_milestone_reached
- reward_earned
- achievement_unlocked
- daily_quest_completed
- leaderboard_viewed
- notification_clicked

Tools: Mixpanel + PostHog
```

---

## 📝 Technical Implementation Notes

### API Endpoints Needed
```typescript
// Habits
POST   /api/habits/create
GET    /api/habits/list/:player_id
PUT    /api/habits/update/:habit_id
DELETE /api/habits/delete/:habit_id

// Completions
POST   /api/habits/complete
GET    /api/habits/completions/:player_id
GET    /api/habits/completions/:player_id/:date

// Stats
GET    /api/habits/stats/:player_id
GET    /api/habits/streaks/:player_id
GET    /api/habits/leaderboard/:type

// Quests
GET    /api/quests/daily/:player_id
POST   /api/quests/complete/:quest_id

// Achievements
GET    /api/achievements/:player_id
POST   /api/achievements/unlock
```

### State Management (Zustand)
```typescript
interface HabitStore {
  habits: Habit[];
  completions: HabitCompletion[];
  stats: PlayerHabitStats;
  dailyQuests: DailyQuest[];
  achievements: Achievement[];

  // Actions
  addHabit: (habit: Habit) => void;
  completeHabit: (habitId: string) => void;
  fetchHabits: () => Promise<void>;
  fetchStats: () => Promise<void>;
  updateStreak: (habitId: string) => void;
}
```

### Notification System
```typescript
// Notification types
- Morning reminder (8am)
- Afternoon reminder (2pm)
- Evening reminder (8pm)
- Streak at risk (11pm if incomplete)
- Milestone reached (immediate)
- Daily quest available (midnight)

// World App integration
- Use MiniKit notification API
- Request permission on first habit creation
- Schedule recurring notifications
```

---

## 🌈 Phase 2: AI Agent (Future Vision)

### AI Agent Features (Post-MVP)
```
- Analyze habit patterns and productivity trends
- Provide personalized insights:
  "You're 40% more productive on Tuesdays"
  "You tend to skip habits after social events"

- Smart scheduling:
  "Based on your energy patterns, schedule deep work at 10am"

- Habit optimization:
  "Your 'Exercise' habit has 90% completion. Ready to level up?"

- Anomaly detection:
  "Your productivity dropped 30% this week. Need support?"

- Goal forecasting:
  "At this rate, you'll hit 1000 habits in 6 months"

- Personalized recommendations:
  "Users with similar profiles benefit from: Morning meditation"
```

### AI Integration Points
```
- GPT-4 API for natural language insights
- ML model for pattern recognition (train on user data)
- Predictive analytics for streak maintenance
- Sentiment analysis on habit notes
- Image recognition for proof uploads (future)
```

---

## 📚 References & Inspiration

### Apps to Study
- **Habitica:** RPG mechanics, social guilds
- **Streaks:** Minimalist design, iOS-native feel
- **Duolingo:** Retention tactics, notification copy
- **Notion:** Flexible databases, customization
- **Strava:** Social competition, segments

### Design Resources
- **Confetti animations:** react-confetti, canvas-confetti
- **Heatmap calendar:** react-calendar-heatmap
- **Charts:** recharts, victory-native
- **Animations:** framer-motion (already in stack)

### Blockchain Considerations
- **Gas optimization:** Batch daily completions
- **Off-chain storage:** Supabase for habits, blockchain for value
- **NFT standards:** ERC-721 for achievement badges
- **Starknet limitations:** Transaction speed, cost

---

## ✅ Definition of Done (MVP)

**A user can:**
1. ✅ Create a custom habit with name, category, frequency
2. ✅ See daily list of habits to complete
3. ✅ Mark a habit as complete → earn coins
4. ✅ See streak counter increment
5. ✅ View completion calendar (heatmap)
6. ✅ Complete daily quests for bonus rewards
7. ✅ See their beast react to habit completions
8. ✅ View basic stats dashboard
9. ✅ Receive morning/evening reminder notifications
10. ✅ See their rank on simple leaderboard

**Technical requirements:**
- ✅ Data persists in Supabase
- ✅ Coins sync with blockchain
- ✅ Works on mobile (responsive)
- ✅ <2s load time for habit screen
- ✅ No critical bugs
- ✅ Analytics tracking implemented

---

**Document Version:** 1.0
**Last Updated:** 2025-01-30
**Author:** Product Team
**Status:** Planning Phase
**Next Review:** After user interviews
