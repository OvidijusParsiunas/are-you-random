export interface Predictor {
  name: string;
  description: string;
  isProcessing: boolean;
  predict(history: number[], optionCount: number): number;
  update(history: number[], actual: number): Promise<void>;
  reset(): void;
}
