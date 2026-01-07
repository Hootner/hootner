// Minimal Differential Privacy - Laplace Mechanism, Privacy Budget
class DifferentialPrivacy {
  constructor(epsilon = 1.0) {
    this.epsilon = epsilon; // Privacy budget
    this.spent = 0;
  }

  // Laplace noise
  laplace(scale) {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
  }

  // Add noise to query result
  addNoise(trueValue, sensitivity) {
    if (this.spent >= this.epsilon) {
      throw new Error('Privacy budget exhausted');
    }

    const scale = sensitivity / this.epsilon;
    const noise = this.laplace(scale);
    const noisyValue = trueValue + noise;
    
    this.spent += this.epsilon;
    
    return Math.round(noisyValue);
  }

  // Count query with DP
  count(data, predicate) {
    const trueCount = data.filter(predicate).length;
    return this.addNoise(trueCount, 1); // Sensitivity = 1 for counting
  }

  // Sum query with DP
  sum(data, accessor, maxValue) {
    const trueSum = data.reduce((acc, item) => acc + accessor(item), 0);
    return this.addNoise(trueSum, maxValue); // Sensitivity = max contribution
  }

  // Average with DP
  average(data, accessor, maxValue) {
    const n = data.length;
    const sum = this.sum(data, accessor, maxValue);
    return sum / n;
  }

  reset() {
    this.spent = 0;
  }
}

// Exponential mechanism for non-numeric queries
class ExponentialMechanism {
  constructor(epsilon = 1.0) {
    this.epsilon = epsilon;
  }

  // Select item with probability proportional to exp(epsilon * score / 2)
  select(items, scoreFn) {
    const scores = items.map(item => ({
      item,
      score: scoreFn(item),
      weight: 0
    }));

    // Calculate weights
    scores.forEach(s => {
      s.weight = Math.exp((this.epsilon * s.score) / 2);
    });

    const totalWeight = scores.reduce((acc, s) => acc + s.weight, 0);
    
    // Sample
    let rand = Math.random() * totalWeight;
    for (const s of scores) {
      rand -= s.weight;
      if (rand <= 0) return s.item;
    }

    return scores[scores.length - 1].item;
  }
}

// Demo
console.log('=== Differential Privacy Demo ===\n');

// Sample data: ages
const users = [
  { id: 1, age: 25, salary: 50000 },
  { id: 2, age: 30, salary: 60000 },
  { id: 3, age: 35, salary: 70000 },
  { id: 4, age: 40, salary: 80000 },
  { id: 5, age: 45, salary: 90000 }
];

const dp = new DifferentialPrivacy(1.0);

console.log('--- Count Query ---');
const trueCount = users.filter(u => u.age > 30).length;
const noisyCount = dp.count(users, u => u.age > 30);
console.log(`True count (age > 30): ${trueCount}`);
console.log(`Noisy count: ${noisyCount}`);

console.log('\n--- Sum Query ---');
dp.reset();
const trueSum = users.reduce((acc, u) => acc + u.salary, 0);
const noisySum = dp.sum(users, u => u.salary, 100000);
console.log(`True sum (salary): ${trueSum}`);
console.log(`Noisy sum: ${noisySum}`);

console.log('\n--- Exponential Mechanism ---');
const em = new ExponentialMechanism(1.0);
const candidates = ['A', 'B', 'C', 'D'];
const scores = { A: 10, B: 20, C: 15, D: 5 };

const selected = em.select(candidates, item => scores[item]);
console.log('Candidates:', candidates);
console.log('Scores:', scores);
console.log('Selected (privacy-preserving):', selected);

export { DifferentialPrivacy, ExponentialMechanism };
