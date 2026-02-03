import { Predictor } from './types';

export class MarkovPredictor implements Predictor {
  name = 'Markov Chain';
  description = 'Predicts based on patterns in your recent choices';

  private order: number;
  private transitions: Map<string, number[]>;

  constructor(order: number = 3) {
    this.order = order;
    this.transitions = new Map();
  }

  predict(history: number[], optionCount: number): number {
    if (history.length < this.order) {
      return history.length % optionCount;
    }

    const context = history.slice(-this.order).join(',');
    const counts = this.transitions.get(context);

    if (!counts) {
      return history.length % optionCount;
    }

    // Find the option with the highest count
    let maxCount = -1;
    let prediction = 0;
    for (let i = 0; i < optionCount; i++) {
      const count = counts[i] || 0;
      if (count > maxCount) {
        maxCount = count;
        prediction = i;
      }
    }

    return prediction;
  }

  update(history: number[], actual: number): void {
    if (history.length < this.order) return;

    const context = history.slice(-this.order).join(',');
    const counts = this.transitions.get(context) || [];

    counts[actual] = (counts[actual] || 0) + 1;

    this.transitions.set(context, counts);
  }

  reset(): void {
    this.transitions.clear();
  }
}
