import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';
import { ArrowLeft, Play, RotateCcw, Sparkles, Brain, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

const NODES = [
  { id: 0, label: 'Альфа', color: 'bg-rose-500 shadow-rose-500/50', border: 'border-rose-400', active: 'bg-rose-300 ring-8 ring-rose-400' },
  { id: 1, label: 'Бета', color: 'bg-cyan-500 shadow-cyan-500/50', border: 'border-cyan-400', active: 'bg-cyan-200 ring-8 ring-cyan-400' },
  { id: 2, label: 'Гамма', color: 'bg-amber-500 shadow-amber-500/50', border: 'border-amber-400', active: 'bg-amber-200 ring-8 ring-amber-400' },
  { id: 3, label: 'Дельта', color: 'bg-emerald-500 shadow-emerald-500/50', border: 'border-emerald-400', active: 'bg-emerald-200 ring-8 ring-emerald-400' },
];

export const MemoryMatrix: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { addRewards, claimAchievement } = useGame();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userStep, setUserStep] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('Запомни световую последовательность!');

  const startNewGame = () => {
    sound.playClick();
    setScore(0);
    setRound(1);
    setUserStep(0);
    setGameState('playing');

    // First sequence of 3 nodes
    const firstSeq = [
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
      Math.floor(Math.random() * 4),
    ];
    setSequence(firstSeq);
    playSequence(firstSeq);
  };

  const playSequence = (seq: number[]) => {
    setIsShowingSequence(true);
    setMessage('Смотри и слушай внимательно... 👂✨');

    let idx = 0;
    const interval = setInterval(() => {
      if (idx >= seq.length) {
        clearInterval(interval);
        setActiveNode(null);
        setIsShowingSequence(false);
        setUserStep(0);
        setMessage('Твоя очередь повторить! 👆');
        return;
      }

      const nodeIndex = seq[idx];
      setActiveNode(nodeIndex);
      sound.playNote(nodeIndex);

      setTimeout(() => {
        setActiveNode(null);
      }, 350);

      idx++;
    }, 650);
  };

  const handleNodeClick = (nodeId: number) => {
    if (isShowingSequence || gameState !== 'playing') return;

    sound.playNote(nodeId);
    setActiveNode(nodeId);
    setTimeout(() => setActiveNode(null), 250);

    // Validate step
    if (sequence[userStep] === nodeId) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Successfully finished current sequence
      if (nextStep === sequence.length) {
        sound.playCorrect();
        confetti({ particleCount: 40, spread: 60 });
        const points = 100 * round;
        setScore((s) => s + points);
        const nextRound = round + 1;
        setRound(nextRound);

        if (nextRound >= 8) {
          claimAchievement('memory_master');
        }

        setMessage(`Отлично! Раунд ${nextRound}! 🚀`);

        // Add 1 random node to sequence
        const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(nextSeq);

        setTimeout(() => {
          playSequence(nextSeq);
        }, 1000);
      }
    } else {
      // Mistake!
      sound.playWrong();
      endGame(score);
    }
  };

  const endGame = (finalScore: number) => {
    setGameState('gameover');
    const earnedCoins = Math.round(finalScore / 3);
    const earnedXp = Math.round(finalScore / 2);
    const earnedCrystals = round >= 6 ? 5 : 1;
    addRewards(earnedXp, earnedCoins, earnedCrystals, 'memory', finalScore);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto p-3 sm:p-6 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full bg-slate-900/80 backdrop-blur border border-pink-500/30 rounded-2xl p-3 mb-4 text-white shadow-xl shadow-pink-950/40">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-pink-300 rounded-xl text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-400">
            Раунд: <span className="text-pink-400 font-bold">{round}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl">
            <span className="text-xs text-slate-400">Счёт:</span>
            <span className="text-lg font-black text-amber-400 font-mono">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full bg-gradient-to-b from-slate-900/90 to-slate-950 border-2 border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[460px] flex flex-col items-center justify-between">
        {gameState === 'ready' && (
          <div className="flex flex-col items-center justify-center text-center my-auto py-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-xl shadow-pink-500/30 animate-pulse">
              💡
            </div>
            <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-pink-300 via-rose-200 to-amber-300 bg-clip-text text-transparent mb-2">
              Неоновая Матрица Памяти
            </h2>
            <p className="text-slate-300 text-sm max-w-sm mb-6 leading-relaxed">
              Тренируй внимание и музыкальную память! Следи за вспышками неоновых узлов и точно повторяй мелодию за квантовым компьютером.
            </p>

            <button
              onClick={startNewGame}
              className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black rounded-2xl shadow-xl shadow-pink-500/40 transform active:scale-95 transition text-lg flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" /> Активировать Матрицу!
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="flex flex-col items-center justify-center w-full my-auto">
            <div className="text-center font-bold text-pink-300 mb-6 text-sm sm:text-base animate-pulse">
              {message}
            </div>

            {/* 2x2 Grid of Neon Crystals */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-xs sm:max-w-sm aspect-square">
              {NODES.map((node) => {
                const isActive = activeNode === node.id;
                return (
                  <button
                    key={node.id}
                    disabled={isShowingSequence}
                    onClick={() => handleNodeClick(node.id)}
                    className={`rounded-3xl border-4 transition-all duration-150 transform active:scale-90 flex flex-col items-center justify-center shadow-lg cursor-pointer ${
                      node.border
                    } ${isActive ? node.active : `${node.color} opacity-85 hover:opacity-100 hover:scale-102`}`}
                  >
                    <span className="text-white font-black text-lg drop-shadow">{node.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="flex flex-col items-center justify-center text-center my-auto py-6">
            <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/50 rounded-2xl flex items-center justify-center text-3xl mb-3">
              ⚡
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-rose-400 mb-1">Сбой Синхронизации</h3>
            <p className="text-slate-300 text-sm mb-4">Ты прошел {round - 1} раундов на отличной скорости!</p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400">Очки</div>
                <div className="text-2xl font-black text-pink-400 font-mono">{score}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400">Награда</div>
                <div className="text-2xl font-black text-amber-400 font-mono">+{Math.round(score / 3)} 🪙</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startNewGame}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 text-white font-bold rounded-xl shadow-lg shadow-pink-500/30 flex items-center gap-2 transition cursor-pointer"
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
                В Штаб
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
