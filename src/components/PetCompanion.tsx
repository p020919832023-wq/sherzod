import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { PETS } from '../data/gameData';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { Sparkles, Heart } from 'lucide-react';

const PET_QUOTES = [
  'Готов к новым космическим рекордам! 🚀',
  'Ты самый умный пилот в Галактике! 🌟',
  'Ура, приключения ждут нас! ✨',
  'Мурр! Лазеры заряжены! 🐾',
  'Давай победим ещё разок! 🔥',
];

export const PetCompanion: React.FC = () => {
  const { profile, addRewards } = useGame();
  const [bubble, setBubble] = useState<string | null>(null);
  const [lastPetTime, setLastPetTime] = useState(0);

  const currentPet = PETS.find((p) => p.id === profile.equippedPet) || PETS[0];

  const handlePetClick = () => {
    sound.playClick();
    const randomQuote = PET_QUOTES[Math.floor(Math.random() * PET_QUOTES.length)];
    setBubble(randomQuote);

    const now = Date.now();
    // Every 30 seconds, child gets a surprise coin by petting!
    if (now - lastPetTime > 30000) {
      setLastPetTime(now);
      sound.playCoin();
      confetti({ particleCount: 25, spread: 45, origin: { x: 0.9, y: 0.85 } });
      addRewards(15, 10, 0);
      setBubble('Питомец нашел для тебя космическую монетку! +10 🪙');
    }

    setTimeout(() => {
      setBubble(null);
    }, 4000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end pointer-events-none select-none">
      {/* Speech bubble */}
      {bubble && (
        <div className="mb-2 max-w-xs bg-slate-900/95 border-2 border-amber-400 text-amber-200 text-xs font-bold py-2 px-3 rounded-2xl shadow-xl shadow-amber-950/40 pointer-events-auto animate-bounce">
          {bubble}
        </div>
      )}

      {/* Floating Pet Card */}
      <button
        onClick={handlePetClick}
        className="pointer-events-auto flex items-center gap-2 p-2.5 bg-slate-900/90 hover:bg-slate-800/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl shadow-xl shadow-cyan-950/60 transition-transform transform active:scale-90 hover:scale-105 cursor-pointer group"
      >
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${currentPet.color} flex items-center justify-center text-2xl shadow-md`}
        >
          {currentPet.emoji}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-white flex items-center gap-1">
            {currentPet.name}
            <Sparkles className="w-3 h-3 text-amber-400" />
          </div>
          <div className="text-[10px] text-cyan-300 font-mono">{currentPet.bonus}</div>
        </div>
      </button>
    </div>
  );
};
