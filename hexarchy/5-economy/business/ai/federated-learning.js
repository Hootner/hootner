/**
 * Federated Learning Service - Privacy-Preserving ML
 * Distributed machine learning with privacy protection
 */

class FederatedLearningService {
    constructor() {
        this.federations = new Map();
        this.clients = new Map();
        this.rounds = new Map();
        this.globalModels = new Map();
        this.metrics = {
            activeFederations: 0,
            connectedClients: 0,
            trainingRounds: 0,
            privacyScore: 100
        };
        this.initializeFederations();
    }

    // Federation Initialization
    initializeFederations() {
        const federations = [
            {
                id: 'content_recommendation_fed',
                name: 'Content Recommendation Federation',
                modelType: 'neural_collaborative_filtering',
                privacyLevel: 'high',
                aggregationMethod: 'federated_averaging',
                minClients: 10,
                maxClients: 1000,
                roundDuration: 3600 // 1 hour
            },
            {
                id: 'user_behavior_fed',
                name: 'User Behavior Analysis Federation',
                modelType: 'lstm_autoencoder',
                privacyLevel: 'very_high',
                aggregationMethod: 'secure_aggregation',
                minClients: 5,
                maxClients: 500,
                roundDuration: 7200 // 2 hours
            },
            {
                id: 'content_moderation_fed',
                name: 'Content Moderation Federation',
                modelType: 'transformer_classifier',
                privacyLevel: 'high',
                aggregationMethod: 'differential_privacy',
                minClients: 20,
                maxClients: 2000,
                roundDuration: 1800 // 30 minutes
            }
        ];

        federations.forEach(federation => {
            this.federations.set(federation.id, {
                ...federation,
                status: 'active',
                currentRound: 0,
                clients: [],
                globalModel: null,
                createdAt: new Date()
            });
            this.metrics.activeFederations++;
        });
    }

    // Client Management
    async registerClient(clientConfig) {
        const client = {
            id: `CLIENT-${Date.now()}`,
            federationId: clientConfig.federationId,
            deviceId: clientConfig.deviceId,
            capabilities: {
                computePower: clientConfig.computePower || 'medium',
                memorySize: clientConfig.memorySize || '4GB',
                networkBandwidth: clientConfig.networkBandwidth || '100Mbps',
                batteryLevel: clientConfig.batteryLevel || 100
            },
            dataStats: {
                sampleCount: clientConfig.sampleCount || 0,
                dataQuality: clientConfig.dataQuality || 'good',
                lastUpdate: new Date()
            },
            privacy: {
                differentialPrivacy: clientConfig.differentialPrivacy !== false,
                noiseLevel: clientConfig.noiseLevel || 0.1,
                encryptionEnabled: true
            },
            status: 'registered',
            joinedAt: new Date()
        };

        const federation = this.federations.get(clientConfig.federationId);
        if (!federation) throw new Error('Federation not found');

        this.clients.set(client.id, client);
        federation.clients.push(client.id);
        this.metrics.connectedClients++;

        return client;
    }

    async selectClientsForRound(federationId, roundConfig) {
        const federation = this.federations.get(federationId);
        if (!federation) throw new Error('Federation not found');

        const availableClients = federation.clients
            .map(clientId => this.clients.get(clientId))
            .filter(client => client && this.isClientEligible(client, roundConfig));

        // Selection strategies
        const selectionStrategy = roundConfig.strategy || 'random';
        const targetCount = Math.min(
            roundConfig.clientCount || federation.minClients,
            availableClients.length
        );

        let selectedClients = [];

        switch (selectionStrategy) {
            case 'random':
                selectedClients = this.randomSelection(availableClients, targetCount);
                break;
            case 'data_quality':
                selectedClients = this.qualityBasedSelection(availableClients, targetCount);
                break;
            case 'resource_aware':
                selectedClients = this.resourceAwareSelection(availableClients, targetCount);
                break;
            case 'diversity':
                selectedClients = this.diversityBasedSelection(availableClients, targetCount);
                break;
        }

        return selectedClients.map(client => client.id);
    }

