import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';
import { ArrowLeft, Play, RotateCcw, Volume2, VolumeX, Shield, Zap, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Asteroid {
  x: number;
  y: number;
  size: number;
  speed: number;
  hp: number;
  rotation: number;
  rotSpeed: number;
  color: string;
}

interface CrystalDrop {
  x: number;
  y: number;
  speed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export const SpaceInterceptor: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { addRewards, profile } = useGame();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [shieldActive, setShieldActive] = useState(false);
  const [combo, setCombo] = useState(0);

  // Ship position
  const shipPosRef = useRef({ x: 300, y: 480, targetX: 300 });
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const crystalsRef = useRef<CrystalDrop[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const lastSpawnRef = useRef(0);
  const lastShootRef = useRef(0);
  const keysRef = useRef<{ left: boolean; right: boolean; shoot: boolean }>({
    left: false,
    right: false,
    shoot: false,
  });

  const animationFrameRef = useRef<number | null>(null);

  const hasExtraShield = profile.equippedPet === 'pet_robot' || profile.unlockedGear.includes('energy_shield');

  // Initialize stars background
  useEffect(() => {
    const list: Star[] = [];
    for (let i = 0; i < 70; i++) {
      list.push({
        x: Math.random() * 600,
        y: Math.random() * 600,
        speed: 0.5 + Math.random() * 2,
        size: 1 + Math.random() * 2,
      });
    }
    starsRef.current = list;
  }, []);

  const spawnParticles = (x: number, y: number, color = '#f59e0b', count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        color,
      });
    }
  };

  const startGame = () => {
    sound.playClick();
    setScore(0);
    setLives(hasExtraShield ? 4 : 3);
    setShieldActive(hasExtraShield);
    setCombo(0);
    bulletsRef.current = [];
    asteroidsRef.current = [];
    crystalsRef.current = [];
    particlesRef.current = [];
    shipPosRef.current = { x: 300, y: 500, targetX: 300 };
    setGameState('playing');
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        keysRef.current.shoot = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      }
      if (e.key === ' ' || e.key === 'Spacebar') {
        keysRef.current.shoot = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game loop
  const updateLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear frame with deep cosmic gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#060814');
    bgGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Starfield
    ctx.fillStyle = '#ffffff';
    starsRef.current.forEach((st) => {
      st.y += st.speed;
      if (st.y > height) {
        st.y = 0;
        st.x = Math.random() * width;
      }
      ctx.globalAlpha = Math.min(1, st.speed / 2);
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    if (gameState === 'playing') {
      const ship = shipPosRef.current;

      // Handle keyboard steering
      const speed = profile.unlockedGear.includes('turbo_thrusters') ? 7 : 5.5;
      if (keysRef.current.left) ship.x -= speed;
      if (keysRef.current.right) ship.x += speed;

      // Smooth towards targetX (from touch or drag)
      ship.x += (ship.targetX - ship.x) * 0.15;
      ship.x = Math.max(30, Math.min(width - 30, ship.x));

      // Handle shooting
      const now = performance.now();
      if ((keysRef.current.shoot || keysRef.current.left || keysRef.current.right) && now - lastShootRef.current > 200) {
        lastShootRef.current = now;
        sound.playLaser();
        const hasDoubleBlaster = profile.unlockedGear.includes('laser_blaster_v2');
        if (hasDoubleBlaster) {
          bulletsRef.current.push({ x: ship.x - 12, y: ship.y - 20, vx: 0, vy: -10 });
          bulletsRef.current.push({ x: ship.x + 12, y: ship.y - 20, vx: 0, vy: -10 });
        } else {
          bulletsRef.current.push({ x: ship.x, y: ship.y - 25, vx: 0, vy: -10 });
        }
      }

      // Spawn asteroids
      if (now - lastSpawnRef.current > Math.max(700, 1500 - score * 0.4)) {
        lastSpawnRef.current = now;
        const size = 18 + Math.random() * 26;
        const colors = ['#a855f7', '#06b6d4', '#eab308', '#ec4899', '#f97316'];
        asteroidsRef.current.push({
          x: 20 + Math.random() * (width - 40),
          y: -40,
          size,
          speed: 1.8 + Math.random() * 2.2 + (score > 1000 ? 0.8 : 0),
          hp: size > 32 ? 2 : 1,
          rotation: 0,
          rotSpeed: (Math.random() - 0.5) * 0.08,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }

      // Update bullets
      for (let i = bulletsRef.current.length - 1; i >= 0; i--) {
        const b = bulletsRef.current[i];
        b.y += b.vy;

        // Render bullet
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 10;
        ctx.fillRect(b.x - 3, b.y, 6, 16);
        ctx.shadowBlur = 0;

        if (b.y < -20) {
          bulletsRef.current.splice(i, 1);
        }
      }

      // Update asteroids
      for (let i = asteroidsRef.current.length - 1; i >= 0; i--) {
        const ast = asteroidsRef.current[i];
        ast.y += ast.speed;
        ast.rotation += ast.rotSpeed;

        // Collision with bullets
        for (let j = bulletsRef.current.length - 1; j >= 0; j--) {
          const b = bulletsRef.current[j];
          const dist = Math.hypot(b.x - ast.x, b.y - ast.y);
          if (dist < ast.size + 4) {
            bulletsRef.current.splice(j, 1);
            ast.hp--;
            spawnParticles(b.x, b.y, '#38bdf8', 5);

            if (ast.hp <= 0) {
              sound.playExplosion();
              spawnParticles(ast.x, ast.y, ast.color, 16);
              // Drop crystal chance
              if (Math.random() < 0.4) {
                crystalsRef.current.push({ x: ast.x, y: ast.y, speed: 2.2 });
              }
              asteroidsRef.current.splice(i, 1);
              setScore((s) => s + 50);
              setCombo((c) => c + 1);
              break;
            }
          }
        }

        // Collision with ship
        const distToShip = Math.hypot(ship.x - ast.x, ship.y - ast.y);
        if (distToShip < ast.size + 18) {
          sound.playExplosion();
          spawnParticles(ship.x, ship.y, '#ef4444', 20);
          asteroidsRef.current.splice(i, 1);

          if (shieldActive) {
            setShieldActive(false);
          } else {
            setLives((l) => {
              const next = l - 1;
              if (next <= 0) {
                endGame(score);
              }
              return next;
            });
          }
          continue;
        }

        // Render asteroid
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.rotate(ast.rotation);
        ctx.fillStyle = ast.color;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const pts = 6;
        for (let p = 0; p < pts; p++) {
          const a = (p / pts) * Math.PI * 2;
          const r = ast.size * (0.8 + ((p % 2) * 0.4));
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Offscreen bottom
        if (ast.y > height + 50) {
          asteroidsRef.current.splice(i, 1);
          setCombo(0);
        }
      }

      // Update Crystals
      for (let i = crystalsRef.current.length - 1; i >= 0; i--) {
        const cr = crystalsRef.current[i];
        cr.y += cr.speed;

        // Collect
        const dist = Math.hypot(ship.x - cr.x, ship.y - cr.y);
        if (dist < 32) {
          sound.playCoin();
          spawnParticles(cr.x, cr.y, '#facc15', 10);
          setScore((s) => s + 100);
          crystalsRef.current.splice(i, 1);
          continue;
        }

        // Render Crystal
        ctx.save();
        ctx.translate(cr.x, cr.y);
        ctx.fillStyle = '#facc15';
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(8, 0);
        ctx.lineTo(0, 10);
        ctx.lineTo(-8, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        if (cr.y > height + 20) {
          crystalsRef.current.splice(i, 1);
        }
      }

      // Render Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.03;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1.0;

      // Draw Spaceship
      ctx.save();
      ctx.translate(ship.x, ship.y);

      // Jet flame
      const flameHeight = 12 + Math.random() * 8;
      const flameGrad = ctx.createLinearGradient(0, 15, 0, 15 + flameHeight);
      flameGrad.addColorStop(0, '#f97316');
      flameGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-8, 15);
      ctx.lineTo(8, 15);
      ctx.lineTo(0, 15 + flameHeight);
      ctx.closePath();
      ctx.fill();

      // Shield aura if active
      if (shieldActive) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(0, 0, 32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Hull
      ctx.fillStyle = '#e0e7ff';
      ctx.beginPath();
      ctx.moveTo(0, -26);
      ctx.lineTo(18, 15);
      ctx.lineTo(8, 10);
      ctx.lineTo(0, 14);
      ctx.lineTo(-8, 10);
      ctx.lineTo(-18, 15);
      ctx.closePath();
      ctx.fill();

      // Cockpit visor
      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(0, -5, 6, 0, Math.PI * 2);
      ctx.fill();

      // Wing glow
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(-18, 5, 4, 10);
      ctx.fillRect(14, 5, 4, 10);

      ctx.restore();
    }

    animationFrameRef.current = requestAnimationFrame(updateLoop);
  }, [gameState, score, shieldActive, profile, hasExtraShield]);

  const endGame = (finalScore: number) => {
    setGameState('gameover');
    sound.playWrong();
    const earnedCoins = Math.round(finalScore / 10);
    const earnedXp = Math.round(finalScore / 5);
    const earnedCrystals = finalScore > 1000 ? 5 : 1;
    addRewards(earnedXp, earnedCoins, earnedCrystals, 'interceptor', finalScore);
  };

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [updateLoop]);

  // Touch and mouse steering
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'playing') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 600;
    shipPosRef.current.targetX = x;
    keysRef.current.shoot = true;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    handlePointerMove(e);
  };

  const handlePointerUp = () => {
    keysRef.current.shoot = false;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto p-2 sm:p-4 select-none">
      {/* Top HUD */}
      <div className="flex items-center justify-between w-full max-w-[600px] bg-slate-900/80 backdrop-blur border border-cyan-500/30 rounded-2xl p-3 mb-3 text-white shadow-lg shadow-cyan-950/40">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Назад в штаб
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Счёт:</span>
            <span className="text-xl font-black text-amber-400 font-mono">{score}</span>
          </div>

          <div className="flex items-center gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <span
                key={i}
                className={`text-lg transition-transform ${
                  i < lives ? 'text-rose-500 scale-100' : 'text-slate-700 scale-90'
                }`}
              >
                ❤️
              </span>
            ))}
          </div>

          {shieldActive && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-cyan-950/70 border border-cyan-400 text-cyan-300 text-xs rounded-lg animate-pulse">
              <Shield className="w-3.5 h-3.5" /> Щит
            </div>
          )}
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative w-full max-w-[600px] aspect-[1/1] rounded-3xl overflow-hidden border-2 border-cyan-500/40 shadow-2xl shadow-cyan-900/50 bg-black">
        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          className="w-full h-full cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
        />

        {/* Start / Ready Overlay */}
        {gameState === 'ready' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-xl shadow-cyan-500/30 animate-bounce">
              🚀
            </div>
            <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-300 bg-clip-text text-transparent mb-2">
              Космический Перехватчик
            </h2>
            <p className="text-slate-300 text-sm max-w-sm mb-6">
              Управляй звёздным истребителем! Уничтожай астероиды, собирай сияющие кристаллы и побеждай угрозы Галактики!
            </p>

            <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-3 mb-6 text-xs text-slate-300 flex flex-col gap-1 max-w-xs text-left">
              <div>🎮 <b>Управление:</b> Стрелки ⬅️ ➡️ или клавиши A / D</div>
              <div>⚡ <b>Стрельба:</b> Пробел или удерживание на экране</div>
              <div>📱 <b>На планшете:</b> Просто води пальцем по экрану!</div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold rounded-2xl shadow-xl shadow-cyan-500/40 transform active:scale-95 transition text-lg flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" /> Начать Полет!
            </button>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/50 rounded-2xl flex items-center justify-center text-3xl mb-3">
              💥
            </div>
            <h3 className="text-2xl font-black text-rose-400 mb-1">Миссия Завершена</h3>
            <p className="text-slate-400 text-sm mb-4">Корабль возвращается на орбитальную базу для ремонта.</p>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full max-w-xs mb-6 grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 rounded-xl p-2.5">
                <div className="text-xs text-slate-400">Очки</div>
                <div className="text-xl font-black text-amber-400 font-mono">{score}</div>
              </div>
              <div className="bg-slate-800/60 rounded-xl p-2.5">
                <div className="text-xs text-slate-400">Награда</div>
                <div className="text-xl font-black text-emerald-400 font-mono">+{Math.round(score / 10)} 🪙</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 font-bold rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Играть Снова
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  onBack();
                }}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition cursor-pointer"
              >
                В Главное Меню
              </button>
            </div>
          </div>
        )}
      </div>

      {/* On-screen Mobile / Tablet Controls */}
      <div className="flex items-center justify-between w-full max-w-[600px] mt-3 gap-2 sm:hidden">
        <button
          onPointerDown={() => {
            keysRef.current.left = true;
          }}
          onPointerUp={() => {
            keysRef.current.left = false;
          }}
          className="flex-1 py-4 bg-slate-800/80 active:bg-cyan-600 text-white rounded-2xl font-bold text-lg border border-slate-700"
        >
          ⬅️ Влево
        </button>
        <button
          onPointerDown={() => {
            keysRef.current.shoot = true;
          }}
          onPointerUp={() => {
            keysRef.current.shoot = false;
          }}
          className="flex-1 py-4 bg-rose-600/80 active:bg-rose-500 text-white rounded-2xl font-bold text-lg border border-rose-500"
        >
          ⚡ Залп
        </button>
        <button
          onPointerDown={() => {
            keysRef.current.right = true;
          }}
          onPointerUp={() => {
            keysRef.current.right = false;
          }}
          className="flex-1 py-4 bg-slate-800/80 active:bg-cyan-600 text-white rounded-2xl font-bold text-lg border border-slate-700"
        >
          Вправо ➡️
        </button>
      </div>
    </div>
  );
};
