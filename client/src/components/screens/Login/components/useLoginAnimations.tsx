import { useEffect, useState } from 'react';
import type { View, CircleType } from '../../../types/login.types';
import { ANIMATION_TIMINGS } from '../../../../constants/login.constants';

export const useLoginAnimations = () => {
  const [view] = useState<View>('cover');
  const [currentCircle, setCurrentCircle] = useState<CircleType>('play');

  // Handle circle animation sequence
  useEffect(() => {
    const sequence: CircleType[] = ['play', 'raise', 'evolve'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % sequence.length;
      setCurrentCircle(sequence[currentIndex]);
    }, ANIMATION_TIMINGS.CIRCLE_ROTATION);
    
    return () => clearInterval(interval);
  }, []);

  return {
    view,
    currentCircle,
  };
};