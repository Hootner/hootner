#!/usr/bin/env node
/**
 * Layer 11: Neural Network - Deep learning framework
 * Dependencies: Layer 0 (Math), Layer 9 (Game Engine for visualization)
 */

class NeuralNetwork {
  constructor(layers) {
    this.layers = layers; // [2, 4, 1] = 2 inputs, 4 hidden, 1 output
    this.weights = [];
    this.biases = [];
    this.learningRate = 0.1;
    this.initializeWeights();
  }

  // Initialize weights and biases
  initializeWeights() {
    for (let i = 0; i < this.layers.length - 1; i++) {
      const w = Array(this.layers[i]).fill(0).map(() =>
        Array(this.layers[i + 1]).fill(0).map(() => Math.random() * 2 - 1)
      );
      const b = Array(this.layers[i + 1]).fill(0).map(() => Math.random() * 2 - 1);
      
      this.weights.push(w);
      this.biases.push(b);
    }
    console.log(`[INIT] Network: ${this.layers.join('-')}`);
  }

  // Activation function (sigmoid)
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  // Sigmoid derivative
  sigmoidDerivative(x) {
    return x * (1 - x);
  }

  // Forward propagation
  forward(inputs) {
    let activations = inputs;
    const layerOutputs = [inputs];
    
    for (let i = 0; i < this.weights.length; i++) {
      const nextActivations = [];
      
      for (let j = 0; j < this.weights[i][0].length; j++) {
        let sum = this.biases[i][j];
        for (let k = 0; k < activations.length; k++) {
          sum += activations[k] * this.weights[i][k][j];
        }
        nextActivations.push(this.sigmoid(sum));
      }
      
      activations = nextActivations;
      layerOutputs.push(activations);
    }
    
    return { output: activations, layerOutputs };
  }

  // Backward propagation
  backward(inputs, target, layerOutputs) {
    const deltas = [];
    
    // Output layer error
    const outputLayer = layerOutputs[layerOutputs.length - 1];
    const outputDelta = outputLayer.map((o, i) =>
      (target[i] - o) * this.sigmoidDerivative(o)
    );
    deltas.unshift(outputDelta);
    
    // Hidden layers error
    for (let i = this.weights.length - 1; i > 0; i--) {
      const delta = [];
      const layer = layerOutputs[i];
      
      for (let j = 0; j < layer.length; j++) {
        let error = 0;
        for (let k = 0; k < deltas[0].length; k++) {
          error += deltas[0][k] * this.weights[i][j][k];
        }
        delta.push(error * this.sigmoidDerivative(layer[j]));
      }
      
      deltas.unshift(delta);
    }
    
    // Update weights and biases
    for (let i = 0; i < this.weights.length; i++) {
      for (let j = 0; j < this.weights[i].length; j++) {
        for (let k = 0; k < this.weights[i][j].length; k++) {
          this.weights[i][j][k] += this.learningRate * deltas[i][k] * layerOutputs[i][j];
        }
      }
      
      for (let j = 0; j < this.biases[i].length; j++) {
        this.biases[i][j] += this.learningRate * deltas[i][j];
      }
    }
  }

  // Train on dataset
  train(dataset, epochs) {
    console.log(`[TRAIN] Starting training for ${epochs} epochs`);
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalError = 0;
      
      for (const { input, output } of dataset) {
        const { output: predicted, layerOutputs } = this.forward(input);
        
        // Calculate error
        const error = output.reduce((sum, target, i) =>
          sum + Math.pow(target - predicted[i], 2), 0
        ) / output.length;
        totalError += error;
        
        // Backpropagation
        this.backward(input, output, layerOutputs);
      }
      
      if (epoch % 100 === 0) {
        console.log(`  Epoch ${epoch}: Error = ${(totalError / dataset.length).toFixed(4)}`);
      }
    }
  }

  // Predict
  predict(inputs) {
    return this.forward(inputs).output;
  }
}

// Demo
if (require.main === module) {
  console.log('=== Neural Network Demo ===\n');
  
  // XOR problem
  const nn = new NeuralNetwork([2, 4, 1]);
  
  const dataset = [
    { input: [0, 0], output: [0] },
    { input: [0, 1], output: [1] },
    { input: [1, 0], output: [1] },
    { input: [1, 1], output: [0] }
  ];
  
  console.log();
  
  // Train
  nn.train(dataset, 1000);
  
  console.log('\n--- Predictions ---\n');
  
  // Test
  for (const { input, output } of dataset) {
    const prediction = nn.predict(input);
    console.log(`Input: [${input}] -> Predicted: ${prediction[0].toFixed(3)}, Expected: ${output[0]}`);
  }
}

module.exports = NeuralNetwork;
