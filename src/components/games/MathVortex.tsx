import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';
import { ArrowLeft, Zap, Sparkles, Trophy, RotateCcw, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MathQuestion {
  prompt: string;
  options: number[];
  answer: number;
  type: 'mult' | 'div' | 'add' | 'sub' | 'equation';
}

function generateMathProblem(level: number): MathQuestion {
  // Balanced specifically for 10-year-olds (4th-5th graders: multiplication, division, brackets, addition)
  const types: ('mult' | 'div' | 'add' | 'sub' | 'equation')[] = ['mult', 'mult', 'add', 'sub', 'div', 'equation'];
  const chosenType = types[Math.floor(Math.random() * types.length)];

  let prompt = '';
  let answer = 0;

  if (chosenType === 'mult') {
    const a = 3 + Math.floor(Math.random() * 9); // 3..11
    const b = 3 + Math.floor(Math.random() * 9); // 3..11
    prompt = `${a} × ${b}`;
    answer = a * b;
  } else if (chosenType === 'div') {
    const b = 2 + Math.floor(Math.random() * 8); // 2..9
    const res = 3 + Math.floor(Math.random() * 9);
    const a = b * res;
    prompt = `${a} ÷ ${b}`;
    answer = res;
  } else if (chosenType === 'equation') {
    const a = 10 + Math.floor(Math.random() * 40);
    const x = 5 + Math.floor(Math.random() * 25);
    const sum = a + x;
    prompt = `${a} + X = ${sum}  (Чему равен X?)`;
    answer = x;
  } else if (chosenType === 'add') {
    const a = 25 + Math.floor(Math.random() * 75);
    const b = 15 + Math.floor(Math.random() * 65);
    prompt = `${a} + ${b}`;
    answer = a + b;
  } else {
    // sub
    const a = 50 + Math.floor(Math.random() * 60);
    const b = 12 + Math.floor(Math.random() * 38);
    prompt = `${a} - ${b}`;
    answer = a - b;
  }

  // Generate 4 distinct options including correct answer
  const optionsSet = new Set<number>();
  optionsSet.add(answer);

  while (optionsSet.size < 4) {
    const delta = (Math.random() > 0.5 ? 1 : -1) * (1 + Math.floor(Math.random() * (answer > 20 ? 8 : 4)));
    const fake = Math.max(1, answer + delta);
    if (fake !== answer) optionsSet.add(fake);
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return { prompt, options, answer, type: chosenType };
}

export const MathVortex: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { addRewards, claimAchievement, profile } = useGame();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [currentProblem, setCurrentProblem] = useState<MathQuestion | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const startNewGame = () => {
    sound.playClick();
    setScore(0);
    setStreak(0);
    setTimeLeft(45);
    setFeedback(null);
    setSelectedOption(null);
    setCurrentProblem(generateMathProblem(1));
    setGameState('playing');
  };

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          finishGame(score);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, score]);

  const finishGame = (finalScore: number) => {
    setGameState('gameover');
    sound.playVictory();
    const earnedCoins = Math.round(finalScore / 4);
    const earnedXp = Math.round(finalScore / 2);
    const earnedCrystals = finalScore > 500 ? 5 : 2;
    addRewards(earnedXp, earnedCoins, earnedCrystals, 'math', finalScore);

    if (streak >= 10) {
      claimAchievement('math_wizard');
    }
  };

  const handleAnswer = (option: number) => {
    if (!currentProblem || feedback !== null) return;
    setSelectedOption(option);

    if (option === currentProblem.answer) {
      sound.playCorrect();
      setFeedback('correct');

      const nextStreak = streak + 1;
      setStreak(nextStreak);

      const pointsEarned = 50 + nextStreak * 15;
      setScore((s) => s + pointsEarned);
      // Give bonus time
      setTimeLeft((t) => Math.min(60, t + 3));

      if (nextStreak === 10) {
        confetti({ particleCount: 70, spread: 80 });
      }

      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
        setCurrentProblem(generateMathProblem(nextStreak));
      }, 500);
    } else {
      sound.playWrong();
      setFeedback('wrong');
      setStreak(0);
      setTimeLeft((t) => Math.max(0, t - 4));

      setTimeout(() => {
        setFeedback(null);
        setSelectedOption(null);
        setCurrentProblem(generateMathProblem(streak));
      }, 700);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-3 sm:p-6 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between w-full bg-slate-900/80 backdrop-blur border border-purple-500/30 rounded-2xl p-3 mb-4 text-white shadow-xl shadow-purple-950/40">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-purple-300 rounded-xl text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Счёт:</span>
            <span className="text-xl font-black text-amber-400 font-mono">{score}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-950/80 border border-purple-500/50 rounded-xl text-purple-300 font-mono text-sm">
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" /> Серия: {streak}x
          </div>

          <div
            className={`flex items-center gap-1 font-mono font-bold text-lg px-2.5 py-0.5 rounded-lg border ${
              timeLeft < 10
                ? 'bg-rose-950/80 border-rose-500 text-rose-400 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-cyan-400'
            }`}
          >
            ⏱️ {timeLeft}с
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full bg-gradient-to-b from-slate-900/90 to-purple-950/70 border-2 border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[440px] flex flex-col justify-between">
        {/* Glow ambient circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {gameState === 'ready' && (
          <div className="flex flex-col items-center justify-center text-center my-auto py-8">
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-xl shadow-purple-500/30 animate-pulse">
              🌀
            </div>
            <h2 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-300 via-pink-200 to-amber-300 bg-clip-text text-transparent mb-2">
              Математический Вортекс
            </h2>
            <p className="text-slate-300 text-sm max-w-md mb-6 leading-relaxed">
              Реактор гипердвигателя нестабилен! Синхронизируй квантовые частоты с помощью быстрого устного счета.
              Каждый точный ответ ускоряет реактор и дарит серии очков!
            </p>

            <button
              onClick={startNewGame}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-purple-500/40 transform active:scale-95 transition text-lg flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current" /> Запустить Реактор!
            </button>
          </div>
        )}

        {gameState === 'playing' && currentProblem && (
          <div className="flex flex-col items-center justify-between h-full w-full">
            {/* Combo banner */}
            <div className="h-8 flex items-center justify-center">
              {streak >= 3 && (
                <div className="px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/50 rounded-full text-amber-300 text-xs font-bold flex items-center gap-1.5 animate-bounce">
                  <Sparkles className="w-3.5 h-3.5" /> СУПЕР СЕРИЯ: Множитель очков активен!
                </div>
              )}
            </div>

            {/* Problem card */}
            <div className="my-6 w-full max-w-md bg-slate-950/80 border-2 border-purple-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-xl shadow-purple-950/80 relative">
              <div className="text-xs uppercase tracking-wider text-purple-400 font-bold mb-2">
                Квантовое уравнение
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-wide">
                {currentProblem.prompt} = ?
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md">
              {currentProblem.options.map((option, idx) => {
                let btnStyle =
                  'bg-slate-800/80 border-slate-700 hover:bg-purple-900/40 hover:border-purple-400 text-white';

                if (selectedOption === option) {
                  if (feedback === 'correct') {
                    btnStyle = 'bg-emerald-600 border-emerald-400 text-white scale-105';
                  } else if (feedback === 'wrong') {
                    btnStyle = 'bg-rose-600 border-rose-400 text-white shake';
                  }
                } else if (feedback !== null && option === currentProblem.answer) {
                  btnStyle = 'bg-emerald-600/70 border-emerald-400 text-white';
                }

                return (
                  <button
                    key={idx}
                    disabled={feedback !== null}
                    onClick={() => handleAnswer(option)}
                    className={`py-4 sm:py-5 px-4 rounded-2xl border-2 font-mono text-2xl sm:text-3xl font-black transition-all transform active:scale-95 shadow-lg flex items-center justify-center cursor-pointer ${btnStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {gameState === 'gameover' && (
          <div className="flex flex-col items-center justify-center text-center my-auto py-6">
            <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-purple-600 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg">
              🏆
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mb-1">Реактор Стабилизирован!</h3>
            <p className="text-slate-300 text-sm mb-4">Отличная работа по вычислению частот!</p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400">Итоговый Счёт</div>
                <div className="text-2xl font-black text-purple-400 font-mono">{score}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400">Награда</div>
                <div className="text-2xl font-black text-amber-400 font-mono">+{Math.round(score / 4)} 🪙</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startNewGame}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 flex items-center gap-2 transition cursor-pointer"
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
