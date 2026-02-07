export const PREDICTOR_NAMES = {
  MARKOV_CHAIN: 'Markov Chain',
  NEURAL_NETWORK: 'Neural Network',
} as const;

export interface Predictor {
  name: string;
  description: string;
  isProcessing: boolean;
  predict(history: number[], optionCount: number): number;
  update(history: number[], actual: number): Promise<void>;
  reset(): void;
  warmup?(): Promise<void>;
}
