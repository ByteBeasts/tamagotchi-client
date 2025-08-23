import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Components
import { GameOverModal } from '../GameOverModal';
import { useFlappyGameLogic } from '../flappybeast/useFlappyGameLogic';
//import { useHighScores } from '../../hooks/useHighScore.tsx';
import { MiniGameScreenProps, GameResult } from '../../../../../types/play.types';

// Assets
import skyBackground from '../../../../../../assets/icons/games/flappy-beasts-assets/bg-sky.png';
import landBackground from '../../../../../../assets/icons/games/flappy-beasts-assets/bg-land.png';
import ceilingBackground from '../../../../../../assets/icons/games/flappy-beasts-assets/bg-ceiling.png';
import pipeImage from '../../../../../../assets/icons/games/flappy-beasts-assets/img-full-pipe.png';
import pipeUpImage from '../../../../../../assets/icons/games/flappy-beasts-assets/img-full-pipe.png';
import pipeDownImage from '../../../../../../assets/icons/games/flappy-beasts-assets/img-full-pipe.png';
import closeIcon from '../../../../../../assets/icons/extras/icon-close.png';
import beastIcon from '../../../../../../assets/icons/profile/beast.png';

// Styles
import "./main.css";


const gameAssets = {
  sky: skyBackground,
  land: landBackground,
  ceiling: ceilingBackground,
  pipe: pipeImage,
  pipeUp: pipeUpImage,
  pipeDown: pipeDownImage,
};

// Game constants
const PIPE_GAP = 160;
const PIPE_INTERVAL = 1700;
const GRAVITY = 9.8;
const JUMP_FORCE = -6.5;
const BIRD_WIDTH = 52;
const BIRD_HEIGHT = 52;
const PIPE_WIDTH = 52;
const ENERGY_TOAST_DURATION = 3000;
const BASE_PIPE_SPEED = 180;
const SPEED_FACTOR = 2;
const MAX_PIPE_SPEED = 600;
const COLLIDER_MARGIN = 10;
const BIRD_COLLIDER_WIDTH = 30;
const BIRD_COLLIDER_HEIGHT = 30;
const PIPE_COLLIDER_WIDTH = PIPE_WIDTH - (COLLIDER_MARGIN * 2);
const BIRD_COLLIDER_OFFSET_X = (BIRD_WIDTH - BIRD_COLLIDER_WIDTH) / 2;
const BIRD_COLLIDER_OFFSET_Y = (BIRD_HEIGHT - BIRD_COLLIDER_HEIGHT) / 2;

const GAME_NAME = "Flappy Beasts";

