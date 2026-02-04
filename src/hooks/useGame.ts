import { Predictor, predictors, createPredictor } from '../predictors';
import { useState, useCallback, useRef } from 'react';

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
  const [isProcessing, setIsProcessing] = useState(false);

  // Ref to access current prediction in callbacks without dependencies
  const predictionRef = useRef(currentPrediction);
  predictionRef.current = currentPrediction;

  const makeChoice = useCallback(async (choice: number) => {
    const prediction = predictionRef.current;
    const correct = prediction === choice;

    const round: Round = {
      userChoice: choice,
      prediction,
      correct,
    };

    const newHistory = [...history, choice];
    setHistory(newHistory);
    setRounds(prev => [...prev, round]);

    if (correct) {
      setMachineScore(prev => prev + 1);
    } else {
      setHumanScore(prev => prev + 1);
    }

    // Update predictor (may involve async training)
    setIsProcessing(true);
    await currentPredictor.update(history, choice);
    setIsProcessing(false);

    // Compute next prediction after training completes
    setCurrentPrediction(currentPredictor.predict(newHistory, optionCount));
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
    isProcessing,
    makeChoice,
    changePredictor,
    resetGame,
    changeOptionCount,
  };
}
