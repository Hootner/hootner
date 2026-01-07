class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }
    
    describe(suite, fn) {
        console.log(`\n${suite}`);
        fn();
    }
    
    it(description, fn) {
        this.tests.push({ description, fn });
    }
    
    async run() {
        console.log('\nRunning tests...\n');
        
        for (let test of this.tests) {
            try {
                await test.fn();
                console.log(`  ✓ ${test.description}`);
                this.passed++;
            } catch (error) {
                console.log(`  ✗ ${test.description}`);
                console.log(`    ${error.message}`);
                this.failed++;
            }
        }
        
        console.log(`\n${this.passed} passed, ${this.failed} failed\n`);
        return this.failed === 0;
    }
    
    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected} but got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy but got ${actual}`);
                }
            }
        };
    }
}

// Example tests
const runner = new TestRunner();

runner.describe('Math operations', () => {
    runner.it('should add numbers', () => {
        runner.expect(2 + 2).toBe(4);
    });
    
    runner.it('should multiply numbers', () => {
        runner.expect(3 * 4).toBe(12);
    });
    
    runner.it('should handle arrays', () => {
        runner.expect([1, 2, 3]).toEqual([1, 2, 3]);
    });
});

runner.describe('String operations', () => {
    runner.it('should concatenate strings', () => {
        runner.expect('hello' + ' world').toBe('hello world');
    });
});

runner.run();
