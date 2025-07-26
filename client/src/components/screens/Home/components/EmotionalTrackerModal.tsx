import { motion } from 'framer-motion';
import { useState, useCallback, useEffect } from 'react';

// Assets
import heartIcon from "../../../../assets/icons/heart/hearth.png";

interface EmotionalTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: number; // timestamp when completed
}

interface EmotionalEntry {
  date: string;
  emotion: string;
  note: string;
}

const emotions = [
  { emoji: '😄', name: 'Happy', value: 'happy' },
  { emoji: '😐', name: 'Neutral', value: 'neutral' },
  { emoji: '😞', name: 'Sad', value: 'sad' },
  { emoji: '😡', name: 'Angry', value: 'angry' },
  { emoji: '😰', name: 'Anxious', value: 'anxious' },
];

const motivationalPhrases = [
  "Every day you're getting stronger! 💪",
  "Your progress is inspiring ✨",
  "Small steps, big changes 🌱",
  "Keep shining bright! ⭐",
  "You're building amazing habits 🏆"
];

export const EmotionalTrackerModal = ({ isOpen, onClose }: EmotionalTrackerModalProps) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', text: 'Meditate for 10 minutes', completed: false },
    { id: '2', text: 'Exercise for 30 minutes', completed: false },
    { id: '3', text: 'Drink 8 glasses of water', completed: false },
  ]);
  const [newGoal, setNewGoal] = useState<string>('');
  const [tamagotchiReaction, setTamagotchiReaction] = useState<string>('😊');
  
  // Track completed goals this week (will be populated from completed daily goals)
  const [weeklyAchievements, setWeeklyAchievements] = useState([
    { goal: 'Morning meditation', completedOn: 'Monday', emoji: '🧘‍♀️', id: 'prev1' },
    { goal: 'Read 20 pages', completedOn: 'Tuesday', emoji: '📚', id: 'prev2' },
  ]);

  // Get current day name
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Auto-remove completed goals after 3 seconds and move to achievements
  useEffect(() => {
    const completedGoals = goals.filter(goal => goal.completed && goal.completedAt);
    
    completedGoals.forEach(goal => {
      if (goal.completedAt) {
        const timeElapsed = Date.now() - goal.completedAt;
        const remainingTime = 3000 - timeElapsed; // 3 seconds total
        
        if (remainingTime > 0) {
          setTimeout(() => {
            // Move goal to achievements before removing
            const goalEmoji = getGoalEmoji(goal.text);
            const newAchievement = {
              goal: goal.text,
              completedOn: getCurrentDay(),
              emoji: goalEmoji,
              id: goal.id + '_achievement'
            };
            
            setWeeklyAchievements(prev => [newAchievement, ...prev]);
            setGoals(prev => prev.filter(g => g.id !== goal.id));
          }, remainingTime);
        } else {
          // Move immediately if already past 3 seconds
          const goalEmoji = getGoalEmoji(goal.text);
          const newAchievement = {
            goal: goal.text,
            completedOn: getCurrentDay(),
            emoji: goalEmoji,
            id: goal.id + '_achievement'
          };
          
          setWeeklyAchievements(prev => [newAchievement, ...prev]);
          setGoals(prev => prev.filter(g => g.id !== goal.id));
        }
      }
    });
  }, [goals]);

  // Function to get emoji based on goal text
  const getGoalEmoji = (goalText: string) => {
    const text = goalText.toLowerCase();
    if (text.includes('meditat')) return '🧘‍♀️';
    if (text.includes('exercise') || text.includes('workout')) return '💪';
    if (text.includes('water') || text.includes('drink')) return '💧';
    if (text.includes('read')) return '📚';
    if (text.includes('walk')) return '🚶‍♀️';
    if (text.includes('sleep')) return '😴';
    if (text.includes('gratitude')) return '🙏';
    if (text.includes('journal')) return '✍️';
    return '⭐'; // default emoji
  };

  // Calculate daily completion and weekly progress
  const completedGoalsToday = goals.filter(goal => goal.completed).length;
  const isDayComplete = completedGoalsToday === 3 && goals.length === 3;
  
  // Mock calculation for weekly progress (in real app, this would come from backend)
  // This represents days where all 3 goals were completed
  const baseCompleteDays = 2; // Previous completed days
  const completeDaysThisWeek = isDayComplete ? baseCompleteDays + 1 : baseCompleteDays;
  
  // Hardcoded wellness metrics for UI testing
  const wellnessMetrics = [
    { name: 'Happiness', value: 75, color: 'bg-yellow-400', emoji: '😊' },
    { name: 'Security', value: 60, color: 'bg-green-400', emoji: '🛡️' },
    { name: 'Confidence', value: 80, color: 'bg-blue-400', emoji: '💪' },
    { name: 'Wellbeing', value: 70, color: 'bg-purple-400', emoji: '✨' },
  ];

  // Mock data for progress chart
  const progressData = [
    { day: 'M', emotion: 'happy' },
    { day: 'T', emotion: 'neutral' },
    { day: 'W', emotion: 'happy' },
    { day: 'T', emotion: 'sad' },
    { day: 'F', emotion: 'happy' },
    { day: 'S', emotion: 'neutral' },
    { day: 'S', emotion: 'happy' },
  ];

  const handleEmotionSelect = useCallback((emotion: string) => {
    setSelectedEmotion(emotion);
    
    // Tamagotchi reactions
    switch (emotion) {
      case 'happy':
        setTamagotchiReaction('🎉');
        break;
      case 'sad':
        setTamagotchiReaction('🤗');
        break;
      case 'angry':
        setTamagotchiReaction('😌');
        break;
      case 'anxious':
        setTamagotchiReaction('🧘‍♂️');
        break;
      default:
        setTamagotchiReaction('😊');
    }
  }, []);

  const addGoal = useCallback(() => {
    if (newGoal.trim() && goals.length < 3) {
      const goal: Goal = {
        id: Date.now().toString(),
        text: newGoal.trim(),
        completed: false,
      };
      setGoals(prev => [...prev, goal]);
      setNewGoal('');
    }
  }, [newGoal, goals.length]);

  const toggleGoalCompletion = useCallback((goalId: string) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === goalId 
          ? { 
              ...goal, 
              completed: !goal.completed,
              completedAt: !goal.completed ? Date.now() : undefined
            } 
          : goal
      )
    );
  }, []);

  const suggestGoal = useCallback(() => {
    const suggestions = [
      'Drink 8 glasses of water',
      'Sleep 8 hours',
      'Read 20 pages',
      'Write in journal',
      'Walk for 30 minutes',
      'Practice gratitude',
      'Deep breathing exercises',
      'Meditate for 10 minutes',
      'Exercise for 30 minutes',
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setNewGoal(randomSuggestion);
  }, []);

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'happy': return 'bg-yellow-300';
      case 'neutral': return 'bg-gray-300';
      case 'sad': return 'bg-blue-300';
      case 'angry': return 'bg-red-300';
      case 'anxious': return 'bg-purple-300';
      default: return 'bg-gray-200';
    }
  };

  const completedGoalsCount = goals.filter(goal => goal.completed).length;
  const progressPercentage = goals.length > 0 ? (completedGoalsCount / goals.length) * 100 : 0;
  const currentPhrase = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-cream w-full max-w-md rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] border-4 border-gold/30 relative overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gold-gradient p-4 border-b-4 border-gold/40 flex justify-between items-center rounded-t-[12px]">
          <div className="flex items-center gap-3">
            <img src={heartIcon} alt="" className="w-8 h-8" />
            <h2 className="text-gray-800 font-luckiest text-xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
              Emotional Tracker
            </h2>
          </div>
          <motion.button
            onClick={onClose}
            className="text-gray-800 transition-colors font-luckiest text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ✕
          </motion.button>
        </div>

        {/* Body */}
        <div className="p-4 bg-gradient-to-b from-cream to-cream/80 space-y-6">
          
          {/* Section 1: Wellness Metrics Chart */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-800 font-luckiest text-lg">Your Wellness Overview</h3>
              <motion.div
                key={tamagotchiReaction}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                {tamagotchiReaction}
              </motion.div>
            </div>
            
            {/* Wellness Metrics Bars */}
            <div className="space-y-4 bg-white/80 p-4 rounded-xl border-2 border-stone-400/50">
              {wellnessMetrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{metric.emoji}</span>
                      <span className="font-luckiest text-sm text-gray-700">{metric.name}</span>
                    </div>
                    <span className="font-luckiest text-sm text-gray-600">{metric.value}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full ${metric.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${metric.value}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Section 2: Today's Goals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-800 font-luckiest text-lg">Today's Goals</h3>
              <div className="text-sm font-luckiest text-gray-600">
                {completedGoalsToday}/3 completed
              </div>
            </div>
            
            <div className="space-y-2">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border-2 border-stone-400/50"
                  whileHover={{ scale: 1.02 }}
                  animate={goal.completed ? { scale: [1, 1.05, 1] } : {}}
                  transition={goal.completed ? { duration: 0.3 } : {}}
                >
                  <button
                    onClick={() => toggleGoalCompletion(goal.id)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      goal.completed
                        ? 'bg-gold border-gold text-white'
                        : 'border-gray-400 bg-white'
                    }`}
                  >
                    {goal.completed && '✓'}
                  </button>
                  <span className={`font-rubik text-sm flex-1 ${
                    goal.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}>
                    {goal.text}
                  </span>
                  {goal.completed && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-green-500 text-lg"
                    >
                      🎉
                    </motion.span>
                  )}
                </motion.div>
              ))}
            </div>

            {goals.length < 3 && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="New goal..."
                  className="flex-1 p-2 border-2 border-stone-400/50 rounded-lg bg-white/80 font-rubik text-sm focus:border-gold focus:outline-none"
                  onKeyPress={(e) => e.key === 'Enter' && addGoal()}
                />
                <motion.button
                  onClick={addGoal}
                  disabled={!newGoal.trim() || goals.length >= 3}
                  className="px-4 py-2 bg-gold text-gray-800 rounded-lg font-luckiest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  +
                </motion.button>
                <motion.button
                  onClick={suggestGoal}
                  disabled={goals.length >= 3}
                  className="px-3 py-2 bg-magenta text-white rounded-lg font-luckiest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💡
                </motion.button>
              </div>
            )}

            {goals.length >= 3 && (
              <div className="text-center p-2 bg-gold/10 rounded-lg border-2 border-gold/30">
                <p className="text-gray-800 font-rubik text-xs">
                  You've reached the maximum of 3 goals. Complete one to add more!
                </p>
              </div>
            )}

            {/* Daily completion status */}
            {isDayComplete && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center p-3 bg-gold/20 rounded-lg border-2 border-gold/50"
              >
                <p className="text-gray-800 font-luckiest text-sm">
                  🎉 Perfect day! All goals completed! 🎉
                </p>
              </motion.div>
            )}
          </div>

          {/* Section 3: Weekly Achievements */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <span className="text-2xl">🏆</span>
              <h3 className="text-gray-800 font-luckiest text-lg">Your Weekly Achievements</h3>
              <span className="text-2xl">🏆</span>
            </div>
            
            {/* Achievement Stats */}
            <div className="bg-white/80 p-6 rounded-xl border-2 border-stone-400/50 space-y-6 min-h-[280px]">
              
              {/* Achievement List */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {weeklyAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-gold/10 rounded-lg border border-gold/20"
                  >
                    <div className="flex-1">
                      <p className="font-luckiest text-sm text-gray-800">{achievement.goal}</p>
                      <p className="font-rubik text-xs text-gray-600">{achievement.completedOn}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gold text-lg">✓</span>
                      <span className="text-xs">🏆</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Weekly Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-rubik text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-sm">🏆</span>
                    <span>Weekly Progress</span>
                  </div>
                  <span className="font-luckiest">{completeDaysThisWeek}/7 days</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
                  <motion.div
                    className="bg-gradient-to-r from-gold to-yellow-400 h-4 rounded-full shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completeDaysThisWeek / 7) * 100}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  />
                </div>
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500">🏆 Keep going to unlock more trophies! 🏆</span>
                </div>
              </div>

              {/* Achievement Badges */}
              <div className="flex justify-center gap-3 flex-wrap">
                {completeDaysThisWeek >= 3 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.8 }}
                    className="bg-gold px-3 py-2 rounded-full flex items-center gap-2 shadow-md"
                  >
                    <span className="text-sm">🔥</span>
                    <span className="font-luckiest text-sm text-gray-800">Streak</span>
                    <span className="text-xs">🏆</span>
                  </motion.div>
                )}
                
                {completeDaysThisWeek >= 5 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1 }}
                    className="bg-purple-400 px-3 py-2 rounded-full flex items-center gap-2 shadow-md"
                  >
                    <span className="text-sm">⭐</span>
                    <span className="font-luckiest text-sm text-white">Champion</span>
                    <span className="text-xs">🏆</span>
                  </motion.div>
                )}

                {completeDaysThisWeek === 7 && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 1.2 }}
                    className="bg-gradient-to-r from-gold to-yellow-400 px-3 py-2 rounded-full flex items-center gap-2 shadow-md"
                  >
                    <span className="text-sm">👑</span>
                    <span className="font-luckiest text-sm text-gray-800">Perfect Week</span>
                    <span className="text-xs">🏆</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Motivational message based on achievements */}
            <div className="text-center space-y-2">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="font-rubik text-sm text-gray-700 italic"
              >
                {completeDaysThisWeek === 0 && "Every journey starts with a single step! 🌱"}
                {completeDaysThisWeek >= 1 && completeDaysThisWeek <= 2 && "Great start! You're building momentum! 💪"}
                {completeDaysThisWeek >= 3 && completeDaysThisWeek <= 4 && "Amazing progress! You're on fire! 🔥"}
                {completeDaysThisWeek >= 5 && completeDaysThisWeek <= 6 && "Incredible dedication! You're a champion! ⭐"}
                {completeDaysThisWeek === 7 && "Perfect week! You're absolutely unstoppable! 👑"}
              </motion.p>

              {weeklyAchievements.length > 0 && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  className="font-luckiest text-xs text-gold"
                >
                  Look how much you've accomplished! 🎉
                </motion.p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmotionalTrackerModal; 