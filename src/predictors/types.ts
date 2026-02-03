export interface Predictor {
  name: string;
  description: string;
  predict(history: number[], optionCount: number): number;
  update(history: number[], actual: number): void;
  reset(): void;
}
