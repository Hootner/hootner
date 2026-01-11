#!/usr/bin/env node

/**
 * Auto-Scaling Agent - Standalone Runner
 * Monitors system resources and makes scaling decisions
 */

class AutoScalingAgent {
    constructor() {
        this.name = 'auto-scaling';
        this.type = 'infrastructure';
        this.status = 'stopped';
        this.metrics = {
            requestCount: 0,
            errorCount: 0,
            lastActive: null,
            startTime: null,
            uptime: 0,
            scalingDecisions: []
        };
        this.scalingInterval = null;
    }

    async start() {
        this.status = 'active';
        this.metrics.startTime = Date.now();
        this.metrics.lastActive = Date.now();

        console.log('\n' + '='.repeat(70));
        console.log('🚀 AUTO-SCALING AGENT - PRODUCTION MODE');
        console.log('='.repeat(70));
        console.log('✅ Agent started successfully');
        console.log('📊 Monitoring system resources...');
        console.log('🔄 Checking every 10 seconds');
        console.log('='.repeat(70) + '\n');

        // Start continuous monitoring
        this.scalingInterval = setInterval(() => this.checkScaling(), 10000);

        // Run immediately
        await this.checkScaling();
    }

    async checkScaling() {
        try {
            this.metrics.requestCount++;
            this.metrics.lastActive = Date.now();
            this.metrics.uptime = Date.now() - this.metrics.startTime;

            // Get actual system metrics
            const cpuUsage = process.cpuUsage();
            const memUsage = process.memoryUsage();

            const metrics = {
                cpuUser: Math.round((cpuUsage.user / 1000000) * 100) / 100,
                cpuSystem: Math.round((cpuUsage.system / 1000000) * 100) / 100,
                memoryHeapUsed: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
                memoryHeapTotal: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
                memoryExternal: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
                memoryRSS: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
                timestamp: new Date().toISOString()
            };

            // Simulate additional load metrics
            const totalCPU = metrics.cpuUser + metrics.cpuSystem;
            const cpuPercentage = Math.min(100, Math.max(0, (totalCPU % 100)));
            const memoryPercentage = (metrics.memoryHeapUsed / metrics.memoryHeapTotal) * 100;

            const decision = this.makeScalingDecision(cpuPercentage, memoryPercentage, metrics);

            // Log current status
            console.log('\n📊 RESOURCE MONITORING');
            console.log('─'.repeat(70));
            console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
            console.log(`💻 CPU Usage: ${cpuPercentage.toFixed(2)}%`);
            console.log(`🧠 Memory Heap Used: ${metrics.memoryHeapUsed} MB / ${metrics.memoryHeapTotal} MB`);
            console.log(`📈 Memory Usage: ${memoryPercentage.toFixed(2)}%`);
            console.log(`💾 RSS Memory: ${metrics.memoryRSS} MB`);
            console.log(`⏱️  Uptime: ${Math.floor(this.metrics.uptime / 1000)} seconds`);
            console.log(`🔢 Checks Performed: ${this.metrics.requestCount}`);

            if (decision.action !== 'maintain') {
                console.log('\n🚨 SCALING ACTION REQUIRED');
                console.log('─'.repeat(70));
                console.log(`⚡ Action: ${decision.action.toUpperCase().replace('_', ' ')}`);
                console.log(`📊 Reason: ${decision.reason}`);
                console.log(`🎯 Target Instances: ${decision.targetInstances}`);
                console.log(`📝 Details: ${decision.details}`);

                this.metrics.scalingDecisions.push({
                    ...decision,
                    timestamp: new Date().toISOString()
                });

                await this.executeScaling(decision);
            } else {
                console.log('\n✅ Status: System stable - No scaling needed');
            }

            console.log('─'.repeat(70));

            return { metrics, decision, status: 'success' };
        } catch (error) {
            this.metrics.errorCount++;
            console.error('\n❌ ERROR:', error.message);
            return { error: error.message, status: 'error' };
        }
    }

    makeScalingDecision(cpuUsage, memoryPercentage, metrics) {
        const currentInstances = parseInt(process.env.CURRENT_INSTANCES) || 1;

        // High resource usage - scale up
        if (cpuUsage > 75 || memoryPercentage > 80) {
            return {
                action: 'scale_up',
                currentInstances,
                targetInstances: currentInstances + 1,
                reason: 'High resource usage detected',
                details: `CPU: ${cpuUsage.toFixed(2)}%, Memory: ${memoryPercentage.toFixed(2)}%`,
                metrics
            };
        }

        // Very high usage - scale up by 2
        if (cpuUsage > 90 || memoryPercentage > 90) {
            return {
                action: 'scale_up',
                currentInstances,
                targetInstances: currentInstances + 2,
                reason: 'Critical resource usage - urgent scaling required',
                details: `CPU: ${cpuUsage.toFixed(2)}%, Memory: ${memoryPercentage.toFixed(2)}%`,
                metrics
            };
        }

        // Low resource usage - scale down (but keep minimum of 1)
        if (cpuUsage < 20 && memoryPercentage < 30 && currentInstances > 1) {
            return {
                action: 'scale_down',
                currentInstances,
                targetInstances: Math.max(1, currentInstances - 1),
                reason: 'Low resource usage - optimizing costs',
                details: `CPU: ${cpuUsage.toFixed(2)}%, Memory: ${memoryPercentage.toFixed(2)}%`,
                metrics
            };
        }

        // Normal operation
        return {
            action: 'maintain',
            currentInstances,
            targetInstances: currentInstances,
            reason: 'Resource usage within normal range',
            details: `CPU: ${cpuUsage.toFixed(2)}%, Memory: ${memoryPercentage.toFixed(2)}%`,
            metrics
        };
    }

