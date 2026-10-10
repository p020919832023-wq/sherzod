import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { sound } from '../utils/sound';
import { X, Trophy, Rocket, Zap, Brain, Sparkles } from 'lucide-react';
import { AVATARS } from '../data/gameData';

export const LeaderboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { leaderboards, profile } = useGame();
  const [activeTab, setActiveTab] = useState<'interceptor' | 'math' | 'trivia' | 'memory'>('interceptor');

  const tabs = [
    { id: 'interceptor', label: 'Перехватчик', icon: '🚀' },
    { id: 'math', label: 'Вортекс', icon: '🌀' },
    { id: 'trivia', label: 'Викторина', icon: '🎓' },
    { id: 'memory', label: 'Матрица', icon: '💡' },
  ];

  const currentScores = leaderboards[activeTab] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 text-white shadow-2xl max-h-[85vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xl">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Галактическая Таблица Рекордов</h3>
              <p className="text-xs text-slate-400">Лучшие космические исследователи</p>
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

        {/* Tabs */}
        <div className="flex gap-1.5 my-3 bg-slate-950/60 p-1 rounded-2xl border border-slate-800">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(t.id as any);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === t.id
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* List of top pilots */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 space-y-2 max-h-[50vh]">
          {currentScores.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              <div className="text-4xl mb-2">🛸</div>
              В этой категории пока нет записей. Сыграй и стань первым в списке чемпионов!
            </div>
          ) : (
            currentScores.map((entry, idx) => {
              const avatar = AVATARS.find((a) => a.id === entry.avatar) || AVATARS[0];
              const isMe = entry.userId === profile.uid;

              let rankBadge = `${idx + 1}`;
              if (idx === 0) rankBadge = '🥇';
              else if (idx === 1) rankBadge = '🥈';
              else if (idx === 2) rankBadge = '🥉';

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    isMe
                      ? 'bg-cyan-950/40 border-cyan-400/60 ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 text-center font-black text-sm text-amber-400">
                      {rankBadge}
                    </div>

                    <div
                      className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${avatar.bgGradient} flex items-center justify-center text-lg shadow`}
                    >
                      {avatar.emoji}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        {entry.playerName}
                        {isMe && <span className="text-[10px] text-cyan-300 font-mono">(Ты)</span>}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {new Date(entry.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-amber-400 text-base">
                      {entry.score}
                    </div>
                    <div className="text-[10px] text-slate-400">очков</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
