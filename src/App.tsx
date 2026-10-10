import React, { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { CosmicHeader } from './components/CosmicHeader';
import { PetCompanion } from './components/PetCompanion';
import { ShopModal } from './components/ShopModal';
import { AchievementsModal } from './components/AchievementsModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { SpaceInterceptor } from './components/games/SpaceInterceptor';
import { MathVortex } from './components/games/MathVortex';
import { CosmoTrivia } from './components/games/CosmoTrivia';
import { MemoryMatrix } from './components/games/MemoryMatrix';
import { AVATARS, PETS } from './data/gameData';
import { sound } from './utils/sound';
import {
  Rocket,
  Zap,
  Brain,
  Sparkles,
  Play,
  Award,
  ChevronRight,
  Shield,
  Star,
  Compass,
  Flame,
  Check,
} from 'lucide-react';

function GameDashboard() {
  const { profile, recentNotice, clearNotice } = useGame();

  const [activeGame, setActiveGame] = useState<'interceptor' | 'math' | 'trivia' | 'memory' | null>(null);
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const currentAvatar = AVATARS.find((a) => a.id === profile.avatar) || AVATARS[0];
  const currentPet = PETS.find((p) => p.id === profile.equippedPet) || PETS[0];

  const handleLaunchGame = (gameId: 'interceptor' | 'math' | 'trivia' | 'memory') => {
    sound.playClick();
    setActiveGame(gameId);
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Background Star Nebulae Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] bg-purple-600/15 rounded-full blur-[140px]" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px]" />
      </div>

      {/* Top Header */}
      <CosmicHeader
        onOpenShop={() => {
          sound.playClick();
          setShowShop(true);
        }}
        onOpenAchievements={() => {
          sound.playClick();
          setShowAchievements(true);
        }}
        onOpenLeaderboard={() => {
          sound.playClick();
          setShowLeaderboard(true);
        }}
      />

      {/* Notice Banner */}
      {recentNotice && (
        <div className="z-30 w-full max-w-2xl mx-auto px-4 mt-3">
          <div className="bg-gradient-to-r from-cyan-950/95 via-blue-950/95 to-slate-900/95 border-2 border-cyan-400 text-cyan-200 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs sm:text-sm font-bold shadow-xl shadow-cyan-950/50 animate-bounce">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{recentNotice}</span>
            </div>
            <button
              onClick={clearNotice}
              className="text-slate-400 hover:text-white ml-2 text-base font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 z-10 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">
        {/* If inside a mini-game */}
        {activeGame === 'interceptor' && (
          <SpaceInterceptor onBack={() => setActiveGame(null)} />
        )}
        {activeGame === 'math' && (
          <MathVortex onBack={() => setActiveGame(null)} />
        )}
        {activeGame === 'trivia' && (
          <CosmoTrivia onBack={() => setActiveGame(null)} />
        )}
        {activeGame === 'memory' && (
          <MemoryMatrix onBack={() => setActiveGame(null)} />
        )}

        {/* If in Main Headquarters / Game Selector */}
        {!activeGame && (
          <div className="space-y-6">
            {/* Hero Welcome & Cadet Banner */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-cyan-500/30 bg-gradient-to-r from-slate-900/90 via-indigo-950/70 to-slate-900/90 p-5 sm:p-8 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4 sm:gap-6 text-center sm:text-left flex-col sm:flex-row">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${currentAvatar.bgGradient} flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-2 border-white/20`}
                  >
                    {currentAvatar.emoji}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-xs uppercase tracking-widest text-cyan-400 font-extrabold">
                        Звездная База «Орион»
                      </span>
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-bold rounded-md border border-amber-500/30">
                        Кадет 10 лет
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-4xl font-black text-white mt-1">
                      Добро пожаловать, {profile.displayName}! 🌟
                    </h1>

                    <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-lg leading-relaxed">
                      Выбирай космическую миссию, тренируй реакцию, скорость ума и эрудицию, собирай звёздные сокровища и открывай легендарных героев!
                    </p>
                  </div>
                </div>

                {/* Quick stats badge */}
                <div className="flex sm:flex-col gap-2 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🐾 Питомец:</span>
                    <span className="text-amber-400 font-bold text-xs">
                      {currentPet.name} {currentPet.emoji}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🛡️ Ранг:</span>
                    <span className="text-cyan-400 font-mono font-bold text-xs">
                      Уровень {profile.level}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Exciting Game Portals Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" /> Сектора Космических Игр
                </h2>
                <span className="text-xs text-slate-400">4 уникальных режима</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Space Interceptor */}
                <div
                  onClick={() => handleLaunchGame('interceptor')}
                  className="group relative rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-b from-slate-900/90 to-cyan-950/40 p-5 shadow-xl hover:shadow-cyan-500/20 transition-all duration-200 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                      🚀
                    </div>
                    <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1">
                      Аркадный Бой
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition">
                      Космический Перехватчик
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Управляй истребителем, сбивай лазерами астероиды, собирай кристаллы и уклоняйся от угроз!
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-cyan-300 font-semibold">Реакция & Ловкость</span>
                    <div className="w-8 h-8 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black group-hover:bg-cyan-400 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* 2. Math Vortex */}
                <div
                  onClick={() => handleLaunchGame('math')}
                  className="group relative rounded-3xl border-2 border-purple-500/40 bg-gradient-to-b from-slate-900/90 to-purple-950/40 p-5 shadow-xl hover:shadow-purple-500/20 transition-all duration-200 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                      🌀
                    </div>
                    <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
                      Логика & Скорость
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-purple-300 transition">
                      Математический Вортекс
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Стабилизируй квантовый реактор с помощью быстрого устного счета и умножения! Серии комбо!
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-purple-300 font-semibold">Устный счёт 4-5 класс</span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-black group-hover:bg-purple-400 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* 3. Cosmo Trivia */}
                <div
                  onClick={() => handleLaunchGame('trivia')}
                  className="group relative rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900/90 to-emerald-950/40 p-5 shadow-xl hover:shadow-emerald-500/20 transition-all duration-200 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                      🎓
                    </div>
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                      Эрудиция & Наука
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-emerald-300 transition">
                      Галактическая Викторина
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Узнавай потрясающие факты о космосе, планетах, океанах и технологиях! Подсказки 50/50!
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-emerald-300 font-semibold">Ум & Факты</span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black group-hover:bg-emerald-400 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* 4. Memory Matrix */}
                <div
                  onClick={() => handleLaunchGame('memory')}
                  className="group relative rounded-3xl border-2 border-pink-500/40 bg-gradient-to-b from-slate-900/90 to-pink-950/40 p-5 shadow-xl hover:shadow-pink-500/20 transition-all duration-200 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                      💡
                    </div>
                    <div className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-1">
                      Память & Внимание
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-pink-300 transition">
                      Неоновая Матрица Памяти
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                      Запоминай цветные световые и звуковые последовательности неоновых кристаллов!
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-pink-300 font-semibold">Фокус & Внимание</span>
                    <div className="w-8 h-8 rounded-xl bg-pink-500 text-white flex items-center justify-center font-black group-hover:bg-pink-400 transition">
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cadet Mission Card (Daily Quest) */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white">
                    Задание дня: Испытание Скорости
                  </div>
                  <div className="text-xs text-slate-400">
                    Сыграй в любой из режимов и набери от 300 очков. Награда ждет в Зале Достижений!
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    setShowAchievements(true);
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" /> Посмотреть Награды
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Pet Companion */}
      {!activeGame && <PetCompanion />}

      {/* Modals */}
      {showShop && <ShopModal onClose={() => setShowShop(false)} />}
      {showAchievements && <AchievementsModal onClose={() => setShowAchievements(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameDashboard />
    </GameProvider>
  );
}
