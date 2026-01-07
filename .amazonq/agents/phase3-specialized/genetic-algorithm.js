// Minimal Genetic Algorithm - Evolution, Selection, Crossover, Mutation
class GeneticAlgorithm {
  constructor(config) {
    this.populationSize = config.populationSize || 100;
    this.geneLength = config.geneLength;
    this.fitness = config.fitness;
    this.mutationRate = config.mutationRate || 0.01;
    this.crossoverRate = config.crossoverRate || 0.7;
    this.population = [];
  }

  initPopulation() {
    this.population = Array(this.populationSize).fill(null).map(() => ({
      genes: Array(this.geneLength).fill(0).map(() => Math.random()),
      fitness: 0
    }));
  }

  evaluateFitness() {
    this.population.forEach(individual => {
      individual.fitness = this.fitness(individual.genes);
    });
    this.population.sort((a, b) => b.fitness - a.fitness);
  }

  select() {
    // Tournament selection
    const tournament = [];
    for (let i = 0; i < 3; i++) {
      tournament.push(this.population[Math.floor(Math.random() * this.population.length)]);
    }
    return tournament.reduce((best, ind) => ind.fitness > best.fitness ? ind : best);
  }

  crossover(parent1, parent2) {
    if (Math.random() > this.crossoverRate) return parent1;
    
    const point = Math.floor(Math.random() * this.geneLength);
    return {
      genes: [...parent1.genes.slice(0, point), ...parent2.genes.slice(point)],
      fitness: 0
    };
  }

  mutate(individual) {
    return {
      genes: individual.genes.map(gene => 
        Math.random() < this.mutationRate ? Math.random() : gene
      ),
      fitness: 0
    };
  }

  evolve(generations) {
    this.initPopulation();
    
    for (let gen = 0; gen < generations; gen++) {
      this.evaluateFitness();
      
      if (gen % 10 === 0) {
        console.log(`Gen ${gen}: Best fitness = ${this.population[0].fitness.toFixed(4)}`);
      }

      const newPopulation = [this.population[0]]; // Elitism
      
      while (newPopulation.length < this.populationSize) {
        const parent1 = this.select();
        const parent2 = this.select();
        let child = this.crossover(parent1, parent2);
        child = this.mutate(child);
        newPopulation.push(child);
      }
      
      this.population = newPopulation;
    }
    
    this.evaluateFitness();
    return this.population[0];
  }
}

// Demo: Optimize function f(x) = -x^2 + 4x
console.log('=== Genetic Algorithm Demo ===\n');

const ga = new GeneticAlgorithm({
  populationSize: 50,
  geneLength: 1,
  fitness: genes => {
    const x = genes[0] * 10; // Scale to [0, 10]
    return -(x ** 2) + 4 * x; // Maximum at x=2
  },
  mutationRate: 0.1,
  crossoverRate: 0.8
});

const best = ga.evolve(50);
console.log(`\nBest solution: x = ${(best.genes[0] * 10).toFixed(2)}`);
console.log(`Fitness: ${best.fitness.toFixed(4)}`);

export default GeneticAlgorithm;