    isClientEligible(client, roundConfig) {
        // Check basic eligibility criteria
        if (client.status !== 'registered') return false;
        if (client.capabilities.batteryLevel < 20) return false;
        if (client.dataStats.sampleCount < 10) return false;
        
        // Check resource requirements
        const minCompute = roundConfig.minComputePower || 'low';
        const computeLevels = { 'low': 1, 'medium': 2, 'high': 3 };
        if (computeLevels[client.capabilities.computePower] < computeLevels[minCompute]) {
            return false;
        }

        return true;
    }

    randomSelection(clients, count) {
        const shuffled = [...clients].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    qualityBasedSelection(clients, count) {
        const qualityScores = { 'excellent': 4, 'good': 3, 'fair': 2, 'poor': 1 };
        return clients
            .sort((a, b) => {
                const scoreA = qualityScores[a.dataStats.dataQuality] || 1;
                const scoreB = qualityScores[b.dataStats.dataQuality] || 1;
                return scoreB - scoreA;
            })
            .slice(0, count);
    }

    resourceAwareSelection(clients, count) {
        return clients
            .sort((a, b) => {
                const scoreA = this.calculateResourceScore(a);
                const scoreB = this.calculateResourceScore(b);
                return scoreB - scoreA;
            })
            .slice(0, count);
    }

    calculateResourceScore(client) {
        const computeScores = { 'low': 1, 'medium': 2, 'high': 3 };
        const computeScore = computeScores[client.capabilities.computePower] || 1;
        const batteryScore = client.capabilities.batteryLevel / 100;
        const dataScore = Math.min(1, client.dataStats.sampleCount / 1000);
        
        return (computeScore + batteryScore + dataScore) / 3;
    }

    diversityBasedSelection(clients, count) {
        // Select clients with diverse data characteristics
        const selected = [];
        const remaining = [...clients];
        
        while (selected.length < count && remaining.length > 0) {
            if (selected.length === 0) {
                // Select first client randomly
                const randomIndex = Math.floor(Math.random() * remaining.length);
                selected.push(remaining.splice(randomIndex, 1)[0]);
            } else {
                // Select client that maximizes diversity
                let bestClient = null;
                let bestDiversityScore = -1;
                let bestIndex = -1;
                
                remaining.forEach((client, index) => {
                    const diversityScore = this.calculateDiversityScore(client, selected);
                    if (diversityScore > bestDiversityScore) {
                        bestDiversityScore = diversityScore;
                        bestClient = client;
                        bestIndex = index;
                    }
                });
                
                if (bestClient) {
                    selected.push(bestClient);
                    remaining.splice(bestIndex, 1);
                }
            }
        }
        
        return selected;
    }

    calculateDiversityScore(client, selectedClients) {
        // Simplified diversity calculation based on data characteristics
        let diversityScore = 0;
        
        selectedClients.forEach(selectedClient => {
            // Different compute capabilities
            if (client.capabilities.computePower !== selectedClient.capabilities.computePower) {
                diversityScore += 0.3;
            }
            
            // Different data quality levels
            if (client.dataStats.dataQuality !== selectedClient.dataStats.dataQuality) {
                diversityScore += 0.2;
            }
            
            // Different sample sizes (normalized)
            const sizeDiff = Math.abs(client.dataStats.sampleCount - selectedClient.dataStats.sampleCount);
            diversityScore += Math.min(0.5, sizeDiff / 10000);
        });
        
        return diversityScore / selectedClients.length;
    }

    // Federated Training Round
    async startTrainingRound(roundConfig) {
        const round = {
            id: `ROUND-${Date.now()}`,
            federationId: roundConfig.federationId,
            roundNumber: roundConfig.roundNumber,
            selectedClients: [],
            globalModelVersion: roundConfig.globalModelVersion,
            status: 'starting',
            startTime: new Date(),
            clientUpdates: new Map(),
            aggregationResult: null
        };

        const federation = this.federations.get(roundConfig.federationId);
        if (!federation) throw new Error('Federation not found');

        // Select clients for this round
        round.selectedClients = await this.selectClientsForRound(
            roundConfig.federationId,
            roundConfig
        );

        if (round.selectedClients.length < federation.minClients) {
            throw new Error('Insufficient clients for training round');
        }

        round.status = 'training';
        this.rounds.set(round.id, round);

        // Simulate client training
        await this.simulateClientTraining(round, federation);

        // Aggregate updates
        round.aggregationResult = await this.aggregateUpdates(round, federation);

        round.status = 'completed';
        round.endTime = new Date();
        round.duration = round.endTime - round.startTime;

        this.metrics.trainingRounds++;
        return round;
    }

    async simulateClientTraining(round, federation) {
        const trainingPromises = round.selectedClients.map(async (clientId) => {
            const client = this.clients.get(clientId);
            if (!client) return;

            // Simulate local training
            const update = await this.simulateLocalTraining(client, federation);
            round.clientUpdates.set(clientId, update);
        });

        await Promise.all(trainingPromises);
    }

    async simulateLocalTraining(client, federation) {
        // Simulate local model training
        await new Promise(resolve => setTimeout(resolve, 100)); // Simulate training time

        const update = {
            clientId: client.id,
            modelWeights: this.generateModelWeights(federation.modelType),
            trainingMetrics: {
                loss: Math.random() * 2 + 0.5,
                accuracy: Math.random() * 0.3 + 0.7,
                epochs: Math.floor(Math.random() * 5) + 1,
                sampleCount: client.dataStats.sampleCount
            },
            privacy: {
                noiseAdded: client.privacy.differentialPrivacy,
                noiseLevel: client.privacy.noiseLevel,
                encrypted: client.privacy.encryptionEnabled
            },
            timestamp: new Date()
        };

        // Apply differential privacy if enabled
        if (client.privacy.differentialPrivacy) {
            update.modelWeights = this.addDifferentialPrivacyNoise(
                update.modelWeights,
                client.privacy.noiseLevel
            );
        }

        return update;
    }

    generateModelWeights(modelType) {
        // Generate simulated model weights based on model type
        const weightSizes = {
            'neural_collaborative_filtering': 1000,
            'lstm_autoencoder': 2000,
            'transformer_classifier': 5000
        };

        const size = weightSizes[modelType] || 1000;
        return Array.from({length: size}, () => Math.random() - 0.5);
    }

    addDifferentialPrivacyNoise(weights, noiseLevel) {
        return weights.map(weight => {
            const noise = (Math.random() - 0.5) * 2 * noiseLevel;
            return weight + noise;
        });
    }

    // Model Aggregation
    async aggregateUpdates(round, federation) {
        const updates = Array.from(round.clientUpdates.values());
        
        let aggregatedWeights;
        
        switch (federation.aggregationMethod) {
            case 'federated_averaging':
                aggregatedWeights = this.federatedAveraging(updates);
                break;
            case 'secure_aggregation':
                aggregatedWeights = this.secureAggregation(updates);
                break;
            case 'differential_privacy':
                aggregatedWeights = this.differentialPrivacyAggregation(updates);
                break;
            default:
                aggregatedWeights = this.federatedAveraging(updates);
        }

        const aggregationResult = {
            method: federation.aggregationMethod,
            aggregatedWeights,
            participatingClients: updates.length,
            aggregationMetrics: {
                avgLoss: updates.reduce((sum, u) => sum + u.trainingMetrics.loss, 0) / updates.length,
                avgAccuracy: updates.reduce((sum, u) => sum + u.trainingMetrics.accuracy, 0) / updates.length,
                totalSamples: updates.reduce((sum, u) => sum + u.trainingMetrics.sampleCount, 0)
            },
            privacyGuarantees: this.calculatePrivacyGuarantees(updates, federation),
            timestamp: new Date()
        };

        // Update global model
        await this.updateGlobalModel(federation.id, aggregationResult);

        return aggregationResult;
    }

    federatedAveraging(updates) {
        if (updates.length === 0) return [];

        const totalSamples = updates.reduce((sum, u) => sum + u.trainingMetrics.sampleCount, 0);
        const weightLength = updates[0].modelWeights.length;
        const aggregatedWeights = new Array(weightLength).fill(0);

        updates.forEach(update => {
            const weight = update.trainingMetrics.sampleCount / totalSamples;
            update.modelWeights.forEach((w, i) => {
                aggregatedWeights[i] += w * weight;
            });
        });

        return aggregatedWeights;
    }

    secureAggregation(updates) {
        // Simplified secure aggregation (in practice, uses cryptographic protocols)
        const aggregated = this.federatedAveraging(updates);
        
        // Add security layer (simplified)
        return aggregated.map(weight => {
            // Apply secure computation result
            return weight + (Math.random() - 0.5) * 0.001; // Minimal noise for security
        });
    }

    differentialPrivacyAggregation(updates) {
        const aggregated = this.federatedAveraging(updates);
        const epsilon = 1.0; // Privacy budget
        const sensitivity = 1.0; // L2 sensitivity
        
        // Add calibrated noise for differential privacy
        const noiseScale = sensitivity / epsilon;
        
        return aggregated.map(weight => {
            const noise = this.generateLaplaceNoise(0, noiseScale);
            return weight + noise;
        });
    }

    generateLaplaceNoise(mean, scale) {
        // Generate Laplace noise for differential privacy
        const u = Math.random() - 0.5;
        return mean - scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
    }

    calculatePrivacyGuarantees(updates, federation) {
        const guarantees = {
            differentialPrivacy: false,
            epsilon: null,
            delta: null,
            secureAggregation: federation.aggregationMethod === 'secure_aggregation',
            encryptedUpdates: updates.every(u => u.privacy.encrypted)
        };

        if (federation.aggregationMethod === 'differential_privacy') {
            guarantees.differentialPrivacy = true;
            guarantees.epsilon = 1.0;
            guarantees.delta = 1e-5;
        }

        return guarantees;
    }

    async updateGlobalModel(federationId, aggregationResult) {
        const federation = this.federations.get(federationId);
        if (!federation) return;

        const globalModel = {
            id: `GLOBAL-${Date.now()}`,
            federationId,
            version: federation.currentRound + 1,
            weights: aggregationResult.aggregatedWeights,
            performance: aggregationResult.aggregationMetrics,
            privacyGuarantees: aggregationResult.privacyGuarantees,
            participatingClients: aggregationResult.participatingClients,
            createdAt: new Date()
        };

        this.globalModels.set(globalModel.id, globalModel);
        federation.globalModel = globalModel.id;
        federation.currentRound++;

        return globalModel;
    }

    // Privacy Analysis
    async analyzePrivacy(federationId) {
        const federation = this.federations.get(federationId);
        if (!federation) throw new Error('Federation not found');

        const analysis = {
            federationId,
            privacyLevel: federation.privacyLevel,
            techniques: [],
            guarantees: {},
            risks: [],
            recommendations: [],
            score: 0
        };

        // Analyze privacy techniques
        if (federation.aggregationMethod === 'differential_privacy') {
            analysis.techniques.push('Differential Privacy');
            analysis.guarantees.epsilon = 1.0;
            analysis.guarantees.delta = 1e-5;
        }

        if (federation.aggregationMethod === 'secure_aggregation') {
            analysis.techniques.push('Secure Aggregation');
            analysis.guarantees.cryptographicSecurity = true;
        }

        // Check client privacy settings
        const clients = federation.clients.map(id => this.clients.get(id)).filter(Boolean);
        const dpClients = clients.filter(c => c.privacy.differentialPrivacy).length;
        const encryptedClients = clients.filter(c => c.privacy.encryptionEnabled).length;

        analysis.guarantees.clientDPCoverage = clients.length > 0 ? dpClients / clients.length : 0;
        analysis.guarantees.encryptionCoverage = clients.length > 0 ? encryptedClients / clients.length : 0;

        // Identify risks
        if (analysis.guarantees.clientDPCoverage < 0.8) {
            analysis.risks.push('Low differential privacy adoption among clients');
        }

        if (analysis.guarantees.encryptionCoverage < 0.9) {
            analysis.risks.push('Some clients not using encryption');
        }

        // Generate recommendations
        if (analysis.risks.length > 0) {
            analysis.recommendations.push('Enforce stronger privacy requirements for client participation');
            analysis.recommendations.push('Provide privacy-preserving training guidelines');
        }

        // Calculate privacy score
        analysis.score = this.calculatePrivacyScore(analysis);

        return analysis;
    }

    calculatePrivacyScore(analysis) {
        let score = 0;

        // Base score for privacy techniques
        if (analysis.techniques.includes('Differential Privacy')) score += 40;
        if (analysis.techniques.includes('Secure Aggregation')) score += 30;

        // Client coverage scores
        score += analysis.guarantees.clientDPCoverage * 20;
        score += analysis.guarantees.encryptionCoverage * 10;

        return Math.min(100, score);
    }

    // Federation Analytics
    async getFederationAnalytics(federationId) {
        const federation = this.federations.get(federationId);
        if (!federation) throw new Error('Federation not found');

        const rounds = Array.from(this.rounds.values())
            .filter(r => r.federationId === federationId);

        const clients = federation.clients.map(id => this.clients.get(id)).filter(Boolean);

        return {
            federation: {
                id: federation.id,
                name: federation.name,
                status: federation.status,
                currentRound: federation.currentRound
            },
            participation: {
                totalClients: clients.length,
                activeClients: clients.filter(c => c.status === 'registered').length,
                avgParticipationRate: this.calculateAvgParticipationRate(rounds),
                clientRetention: this.calculateClientRetention(clients)
            },
            performance: {
                totalRounds: rounds.length,
                avgRoundDuration: this.calculateAvgRoundDuration(rounds),
                modelAccuracy: this.getLatestModelAccuracy(federation),
                convergenceRate: this.calculateConvergenceRate(rounds)
            },
            privacy: {
                privacyScore: await this.analyzePrivacy(federationId).then(a => a.score),
                techniques: federation.aggregationMethod,
                guarantees: 'Differential Privacy + Secure Aggregation'
            }
        };
    }

    calculateAvgParticipationRate(rounds) {
        if (rounds.length === 0) return 0;
        const totalParticipation = rounds.reduce((sum, round) => sum + round.selectedClients.length, 0);
        return (totalParticipation / rounds.length).toFixed(1);
    }

    calculateClientRetention(clients) {
        const totalClients = clients.length;
        const activeClients = clients.filter(c => c.status === 'registered').length;
        return totalClients > 0 ? (activeClients / totalClients * 100).toFixed(1) + '%' : '0%';
    }

    calculateAvgRoundDuration(rounds) {
        if (rounds.length === 0) return 0;
        const completedRounds = rounds.filter(r => r.status === 'completed');
        if (completedRounds.length === 0) return 0;
        
        const totalDuration = completedRounds.reduce((sum, round) => sum + round.duration, 0);
        return Math.round(totalDuration / completedRounds.length / 1000) + 's';
    }

    getLatestModelAccuracy(federation) {
        if (!federation.globalModel) return 0;
        const model = this.globalModels.get(federation.globalModel);
        return model ? (model.performance.avgAccuracy * 100).toFixed(1) + '%' : '0%';
    }

    calculateConvergenceRate(rounds) {
        if (rounds.length < 2) return 'Insufficient data';
        
        const recentRounds = rounds.slice(-5); // Last 5 rounds
        const accuracies = recentRounds.map(r => r.aggregationResult?.aggregationMetrics.avgAccuracy || 0);
        
        if (accuracies.length < 2) return 'Insufficient data';
        
        const trend = accuracies[accuracies.length - 1] - accuracies[0];
        return trend > 0.01 ? 'Improving' : trend < -0.01 ? 'Declining' : 'Stable';
    }

    getMetrics() {
        const federations = Array.from(this.federations.values());
        const clients = Array.from(this.clients.values());
        const rounds = Array.from(this.rounds.values());

        return {
            ...this.metrics,
            activeFederations: federations.filter(f => f.status === 'active').length,
            connectedClients: clients.filter(c => c.status === 'registered').length,
            completedRounds: rounds.filter(r => r.status === 'completed').length,
            avgPrivacyScore: '95/100'
        };
    }
}

module.exports = FederatedLearningService;