import { useCallback, useState, useEffect, useRef } from "react";

// Components
import { ShareModal } from "./ShareModal";

// Context
import { useMusic } from "../../../../context/MusicContext";

// Simple hook to check if user has a beast
import { useBeastDisplay } from "../../../../dojo/hooks/useBeastDisplay";

// Store for clearing auth state
import useAppStore from "../../../../zustand/store";

// Assets
import menuIcon from "../../../../assets/icons/menu/icon-menu.webp";
import closeIcon from "../../../../assets/icons/extras/icon-close.webp";
import profileIcon from "../../../../assets/icons/menu/svg/icon-profile.svg";
import shareIcon from "../../../../assets/icons/menu/svg/icon-share.svg";
import logoutIcon from "../../../../assets/icons/menu/svg/icon-logout.svg";
import soundOnIcon from "../../../../assets/icons/menu/svg/icon-sound-on.svg";
import soundOffIcon from "../../../../assets/icons/menu/svg/icon-sound-off.svg";

type DropdownMenuProps = {
  onNavigateLogin: () => void;
};

export const DropdownMenu = ({ onNavigateLogin }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { isMuted, toggleMute } = useMusic();
  const { hasLiveBeast } = useBeastDisplay();
  
  // Get clearCavosAuth function from store
  const clearCavosAuth = useAppStore(state => state.clearCavosAuth);
  const resetStore = useAppStore(state => state.resetStore);

  const toggleMenu = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Profile functionality disabled for Cavos migration
  // const handleProfile = useCallback(() => {
  //   console.log("Profile feature temporarily disabled");
  // }, []);

  const handleShareClick = useCallback(() => {
    setIsShareModalOpen(true);
    setIsOpen(false); // Close dropdown when opening share modal
  }, []);

  const handleDisconnect = useCallback(() => {
    console.log('🚪 Disconnecting user...');
    
    // Clear Cavos auth data from Zustand store
    clearCavosAuth();
    
    // Reset entire store to clean state
    resetStore();
    
    // Clear localStorage as backup
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('cavos_auth_data');
    
    // Clear all tamagotchi localStorage
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tamagotchi-store')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    setIsOpen(false);
    
    // Navigate to login after clearing all data
    setTimeout(() => {
      console.log('✅ User logged out, navigating to login...');
      onNavigateLogin();
    }, 100);
  }, [onNavigateLogin, clearCavosAuth, resetStore]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        onClick={toggleMenu}
        className="flex items-center justify-center z-50 hover:scale-105 transition-transform"
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        <img
          src={isOpen ? closeIcon : menuIcon}
          alt=""
          className={`${isOpen ? 'w-10 h-10' : 'w-10 h-10'}`}
        />
      </button>

      {/* Dropdown Overlay */}
      {isOpen && (
        <div 
          className="absolute top-0 right-0 mt-12 w-48 bg-cream rounded-xl shadow-lg px-4 py-3 space-y-3 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* Profile section commented out - feature disabled for Cavos migration */}
          {/* <button
            onClick={handleProfile}
            className="flex items-center space-x-3 w-full hover:scale-105 transition-transform"
            role="menuitem"
          >
            <img src={profileIcon} alt="" className="w-5 h-5" />
            <span className="text-dark font-luckiest">Profile</span>
          </button> */}

          {/* Share button - only show when beast is alive */}
          {hasLiveBeast && (
            <button
              onClick={handleShareClick}
              className="flex items-center space-x-3 w-full hover:scale-105 transition-transform"
              role="menuitem"
            >
              <img src={shareIcon} alt="" className="w-5 h-5" />
              <span className="text-dark font-luckiest">
                Share on X
              </span>
            </button>
          )}

          <button
            onClick={toggleMute}
            className="flex items-center space-x-3 w-full hover:scale-105 transition-transform"
            role="menuitem"
          >
            <img src={isMuted ? soundOffIcon : soundOnIcon} alt="" className="w-5 h-5" />
            <span className="text-dark font-luckiest">{isMuted ? "Unmute" : "Mute"}</span>
          </button>

          <button
            id="feedback-button"
            className="flex items-center space-x-3 w-full hover:scale-105 transition-transform"
            role="menuitem"
          >
            <img src={profileIcon} alt="" className="w-5 h-5" />
            <span className="text-dark font-luckiest">Feedback</span>
          </button>

          <button
            onClick={handleDisconnect}
            className="flex items-center space-x-3 w-full hover:scale-105 transition-transform"
            role="menuitem"
          >
            <img src={logoutIcon} alt="" className="w-5 h-5" />
            <span className="text-dark font-luckiest">Disconnect</span>
          </button>
        </div>
      )}

      {/* 🆕 NEW: ShareModal now automatically gets real-time data */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        type="beast"
        // No need to pass beastData - ShareModal gets it automatically!
      />
    </div>
  );
};