import { MarkovPredictor } from './MarkovPredictor';
import { NeuralPredictor } from './NeuralPredictor';
import { Predictor } from './types';

export type { Predictor };

export const predictors: Predictor[] = [
  new MarkovPredictor(),
  new NeuralPredictor(),
];

export function createPredictor(name: string): Predictor {
  switch (name) {
    case 'Markov Chain':
      return new MarkovPredictor();
    case 'Neural Network':
      return new NeuralPredictor();
    default:
      return new MarkovPredictor();
  }
}
