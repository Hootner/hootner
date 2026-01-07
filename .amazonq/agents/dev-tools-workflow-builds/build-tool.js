const fs = require('fs');
const path = require('path');

class BuildTool {
    constructor(config = {}) {
        this.tasks = {};
        this.config = config;
    }
    
    task(name, deps, fn) {
        if (typeof deps === 'function') {
            fn = deps;
            deps = [];
        }
        this.tasks[name] = { deps, fn };
    }
    
    async run(taskName) {
        if (!this.tasks[taskName]) {
            throw new Error(`Task ${taskName} not found`);
        }
        
        const task = this.tasks[taskName];
        
        // Run dependencies first
        for (let dep of task.deps) {
            await this.run(dep);
        }
        
        console.log(`Running task: ${taskName}`);
        await task.fn(this.config);
    }
}

// Example usage
const build = new BuildTool({ src: 'src', dist: 'dist' });

build.task('clean', async (config) => {
    console.log(`Cleaning ${config.dist}...`);
    if (fs.existsSync(config.dist)) {
        fs.rmSync(config.dist, { recursive: true });
    }
});

build.task('compile', ['clean'], async (config) => {
    console.log(`Compiling ${config.src} to ${config.dist}...`);
    fs.mkdirSync(config.dist, { recursive: true });
    fs.writeFileSync(path.join(config.dist, 'output.js'), '// Compiled code');
});

build.task('test', async () => {
    console.log('Running tests...');
    console.log('✓ All tests passed');
});

build.task('build', ['compile', 'test'], async () => {
    console.log('✓ Build complete');
});

// Run
build.run('build').catch(console.error);
