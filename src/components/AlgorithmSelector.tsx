import { Predictor } from '../predictors';
import './AlgorithmSelector.css';

interface AlgorithmSelectorProps {
  predictors: Predictor[];
  currentPredictor: Predictor;
  onSelect: (name: string) => void;
}

export function AlgorithmSelector({
  predictors,
  currentPredictor,
  onSelect,
}: AlgorithmSelectorProps) {
  return (
    <div className="algorithm-selector">
      <label htmlFor="algorithm-select">Algorithm:</label>
      <select
        id="algorithm-select"
        value={currentPredictor.name}
        onChange={(e) => onSelect(e.target.value)}
      >
        {predictors.map((predictor) => (
          <option key={predictor.name} value={predictor.name}>
            {predictor.name}
          </option>
        ))}
      </select>
      <p className="algorithm-description">{currentPredictor.description}</p>
    </div>
  );
}
