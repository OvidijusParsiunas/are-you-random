import * as tf from '@tensorflow/tfjs';
import { Predictor } from './types';

export class NeuralPredictor implements Predictor {
  name = 'Neural Network';
  description = 'A machine learning model that learns your patterns';

  private model: tf.Sequential | null = null;
  private historyWindow: number;
  private trainingData: { input: number[]; output: number }[] = [];
  private batchSize: number;
  private _isProcessing: boolean = false;
  private lastOptionCount: number = 2;

  get isProcessing(): boolean {
    return this._isProcessing;
  }

  constructor(historyWindow: number = 8, batchSize: number = 4) {
    this.historyWindow = historyWindow;
    this.batchSize = batchSize;
  }

  private buildModel(optionCount: number): tf.Sequential {
    const model = tf.sequential();

    // Input layer: historyWindow * optionCount (one-hot encoded history)
    const inputSize = this.historyWindow * optionCount;

    model.add(
      tf.layers.dense({
        units: 32,
        activation: 'relu',
        inputShape: [inputSize],
        kernelInitializer: 'glorotUniform',
      })
    );

    model.add(
      tf.layers.dense({
        units: 16,
        activation: 'relu',
      })
    );

    // Output layer: probability distribution over choices
    model.add(
      tf.layers.dense({
        units: optionCount,
        activation: 'softmax',
      })
    );

    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    });

    return model;
  }

  private encodeHistory(history: number[], optionCount: number): number[] {
    // One-hot encode the last historyWindow moves
    const features: number[] = new Array(this.historyWindow * optionCount).fill(0);

    const startIdx = Math.max(0, history.length - this.historyWindow);
    const relevantHistory = history.slice(startIdx);

    // Pad from the end (most recent moves are at the end of the feature vector)
    const offset = this.historyWindow - relevantHistory.length;

    for (let i = 0; i < relevantHistory.length; i++) {
      const move = relevantHistory[i];
      const featureIdx = (offset + i) * optionCount + move;
      if (featureIdx < features.length) {
        features[featureIdx] = 1;
      }
    }

    return features;
  }

  private oneHotEncode(value: number, optionCount: number): number[] {
    const encoded = new Array(optionCount).fill(0);
    encoded[value] = 1;
    return encoded;
  }

  predict(history: number[], optionCount: number): number {
    // Rebuild model if optionCount changed
    if (optionCount !== this.lastOptionCount) {
      this.model?.dispose();
      this.model = null;
      this.trainingData = [];
      this.lastOptionCount = optionCount;
    }

    // Initialize model if needed
    if (!this.model) {
      this.model = this.buildModel(optionCount);
    }

    // Not enough history - return deterministic fallback
    if (history.length < 2) {
      return history.length % optionCount;
    }
    // Use tf.tidy to clean up tensors
    const prediction = tf.tidy(() => {
      const input = this.encodeHistory(history, optionCount);
      const inputTensor = tf.tensor2d([input]);
      const output = this.model!.predict(inputTensor) as tf.Tensor;
      const probabilities = output.dataSync();

      // Find the option with highest probability
      let maxProb = -1;
      let predictedClass = 0;
      for (let i = 0; i < optionCount; i++) {
        if (probabilities[i] > maxProb) {
          maxProb = probabilities[i];
          predictedClass = i;
        }
      }
      return predictedClass;
    });

    return prediction;
  }

  async update(history: number[], actual: number): Promise<void> {
    const optionCount = this.lastOptionCount;

    // Need at least some history to learn from
    if (history.length < 1) return;

    // Store training example (history is already BEFORE the actual move)
    const input = this.encodeHistory(history, optionCount);
    this.trainingData.push({ input, output: actual });

    // Keep training data bounded
    if (this.trainingData.length > 200) {
      this.trainingData = this.trainingData.slice(-200);
    }

    // Train when we have enough data
    if (this.trainingData.length >= this.batchSize) {
      await this.trainBatch(optionCount);
    }
  }

  private async trainBatch(optionCount: number): Promise<void> {
    if (!this.model) return;

    this._isProcessing = true;

    try {
      // Take the most recent samples for training
      const samples = this.trainingData.slice(-this.batchSize);

      const xs = tf.tensor2d(samples.map((s) => s.input));
      const ys = tf.tensor2d(samples.map((s) => this.oneHotEncode(s.output, optionCount)));

      await this.model.fit(xs, ys, {
        epochs: 3,
        verbose: 0,
      });

      xs.dispose();
      ys.dispose();
    } finally {
      this._isProcessing = false;
    }
  }

  reset(): void {
    this.model?.dispose();
    this.model = null;
    this.trainingData = [];
    this._isProcessing = false;
  }
}
