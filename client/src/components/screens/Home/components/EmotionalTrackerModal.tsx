import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';

// Assets
import emotionalTrackerIcon from "../../../../assets/icons/menu/icon-emotional-tracker.webp";

interface EmotionalTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Goal {
  id: string;
  text: string;
  completed: boolean;
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
    { id: '2', text: 'Exercise', completed: true },
  ]);
  const [newGoal, setNewGoal] = useState<string>('');
  const [tamagotchiReaction, setTamagotchiReaction] = useState<string>('😊');

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
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
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
            <img src={emotionalTrackerIcon} alt="" className="w-8 h-8" />
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
          
          {/* Section 1: Current emotional state */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-gray-800 font-luckiest text-lg">How are you feeling today?</h3>
              <motion.div
                key={tamagotchiReaction}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                {tamagotchiReaction}
              </motion.div>
            </div>
            
            <div className="flex justify-between gap-2">
              {emotions.map((emotion) => (
                <motion.button
                  key={emotion.value}
                  onClick={() => handleEmotionSelect(emotion.value)}
                  className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                    selectedEmotion === emotion.value
                      ? 'border-gold bg-gold/20 shadow-[0_4px_0_rgba(0,0,0,0.15)]'
                      : 'border-stone-400/50 bg-white/50 hover:border-gold/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-2xl mb-1">{emotion.emoji}</span>
                  <span className="text-xs font-rubik text-gray-600">{emotion.name}</span>
                </motion.button>
              ))}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What happened today?"
              className="w-full p-3 border-2 border-stone-400/50 rounded-xl bg-white/80 font-rubik text-sm resize-none focus:border-gold focus:outline-none"
              rows={3}
            />
          </div>

          {/* Section 2: Emotional goals */}
          <div className="space-y-3">
            <h3 className="text-gray-800 font-luckiest text-lg">What do you want to focus on this week?</h3>
            
            <div className="space-y-2">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border-2 border-stone-400/50"
                  whileHover={{ scale: 1.02 }}
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
                  disabled={!newGoal.trim()}
                  className="px-4 py-2 bg-gold text-gray-800 rounded-lg font-luckiest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  +
                </motion.button>
                <motion.button
                  onClick={suggestGoal}
                  className="px-3 py-2 bg-magenta text-white rounded-lg font-luckiest text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  💡
                </motion.button>
              </div>
            )}
          </div>

          {/* Section 3: Progress */}
          <div className="space-y-3">
            <h3 className="text-gray-800 font-luckiest text-lg">Your transformation journey</h3>
            
            {/* Simple progress chart */}
            <div className="bg-white/80 p-4 rounded-xl border-2 border-stone-400/50">
              <div className="flex justify-between items-end mb-3 h-20">
                {progressData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <motion.div
                      className={`w-4 rounded-t ${getEmotionColor(day.emotion)}`}
                      style={{ height: `${20 + Math.random() * 40}px` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${20 + Math.random() * 40}px` }}
                      transition={{ delay: index * 0.1 }}
                    />
                    <span className="text-xs font-rubik text-gray-600">{day.day}</span>
                  </div>
                ))}
              </div>
              
              {/* Progress bar for goals */}
              <div className="mt-4">
                <div className="flex justify-between text-xs font-rubik text-gray-600 mb-1">
                  <span>Goals completed</span>
                  <span>{completedGoalsCount}/{goals.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gold h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
              </div>
            </div>

            {/* Badge and motivational phrase */}
            <div className="text-center space-y-2">
              {progressPercentage >= 50 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 bg-gold px-3 py-1 rounded-full"
                >
                  <span className="text-lg">⭐</span>
                  <span className="font-luckiest text-sm text-gray-800">Progress Star!</span>
                </motion.div>
              )}
              
              <motion.p
                key={currentPhrase}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-rubik text-sm text-gray-700 italic"
              >
                {currentPhrase}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmotionalTrackerModal; 