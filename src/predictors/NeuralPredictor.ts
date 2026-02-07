import { Predictor, PREDICTOR_NAMES } from './types';
import * as tf from '@tensorflow/tfjs';

export class NeuralPredictor implements Predictor {
  name = PREDICTOR_NAMES.NEURAL_NETWORK;
  description = 'A machine learning model that learns your patterns';

  private model: tf.Sequential | null = null;
  private historyWindow: number;
  private trainingData: { input: number[]; output: number }[] = [];
  private minSamples: number;
  private _isProcessing: boolean = false;
  private lastOptionCount: number = 2;

  get isProcessing(): boolean {
    return this._isProcessing;
  }

  constructor(historyWindow: number = 8, minSamples: number = 4) {
    this.historyWindow = historyWindow;
    this.minSamples = minSamples;
  }

  // Adaptive decay: more choices = more recency bias, fewer choices = more history
  private getRecencyDecay(optionCount: number): number {
    // 2 choices → 0.875 (keeps more history)
    // 4 choices → 0.8375
    // 6 choices → 0.825 (most recency-focused)
    return 0.8 + 0.15 / optionCount;
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
    if (this.trainingData.length >= this.minSamples) {
      await this.trainBatch(optionCount);
    }
  }

  private async trainBatch(optionCount: number): Promise<void> {
    if (!this.model) return;

    this._isProcessing = true;
;
    try {
      const allSamples = this.trainingData;
      const numSamples = allSamples.length;
      const batchSize = Math.min(8, numSamples);

      // Compute cumulative weights for efficient weighted sampling
      const recencyDecay = this.getRecencyDecay(optionCount);
      const cumulativeWeights: number[] = [];
      let totalWeight = 0;
      for (let i = 0; i < numSamples; i++) {
        const age = numSamples - i - 1;
        totalWeight += Math.pow(recencyDecay, age);
        cumulativeWeights.push(totalWeight);
      }

      // Binary search sampling (O(batchSize * log(numSamples)))
      const sampledIndices: number[] = [];
      for (let i = 0; i < batchSize; i++) {
        const r = Math.random() * totalWeight;
        // Binary search for the index
        let lo = 0, hi = numSamples - 1;
        while (lo < hi) {
          const mid = (lo + hi) >> 1;
          if (cumulativeWeights[mid] < r) {
            lo = mid + 1;
          } else {
            hi = mid;
          }
        }
        sampledIndices.push(lo);
      }

      const samples = sampledIndices.map((i) => allSamples[i]);
      const xs = tf.tensor2d(samples.map((s) => s.input));
      const ys = tf.tensor2d(samples.map((s) => this.oneHotEncode(s.output, optionCount)));

      await this.model.fit(xs, ys, {
        epochs: 2,
        verbose: 0,
      });

      xs.dispose();
      ys.dispose();
    } finally {
      this._isProcessing = false;
    }
  }

  reset(): void {
    // Keep the model (preserves warmup) but clear learned patterns
    this.trainingData = [];
    this._isProcessing = false;
  }

  async warmup(): Promise<void> {
    // Initialize TensorFlow.js backend (WebGL or CPU)
    await tf.ready();
    // Pre-build the model for default option count
    if (!this.model) {
      this.model = this.buildModel(this.lastOptionCount);
    }
    // Run a dummy prediction to fully initialize GPU kernels
    tf.tidy(() => {
      const dummyInput = tf.zeros([1, this.historyWindow * this.lastOptionCount]);
      this.model!.predict(dummyInput);
    });
  }
}
