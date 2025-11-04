// ================================================================
// HABIT TEMPLATE SELECTOR
// Grid of pre-configured habit templates for quick selection
// ================================================================

import { motion } from 'framer-motion';
import { HABIT_TEMPLATES, CATEGORY_INFO } from '../../../../constants/habitTemplates';
import type { HabitTemplate, HabitCategory } from '../../../../types/habit.types';

interface HabitTemplateSelectorProps {
  onSelectTemplate: (template: HabitTemplate) => void;
  selectedCategory?: HabitCategory | 'all';
  onCategoryChange?: (category: HabitCategory | 'all') => void;
}

export const HabitTemplateSelector = ({
  onSelectTemplate,
  selectedCategory = 'all',
  onCategoryChange
}: HabitTemplateSelectorProps) => {
  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all'
    ? HABIT_TEMPLATES
    : HABIT_TEMPLATES.filter(t => t.category === selectedCategory);

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  return (
    <div className="space-y-4">
      {/* Category filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <motion.button
          onClick={() => onCategoryChange?.('all')}
          className={`px-3 py-1.5 rounded-full font-rubik text-xs whitespace-nowrap border-2 transition-all
            ${selectedCategory === 'all'
              ? 'bg-gold-gradient border-gold text-gray-800 font-bold'
              : 'bg-white/10 backdrop-blur-sm border-gold/20 text-gray-600 hover:border-gold/40'
            }`}
          whileTap={{ scale: 0.95 }}
        >
          All
        </motion.button>
        {Object.entries(CATEGORY_INFO).map(([key, info]) => (
          <motion.button
            key={key}
            onClick={() => onCategoryChange?.(key as HabitCategory)}
            className={`px-3 py-1.5 rounded-full font-rubik text-xs whitespace-nowrap border-2 transition-all flex items-center gap-1
              ${selectedCategory === key
                ? 'bg-gold-gradient border-gold text-gray-800 font-bold'
                : 'bg-white/10 backdrop-blur-sm border-gold/20 text-gray-600 hover:border-gold/40'
              }`}
            whileTap={{ scale: 0.95 }}
          >
            <span>{info.icon}</span>
            <span>{info.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Templates grid */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 font-rubik">No templates found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
          {filteredTemplates.map((template, index) => (
            <motion.button
              key={index}
              onClick={() => onSelectTemplate(template)}
              className="text-left bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-gold/20 hover:border-gold/40 hover:shadow-md transition-all group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${template.color}20` }}>
                  {template.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-luckiest text-sm text-gray-800 mb-1 group-hover:text-gold transition-colors">
                    {template.name}
                  </h4>
                  {template.description && (
                    <p className="text-xs text-gray-600 font-rubik line-clamp-2 mb-2">
                      {template.description}
                    </p>
                  )}

                  {/* Difficulty badge */}
                  <div className="inline-flex items-center gap-1 text-xs font-rubik font-medium text-gray-700">
                    <span>{getDifficultyStars(template.difficulty)}</span>
                  </div>
                </div>

                {/* Arrow icon */}
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gold transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};
