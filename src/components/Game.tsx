import { useGame } from '../hooks/useGame';
import { ScoreDisplay } from './ScoreDisplay';
import { ChoiceButtons } from './ChoiceButtons';
import { History } from './History';
import { AlgorithmSelector } from './AlgorithmSelector';
import './Game.css';

export function Game() {
  const {
    rounds,
    humanScore,
    machineScore,
    currentPredictor,
    availablePredictors,
    makeChoice,
    changePredictor,
    resetGame,
  } = useGame();

  return (
    <div className="game">
      <header className="game-header">
        <h1>Are You Random?</h1>
        <p className="game-subtitle">
          The machine will try to predict your next choice. If it's right, it scores. If not, you do.
        </p>
      </header>

      <div className="choice-section">
        <h2>Make your choice</h2>
        <ChoiceButtons onChoice={makeChoice} />
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
