import { Predictor } from './types';
import { MarkovPredictor } from './MarkovPredictor';
import { FrequencyPredictor } from './FrequencyPredictor';
import { DecayPredictor } from './DecayPredictor';

export type { Predictor };

export const predictors: Predictor[] = [
  new MarkovPredictor(),
  new FrequencyPredictor(),
  new DecayPredictor(),
];

export function createPredictor(name: string): Predictor {
  switch (name) {
    case 'Markov Chain':
      return new MarkovPredictor();
    case 'Frequency':
      return new FrequencyPredictor();
    case 'Decay-Weighted':
      return new DecayPredictor();
    default:
      return new MarkovPredictor();
  }
}
