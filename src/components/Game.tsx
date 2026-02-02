import { useState, useEffect } from 'react';
import { MachinePrediction } from './MachinePrediction';
import { AlgorithmSelector } from './AlgorithmSelector';
import { ChoiceButtons } from './ChoiceButtons';
import { ScoreDisplay } from './ScoreDisplay';
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
    makeChoice,
    changePredictor,
    resetGame,
  } = useGame();

  const [showReveal, setShowReveal] = useState(false);
  const [showScoreAndHistory, setShowScoreAndHistory] = useState(false);

  const hasPlayed = rounds.length > 0;
  const lastRound = rounds[rounds.length - 1];

  // Reset states when game is reset
  useEffect(() => {
    if (rounds.length === 0) {
      setShowReveal(false);
      setShowScoreAndHistory(false);
    }
  }, [rounds.length]);

  // Handle first choice reveal animation
  useEffect(() => {
    if (rounds.length === 1 && !showScoreAndHistory) {
      setShowReveal(true);
      // After reveal message shows, fade it out and show score/history
      const timer = setTimeout(() => {
        setShowReveal(false);
        setShowScoreAndHistory(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [rounds.length, showScoreAndHistory]);

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

      <header className="game-header">
        <h1>Are You Random?</h1>
        <p className="game-subtitle">
          The machine will try to predict your next choice. If it's right, it scores. If not, you do.
        </p>
      </header>

      <div className="choices-container">
        <div className="choice-section">
          <h2>Make your choice</h2>
          <ChoiceButtons onChoice={makeChoice} disabled={showReveal} />
          {lastRound && !lastRound.correct && rounds.length > 1 && (
            <div key={rounds.length} className="plus-one human">+1</div>
          )}
        </div>

        <div className="choice-section">
          <h2>Machine prediction</h2>
          <div className="prediction-wrapper">
            <MachinePrediction
              key={rounds.length}
              prediction={currentPrediction}
              lastPrediction={lastRound?.prediction}
              keepRevealed={showReveal}
            />
          </div>
          {lastRound && lastRound.correct && rounds.length > 1 && (
            <div key={rounds.length} className="plus-one machine">+1</div>
          )}
        </div>
      </div>

      {hasPlayed && (
        <div className="score-area">
          {showReveal && (
            <div className={`reveal-message ${lastRound?.correct ? 'machine-win' : 'human-win'}`}>
              {lastRound?.correct ? 'AI predicted your choice!' : 'You fooled the AI!'}
            </div>
          )}
          {showScoreAndHistory && (
            <div className="fade-in">
              <ScoreDisplay humanScore={humanScore} machineScore={machineScore} />
            </div>
          )}
        </div>
      )}

      {showScoreAndHistory && (
        <div className="fade-in">
          <History rounds={rounds} />
        </div>
      )}

    </div>
  );
}
