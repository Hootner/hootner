#!/usr/bin/env node

/**
 * Agent Orchestrator
 * Coordinates multiple agents working together on complex tasks
 */

import { EventEmitter } from 'events';
import { advancedAgents } from './advanced-agents.js';

class AgentOrchestrator extends EventEmitter {
    constructor() {
        super();
        this.agents = new Map();
        this.tasks = new Map();
        this.workflows = new Map();
        this.taskCounter = 0;
    }

    async initialize() {
        console.log('🎭 Initializing Agent Orchestrator...');

        // Initialize advanced agents
        for (const [name, AgentClass] of Object.entries(advancedAgents)) {
            try {
                const instance = new AgentClass();
                await instance.start();
                this.agents.set(name, instance);

                // Listen to agent events
                instance.on('started', (data) => this.emit('agent-started', data));
                instance.on('stopped', (data) => this.emit('agent-stopped', data));

                console.log(`   ✅ ${name} ready`);
            } catch (error) {
                console.error(`   ❌ ${name} failed to initialize: ${error.message}`);
            }
        }

        console.log(`✅ Orchestrator initialized with ${this.agents.size} agents\n`);
    }

    /**
     * Execute a complex task requiring multiple agents
     */
    async executeTask(taskConfig) {
        const taskId = `task-${++this.taskCounter}`;
        const task = {
            id: taskId,
            config: taskConfig,
            status: 'running',
            startTime: Date.now(),
            steps: [],
            results: {}
        };

        this.tasks.set(taskId, task);
        this.emit('task-started', { taskId, config: taskConfig });

        try {
            console.log(`\n🎯 Executing task: ${taskConfig.type} (${taskId})`);

            // Route to appropriate workflow
            const result = await this.routeTask(taskConfig);

            task.status = 'completed';
            task.endTime = Date.now();
            task.results = result;

            this.emit('task-completed', { taskId, result });
            console.log(`✅ Task ${taskId} completed in ${task.endTime - task.startTime}ms\n`);

            return result;
        } catch (error) {
            task.status = 'failed';
            task.error = error.message;
            this.emit('task-failed', { taskId, error: error.message });
            console.error(`❌ Task ${taskId} failed: ${error.message}\n`);
            throw error;
        }
    }

    async routeTask(taskConfig) {
        switch (taskConfig.type) {
            case 'code-analysis':
                return await this.executeCodeAnalysisWorkflow(taskConfig);
            case 'deployment':
                return await this.executeDeploymentWorkflow(taskConfig);
            case 'documentation':
                return await this.executeDocumentationWorkflow(taskConfig);
            case 'maintenance':
                return await this.executeMaintenanceWorkflow(taskConfig);
            case 'learning':
                return await this.executeLearningWorkflow(taskConfig);
            default:
                throw new Error(`Unknown task type: ${taskConfig.type}`);
        }
    }

    /**
     * Code Analysis Workflow
     * Intelligent Code Agent + Security Agent + Compliance Agent
     */
    async executeCodeAnalysisWorkflow(config) {
        console.log('   📊 Starting code analysis workflow...');

        const codeAgent = this.agents.get('IntelligentCodeAgent');
        if (!codeAgent) throw new Error('Intelligent Code Agent not available');

        // Step 1: Analyze codebase
        console.log('   1/4 Analyzing codebase...');
        const analysis = await codeAgent.analyzeCodebase(config.targetPath);

        // Step 2: Security scan
        console.log('   2/4 Running security scan...');
        const security = await analysis.security;

        // Step 3: Generate refactoring recommendations
        console.log('   3/4 Generating recommendations...');
        const recommendations = codeAgent.generateRecommendations(analysis);

        // Step 4: Auto-fix if requested
        if (config.autoFix) {
            console.log('   4/4 Applying auto-fixes...');
            for (const file of analysis.complexity.highComplexityFiles.slice(0, 5)) {
                await codeAgent.autoRefactor(file, { aggressive: false });
            }
        } else {
            console.log('   4/4 Skipping auto-fix (not requested)');
        }

        return {
            analysis,
            recommendations,
            summary: {
                filesAnalyzed: 100, // placeholder
                issuesFound: recommendations.length,
                securityScore: security.riskScore,
                autoFixApplied: config.autoFix
            }
        };
    }

