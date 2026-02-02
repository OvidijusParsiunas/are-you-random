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

  const lastRound = rounds[rounds.length - 1];

  return (
    <div className="game">
      <header className="game-header">
        <h1>Are You Random?</h1>
        <p className="game-subtitle">
          The machine will try to predict your next choice. If it's right, it scores. If not, you do.
        </p>
      </header>

      <div className="choices-container">
        <div className="choice-section">
          <h2>Make your choice</h2>
          <ChoiceButtons onChoice={makeChoice} />
          {lastRound && !lastRound.correct && (
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
            />
          </div>
          {lastRound && lastRound.correct && (
            <div key={rounds.length} className="plus-one machine">+1</div>
          )}
        </div>
      </div>

      <ScoreDisplay humanScore={humanScore} machineScore={machineScore} />

      <History rounds={rounds} />

      <div className="settings-section">
        <AlgorithmSelector
          predictors={availablePredictors}
          currentPredictor={currentPredictor}
          onSelect={changePredictor}
        />
        <button className="reset-button" onClick={resetGame}>
          Reset Game
        </button>
      </div>
    </div>
  );
}
