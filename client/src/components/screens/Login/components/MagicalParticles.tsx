import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

const MagicalParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  const colors = ['#ffffff', '#3b82f6', '#01e8dd']; // white, blue, cyan

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      const particles: Particle[] = [];
      const particleCount = 50; // Back to original count

      for (let i = 0; i < particleCount; i++) {
        // Scatter particles across the entire screen
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.3, // Slower movement
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 4 + 1, // Slightly larger particles
          color: colors[Math.floor(Math.random() * colors.length)],
          opacity: Math.random() * 0.6 + 0.4, // Higher base opacity
          life: Math.random() * 120, // Longer life cycle
          maxLife: 120
        });
      }

      particlesRef.current = particles;
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Update life with smoother appear/disappear effect
        particle.life += 0.8;
        if (particle.life > particle.maxLife) {
          particle.life = 0;
          
          // Respawn scattered across the entire screen
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          
          particle.color = colors[Math.floor(Math.random() * colors.length)];
        }

        // Enhanced appear/disappear effect with smooth transitions
        const lifeProgress = particle.life / particle.maxLife;
        let opacity;
        
        if (lifeProgress < 0.2) {
          // Fade in phase (0-20% of life)
          opacity = particle.opacity * (lifeProgress / 0.2);
        } else if (lifeProgress > 0.8) {
          // Fade out phase (80-100% of life)
          opacity = particle.opacity * ((1 - lifeProgress) / 0.2);
        } else {
          // Full visibility phase (20-80% of life)
          opacity = particle.opacity;
        }

        // Draw particle with enhanced glow
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = particle.color;
        
        // Main particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Enhanced glow effect
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        // Additional outer glow
        ctx.shadowBlur = 8;
        ctx.globalAlpha = opacity * 0.5;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default MagicalParticles;
