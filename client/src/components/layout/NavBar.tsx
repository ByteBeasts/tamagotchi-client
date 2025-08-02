import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import SleepIcon  from '../../assets/icons/navBar/icon-sleep.webp';
import FeedIcon    from '../../assets/icons/navBar/icon-feed.webp';
import HomeIcon from '../../assets/icons/navBar/icon-home.webp';
import CleanIcon from '../../assets/icons/navBar/icon-clean.webp';
import PlayIcon from '../../assets/icons/navBar/icon-play.webp';

// Real-time status integration
import { useUpdateBeast } from '../../dojo/hooks/useUpdateBeast';

type Screen = "login" | "cover" | "home" | "sleep" | "feed" | "clean" | "play";

interface NavBarProps {
  onNavigation?: (screen: Screen) => void;
  activeTab?: Screen;
  shouldBlockNavigation?: boolean; // NEW: Indicates if navigation should be blocked
}

export function NavBar({
  onNavigation,
  activeTab = 'home',
  shouldBlockNavigation = false, // NEW: Default to false
}: NavBarProps) {
  const [active, setActive] = useState<Screen>(activeTab);
  
  // Hook for background beast updates
  const { triggerUpdate } = useUpdateBeast();

  useEffect(() => {
    setActive(activeTab);
  }, [activeTab]);

  const navItems: { id: Screen; src: string; label: string }[] = [
    { id: 'sleep',  src: SleepIcon,  label: ''  },
    { id: 'feed',    src: FeedIcon,    label: ''    },
    { id: 'home', src: HomeIcon, label: '' },
    { id: 'clean', src: CleanIcon, label: '' },
    { id: 'play', src: PlayIcon, label: '' },
  ];

  const handleClick = (id: Screen) => {
    // Set active immediately for instant UI feedback
    setActive(id);
    
    // Trigger navigation callback immediately (non-blocking)
    // Note: Navigation blocking logic is handled in App.tsx
    onNavigation?.(id);
    
    // Trigger background update_beast (fire-and-forget)
    triggerUpdate();
  };

  /**
   * Determine if a specific navigation item should be disabled
   * @param itemId - The screen ID to check
   * @returns true if the item should be disabled
   */
  const isItemDisabled = (itemId: Screen): boolean => {
    // When navigation is blocked, disable all items except Sleep
    return shouldBlockNavigation && itemId !== 'sleep';
  };

  /**
   * Get styling classes for navigation items based on their state
   * @param item - The navigation item
   * @returns CSS classes string
   */
  const getItemClasses = (item: { id: Screen; src: string; label: string }) => {
    const isActive = active === item.id;
    const isDisabled = isItemDisabled(item.id);
    
    let classes = `
      flex-1 h-full
      flex flex-col items-center justify-center
      transition-all duration-300 ease-in-out
      relative
    `;
    
    if (isDisabled) {
      // 🚫 Disabled state (beast sleeping)
      classes += ` 
        opacity-50 cursor-not-allowed 
        bg-transparent text-gray-500
        hover:bg-transparent
      `;
    } else if (isActive) {
      // ✅ Active state
      classes += ` 
        bg-gold-gradient text-screen shadow-soft-lg cursor-pointer
      `;
    } else {
      // 🎯 Normal inactive state
      classes += ` 
        bg-transparent hover:bg-gold/10 text-text-primary cursor-pointer
      `;
    }
    
    return classes;
  };

  return (
    <motion.nav
      className="
        fixed bottom-0 inset-x-0 h-16
        bg-cream shadow-soft-lg
        flex divide-x divide-gray-500/20
        z-20
      "
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
    >
      {navItems.map(item => {
        const isDisabled = isItemDisabled(item.id);
        
        return (
          <motion.button
            key={item.id}
            layout
            onClick={() => !isDisabled && handleClick(item.id)}
            className={getItemClasses(item)}
            aria-label={`${item.label}${isDisabled ? ' (Disabled - Beast Sleeping)' : ''}`}
            disabled={isDisabled}
            title={isDisabled ? "Your beast is sleeping! Wake them up first 😴" : item.label}
          >      
            <div className="relative">
              {/* Icon with conditional styling */}
              <img
                src={item.src}
                alt={item.label}
                className={`
                  w-14 h-14 transition-all duration-300
                  ${isDisabled ? 'grayscale' : ''}
                `}
              />
              
              {/* 🌙 Sleep indicator for disabled items */}
              {isDisabled && (
                <div className="absolute -top-1 -right-1 text-xs">
                  🌙
                </div>
              )}
            </div>
            
            {/* Label - only show for active item */}
            {active === item.id && (
              <span className={`
                text-sm font-luckiest pb-1 transition-all duration-300
                ${isDisabled ? 'text-gray-500' : 'text-screen'}
              `}>
                {item.label}
              </span>
            )}
          </motion.button>
        );
      })}
    </motion.nav>
  );
}