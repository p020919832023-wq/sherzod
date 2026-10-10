import React from 'react';
import { useGame } from '../context/GameContext';
import { ACHIEVEMENTS } from '../data/gameData';
import { sound } from '../utils/sound';
import { X, Award, CheckCircle2, Lock } from 'lucide-react';

export const AchievementsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { profile, claimAchievement } = useGame();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-purple-500/40 rounded-3xl p-4 sm:p-6 text-white shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-xl">
              🎖️
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Зал Славы и Достижений</h3>
              <p className="text-xs text-slate-400">Выполняй задания и получай редкие награды</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto pr-1 my-3 space-y-2.5 max-h-[55vh]">
          {ACHIEVEMENTS.map((ach) => {
            const isCompleted = profile.achievements.includes(ach.id);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                  isCompleted
                    ? 'bg-purple-950/30 border-purple-500/50'
                    : 'bg-slate-900/60 border-slate-800 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-2xl shadow">
                    {ach.icon}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      {ach.title}
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{ach.description}</div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] font-mono">
                      <span className="text-amber-400">+{ach.rewardCoins} 🪙</span>
                      <span className="text-cyan-400">+{ach.rewardCrystals} 💎</span>
                    </div>
                  </div>
                </div>

                <div>
                  {isCompleted ? (
                    <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl">
                      Получено
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-800 text-slate-500 text-xs font-bold rounded-xl flex items-center gap-1">
                      <Lock className="w-3 h-3" /> В процессе
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
