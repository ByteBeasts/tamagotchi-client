import { useCallback, useState, useEffect, useRef } from "react";
// import { useCavosAccount } from "../../../../dojo/hooks/useCavosAccount"; // Not needed for invisible wallets

// Components
import { ShareModal } from "./ShareModal";

// Context
import { useMusic } from "../../../../context/MusicContext";

// Simple hook to check if user has a beast
import { useBeastDisplay } from "../../../../dojo/hooks/useBeastDisplay";

// Assets
import menuIcon from "../../../../assets/icons/menu/icon-menu.webp";
import closeIcon from "../../../../assets/icons/extras/icon-close.png";
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
  // Note: account removed since not used - Cavos handles invisible wallets
  const { isMuted, toggleMute } = useMusic();

  // Only need to check if user has a beast (for disabling share button)
  const { hasLiveBeast } = useBeastDisplay();

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

  const handleProfile = useCallback(() => {
    // Profile functionality disabled for Cavos migration
    console.log("Profile feature temporarily disabled");
  }, []);

  const handleShareClick = useCallback(() => {
    setIsShareModalOpen(true);
    setIsOpen(false); // Close dropdown when opening share modal
  }, []);

  const handleDisconnect = useCallback(() => {
    // Clear Cavos auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('cavos_auth_data');
    setIsOpen(false);
    // Navigate to login after clearing auth data
    setTimeout(() => {
      onNavigateLogin();
    }, 100);
  }, [onNavigateLogin]);

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
          <button
            onClick={handleProfile}
            className="flex items-center space-x-3 w-full hover:scale-105 transition-transform"
            role="menuitem"
          >
            <img src={profileIcon} alt="" className="w-5 h-5" />
            <span className="text-dark font-luckiest">Profile</span>
          </button>

          <button
            onClick={handleShareClick}
            className="flex items-center space-x-3 w-full hover:scale-105 transition-transform"
            role="menuitem"
            disabled={!hasLiveBeast} // Disable if no beast exists
          >
            <img src={shareIcon} alt="" className="w-5 h-5" />
            <span className={`font-luckiest ${!hasLiveBeast ? 'text-gray-400' : 'text-dark'}`}>
              Share on X
            </span>
          </button>

          <button
            onClick={toggleMute}
            className="flex items-center space-x-3 w-full hover:scale-105 transition-transform"
            role="menuitem"
          >
            <img src={isMuted ? soundOffIcon : soundOnIcon} alt="" className="w-5 h-5" />
            <span className="text-dark font-luckiest">{isMuted ? "Unmute" : "Mute"}</span>
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