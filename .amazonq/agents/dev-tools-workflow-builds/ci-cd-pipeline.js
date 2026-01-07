class Pipeline {
    constructor(name) {
        this.name = name;
        this.stages = [];
    }
    
    addStage(name, jobs) {
        this.stages.push({ name, jobs });
    }
    
    async run() {
        console.log(`\n=== Pipeline: ${this.name} ===\n`);
        
        for (let stage of this.stages) {
            console.log(`Stage: ${stage.name}`);
            
            for (let job of stage.jobs) {
                try {
                    await this.runJob(job);
                } catch (error) {
                    console.error(`✗ Job failed: ${job.name}`);
                    console.error(error.message);
                    return false;
                }
            }
            console.log();
        }
        
        console.log('✓ Pipeline completed successfully\n');
        return true;
    }
    
    async runJob(job) {
        console.log(`  Running: ${job.name}`);
        
        for (let step of job.steps) {
            console.log(`    - ${step.name}`);
            await step.run();
        }
        
        console.log(`  ✓ ${job.name} passed`);
    }
}

// Example pipeline
const pipeline = new Pipeline('Build and Deploy');

pipeline.addStage('Build', [
    {
        name: 'Compile',
        steps: [
            { name: 'Install dependencies', run: async () => { await sleep(100); } },
            { name: 'Compile source', run: async () => { await sleep(100); } }
        ]
    }
]);

pipeline.addStage('Test', [
    {
        name: 'Unit Tests',
        steps: [
            { name: 'Run unit tests', run: async () => { await sleep(100); } }
        ]
    },
    {
        name: 'Integration Tests',
        steps: [
            { name: 'Run integration tests', run: async () => { await sleep(100); } }
        ]
    }
]);

pipeline.addStage('Deploy', [
    {
        name: 'Deploy to Production',
        steps: [
            { name: 'Build Docker image', run: async () => { await sleep(100); } },
            { name: 'Push to registry', run: async () => { await sleep(100); } },
            { name: 'Deploy to cluster', run: async () => { await sleep(100); } }
        ]
    }
]);

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run pipeline
pipeline.run();
