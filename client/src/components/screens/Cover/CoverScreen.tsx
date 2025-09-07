import { useEffect, useState } from "react";
import bgLoging from '../../../assets/backgrounds/bg-loging.webp';
import MagicalParticles from '../Login/components/MagicalParticles';

interface CoverScreenProps {
  onLoadingComplete: () => void;
}

export const CoverScreen = ({ onLoadingComplete }: CoverScreenProps) => {
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 5000; 

    const animateLoading = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setLoadingProgress(progress * 100);

      if (progress < 1) {
        requestAnimationFrame(animateLoading);
      } else {
        setTimeout(onLoadingComplete, 500);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateLoading);
    }, 50);

    return () => clearTimeout(timer);
  }, [onLoadingComplete]);

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url(${bgLoging})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Magical Particles Effect */}
      <MagicalParticles />
      
      {/* Progress bar */}
      <div className="absolute bottom-20 left-4 right-4 z-10">
        <div className="relative h-5 bg-surface/30 rounded-full overflow-hidden backdrop-blur-sm">
          {/* Animated fill - With gradient */}
          <div
            className="absolute left-0 top-0 bottom-0 z-0 rounded-full"
            style={{ 
              width: `${loadingProgress}%`,
              background: 'linear-gradient(90deg, rgb(var(--color-gold)), rgb(var(--color-emerald)))'
            }}
          />
          {/* Centered text */}
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <span className="font-bold font-rubik text-sm text-cream drop-shadow-lg">
              {Math.round(loadingProgress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};