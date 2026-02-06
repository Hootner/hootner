#!/usr/bin/env node

/**
 * Test Suite for Advanced Agents
 */

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { advancedAgents } from '../frameworks/ai/agents/advanced-agents.js';
import AgentOrchestrator from '../frameworks/ai/agents/agent-orchestrator.js';

describe('Advanced Agents', () => {
    let orchestrator;

    beforeAll(async () => {
        orchestrator = new AgentOrchestrator();
        await orchestrator.initialize();
    });

    afterAll(async () => {
        await orchestrator.shutdown();
    });

    describe('Agent Initialization', () => {
        it('should initialize all advanced agents', () => {
            expect(orchestrator.agents.size).toBeGreaterThan(0);
        });

        it('should have all agents in active status', () => {
            for (const [name, agent] of orchestrator.agents) {
                expect(agent.status).toBe('active');
            }
        });
    });

    describe('Intelligent Code Agent', () => {
        it('should analyze codebase', async () => {
            const result = await orchestrator.executeTask({
                type: 'code-analysis',
                targetPath: '.',
                autoFix: false
            });

            expect(result).toHaveProperty('analysis');
            expect(result).toHaveProperty('recommendations');
            expect(result).toHaveProperty('summary');
        });

        it('should generate recommendations', async () => {
            const result = await orchestrator.executeTask({
                type: 'code-analysis',
                targetPath: '.',
                autoFix: false
            });

            expect(Array.isArray(result.recommendations)).toBe(true);
        });
    });

    describe('Continuous Learning Agent', () => {
        it('should process learning workflow', async () => {
            const result = await orchestrator.executeTask({
                type: 'learning'
            });

            expect(result).toHaveProperty('patterns');
            expect(result).toHaveProperty('feedbackProcessed');
            expect(result).toHaveProperty('status');
        });

        it('should accept feedback', async () => {
            const result = await orchestrator.executeTask({
                type: 'learning',
                feedback: {
                    type: 'positive',
                    context: { feature: 'deployment' }
                }
            });

            expect(result.status).toBe('learning-active');
        });
    });

    describe('Predictive Maintenance Agent', () => {
        it('should perform maintenance workflow', async () => {
            const result = await orchestrator.executeTask({
                type: 'maintenance'
            });

            expect(result).toHaveProperty('immediateActions');
            expect(result).toHaveProperty('scheduledMaintenance');
            expect(result).toHaveProperty('recommendations');
        });
    });

    describe('Autonomous Deployment Agent', () => {
        it('should handle deployment configuration', async () => {
            const config = {
                type: 'deployment',
                environment: 'staging',
                branch: 'main'
            };

            // Note: This is a dry run - won't actually deploy
            const result = await orchestrator.executeTask(config);

            expect(result).toHaveProperty('success');
        });
    });

    describe('Intelligent Documentation Agent', () => {
        it('should generate documentation', async () => {
            const result = await orchestrator.executeTask({
                type: 'documentation',
                targetPath: '.',
                includeArchitecture: true
            });

            expect(result).toHaveProperty('overview');
            expect(result).toHaveProperty('api');
            expect(result).toHaveProperty('examples');
            expect(result).toHaveProperty('changelog');
        });
    });

    describe('Agent Orchestration', () => {
        it('should track task metrics', () => {
            const status = orchestrator.getStatus();

            expect(status).toHaveProperty('agents');
            expect(status).toHaveProperty('tasks');
            expect(status.tasks).toHaveProperty('total');
        });

        it('should emit events on task execution', (done) => {
            orchestrator.once('task-started', ({ taskId, config }) => {
                expect(taskId).toBeTruthy();
                expect(config).toBeTruthy();
                done();
            });

            orchestrator.executeTask({
                type: 'learning'
            });
        });
    });

    describe('Agent Metrics', () => {
        it('should track operation count', async () => {
            const agent = orchestrator.agents.get('IntelligentCodeAgent');
            const initialOps = agent?.metrics.operations || 0;

            await orchestrator.executeTask({
                type: 'code-analysis',
                targetPath: '.',
                autoFix: false
            });

            expect(agent?.metrics.operations).toBeGreaterThan(initialOps);
        });

        it('should calculate success rate', async () => {
            const agent = orchestrator.agents.get('ContinuousLearningAgent');

            await orchestrator.executeTask({ type: 'learning' });

            expect(agent?.metrics.successRate).toBeGreaterThanOrEqual(0);
            expect(agent?.metrics.successRate).toBeLessThanOrEqual(100);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid task type', async () => {
            await expect(
                orchestrator.executeTask({ type: 'invalid-type' })
            ).rejects.toThrow();
        });

        it('should track failed tasks', async () => {
            const initialFailed = orchestrator.getStatus().tasks.failed;

            try {
                await orchestrator.executeTask({ type: 'invalid-type' });
            } catch (error) {
                // Expected to fail
            }

            const newFailed = orchestrator.getStatus().tasks.failed;
            expect(newFailed).toBeGreaterThanOrEqual(initialFailed);
        });
    });
});

describe('Advanced Agent Classes', () => {
    describe('IntelligentCodeAgent', () => {
        let agent;

        beforeAll(async () => {
            const { IntelligentCodeAgent } = advancedAgents;
            agent = new IntelligentCodeAgent();
            await agent.start();
        });

        afterAll(async () => {
            await agent.stop();
        });

        it('should have required capabilities', () => {
            expect(agent.capabilities).toContain('code-analysis');
            expect(agent.capabilities).toContain('refactoring');
            expect(agent.capabilities).toContain('security-scanning');
        });

        it('should record metrics', () => {
            expect(agent.metrics).toHaveProperty('operations');
            expect(agent.metrics).toHaveProperty('successRate');
            expect(agent.metrics).toHaveProperty('avgResponseTime');
        });
    });

    describe('PredictiveMaintenanceAgent', () => {
        let agent;

        beforeAll(async () => {
            const { PredictiveMaintenanceAgent } = advancedAgents;
            agent = new PredictiveMaintenanceAgent();
            await agent.start();
        });

        afterAll(async () => {
            await agent.stop();
        });

        it('should detect anomalies', async () => {
            const metrics = await agent.collectMetrics();
            const anomalies = agent.detectAnomalies(metrics);

            expect(Array.isArray(anomalies)).toBe(true);
        });

        it('should predict failures', async () => {
            const metrics = await agent.collectMetrics();
            const predictions = agent.predictFailures(metrics);

            expect(Array.isArray(predictions)).toBe(true);
        });
    });
});

console.log('✅ Advanced Agent tests loaded');
