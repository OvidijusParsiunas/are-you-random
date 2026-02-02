import { Predictor } from './types';

export class MarkovPredictor implements Predictor {
  name = 'Markov Chain';
  description = 'Predicts based on patterns in your recent choices';

  private order: number;
  private transitions: Map<string, { count0: number; count1: number }>;

  constructor(order: number = 3) {
    this.order = order;
    this.transitions = new Map();
  }

  predict(history: number[]): number {
    if (history.length < this.order) {
      return Math.round(history.length % 2);
    }

    const context = history.slice(-this.order).join('');
    const counts = this.transitions.get(context);

    if (!counts) {
      return Math.round(history.length % 2);
    }

    return counts.count1 > counts.count0 ? 1 : 0;
  }

  update(history: number[], actual: number): void {
    if (history.length < this.order) return;

    const context = history.slice(-this.order).join('');
    const counts = this.transitions.get(context) || { count0: 0, count1: 0 };

    if (actual === 0) {
      counts.count0++;
    } else {
      counts.count1++;
    }

    this.transitions.set(context, counts);
  }

  reset(): void {
    this.transitions.clear();
  }
}