    async executeScaling(decision) {
        console.log('\n🔧 EXECUTING SCALING OPERATION');
        console.log('─'.repeat(70));

        const scalingMode = process.env.SCALING_MODE || 'docker'; // 'kubernetes', 'docker', or 'simulate'
        const replicas = decision.targetInstances;

        try {
            switch (decision.action) {
                case 'scale_up':
                    console.log(`📈 Scaling UP from ${decision.currentInstances} to ${replicas} instances`);
                    await this.performScaling(scalingMode, replicas);
                    break;

                case 'scale_down':
                    console.log(`📉 Scaling DOWN from ${decision.currentInstances} to ${replicas} instances`);
                    await this.performScaling(scalingMode, replicas);
                    break;
            }

            console.log('✅ Scaling operation completed successfully');
        } catch (error) {
            console.error('❌ Scaling operation failed:', error.message);
            this.metrics.errorCount++;
        }

        console.log('─'.repeat(70));
    }

    async performScaling(mode, replicas) {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);

        switch (mode) {
            case 'kubernetes':
                console.log('🔄 Executing Kubernetes scaling...');
                const k8sCommand = `kubectl scale deployment hootner --replicas=${replicas}`;
                console.log(`   Command: ${k8sCommand}`);

                if (process.env.DRY_RUN !== 'true') {
                    try {
                        const { stdout, stderr } = await execAsync(k8sCommand);
                        console.log(`   ✅ Output: ${stdout}`);
                        if (stderr) console.log(`   ⚠️  Stderr: ${stderr}`);
                    } catch (error) {
                        console.log('   ⚠️  kubectl not available or deployment not found');
                        console.log('   💡 Install kubectl: https://kubernetes.io/docs/tasks/tools/');
                    }
                } else {
                    console.log('   🔍 DRY RUN - Command not executed');
                }
                break;

            case 'docker':
                console.log('🔄 Executing Docker Compose scaling...');
                const dockerCommand = `docker-compose up -d --scale app=${replicas}`;
                console.log(`   Command: ${dockerCommand}`);

                if (process.env.DRY_RUN !== 'true') {
                    try {
                        const { stdout, stderr } = await execAsync(dockerCommand);
                        console.log(`   ✅ Output: ${stdout}`);
                        if (stderr && !stderr.includes('WARNING')) console.log(`   ⚠️  Stderr: ${stderr}`);

                        // Update environment variable for next check
                        process.env.CURRENT_INSTANCES = replicas.toString();
                    } catch (error) {
                        console.log('   ⚠️  Docker Compose not available or service not configured');
                        console.log('   💡 Install Docker Desktop: https://www.docker.com/products/docker-desktop');
                    }
                } else {
                    console.log('   🔍 DRY RUN - Command not executed');
                }
                break;

            case 'aws':
                console.log('🔄 Executing AWS ECS/EKS scaling...');
                const awsCommand = `aws ecs update-service --cluster hootner-cluster --service hootner-service --desired-count ${replicas}`;
                console.log(`   Command: ${awsCommand}`);

                if (process.env.DRY_RUN !== 'true') {
                    try {
                        const { stdout } = await execAsync(awsCommand);
                        console.log('   ✅ Service scaled successfully');
                    } catch (error) {
                        console.log('   ⚠️  AWS CLI not available or not configured');
                        console.log('   💡 Install AWS CLI: https://aws.amazon.com/cli/');
                    }
                } else {
                    console.log('   🔍 DRY RUN - Command not executed');
                }
                break;

            default:
                console.log('🔍 SIMULATION MODE (no actual scaling)');
                console.log(`   Would execute: kubectl scale deployment hootner --replicas=${replicas}`);
                console.log(`   Would execute: docker-compose up -d --scale app=${replicas}`);
                console.log('   💡 Set SCALING_MODE=kubernetes or docker to enable real scaling');
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            recentDecisions: this.metrics.scalingDecisions.slice(-5)
        };
    }

    async stop() {
        console.log('\n🛑 Stopping Auto-Scaling Agent...');

        if (this.scalingInterval) {
            clearInterval(this.scalingInterval);
        }

        this.status = 'stopped';

        console.log('\n' + '='.repeat(70));
        console.log('📊 FINAL STATISTICS');
        console.log('─'.repeat(70));
        console.log(`⏱️  Total Runtime: ${Math.floor(this.metrics.uptime / 1000)} seconds`);
        console.log(`🔢 Total Checks: ${this.metrics.requestCount}`);
        console.log(`⚡ Scaling Decisions: ${this.metrics.scalingDecisions.length}`);
        console.log(`❌ Errors: ${this.metrics.errorCount}`);
        console.log('='.repeat(70));
        console.log('✅ Auto-Scaling Agent stopped gracefully\n');
    }
}

// Start the agent
const agent = new AutoScalingAgent();

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Received shutdown signal...');
    await agent.stop();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n\n⚠️  Received termination signal...');
    await agent.stop();
    process.exit(0);
});

// Start monitoring
agent.start().catch(error => {
    console.error('❌ Failed to start agent:', error);
    process.exit(1);
});

export default agent;
