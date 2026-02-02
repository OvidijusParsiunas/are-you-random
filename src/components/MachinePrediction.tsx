import { useState, useEffect } from 'react';
import './MachinePrediction.css';

interface MachinePredictionProps {
  prediction: number;
  lastPrediction?: number | null;
}

export function MachinePrediction({ prediction, lastPrediction }: MachinePredictionProps) {
  const [showLastResult, setShowLastResult] = useState(
    lastPrediction !== null && lastPrediction !== undefined
  );

  useEffect(() => {
    if (lastPrediction !== null && lastPrediction !== undefined) {
      setShowLastResult(true);
      const timer = setTimeout(() => {
        setShowLastResult(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [lastPrediction]);

  const isShowingResult = showLastResult && lastPrediction !== null && lastPrediction !== undefined;

  return (
    <div className="machine-prediction">
      {isShowingResult ? (
        <div className={`prediction-display prediction-${lastPrediction}`}>
          {lastPrediction}
        </div>
      ) : (
        <div className="prediction-container">
          <div className={`prediction-display prediction-${prediction}`}>
            {prediction}
          </div>
          <div className="prediction-shutter">
            ?
          </div>
        </div>
      )}
    </div>
  );
}
