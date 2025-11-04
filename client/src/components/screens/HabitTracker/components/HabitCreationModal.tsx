// ================================================================
// HABIT CREATION MODAL
// Modal for creating/editing habits (with template selector)
// ================================================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import closeIcon from '../../../../assets/icons/extras/icon-close.webp';
import { CATEGORY_INFO } from '../../../../constants/habitTemplates';
import { HabitTemplateSelector } from './HabitTemplateSelector';
import type { HabitCategory, HabitDifficulty, HabitTemplate } from '../../../../types/habit.types';

interface HabitCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (habit: {
    name: string;
    description?: string;
    category: HabitCategory;
    difficulty: HabitDifficulty;
  }) => void;
  editMode?: boolean;
  initialValues?: {
    name: string;
    description?: string;
    category: HabitCategory;
    difficulty: HabitDifficulty;
  };
}

export const HabitCreationModal = ({
  isOpen,
  onClose,
  onSubmit,
  editMode = false,
  initialValues
}: HabitCreationModalProps) => {
  const [step, setStep] = useState<'template' | 'custom'>('template');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>(1);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');

  // Load initial values if editing
  useEffect(() => {
    if (isOpen) {
      if (initialValues) {
        setName(initialValues.name);
        setDescription(initialValues.description || '');
        setCategory(initialValues.category);
        setDifficulty(initialValues.difficulty);
        setStep('custom'); // Go directly to custom form in edit mode
      } else {
        // Reset form for new habit
        setName('');
        setDescription('');
        setCategory('health');
        setDifficulty(1);
        setStep('template');
        setSelectedCategory('all'); // Reset filter
      }
      setError('');
    }
  }, [isOpen, initialValues]);

  const handleTemplateSelect = (template: HabitTemplate) => {
    setName(template.name);
    setDescription(template.description || '');
    setCategory(template.category);
    setDifficulty(template.difficulty);
    setStep('custom');
  };

  const handleSubmit = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a habit name');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Name must be 100 characters or less');
      return;
    }

    onSubmit({
      name: trimmedName,
      description: description.trim() || undefined,
      category,
      difficulty
    });

    // Don't close modal here - let the parent handle it after refetch
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && step === 'custom') {
      handleSubmit();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-cream w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-gold/40 overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gold-gradient p-4 border-b-4 border-gold/50 flex justify-between items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-shimmer" />
            <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-md relative z-10">
              {editMode ? 'EDIT HABIT' : 'CREATE NEW HABIT'}
            </h2>
            <motion.button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 transition-colors relative z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={closeIcon} alt="Close" className="w-8 h-8" />
            </motion.button>
          </div>

          {/* Toggle switch selector (only show if not editing) */}
          {!editMode && (
            <div className="flex justify-center items-center py-4 bg-cream/50">
              <div className="flex items-center gap-3">
                <span className={`font-luckiest text-sm transition-colors ${
                  step === 'template' ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  📋 TEMPLATES
                </span>

                {/* iOS-style toggle switch */}
                <button
                  onClick={() => setStep(step === 'template' ? 'custom' : 'template')}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-300 ease-in-out ${
                    step === 'custom' ? 'bg-gold' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle between templates and custom"
                >
                  <motion.div
                    className="absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{
                      x: step === 'custom' ? 24 : 0
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30
                    }}
                  />
                </button>

                <span className={`font-luckiest text-sm transition-colors ${
                  step === 'custom' ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  ✏️ CUSTOM
                </span>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-cream to-cream/80">
            {step === 'template' && !editMode ? (
              <HabitTemplateSelector
                onSelectTemplate={handleTemplateSelect}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            ) : (
              <div className="space-y-4">
                {/* Name input */}
                <div>
                  <label className="block text-sm font-rubik font-medium text-gray-700 mb-2">
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g., Exercise 30 minutes"
                    maxLength={100}
                    className="w-full bg-surface/20 rounded-xl p-4 text-gray-800 font-rubik
                      border-2 border-gold/30 shadow-inner backdrop-blur-sm
                      placeholder:text-gray-500 text-sm focus:outline-none focus:border-gold/50"
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-1">
                    {error && <p className="text-red-600 text-xs font-rubik">{error}</p>}
                    <p className="text-gray-500 text-xs font-rubik ml-auto">{name.length}/100</p>
                  </div>
                </div>

                {/* Description input */}
                <div>
                  <label className="block text-sm font-rubik font-medium text-gray-700 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add more details about this habit..."
                    maxLength={200}
                    rows={3}
                    className="w-full bg-surface/20 rounded-xl p-4 text-gray-800 font-rubik
                      border-2 border-gold/30 shadow-inner backdrop-blur-sm
                      placeholder:text-gray-500 text-sm focus:outline-none focus:border-gold/50 resize-none"
                  />
                  <p className="text-gray-500 text-xs font-rubik text-right mt-1">
                    {description.length}/200
                  </p>
                </div>

                {/* Category selector */}
                <div>
                  <label className="block text-sm font-rubik font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                      <motion.button
                        key={key}
                        onClick={() => setCategory(key as HabitCategory)}
                        className={`p-3 rounded-xl border-2 transition-all text-left ${
                          category === key
                            ? 'bg-gold-gradient border-gold'
                            : 'bg-white border-gray-300 hover:border-gold/50'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{info.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-rubik text-xs font-medium text-gray-800 truncate">
                              {info.label}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Difficulty selector */}
                <div>
                  <label className="block text-sm font-rubik font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((level) => (
                      <motion.button
                        key={level}
                        onClick={() => setDifficulty(level as HabitDifficulty)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          difficulty === level
                            ? level === 1
                              ? 'bg-green-100 border-green-400'
                              : level === 2
                              ? 'bg-yellow-100 border-yellow-400'
                              : 'bg-red-100 border-red-400'
                            : 'bg-white border-gray-300 hover:border-gold/50'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="text-center">
                          <p className="text-2xl mb-1">{'⭐'.repeat(level)}</p>
                          <p className="font-luckiest text-xs text-gray-700">
                            {level === 1 ? 'EASY' : level === 2 ? 'MEDIUM' : 'HARD'}
                          </p>
                          <p className="font-rubik text-xs text-gray-600 mt-1">
                            {level === 1 ? '10 coins' : level === 2 ? '25 coins' : '50 coins'}
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer (only show in custom mode) */}
          {step === 'custom' && (
            <div className="p-4 bg-gold/10 border-t-4 border-gold/30 flex gap-3">
              <motion.button
                onClick={onClose}
                className="bg-gray-300 text-gray-800 flex-1 font-luckiest text-lg py-3 px-6 rounded-xl
                  shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)]
                  active:shadow-none active:translate-y-1 transition-all duration-150"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">CANCEL</span>
              </motion.button>

              <motion.button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="bg-gold text-gray-800 flex-1 font-luckiest text-lg py-3 px-6 rounded-xl
                  shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)]
                  active:shadow-none active:translate-y-1 transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
                  {editMode ? 'UPDATE' : 'CREATE'}
                </span>
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
