import { FrequencyPredictor } from './FrequencyPredictor';
import { MarkovPredictor } from './MarkovPredictor';
import { NeuralPredictor } from './NeuralPredictor';
import { DecayPredictor } from './DecayPredictor';
import { Predictor } from './types';

export type { Predictor };

export const predictors: Predictor[] = [
  new MarkovPredictor(),
  new FrequencyPredictor(),
  new DecayPredictor(),
  new NeuralPredictor(),
];

export function createPredictor(name: string): Predictor {
  switch (name) {
    case 'Markov Chain':
      return new MarkovPredictor();
    case 'Frequency':
      return new FrequencyPredictor();
    case 'Decay-Weighted':
      return new DecayPredictor();
    case 'Neural Network':
      return new NeuralPredictor();
    default:
      return new MarkovPredictor();
  }
}
