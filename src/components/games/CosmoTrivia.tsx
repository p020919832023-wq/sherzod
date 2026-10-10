import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../utils/sound';
import { TRIVIA_QUESTIONS, TriviaQuestion } from '../../data/gameData';
import { ArrowLeft, HelpCircle, CheckCircle, XCircle, Sparkles, Award, RotateCcw, Brain, Bot } from 'lucide-react';
import confetti from 'canvas-confetti';

export const CosmoTrivia: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { addRewards, claimAchievement } = useGame();

  const [questions] = useState<TriviaQuestion[]>(() => {
    return [...TRIVIA_QUESTIONS].sort(() => Math.random() - 0.5);
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // Lifelines
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [usedHint, setUsedHint] = useState(false);

  const currentQ = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (answered || isFinished) return;
    setSelectedOption(idx);
    setAnswered(true);

    if (idx === currentQ.correctIndex) {
      sound.playCorrect();
      setScore((s) => s + 100);
      confetti({ particleCount: 35, spread: 50 });
    } else {
      sound.playWrong();
    }
  };

  const handleNext = () => {
    sound.playClick();
    setAnswered(false);
    setSelectedOption(null);
    setHiddenOptions([]);
    setHintMessage(null);

    if (currentIndex + 1 < questions.length && currentIndex + 1 < 10) {
      setCurrentIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsFinished(true);
    sound.playVictory();
    confetti({ particleCount: 90, spread: 75 });
    const finalScore = score + (selectedOption === currentQ.correctIndex ? 100 : 0);
    const earnedCoins = Math.round(finalScore / 2);
    const earnedXp = Math.round(finalScore);
    const earnedCrystals = finalScore >= 800 ? 5 : 2;

    addRewards(earnedXp, earnedCoins, earnedCrystals, 'trivia', finalScore);

    if (finalScore >= 800) {
      claimAchievement('knowledge_seeker');
    }
  };

  const useFiftyFifty = () => {
    if (usedFiftyFifty || answered) return;
    sound.playClick();
    setUsedFiftyFifty(true);

    const wrongIndexes = [0, 1, 2, 3].filter((i) => i !== currentQ.correctIndex);
    wrongIndexes.sort(() => Math.random() - 0.5);
    setHiddenOptions(wrongIndexes.slice(0, 2));
  };

  const useRoboHint = () => {
    if (usedHint || answered) return;
    sound.playClick();
    setUsedHint(true);
    // Provide a smart hint without giving away directly
    setHintMessage(`🤖 Робот-советник: "Мои сенсоры исключают вариант: ${currentQ.options[(currentQ.correctIndex + 1) % 4]}!"`);
  };

  const restart = () => {
    sound.playClick();
    setCurrentIndex(0);
    setScore(0);
    setSelectedOption(null);
    setAnswered(false);
    setIsFinished(false);
    setUsedFiftyFifty(false);
    setUsedHint(false);
    setHiddenOptions([]);
    setHintMessage(null);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto p-3 sm:p-6 select-none">
      {/* Header bar */}
      <div className="flex items-center justify-between w-full bg-slate-900/80 backdrop-blur border border-emerald-500/30 rounded-2xl p-3 mb-4 text-white shadow-xl shadow-emerald-950/40">
        <button
          onClick={() => {
            sound.playClick();
            onBack();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-sm font-semibold transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">
            Вопрос: <span className="text-emerald-400 font-bold">{currentIndex + 1} / 10</span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl">
            <span className="text-xs text-slate-400">Счёт:</span>
            <span className="text-lg font-black text-amber-400 font-mono">{score}</span>
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className="w-full bg-gradient-to-b from-slate-900/90 to-emerald-950/60 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md min-h-[460px] flex flex-col justify-between">
        {!isFinished ? (
          <>
            {/* Lifelines */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <button
                  disabled={usedFiftyFifty || answered}
                  onClick={useFiftyFifty}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    usedFiftyFifty
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> 50 : 50
                </button>

                <button
                  disabled={usedHint || answered}
                  onClick={useRoboHint}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    usedHint
                      ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-cyan-900/60 hover:bg-cyan-800/80 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  <Bot className="w-3.5 h-3.5" /> Совет Робота
                </button>
              </div>

              <span className="text-xs px-2.5 py-1 bg-emerald-950 border border-emerald-500/30 rounded-full text-emerald-300 uppercase tracking-wider font-semibold">
                Категория: {currentQ.category}
              </span>
            </div>

            {hintMessage && (
              <div className="bg-cyan-950/80 border border-cyan-500/50 rounded-xl p-2.5 text-xs text-cyan-200 mb-4 animate-fade-in flex items-center gap-2">
                <span>{hintMessage}</span>
              </div>
            )}

            {/* Question Card */}
            <div className="bg-slate-950/80 border border-emerald-500/40 rounded-2xl p-5 sm:p-6 mb-6 shadow-inner">
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {currentQ.options.map((option, idx) => {
                if (hiddenOptions.includes(idx)) {
                  return (
                    <div
                      key={idx}
                      className="py-3 px-4 rounded-xl border border-slate-800 bg-slate-900/30 opacity-20 text-slate-500 font-medium"
                    >
                      ---
                    </div>
                  );
                }

                let btnClass = 'bg-slate-800/80 hover:bg-emerald-900/40 border-slate-700 text-slate-100';

                if (answered) {
                  if (idx === currentQ.correctIndex) {
                    btnClass = 'bg-emerald-600 border-emerald-400 text-white font-bold ring-2 ring-emerald-400';
                  } else if (idx === selectedOption) {
                    btnClass = 'bg-rose-600 border-rose-400 text-white font-bold';
                  } else {
                    btnClass = 'bg-slate-900/60 border-slate-800 text-slate-500';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={answered}
                    onClick={() => handleSelect(idx)}
                    className={`py-3.5 px-4 rounded-xl border-2 text-base font-semibold text-left transition transform active:scale-98 cursor-pointer flex items-center justify-between ${btnClass}`}
                  >
                    <span>{option}</span>
                    {answered && idx === currentQ.correctIndex && <CheckCircle className="w-5 h-5 text-white ml-2 flex-shrink-0" />}
                    {answered && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-white ml-2 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {answered && (
              <div className="bg-emerald-950/60 border border-emerald-500/50 rounded-2xl p-4 text-emerald-200 text-sm mb-4 animate-fade-in">
                <div className="font-bold mb-1 flex items-center gap-1.5 text-white">
                  💡 Знаешь ли ты?
                </div>
                {currentQ.explanation}
              </div>
            )}

            {/* Bottom action */}
            <div className="flex justify-end">
              {answered && (
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 transition cursor-pointer text-sm"
                >
                  {currentIndex + 1 < 10 ? 'Следующий Вопрос ➡️' : 'Посмотреть Итог 🏆'}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Finished screen */
          <div className="flex flex-col items-center justify-center text-center my-auto py-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-emerald-400 to-teal-600 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-xl shadow-emerald-500/30">
              🎓
            </div>
            <h3 className="text-3xl font-black text-emerald-300 mb-2">Викторина Завершена!</h3>
            <p className="text-slate-300 text-sm mb-6 max-w-sm">
              Твоя эрудиция достойна звания Главного Исследователя Космоса!
            </p>

            <div className="grid grid-cols-2 gap-3 w-full max-w-xs mb-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400">Набрано Очков</div>
                <div className="text-2xl font-black text-emerald-400 font-mono">{score}</div>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <div className="text-xs text-slate-400">Звездные Монеты</div>
                <div className="text-2xl font-black text-amber-400 font-mono">+{Math.round(score / 2)} 🪙</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={restart}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition cursor-pointer"
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
