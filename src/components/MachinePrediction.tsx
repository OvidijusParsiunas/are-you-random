import { useState, useEffect } from 'react';
import './MachinePrediction.css';

interface MachinePredictionProps {
  prediction: number;
  lastPrediction?: number | null;
  keepRevealed?: boolean;
}

export function MachinePrediction({ prediction, lastPrediction, keepRevealed }: MachinePredictionProps) {
  const [showLastResult, setShowLastResult] = useState(
    lastPrediction !== null && lastPrediction !== undefined
  );

  useEffect(() => {
    if (lastPrediction !== null && lastPrediction !== undefined) {
      setShowLastResult(true);
    }
  }, [lastPrediction]);

  // Hide the result after delay, unless keepRevealed is true
  useEffect(() => {
    if (showLastResult && !keepRevealed) {
      const timer = setTimeout(() => {
        setShowLastResult(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [showLastResult, keepRevealed]);

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