const FlappyBirdMiniGame = forwardRef<{ resetGame: () => void }, MiniGameScreenProps>(({
  onExitGame,
  beastImage,
}, ref) => {
  // === Business logic hook ===
  const {
    checkEnergyRequirement,
    consumeEnergy,
    handleGameCompletion,
    showEnergyToast,
    setShowEnergyToast,
    isProcessingResults
  } = useFlappyGameLogic();

  // === UI State ===
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // === Refs for DOM + game loop ===
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const beastRef = useRef<HTMLDivElement>(null);
  const pipesRef = useRef<HTMLDivElement>(null);
  const scoreRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number>(0);
  const lastPipeTime = useRef<number>(0);
  const currentScoreRef = useRef<number>(0);
  const gameConfig = useRef({
    birdX: 60,
    birdY: 0,
    velocity: 0,
    pipes: [] as Array<{
      x: number;
      topHeight: number;
      bottomY: number;
      scored: boolean;
      element: HTMLDivElement;
      topElement: HTMLDivElement;
      bottomElement: HTMLDivElement;
    }>,
    gravity: GRAVITY,
    jumpForce: JUMP_FORCE,
    gameWidth: 360,
    gameHeight: 576,
    running: false,
    lastTimestamp: 0,
    pipeSpeedPPS: BASE_PIPE_SPEED,
  });

  // === Adjust pipe speed with score ===
  useEffect(() => {
    const next = BASE_PIPE_SPEED + score * SPEED_FACTOR;
    gameConfig.current.pipeSpeedPPS = Math.min(next, MAX_PIPE_SPEED);
  }, [score]);

  // === Expose resetGame to parent ===
  useImperativeHandle(ref, () => ({ resetGame }));

  // === Game loop functions ===
  const createPipe = () => {
    if (!pipesRef.current || !gameContainerRef.current) return;
    const game = gameConfig.current;
    const h = game.gameHeight;
    const minH = Math.floor(h * 0.1);
    const maxH = Math.floor(h * 0.6);
    const topH = Math.floor(Math.random() * (maxH - minH)) + minH;
    const bottomY = topH + PIPE_GAP;

    const container = document.createElement('div');
    container.className = 'pipe';
    container.style.cssText = `
      position:absolute; width:${PIPE_WIDTH}px;
      left:${game.gameWidth}px; height:100%; z-index:10;
    `;

    const top = document.createElement('div');
    top.className = 'pipe_upper';
    top.style.cssText = `
      position:absolute; top:0; width:${PIPE_WIDTH}px;
      height:${topH}px; background:url(${gameAssets.pipe}) center repeat-y;
    `;
    const topEnd = document.createElement('div');
    topEnd.className = 'pipe_upper_end';
    topEnd.style.cssText = `
      position:absolute; bottom:0; width:${PIPE_WIDTH}px;
      height:26px; background:url(${gameAssets.pipeDown}) center no-repeat;
    `;
    top.appendChild(topEnd);

    const bottom = document.createElement('div');
    bottom.className = 'pipe_lower';
    bottom.style.cssText = `
      position:absolute; top:${bottomY}px; width:${PIPE_WIDTH}px;
      height:${h - bottomY}px; background:url(${gameAssets.pipe}) center repeat-y;
    `;
    const bottomEnd = document.createElement('div');
    bottomEnd.className = 'pipe_lower_end';
    bottomEnd.style.cssText = `
      position:absolute; top:0; width:${PIPE_WIDTH}px;
      height:26px; background:url(${gameAssets.pipeUp}) center no-repeat;
    `;
    bottom.appendChild(bottomEnd);

    container.append(top, bottom);
    pipesRef.current.appendChild(container);

    game.pipes.push({ x: game.gameWidth, topHeight: topH, bottomY, scored: false, element: container, topElement: top, bottomElement: bottom });
  };

  const removePipes = () => {
    const game = gameConfig.current;
    game.pipes = game.pipes.filter(pipe => {
      if (pipe.x + PIPE_WIDTH < 0) {
        pipe.element.remove();
        return false;
      }
      return true;
    });
  };

  const updateBird = (dt: number) => {
    const g = gameConfig.current;
    g.velocity = Math.min(g.velocity + g.gravity * dt, 15);
    g.birdY += g.velocity * dt * 60;

    if (beastRef.current) {
      beastRef.current.style.transform = `translateY(${g.birdY}px) rotate(${Math.min(Math.max(g.velocity * 3, -30), 90)}deg)`;
    }

    if (g.birdY < 0) {
      g.birdY = 0; g.velocity = 0;
    } else if (g.birdY > g.gameHeight - BIRD_HEIGHT) {
      endGame();
    }
  };

  const updatePipes = (dt: number) => {
    const game = gameConfig.current;
    const speedPx = game.pipeSpeedPPS * dt;

    game.pipes.forEach(pipe => {
      pipe.x -= speedPx;
      pipe.element.style.left = `${pipe.x}px`;

      // scoring
      if (!pipe.scored && pipe.x + PIPE_WIDTH < game.birdX) {
        pipe.scored = true;
        currentScoreRef.current += 1;
        setScore(currentScoreRef.current);
        if (scoreRef.current) scoreRef.current.textContent = `${currentScoreRef.current}`;
      }

      // collision AABB
      const bl = game.birdX + BIRD_COLLIDER_OFFSET_X;
      const bt = game.birdY + BIRD_COLLIDER_OFFSET_Y;
      const br = bl + BIRD_COLLIDER_WIDTH;
      const bb = bt + BIRD_COLLIDER_HEIGHT;
      const pl = pipe.x + (PIPE_WIDTH - PIPE_COLLIDER_WIDTH)/2;
      const pr = pl + PIPE_COLLIDER_WIDTH;
      const tb = pipe.topHeight - COLLIDER_MARGIN;
      const btmt = pipe.bottomY + COLLIDER_MARGIN;

      if (br > pl && bl < pr && (bt < tb || bb > btmt)) {
        endGame();
      }
    });
  };

  const update = (timestamp: number) => {
    const game = gameConfig.current;
    if (!game.running) return;
    if (!game.lastTimestamp) {
      game.lastTimestamp = timestamp;
      animationFrameId.current = requestAnimationFrame(update);
      return;
    }

    let dt = (timestamp - game.lastTimestamp) / 1000;
    if (dt > 0.1) dt = 0.1;
    game.lastTimestamp = timestamp;

    if (timestamp - lastPipeTime.current > PIPE_INTERVAL) {
      createPipe();
      lastPipeTime.current = timestamp;
    }

    updateBird(dt);
    updatePipes(dt);
    removePipes();

    animationFrameId.current = requestAnimationFrame(update);
  };

  // === Controls ===
  const jump = () => {
    const game = gameConfig.current;
    if (!gameActive && !gameOver) {
      startGame();
    } else if (gameActive) {
      game.velocity = game.jumpForce;
      game.birdY -= 5;
      if (beastRef.current) {
        beastRef.current.style.transform = `translateY(${game.birdY}px) rotate(-20deg)`;
      }
    }
  };

  // Start
  const startGame = async () => {
    if (gameConfig.current.running) return;

    setIsStarting(true);

    // energy check + consume
    const has = await checkEnergyRequirement();
    if (!has) {
      setIsStarting(false);
      setShowEnergyToast(true);
      setTimeout(() => setShowEnergyToast(false), ENERGY_TOAST_DURATION);
      return;
    }
    const ok = await consumeEnergy();
    if (!ok) {
      setIsStarting(false);
      return;
    }

    // init physics
    const g = gameConfig.current;
    g.running = true;
    g.birdY = g.gameHeight/2 - BIRD_HEIGHT/2;
    g.velocity = 0;
    if (beastRef.current) beastRef.current.style.transform = `translateY(${g.birdY}px) rotate(0deg)`;

    setGameActive(true);
    setGameOver(false);
    currentScoreRef.current = 0;
    setScore(0);
    if (scoreRef.current) scoreRef.current.textContent = "0";
    
    lastPipeTime.current = performance.now() + 500;
    
    // start loop with delay to allow DOM to settle
    animationFrameId.current = requestAnimationFrame(update);

    // small auto-jump
    setTimeout(() => {
      setIsStarting(false);
      if (gameConfig.current.running) jump();
    }, 150);
  };

  // End
  const endGame = () => {
    if (!gameConfig.current.running) return;
    gameConfig.current.running = false;
    setGameActive(false);
    setGameOver(true);
    cancelAnimationFrame(animationFrameId.current);

    // business logic: save and compute rewards
    (async () => {
      const result = await handleGameCompletion(currentScoreRef.current);
      setGameResult(result);
      setShowGameOverModal(true);
    })();
  };

  // Play again
  const handlePlayAgain = async () => {
    // re-check energy
    const has = await checkEnergyRequirement();
    if (!has) {
      setShowEnergyToast(true);
      setTimeout(() => setShowEnergyToast(false), ENERGY_TOAST_DURATION);
      return;
    }
    const ok = await consumeEnergy();
    if (!ok) return;

    setShowGameOverModal(false);
    resetGame();
  };

  // Reset
  const resetGame = () => {
    cancelAnimationFrame(animationFrameId.current);
    const g = gameConfig.current;
    g.running = false;
    g.birdY = g.gameHeight/2 - BIRD_HEIGHT/2;
    g.velocity = 0;
    g.lastTimestamp = 0;
    g.pipes.forEach(p => p.element.remove());
    g.pipes = [];
    currentScoreRef.current = 0;
    setScore(0);
    setGameOver(false);
    setGameActive(false);
    if (beastRef.current) beastRef.current.style.transform = `translateY(${g.birdY}px) rotate(0deg)`;
  };

  // Input handlers
  useEffect(() => {
    const ctr = gameContainerRef.current;
    if (!ctr) return;
    
    const onClick = (e: MouseEvent) => { 
      // Only prevent default if not a modal
      if (!(e.target as Element).closest('.modal-overlay, .fixed')) {
        e.preventDefault(); 
        jump(); 
      }
    };
    
    const onTouch = (e: TouchEvent) => { 
      // Only prevent default if not a modal
      if (!(e.target as Element).closest('.modal-overlay, .fixed')) {
        e.preventDefault(); 
        jump(); 
      }
    };
    
    const onKey = (e: KeyboardEvent) => {
      if (e.code.match(/Space|ArrowUp|KeyW/) && !isProcessingResults) {
        // Only prevent default if not a modal
        if (!showGameOverModal) {
          e.preventDefault(); 
          jump();
        }
      }
    };
    
    ctr.addEventListener('click', onClick);
    ctr.addEventListener('touchstart', onTouch, { passive: false });
    window.addEventListener('keydown', onKey);
    
    return () => {
      ctr.removeEventListener('click', onClick);
      ctr.removeEventListener('touchstart', onTouch);
      window.removeEventListener('keydown', onKey);
    };
  }, [gameActive, gameOver, isProcessingResults, showGameOverModal]);

  // Responsiveness
  useEffect(() => {
    const resize = () => {
      const ctr = gameContainerRef.current;
      if (!ctr) return;
      const w = ctr.clientWidth, h = ctr.clientHeight;
      const g = gameConfig.current;
      g.gameWidth = w;
      g.gameHeight = h;
      g.birdY = h/2 - BIRD_HEIGHT/2;
      while (pipesRef.current?.firstChild) pipesRef.current.removeChild(pipesRef.current.firstChild);
      g.pipes = [];
      if (beastRef.current) beastRef.current.style.transform = `translateY(${g.birdY}px) rotate(0deg)`;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  return (
    <div ref={gameContainerRef} className="flappy-bird-game" style={{ position: 'relative', overflow: 'hidden', width:'100%', height:'100%', backgroundColor:'#4ec0ca' }}>
      {/* Sky */}
      <div className="sky animated" style={{ backgroundImage:`url(${gameAssets.sky})` }} />
      {/* Ceiling */}
      <div className="ceiling animated" style={{ backgroundImage:`url(${gameAssets.ceiling})` }} />
      {/* Play area */}
      <div className="fly-area">
        <div ref={beastRef} className="bird" style={{
          width:`${BIRD_WIDTH}px`, height:`${BIRD_HEIGHT}px`,
          backgroundImage:`url(${beastImage})`, backgroundSize:'contain', backgroundRepeat:'no-repeat',
          position:'absolute', left:`${gameConfig.current.birdX}px`, transform:`translateY(${gameConfig.current.birdY}px) rotate(0deg)`, transition:'transform 0.1s', zIndex:20
        }} />
        <div ref={pipesRef} className="pipes-container" style={{ position:'relative' }} />
        <div className="score-card"><div ref={scoreRef} className="score-text">0</div></div>
      </div>
      {/* Land */}
      <div className="land animated" style={{ backgroundImage:`url(${gameAssets.land})` }} />

      {/* Start overlay - Modal style */}
      {!gameActive && !gameOver && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-cream w-[90%] max-w-md rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] overflow-hidden border-4 border-gold/30"
          >
            {/* Header */}
            <div className="bg-gold-gradient p-4 border-b-4 border-gold/40 flex justify-between items-center">
              <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
                FLAPPY BEASTS
              </h2>
              <motion.button 
                onClick={onExitGame}
                className="transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={closeIcon} alt="Close" className="w-8 h-8" />
              </motion.button>
            </div>

            {/* Body */}
            <div className="p-6 bg-gradient-to-b from-cream to-cream/80 text-center">
              <div className="mb-6">
                <div className="mb-4">
                  <img src={beastIcon} alt="Beast" className="w-20 h-20 mx-auto" />
                </div>
                <p className="text-gray-700 font-rubik text-lg leading-relaxed">
                  Guide your beast through the pipes!
                </p>
                <p className="text-gray-600 font-rubik text-sm mt-2">
                  Tap or click to make your beast fly
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gold/10 border-t-4 border-gold/30">
              <motion.button
                onClick={startGame}
                disabled={isProcessingResults || isStarting}
                className="bg-gold text-gray-800 w-full flex items-center justify-center gap-2 font-luckiest text-lg py-3 px-6 rounded-xl
                  shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] 
                  active:shadow-none active:translate-y-1
                  transition-all duration-150
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                whileHover={!isProcessingResults && !isStarting ? { scale: 1.02 } : {}}
                whileTap={!isProcessingResults && !isStarting ? { scale: 0.98 } : {}}
              >
                {isStarting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-800/30 border-t-gray-800"></div>
                    <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
                      STARTING...
                    </span>
                  </>
                ) : (
                  <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
                    {isProcessingResults ? 'PROCESSING...' : 'START GAME'}
                  </span>
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Energy Toast */}
      {showEnergyToast && (
        <div className="energy-toast">
          <span>⚠️ Your beast needs energy!</span>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOverModal && gameResult && (
        <GameOverModal
          isOpen={showGameOverModal}
          gameResult={gameResult}
          onPlayAgain={handlePlayAgain}
          onExitGame={onExitGame}
          gameName={GAME_NAME}
        />
      )}
    </div>
  );
});

FlappyBirdMiniGame.displayName = 'FlappyBirdMiniGame';

export default FlappyBirdMiniGame;
