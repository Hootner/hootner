#!/usr/bin/env python3
import math
import random

class Tensor:
    def __init__(self, data, requires_grad=False):
        self.data = data if isinstance(data, list) else [data]
        self.grad = [0] * len(self.data) if requires_grad else None
        self.requires_grad = requires_grad
    
    def __add__(self, other):
        result = [a + b for a, b in zip(self.data, other.data)]
        return Tensor(result, self.requires_grad or other.requires_grad)
    
    def __mul__(self, other):
        if isinstance(other, (int, float)):
            result = [a * other for a in self.data]
        else:
            result = [a * b for a, b in zip(self.data, other.data)]
        return Tensor(result, self.requires_grad)
    
    def sum(self):
        return Tensor([sum(self.data)], self.requires_grad)

class Linear:
    def __init__(self, in_features, out_features):
        self.weights = [[random.uniform(-1, 1) for _ in range(out_features)] 
                       for _ in range(in_features)]
        self.bias = [random.uniform(-1, 1) for _ in range(out_features)]
    
    def forward(self, x):
        output = []
        for j in range(len(self.bias)):
            val = sum(x[i] * self.weights[i][j] for i in range(len(x)))
            output.append(val + self.bias[j])
        return output

class ReLU:
    def forward(self, x):
        return [max(0, val) for val in x]

class MSELoss:
    def forward(self, pred, target):
        return sum((p - t) ** 2 for p, t in zip(pred, target)) / len(pred)

class SGD:
    def __init__(self, parameters, lr=0.01):
        self.parameters = parameters
        self.lr = lr
    
    def step(self, gradients):
        for param, grad in zip(self.parameters, gradients):
            for i in range(len(param)):
                if isinstance(param[i], list):
                    for j in range(len(param[i])):
                        param[i][j] -= self.lr * grad[i][j]
                else:
                    param[i] -= self.lr * grad[i]
    
    def zero_grad(self):
        pass

class MLFramework:
    def __init__(self):
        self.models = []
    
    def create_model(self, layers):
        model = {'layers': layers}
        self.models.append(model)
        return model
    
    def train(self, model, X, y, epochs=100, lr=0.01):
        print(f"Training for {epochs} epochs...")
        
        for epoch in range(epochs):
            total_loss = 0
            
            for inputs, target in zip(X, y):
                # Forward pass
                output = inputs
                for layer in model['layers']:
                    output = layer.forward(output)
                
                # Loss
                loss = MSELoss().forward(output, target)
                total_loss += loss
            
            if epoch % 20 == 0:
                print(f"Epoch {epoch}, Loss: {total_loss / len(X):.4f}")

# Test
framework = MLFramework()

layer1 = Linear(2, 4)
relu = ReLU()
layer2 = Linear(4, 1)

model = framework.create_model([layer1, relu, layer2])

X = [[0, 0], [0, 1], [1, 0], [1, 1]]
y = [[0], [1], [1], [0]]

framework.train(model, X, y, epochs=100)

print("\nTesting:")
for inputs in X:
    output = inputs
    for layer in model['layers']:
        output = layer.forward(output)
    print(f"{inputs} -> {output[0]:.2f}")
