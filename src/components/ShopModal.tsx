import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { AVATARS, PETS, GEAR } from '../data/gameData';
import { sound } from '../utils/sound';
import { X, Check, Lock, Sparkles, Shield, User, ShoppingBag } from 'lucide-react';

export const ShopModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    profile,
    unlockAvatar,
    equipAvatar,
    unlockPet,
    equipPet,
    unlockGear,
  } = useGame();

  const [tab, setTab] = useState<'heroes' | 'pets' | 'gear'>('heroes');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 text-white shadow-2xl max-h-[90vh] flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl">
              🛍️
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Космический Арсенал</h3>
              <p className="text-xs text-slate-400">Герои, питомцы и улучшенная экипировка</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
              <span>🪙</span>
              <span className="font-mono font-bold text-amber-400 text-sm">{profile.coins}</span>
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
        </div>

        {/* Tabs */}
        <div className="flex gap-2 my-3">
          <button
            onClick={() => {
              sound.playClick();
              setTab('heroes');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'heroes'
                ? 'bg-cyan-500 text-slate-950'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> Герои
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('pets');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'pets'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4" /> Питомцы
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setTab('gear');
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === 'gear'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Shield className="w-4 h-4" /> Экипировка
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[50vh]">
          {tab === 'heroes' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVATARS.map((avatar) => {
                const isUnlocked = profile.unlockedAvatars.includes(avatar.id);
                const isEquipped = profile.avatar === avatar.id;

                return (
                  <div
                    key={avatar.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${
                      isEquipped
                        ? 'border-cyan-400 bg-cyan-950/40'
                        : isUnlocked
                        ? 'border-slate-700 bg-slate-800/50'
                        : 'border-slate-800 bg-slate-900/40 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${avatar.bgGradient} flex items-center justify-center text-2xl shadow`}
                      >
                        {avatar.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{avatar.name}</div>
                        <div className="text-[11px] text-cyan-300">{avatar.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{avatar.description}</div>
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="px-2.5 py-1 bg-cyan-500 text-slate-950 text-xs font-black rounded-xl">
                          Выбран
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => equipAvatar(avatar.id)}
                          className="px-3 py-1 bg-slate-700 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Надеть
                        </button>
                      ) : (
                        <button
                          onClick={() => unlockAvatar(avatar.id)}
                          disabled={profile.coins < avatar.cost}
                          className={`px-3 py-1 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer ${
                            profile.coins >= avatar.cost
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3 h-3" /> {avatar.cost} 🪙
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'pets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PETS.map((pet) => {
                const isUnlocked = profile.unlockedPets.includes(pet.id);
                const isEquipped = profile.equippedPet === pet.id;

                return (
                  <div
                    key={pet.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${
                      isEquipped
                        ? 'border-amber-400 bg-amber-950/40'
                        : isUnlocked
                        ? 'border-slate-700 bg-slate-800/50'
                        : 'border-slate-800 bg-slate-900/40 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${pet.color} flex items-center justify-center text-2xl shadow`}
                      >
                        {pet.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{pet.name}</div>
                        <div className="text-[11px] text-amber-300">{pet.bonus}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{pet.description}</div>
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="px-2.5 py-1 bg-amber-500 text-slate-950 text-xs font-black rounded-xl">
                          С тобой
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => equipPet(pet.id)}
                          className="px-3 py-1 bg-slate-700 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Взять
                        </button>
                      ) : (
                        <button
                          onClick={() => unlockPet(pet.id)}
                          disabled={profile.coins < pet.cost}
                          className={`px-3 py-1 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer ${
                            profile.coins >= pet.cost
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3 h-3" /> {pet.cost} 🪙
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {tab === 'gear' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {GEAR.map((item) => {
                const isUnlocked = profile.unlockedGear.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition ${
                      isUnlocked
                        ? 'border-purple-400 bg-purple-950/40'
                        : 'border-slate-800 bg-slate-900/40 opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-900/60 border border-purple-500/40 flex items-center justify-center text-2xl shadow">
                        {item.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{item.name}</div>
                        <div className="text-[11px] text-purple-300">{item.bonus}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{item.description}</div>
                      </div>
                    </div>

                    <div>
                      {isUnlocked ? (
                        <span className="px-2.5 py-1 bg-purple-500 text-white text-xs font-black rounded-xl">
                          Активно
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            if (profile.coins >= item.cost) {
                              unlockGear(item.id);
                            }
                          }}
                          disabled={profile.coins < item.cost}
                          className={`px-3 py-1 text-xs font-bold rounded-xl flex items-center gap-1 transition cursor-pointer ${
                            profile.coins >= item.cost
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Lock className="w-3 h-3" /> {item.cost} 🪙
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
