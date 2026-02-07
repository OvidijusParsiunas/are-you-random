import { MachinePrediction } from './MachinePrediction';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ChoiceButtons } from './ChoiceButtons';
import { ScoreDisplay } from './ScoreDisplay';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useGame } from '../hooks/useGame';
import { History } from './History';
import './Game.css';

export function Game() {
  const {
    rounds,
    humanScore,
    machineScore,
    currentPredictor,
    currentPrediction,
    availablePredictors,
    optionCount,
    isProcessing,
    makeChoice,
    changePredictor,
    resetGame,
    changeOptionCount,
  } = useGame();

  const [showReveal, setShowReveal] = useState(false);
  const [showScoreAndHistory, setShowScoreAndHistory] = useState(false);
  const [hasPlayedBefore, setHasPlayedBefore] = useState(false);
  const [initialFadeIn, setInitialFadeIn] = useState(true);

  const hasPlayed = rounds.length > 0;
  const lastRound = rounds[rounds.length - 1];

  // Handle first choice reveal animation (only on very first game)
  useEffect(() => {
    if (rounds.length === 1 && !hasPlayedBefore) {
      // First time ever playing - show reveal animation
      setShowReveal(true);
      const timer = setTimeout(() => {
        setShowReveal(false);
        setShowScoreAndHistory(true);
        setHasPlayedBefore(true);
        // Turn off fade-in after animation completes
        setTimeout(() => setInitialFadeIn(false), 500);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [rounds.length, hasPlayedBefore]);

  return (
    <div className="game">
      <div className="toolbar">
        <AlgorithmSelector
          predictors={availablePredictors}
          currentPredictor={currentPredictor}
          onSelect={changePredictor}
        />
        <button className="reset-button" onClick={resetGame}>
          Reset
        </button>
      </div>
      <div className="toolbar-right">
        <a
          href="https://github.com/OvidijusParsiunas/are-you-random"
          target="_blank"
          rel="noopener noreferrer"
          className="github-link"
          aria-label="View source on GitHub"
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </a>
        <ThemeToggle />
      </div>

      <header className="game-header">
        <h1>Are You Random?</h1>
        <p className="game-subtitle">
          The machine will try to predict your next choice. If it's right, it scores. If not, you do.
        </p>
      </header>

      <div className="choices-container">
        <div className="choice-section">
          <div className="choice-header">
            <h2>Make your choice</h2>
            <button
              className="option-count-btn"
              onClick={() => changeOptionCount(optionCount - 1)}
              disabled={optionCount <= 2}
            >
              −
            </button>
            <button
              className="option-count-btn"
              onClick={() => changeOptionCount(optionCount + 1)}
              disabled={optionCount >= 6}
            >
              +
            </button>
          </div>
          <ChoiceButtons onChoice={makeChoice} disabled={showReveal || isProcessing} optionCount={optionCount} />
          {lastRound && !lastRound.correct && rounds.length > 1 && (
            <div key={rounds.length} className="plus-one human">+1</div>
          )}
        </div>

        <div className="choice-section">
          <div className="choice-header">
            <h2>Machine prediction</h2>
          </div>
          <div className="prediction-wrapper">
            <MachinePrediction
              key={rounds.length}
              prediction={currentPrediction}
              lastPrediction={lastRound?.prediction}
              keepRevealed={showReveal}
              isProcessing={isProcessing}
            />
          </div>
          {lastRound && lastRound.correct && rounds.length > 1 && (
            <div key={rounds.length} className="plus-one machine">+1</div>
          )}
        </div>
      </div>

      {(hasPlayed || showScoreAndHistory) && (
        <div className="score-area">
          {showReveal && (
            <div className={`reveal-message ${lastRound?.correct ? 'machine-win' : 'human-win'}`}>
              {lastRound?.correct ? 'AI predicted your choice!' : 'You fooled the AI!'}
            </div>
          )}
          {showScoreAndHistory && (
            <div className={initialFadeIn ? 'fade-in' : undefined}>
              <ScoreDisplay humanScore={humanScore} machineScore={machineScore} />
            </div>
          )}
        </div>
      )}

      {showScoreAndHistory && (
        <div className={initialFadeIn ? 'fade-in' : undefined}>
          <History rounds={rounds} />
        </div>
      )}

    </div>
  );
}
