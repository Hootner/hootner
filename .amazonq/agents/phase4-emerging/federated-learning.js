// Minimal Federated Learning - Distributed Training, Model Aggregation
class FederatedClient {
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.model = null;
  }

  train(globalModel, epochs = 1) {
    this.model = { ...globalModel };
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      this.data.forEach(({ x, y }) => {
        const prediction = this.predict(x);
        const error = y - prediction;
        
        // Simple gradient descent
        this.model.weights = this.model.weights.map((w, i) => 
          w + 0.01 * error * x[i]
        );
        this.model.bias += 0.01 * error;
      });
    }

    return this.model;
  }

  predict(x) {
    const sum = this.model.weights.reduce((acc, w, i) => acc + w * x[i], 0);
    return sum + this.model.bias;
  }

  evaluate(testData) {
    let totalError = 0;
    testData.forEach(({ x, y }) => {
      const pred = this.predict(x);
      totalError += Math.abs(y - pred);
    });
    return totalError / testData.length;
  }
}

class FederatedServer {
  constructor(modelShape) {
    this.globalModel = {
      weights: Array(modelShape).fill(0),
      bias: 0
    };
    this.clients = [];
    this.round = 0;
  }

  addClient(client) {
    this.clients.push(client);
  }

  // Federated averaging
  aggregate(clientModels) {
    const n = clientModels.length;
    
    // Average weights
    const avgWeights = this.globalModel.weights.map((_, i) => {
      const sum = clientModels.reduce((acc, model) => acc + model.weights[i], 0);
      return sum / n;
    });

    // Average bias
    const avgBias = clientModels.reduce((acc, model) => acc + model.bias, 0) / n;

    this.globalModel = { weights: avgWeights, bias: avgBias };
  }

  trainRound(epochs = 1) {
    console.log(`\n=== Round ${++this.round} ===`);
    
    const clientModels = this.clients.map(client => {
      const model = client.train(this.globalModel, epochs);
      console.log(`Client ${client.id} trained`);
      return model;
    });

    this.aggregate(clientModels);
    console.log('Global model updated');
  }

  getModel() {
    return this.globalModel;
  }
}

// Demo: Linear regression
console.log('=== Federated Learning Demo ===\n');

// Create server
const server = new FederatedServer(2); // 2 features

// Create clients with local data
const client1 = new FederatedClient('client-1', [
  { x: [1, 2], y: 5 },
  { x: [2, 3], y: 8 },
  { x: [3, 4], y: 11 }
]);

const client2 = new FederatedClient('client-2', [
  { x: [1, 1], y: 3 },
  { x: [2, 2], y: 6 },
  { x: [3, 3], y: 9 }
]);

const client3 = new FederatedClient('client-3', [
  { x: [2, 1], y: 4 },
  { x: [3, 2], y: 7 },
  { x: [4, 3], y: 10 }
]);

server.addClient(client1);
server.addClient(client2);
server.addClient(client3);

// Train for multiple rounds
for (let i = 0; i < 5; i++) {
  server.trainRound(3);
}

// Test global model
console.log('\n=== Final Model ===');
const model = server.getModel();
console.log('Weights:', model.weights.map(w => w.toFixed(2)));
console.log('Bias:', model.bias.toFixed(2));

// Test prediction
client1.model = model;
const testX = [2, 2];
const pred = client1.predict(testX);
console.log(`\nPrediction for [${testX}]:`, pred.toFixed(2));

export { FederatedServer, FederatedClient };
