import React from 'react';
import { useGame } from '../context/GameContext';
import { AVATARS } from '../data/gameData';
import { Volume2, VolumeX, LogIn, LogOut, Sparkles, Trophy, ShoppingBag, Award, Cloud } from 'lucide-react';

interface HeaderProps {
  onOpenShop: () => void;
  onOpenAchievements: () => void;
  onOpenLeaderboard: () => void;
}

export const CosmicHeader: React.FC<HeaderProps> = ({
  onOpenShop,
  onOpenAchievements,
  onOpenLeaderboard,
}) => {
  const { profile, firebaseUser, soundEnabled, toggleSound, login, logout } = useGame();

  const currentAvatar = AVATARS.find((a) => a.id === profile.avatar) || AVATARS[0];
  const requiredXp = profile.level * 150;
  const xpPercent = Math.min(100, Math.round((profile.xp / requiredXp) * 100));

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-cyan-500/20 px-3 sm:px-6 py-3 sticky top-0 z-40 text-white shadow-xl shadow-cyan-950/20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Cadet Profile */}
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentAvatar.bgGradient} flex items-center justify-center text-2xl shadow-lg border border-white/20`}
          >
            {currentAvatar.emoji}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-white">
                {firebaseUser?.displayName || profile.displayName}
              </span>
              <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold rounded-full">
                Ранг {profile.level}
              </span>
            </div>

            {/* XP progress bar */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-24 sm:w-32 h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {profile.xp}/{requiredXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* Center: Currency */}
        <div className="flex items-center gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl px-3.5 py-1.5 shadow-inner">
          <div className="flex items-center gap-1.5">
            <span className="text-lg">🪙</span>
            <span className="font-mono font-black text-amber-400 text-sm sm:text-base">
              {profile.coins}
            </span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-lg">💎</span>
            <span className="font-mono font-black text-cyan-400 text-sm sm:text-base">
              {profile.crystals}
            </span>
          </div>
        </div>

        {/* Right: Modals & Actions */}
        <div className="flex items-center gap-2">
          {/* Shop button */}
          <button
            onClick={onOpenShop}
            title="Магазин и Кастомизация"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Магазин</span>
          </button>

          {/* Achievements button */}
          <button
            onClick={onOpenAchievements}
            title="Достижения"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Награды</span>
          </button>

          {/* Leaderboard button */}
          <button
            onClick={onOpenLeaderboard}
            title="Таблица рекордов"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Рекорды</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Google Sign-in */}
          {firebaseUser ? (
            <div className="flex items-center gap-2 pl-1">
              {firebaseUser.photoURL ? (
                <img
                  src={firebaseUser.photoURL}
                  alt={firebaseUser.displayName || 'Pilot'}
                  className="w-8 h-8 rounded-full border border-cyan-400"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-xs font-bold">
                  {firebaseUser.displayName?.charAt(0) || 'U'}
                </div>
              )}
              <button
                onClick={logout}
                title="Выйти"
                className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 rounded-xl transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={login}
              title="Войти через Google для сохранения прогресса"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs sm:text-sm font-bold transition shadow-md shadow-cyan-900/40 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Вход с Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
