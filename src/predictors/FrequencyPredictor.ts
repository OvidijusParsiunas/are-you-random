import { Predictor } from './types';

export class FrequencyPredictor implements Predictor {
  name = 'Frequency';
  description = 'Predicts your most frequently chosen option';

  private count0: number = 0;
  private count1: number = 0;

  predict(_history: number[]): number {
    if (this.count0 === this.count1) {
      return 0;
    }
    return this.count1 > this.count0 ? 1 : 0;
  }

  update(_history: number[], actual: number): void {
    if (actual === 0) {
      this.count0++;
    } else {
      this.count1++;
    }
  }

  reset(): void {
    this.count0 = 0;
    this.count1 = 0;
  }
}
