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
