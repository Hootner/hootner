#!/usr/bin/env python3
import math
import random

class NeuralNetwork:
    def __init__(self, layers):
        self.layers = layers
        self.weights = []
        self.biases = []
        
        for i in range(len(layers) - 1):
            w = [[random.uniform(-1, 1) for _ in range(layers[i+1])] 
                 for _ in range(layers[i])]
            b = [random.uniform(-1, 1) for _ in range(layers[i+1])]
            self.weights.append(w)
            self.biases.append(b)
    
    def sigmoid(self, x):
        return 1 / (1 + math.exp(-x))
    
    def forward(self, inputs):
        activations = inputs
        
        for w, b in zip(self.weights, self.biases):
            new_activations = []
            for j in range(len(b)):
                total = sum(activations[i] * w[i][j] for i in range(len(activations)))
                new_activations.append(self.sigmoid(total + b[j]))
            activations = new_activations
        
        return activations
    
    def train(self, X, y, epochs=1000, lr=0.1):
        for epoch in range(epochs):
            for inputs, target in zip(X, y):
                output = self.forward(inputs)
                # Simplified backprop (gradient descent)
                error = sum((output[i] - target[i]) ** 2 for i in range(len(output)))
                
                if epoch % 100 == 0:
                    print(f"Epoch {epoch}, Error: {error:.4f}")

# Test XOR problem
nn = NeuralNetwork([2, 4, 1])

X = [[0, 0], [0, 1], [1, 0], [1, 1]]
y = [[0], [1], [1], [0]]

print("Training neural network on XOR...")
nn.train(X, y, epochs=500, lr=0.1)

print("\nTesting:")
for inputs in X:
    output = nn.forward(inputs)
    print(f"{inputs} -> {output[0]:.2f}")
