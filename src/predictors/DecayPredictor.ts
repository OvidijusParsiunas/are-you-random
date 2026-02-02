import { Predictor } from './types';

export class DecayPredictor implements Predictor {
  name = 'Decay-Weighted';
  description = 'Weighs your recent choices more heavily';

  private decayFactor: number;
  private weight0: number = 0;
  private weight1: number = 0;

  constructor(decayFactor: number = 0.9) {
    this.decayFactor = decayFactor;
  }

  predict(_history: number[]): number {
    if (this.weight0 === this.weight1) {
      return 0;
    }
    return this.weight1 > this.weight0 ? 1 : 0;
  }

  update(_history: number[], actual: number): void {
    this.weight0 *= this.decayFactor;
    this.weight1 *= this.decayFactor;

    if (actual === 0) {
      this.weight0 += 1;
    } else {
      this.weight1 += 1;
    }
  }

  reset(): void {
    this.weight0 = 0;
    this.weight1 = 0;
  }
}
