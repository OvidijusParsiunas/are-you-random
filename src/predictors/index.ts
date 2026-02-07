import { Predictor, PREDICTOR_NAMES } from './types';
import { MarkovPredictor } from './MarkovPredictor';
import { NeuralPredictor } from './NeuralPredictor';

export type { Predictor };
export { PREDICTOR_NAMES };

export const predictors: Predictor[] = [
  new MarkovPredictor(),
  new NeuralPredictor(),
];

export async function warmupPredictors(): Promise<void> {
  await Promise.all(
    predictors.map((p) => p.warmup?.())
  );
}

export function createPredictor(name: string): Predictor {
  // Return the singleton instance (which may have been warmed up)
  // and reset it for fresh use
  const predictor = predictors.find((p) => p.name === name) ?? predictors[0];
  predictor.reset();
  return predictor;
}
