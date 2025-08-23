import bbBanner from '../../../../assets/LoginCovers/img-banner.webp';
import bbBannerTamagotchi from '../../../../assets/LoginCovers/img-banner-tamagotchi.webp';

// Universe intro view
export const UniverseView = () => (
  <div 
    className="h-screen w-full flex flex-col items-center justify-center absolute top-0 left-0 z-10 opacity-0 translate-y-8 animate-fadeInUp"
    style={{ backgroundColor: '#1C1C1C' }}
  >
    <img 
      src={bbBanner} 
      alt="Universe Banner" 
      className="w-48 mx-auto opacity-0 translate-y-8 animate-fadeInUp"
      style={{ animationDelay: '0.2s' }}
    />
  </div>
);

// Game intro view
export const GameView = () => (
  <div 
    className="h-screen w-full flex flex-col items-center justify-center absolute top-0 left-0 z-10 opacity-0 translate-y-8 animate-fadeInUp"
    style={{ backgroundColor: '#950124' }}
  >
    <img 
      src={bbBannerTamagotchi} 
      alt="Game Banner" 
      className="w-48 mx-auto opacity-0 translate-y-8 animate-fadeInUp"
      style={{ animationDelay: '0.2s' }}
    />
  </div>
);