    /**
     * Deployment Workflow
     * Autonomous Deployment Agent + Predictive Maintenance Agent
     */
    async executeDeploymentWorkflow(config) {
        console.log('   🚀 Starting deployment workflow...');

        const deployAgent = this.agents.get('AutonomousDeploymentAgent');
        const maintenanceAgent = this.agents.get('PredictiveMaintenanceAgent');

        if (!deployAgent) throw new Error('Autonomous Deployment Agent not available');

        // Step 1: Pre-deployment health check
        if (maintenanceAgent) {
            console.log('   1/3 Running pre-deployment health check...');
            await maintenanceAgent.performHealthCheck();
        }

        // Step 2: Execute deployment
        console.log('   2/3 Executing deployment...');
        const result = await deployAgent.deployApplication(config);

        // Step 3: Post-deployment monitoring
        if (maintenanceAgent && result.success) {
            console.log('   3/3 Monitoring post-deployment health...');
            setTimeout(() => maintenanceAgent.performHealthCheck(), 5000);
        } else {
            console.log('   3/3 Skipping post-deployment monitoring (deployment failed)');
        }

        return result;
    }

    /**
     * Documentation Workflow
     * Intelligent Documentation Agent + Code Analysis
     */
    async executeDocumentationWorkflow(config) {
        console.log('   📝 Starting documentation workflow...');

        const docAgent = this.agents.get('IntelligentDocumentationAgent');
        const codeAgent = this.agents.get('IntelligentCodeAgent');

        if (!docAgent) throw new Error('Intelligent Documentation Agent not available');

        // Step 1: Analyze code structure
        let codeStructure = null;
        if (codeAgent) {
            console.log('   1/3 Analyzing code structure...');
            codeStructure = await codeAgent.analyzeCodebase(config.targetPath);
        }

        // Step 2: Generate documentation
        console.log('   2/3 Generating documentation...');
        const docs = await docAgent.generateDocumentation(config.targetPath, {
            includeArchitecture: config.includeArchitecture || true
        });

        // Step 3: Add insights from code analysis
        if (codeStructure) {
            console.log('   3/3 Enriching docs with code insights...');
            docs.codeInsights = {
                complexity: codeStructure.complexity.averageComplexity,
                maintainability: codeStructure.maintainability.score,
                securityScore: codeStructure.security.riskScore
            };
        }

        return docs;
    }

    /**
     * Maintenance Workflow
     * Predictive Maintenance Agent + Auto-remediation
     */
    async executeMaintenanceWorkflow(config) {
        console.log('   🔧 Starting maintenance workflow...');

        const maintenanceAgent = this.agents.get('PredictiveMaintenanceAgent');
        if (!maintenanceAgent) throw new Error('Predictive Maintenance Agent not available');

        // Perform comprehensive health check
        console.log('   1/2 Running comprehensive health check...');
        await maintenanceAgent.performHealthCheck();

        // Get maintenance recommendations
        console.log('   2/2 Generating maintenance plan...');
        const plan = {
            immediateActions: maintenanceAgent.anomalies.filter(a => a.severity === 'critical'),
            scheduledMaintenance: maintenanceAgent.anomalies.filter(a => a.severity === 'warning'),
            recommendations: []
        };

        return plan;
    }

    /**
     * Learning Workflow
     * Continuous Learning Agent + Feedback Processing
     */
    async executeLearningWorkflow(config) {
        console.log('   🧠 Starting learning workflow...');

        const learningAgent = this.agents.get('ContinuousLearningAgent');
        if (!learningAgent) throw new Error('Continuous Learning Agent not available');

        // Process learning cycle
        console.log('   1/2 Processing learning cycle...');
        await learningAgent.processLearningCycle();

        // Apply feedback if provided
        if (config.feedback) {
            console.log('   2/2 Processing user feedback...');
            await learningAgent.recordFeedback(config.feedback);
        }

        return {
            patterns: learningAgent.patterns.size,
            feedbackProcessed: learningAgent.feedbackHistory.length,
            status: 'learning-active'
        };
    }

    /**
     * Create a custom workflow
     */
    registerWorkflow(name, workflow) {
        this.workflows.set(name, workflow);
        console.log(`✅ Registered custom workflow: ${name}`);
    }

    /**
     * Get agent status
     */
    getStatus() {
        const status = {
            agents: {},
            tasks: {
                total: this.tasks.size,
                running: 0,
                completed: 0,
                failed: 0
            }
        };

        // Agent status
        for (const [name, agent] of this.agents) {
            status.agents[name] = {
                status: agent.status,
                metrics: agent.metrics
            };
        }

        // Task statistics
        for (const task of this.tasks.values()) {
            status.tasks[task.status]++;
        }

        return status;
    }

    /**
     * Shutdown all agents
     */
    async shutdown() {
        console.log('🛑 Shutting down Agent Orchestrator...');

        for (const [name, agent] of this.agents) {
            try {
                await agent.stop();
                console.log(`   ✅ ${name} stopped`);
            } catch (error) {
                console.error(`   ❌ ${name} failed to stop: ${error.message}`);
            }
        }

        console.log('✅ Agent Orchestrator shutdown complete');
    }
}

export default AgentOrchestrator;
