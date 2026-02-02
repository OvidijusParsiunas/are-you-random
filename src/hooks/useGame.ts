import { useState, useCallback } from 'react';
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
}

export function useGame() {
  const [history, setHistory] = useState<number[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [humanScore, setHumanScore] = useState(0);
  const [machineScore, setMachineScore] = useState(0);
  const [currentPredictor, setCurrentPredictor] = useState<Predictor>(predictors[0]);

  const makeChoice = useCallback((choice: number) => {
    const prediction = currentPredictor.predict(history);
    const correct = prediction === choice;

    const round: Round = {
      userChoice: choice,
      prediction,
      correct,
    };

    currentPredictor.update(history, choice);

    setHistory(prev => [...prev, choice]);
    setRounds(prev => [...prev, round]);

    if (correct) {
      setMachineScore(prev => prev + 1);
    } else {
      setHumanScore(prev => prev + 1);
    }
  }, [history, currentPredictor]);

  const changePredictor = useCallback((predictorName: string) => {
    const newPredictor = createPredictor(predictorName);
    setCurrentPredictor(newPredictor);
    setHistory([]);
    setRounds([]);
    setHumanScore(0);
    setMachineScore(0);
  }, []);

  const resetGame = useCallback(() => {
    currentPredictor.reset();
    setHistory([]);
    setRounds([]);
    setHumanScore(0);
    setMachineScore(0);
  }, [currentPredictor]);

  const currentPrediction = currentPredictor.predict(history);

  return {
    history,
    rounds,
    humanScore,
    machineScore,
    currentPredictor,
    currentPrediction,
    availablePredictors: predictors,
    makeChoice,
    changePredictor,
    resetGame,
  };
}
