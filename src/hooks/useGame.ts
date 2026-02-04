import { useState, useCallback, useRef } from 'react';
import { Predictor, predictors, createPredictor } from '../predictors';

export interface Round {
  userChoice: number;
  prediction: number;
  correct: boolean;
}

export interface GameState {
  history: number[];
  rounds: Round[];
  humanScore: number;
  machineScore: number;
  currentPredictor: Predictor;
  availablePredictors: Predictor[];
  optionCount: number;
}

const initialPredictor = predictors[0];
const initialOptionCount = 2;

export function useGame() {
  const [history, setHistory] = useState<number[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [humanScore, setHumanScore] = useState(0);
  const [machineScore, setMachineScore] = useState(0);
  const [currentPredictor, setCurrentPredictor] = useState<Predictor>(initialPredictor);
  const [optionCount, setOptionCount] = useState(initialOptionCount);
  const [currentPrediction, setCurrentPrediction] = useState(
    () => initialPredictor.predict([], initialOptionCount)
  );

  // Ref to access current prediction in callbacks without dependencies
  const predictionRef = useRef(currentPrediction);
  predictionRef.current = currentPrediction;

  const makeChoice = useCallback((choice: number) => {
    const prediction = predictionRef.current;
    const correct = prediction === choice;

    const round: Round = {
      userChoice: choice,
      prediction,
      correct,
    };

    currentPredictor.update(history, choice);

    const newHistory = [...history, choice];
    setHistory(newHistory);
    setRounds(prev => [...prev, round]);
    setCurrentPrediction(currentPredictor.predict(newHistory, optionCount));

    if (correct) {
      setMachineScore(prev => prev + 1);
    } else {
      setHumanScore(prev => prev + 1);
    }
  }, [history, currentPredictor, optionCount]);

  const changePredictor = useCallback((predictorName: string) => {
    const newPredictor = createPredictor(predictorName);
    setCurrentPredictor(newPredictor);
    setHistory([]);
    setRounds([]);
    setHumanScore(0);
    setMachineScore(0);
    setCurrentPrediction(newPredictor.predict([], optionCount));
  }, [optionCount]);

  const resetGame = useCallback(() => {
    currentPredictor.reset();
    setHistory([]);
    setRounds([]);
    setHumanScore(0);
    setMachineScore(0);
    setCurrentPrediction(currentPredictor.predict([], optionCount));
  }, [currentPredictor, optionCount]);

  const changeOptionCount = useCallback((newCount: number) => {
    if (newCount < 2 || newCount > 6) return;
    setOptionCount(newCount);
    // Reset game when option count changes since learned patterns are invalid
    currentPredictor.reset();
    setHistory([]);
    setRounds([]);
    setHumanScore(0);
    setMachineScore(0);
    setCurrentPrediction(currentPredictor.predict([], newCount));
  }, [currentPredictor]);

  return {
    history,
    rounds,
    humanScore,
    machineScore,
    currentPredictor,
    currentPrediction,
    availablePredictors: predictors,
    optionCount,
    makeChoice,
    changePredictor,
    resetGame,
    changeOptionCount,
  };
}
