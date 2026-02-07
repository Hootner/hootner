/**
 * Sentiment Analysis Service - Brand Monitoring
 * Advanced sentiment tracking and brand reputation management
 */

class SentimentAnalysisService {
    constructor() {
        this.sentiments = new Map();
        this.brands = new Map();
        this.sources = new Map();
        this.alerts = new Map();
        this.metrics = {
            totalAnalyses: 0,
            brandsMmonitored: 0,
            alertsGenerated: 0,
            avgSentimentScore: 0
        };
        this.initializeBrands();
    }

    // Brand Monitoring Setup
    initializeBrands() {
        const brands = [
            {
                id: 'hootner',
                name: 'HOOTNER',
                keywords: ['hootner', '@hootner', '#hootner', 'hootner platform'],
                competitors: ['netflix', 'youtube', 'twitch'],
                categories: ['video_streaming', 'entertainment', 'technology']
            }
        ];

        brands.forEach(brand => {
            this.brands.set(brand.id, {
                ...brand,
                sentimentHistory: [],
                currentScore: 0,
                trending: 'stable',
                lastUpdated: new Date()
            });
            this.metrics.brandsMoniored++;
        });
    }

    // Sentiment Analysis
    async analyzeSentiment(analysisConfig) {
        const analysis = {
            id: `SENT-${Date.now()}`,
            text: analysisConfig.text,
            source: analysisConfig.source, // twitter, facebook, reddit, news, reviews
            brandId: analysisConfig.brandId,
            userId: analysisConfig.userId,
            metadata: analysisConfig.metadata || {},
            sentiment: null,
            confidence: 0,
            emotions: {},
            aspects: {},
            createdAt: new Date()
        };

        // Perform sentiment analysis
        analysis.sentiment = await this.performSentimentAnalysis(analysis.text);
        analysis.emotions = await this.analyzeEmotions(analysis.text);
        analysis.aspects = await this.analyzeAspects(analysis.text, analysisConfig.brandId);

        // Calculate overall confidence
        analysis.confidence = this.calculateOverallConfidence(analysis);

        this.sentiments.set(analysis.id, analysis);
        this.metrics.totalAnalyses++;
        this.updateBrandSentiment(analysisConfig.brandId, analysis);

        return analysis;
    }

    async performSentimentAnalysis(text) {
        // Advanced sentiment analysis with multiple dimensions
        const positiveWords = ['love', 'great', 'awesome', 'excellent', 'amazing', 'perfect', 'wonderful', 'fantastic', 'outstanding', 'brilliant'];
        const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'worst', 'bad', 'disappointing', 'frustrating', 'annoying', 'useless'];
        const neutralWords = ['okay', 'fine', 'average', 'normal', 'standard', 'typical'];

        const cleanText = text.toLowerCase();
        let positiveScore = 0;
        let negativeScore = 0;
        let neutralScore = 0;

        // Count sentiment words with weights
        positiveWords.forEach(word => {
            const count = (cleanText.match(new RegExp(word, 'g')) || []).length;
            positiveScore += count * 1.0;
        });

        negativeWords.forEach(word => {
            const count = (cleanText.match(new RegExp(word, 'g')) || []).length;
            negativeScore += count * 1.0;
        });

        neutralWords.forEach(word => {
            const count = (cleanText.match(new RegExp(word, 'g')) || []).length;
            neutralScore += count * 0.5;
        });

        // Handle negations
        const negationPattern = /\b(not|no|never|nothing|nowhere|neither|nobody|none)\s+(\w+)/g;
        let match;
        while ((match = negationPattern.exec(cleanText)) !== null) {
            const negatedWord = match[2];
            if (positiveWords.includes(negatedWord)) {
                positiveScore -= 0.5;
                negativeScore += 0.5;
            } else if (negativeWords.includes(negatedWord)) {
                negativeScore -= 0.5;
                positiveScore += 0.3;
            }
        }

        // Normalize scores
        const totalScore = positiveScore + negativeScore + neutralScore + 1; // +1 to avoid division by zero
        const normalizedPositive = positiveScore / totalScore;
        const normalizedNegative = negativeScore / totalScore;
        const normalizedNeutral = (neutralScore + 1) / totalScore; // Base neutral score

        // Determine primary sentiment
        let primarySentiment;
        let polarity;
        
        if (normalizedPositive > normalizedNegative && normalizedPositive > normalizedNeutral) {
            primarySentiment = 'positive';
            polarity = normalizedPositive - normalizedNegative;
        } else if (normalizedNegative > normalizedPositive && normalizedNegative > normalizedNeutral) {
            primarySentiment = 'negative';
            polarity = normalizedNegative - normalizedPositive;
        } else {
            primarySentiment = 'neutral';
            polarity = 0;
        }

        return {
            label: primarySentiment,
            scores: {
                positive: normalizedPositive,
                negative: normalizedNegative,
                neutral: normalizedNeutral
            },
            polarity: polarity,
            magnitude: Math.abs(polarity),
            confidence: Math.max(normalizedPositive, normalizedNegative, normalizedNeutral)
        };
    }

    async analyzeEmotions(text) {
        // Emotion detection beyond basic sentiment
        const emotionKeywords = {
            joy: ['happy', 'excited', 'thrilled', 'delighted', 'cheerful', 'elated'],
            anger: ['angry', 'furious', 'mad', 'irritated', 'annoyed', 'outraged'],
            fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'terrified'],
            sadness: ['sad', 'depressed', 'disappointed', 'upset', 'heartbroken', 'miserable'],
            surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned'],
            disgust: ['disgusted', 'revolted', 'repulsed', 'sickened'],
            trust: ['trust', 'confident', 'reliable', 'dependable', 'faithful'],
            anticipation: ['excited', 'eager', 'hopeful', 'optimistic', 'looking forward']
        };

        const emotions = {};
        const cleanText = text.toLowerCase();

        Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
            let score = 0;
            keywords.forEach(keyword => {
                const count = (cleanText.match(new RegExp(keyword, 'g')) || []).length;
                score += count;
            });
            emotions[emotion] = Math.min(1, score * 0.2); // Normalize to 0-1
        });

        // Find dominant emotion
        const dominantEmotion = Object.entries(emotions).reduce((max, [emotion, score]) => 
            score > max.score ? { emotion, score } : max,
            { emotion: 'neutral', score: 0 }
        );

        return {
            dominantEmotion: dominantEmotion.emotion,
            scores: emotions,
            intensity: dominantEmotion.score,
            mixed: Object.values(emotions).filter(score => score > 0.3).length > 1
        };
    }

    async analyzeAspects(text, brandId) {
        // Aspect-based sentiment analysis
        const brand = this.brands.get(brandId);
        if (!brand) return {};

        const aspects = {
            'product_quality': ['quality', 'performance', 'reliability', 'durability'],
            'user_experience': ['interface', 'usability', 'design', 'navigation', 'experience'],
            'customer_service': ['support', 'service', 'help', 'staff', 'response'],
            'pricing': ['price', 'cost', 'expensive', 'cheap', 'value', 'money'],
            'features': ['feature', 'functionality', 'capability', 'option'],
            'performance': ['speed', 'fast', 'slow', 'lag', 'responsive', 'loading']
        };

        const aspectSentiments = {};
        const cleanText = text.toLowerCase();

        Object.entries(aspects).forEach(([aspect, keywords]) => {
            let mentions = 0;
            let contextSentiment = 0;

            keywords.forEach(keyword => {
                const regex = new RegExp(`\\b${keyword}\\b`, 'g');
                const matches = cleanText.match(regex);
                if (matches) {
                    mentions += matches.length;
                    // Analyze sentiment in context around the keyword
                    const contextRegex = new RegExp(`.{0,50}\\b${keyword}\\b.{0,50}`, 'gi');
                    const contexts = text.match(contextRegex);
                    if (contexts) {
                        contexts.forEach(context => {
                            const contextSent = this.getContextSentiment(context);
                            contextSentiment += contextSent;
                        });
                    }
                }
            });

            if (mentions > 0) {
                aspectSentiments[aspect] = {
                    mentions,
                    sentiment: contextSentiment / mentions,
                    relevance: Math.min(1, mentions * 0.3)
                };
            }
        });

        return aspectSentiments;
    }

    getContextSentiment(context) {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst'];
        
        let score = 0;
        const cleanContext = context.toLowerCase();
        
        positiveWords.forEach(word => {
            if (cleanContext.includes(word)) score += 1;
        });
        
        negativeWords.forEach(word => {
            if (cleanContext.includes(word)) score -= 1;
        });
        
        return Math.max(-1, Math.min(1, score * 0.5));
    }

    calculateOverallConfidence(analysis) {
        const sentimentConfidence = analysis.sentiment.confidence;
        const emotionConfidence = analysis.emotions.intensity;
        const aspectCount = Object.keys(analysis.aspects).length;
        const aspectConfidence = Math.min(1, aspectCount * 0.2);
        
        return (sentimentConfidence + emotionConfidence + aspectConfidence) / 3;
    }

    updateBrandSentiment(brandId, analysis) {
        const brand = this.brands.get(brandId);
        if (!brand) return;

        // Add to sentiment history
        brand.sentimentHistory.push({
            timestamp: analysis.createdAt,
            sentiment: analysis.sentiment.label,
            score: analysis.sentiment.polarity,
            source: analysis.source
        });

        // Keep only last 1000 entries
        if (brand.sentimentHistory.length > 1000) {
            brand.sentimentHistory = brand.sentimentHistory.slice(-1000);
        }

        // Update current score (weighted average of recent sentiments)
        const recentSentiments = brand.sentimentHistory.slice(-100); // Last 100 entries
        const totalScore = recentSentiments.reduce((sum, s) => sum + s.score, 0);
        brand.currentScore = totalScore / recentSentiments.length;

        // Update trending
        brand.trending = this.calculateTrend(brand.sentimentHistory);
        brand.lastUpdated = new Date();

        this.checkForAlerts(brandId, analysis);
    }

    calculateTrend(history) {
        if (history.length < 10) return 'stable';

        const recent = history.slice(-10);
        const older = history.slice(-20, -10);

        if (older.length === 0) return 'stable';

        const recentAvg = recent.reduce((sum, s) => sum + s.score, 0) / recent.length;
        const olderAvg = older.reduce((sum, s) => sum + s.score, 0) / older.length;

        const change = recentAvg - olderAvg;

        if (change > 0.1) return 'improving';
        if (change < -0.1) return 'declining';
        return 'stable';
    }

    // Alert System
    checkForAlerts(brandId, analysis) {
        const brand = this.brands.get(brandId);
        if (!brand) return;

        const alerts = [];

        // Negative sentiment spike
        if (analysis.sentiment.label === 'negative' && analysis.sentiment.magnitude > 0.8) {
            alerts.push({
                type: 'negative_spike',
                severity: 'high',
                message: 'High negative sentiment detected',
                data: analysis
            });
        }

        // Trending decline
        if (brand.trending === 'declining' && brand.currentScore < -0.3) {
            alerts.push({
                type: 'trending_decline',
                severity: 'medium',
                message: 'Brand sentiment trending downward',
                data: { currentScore: brand.currentScore, trend: brand.trending }
            });
        }

        // Volume spike (simplified)
        const recentCount = brand.sentimentHistory.filter(s => 
            (Date.now() - s.timestamp.getTime()) < 3600000 // Last hour
        ).length;

        if (recentCount > 50) { // Threshold for volume spike
            alerts.push({
                type: 'volume_spike',
                severity: 'medium',
                message: 'Unusual volume of mentions detected',
                data: { count: recentCount }
            });
        }

        // Create alert records
        alerts.forEach(alertData => {
            const alert = {
                id: `ALERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                brandId,
                ...alertData,
                createdAt: new Date(),
                status: 'active'
            };
            this.alerts.set(alert.id, alert);
            this.metrics.alertsGenerated++;
        });
    }

    // Social Media Monitoring
    async monitorSocialMedia(monitoringConfig) {
        const monitoring = {
            id: `MONITOR-${Date.now()}`,
            brandId: monitoringConfig.brandId,
            sources: monitoringConfig.sources || ['twitter', 'facebook', 'instagram', 'reddit'],
            keywords: monitoringConfig.keywords || [],
            timeframe: monitoringConfig.timeframe || '24h',
            results: {},
            startTime: new Date()
        };

        // Simulate social media data collection
        for (const source of monitoring.sources) {
            monitoring.results[source] = await this.collectSocialData(source, monitoring.keywords);
        }

        // Analyze collected data
        monitoring.analysis = await this.analyzeSocialData(monitoring.results);
        monitoring.endTime = new Date();

        return monitoring;
    }

    async collectSocialData(source, keywords) {
        // Simulate data collection from social media APIs
        const postCount = Math.floor(Math.random() * 100) + 20;
        const posts = [];

        for (let i = 0; i < postCount; i++) {
            posts.push({
                id: `${source}_${Date.now()}_${i}`,
                text: this.generateSamplePost(keywords),
                author: `user_${Math.floor(Math.random() * 10000)}`,
                timestamp: new Date(Date.now() - Math.random() * 86400000), // Last 24h
                engagement: {
                    likes: Math.floor(Math.random() * 100),
                    shares: Math.floor(Math.random() * 20),
                    comments: Math.floor(Math.random() * 30)
                }
            });
        }

        return {
            source,
            postCount,
            posts: posts.slice(0, 10), // Return sample
            totalEngagement: posts.reduce((sum, post) => 
                sum + post.engagement.likes + post.engagement.shares + post.engagement.comments, 0
            )
        };
    }

    generateSamplePost(keywords) {
        const templates = [
            `Just tried ${keywords[0] || 'the platform'} and it's amazing!`,
            `Having issues with ${keywords[0] || 'the service'} today`,
            `${keywords[0] || 'This app'} has really improved lately`,
            `Not sure about ${keywords[0] || 'this platform'} anymore`,
            `Love the new features in ${keywords[0] || 'the app'}`
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    }

    async analyzeSocialData(results) {
        const allPosts = [];
        Object.values(results).forEach(sourceData => {
            allPosts.push(...sourceData.posts);
        });

        const sentimentCounts = { positive: 0, negative: 0, neutral: 0 };
        const totalEngagement = Object.values(results).reduce((sum, data) => sum + data.totalEngagement, 0);

        // Analyze each post
        for (const post of allPosts) {
            const sentiment = await this.performSentimentAnalysis(post.text);
            sentimentCounts[sentiment.label]++;
        }

        return {
            totalPosts: allPosts.length,
            sentimentDistribution: sentimentCounts,
            totalEngagement,
            avgEngagementPerPost: allPosts.length > 0 ? totalEngagement / allPosts.length : 0,
            topSources: Object.entries(results)
                .sort(([,a], [,b]) => b.postCount - a.postCount)
                .slice(0, 3)
                .map(([source, data]) => ({ source, posts: data.postCount }))
        };
    }

    // Competitive Analysis
    async compareWithCompetitors(brandId) {
        const brand = this.brands.get(brandId);
        if (!brand) throw new Error('Brand not found');

        const comparison = {
            brand: brandId,
            competitors: brand.competitors,
            analysis: {},
            createdAt: new Date()
        };

        // Simulate competitor sentiment data
        for (const competitor of brand.competitors) {
            comparison.analysis[competitor] = {
                currentScore: (Math.random() - 0.5) * 2, // -1 to 1
                trending: ['improving', 'declining', 'stable'][Math.floor(Math.random() * 3)],
                volume: Math.floor(Math.random() * 1000) + 100,
                topAspects: ['quality', 'price', 'service'].slice(0, Math.floor(Math.random() * 3) + 1)
            };
        }

        // Add brand's own data
        comparison.analysis[brandId] = {
            currentScore: brand.currentScore,
            trending: brand.trending,
            volume: brand.sentimentHistory.length,
            topAspects: this.getTopAspects(brandId)
        };

        return comparison;
    }

    getTopAspects(brandId) {
        // Simplified - would analyze recent sentiment data for top mentioned aspects
        return ['user_experience', 'performance', 'features'];
    }

    // Reporting
    async generateSentimentReport(reportConfig) {
        const report = {
            id: `REPORT-${Date.now()}`,
            brandId: reportConfig.brandId,
            timeframe: reportConfig.timeframe || '7d',
            type: reportConfig.type || 'comprehensive',
            data: {},
            insights: [],
            recommendations: [],
            createdAt: new Date()
        };

        const brand = this.brands.get(reportConfig.brandId);
        if (!brand) throw new Error('Brand not found');

        // Generate report data
        report.data = {
            overview: {
                currentScore: brand.currentScore,
                trending: brand.trending,
                totalMentions: brand.sentimentHistory.length,
                sentimentDistribution: this.getSentimentDistribution(brand.sentimentHistory)
            },
            timeline: this.getTimelineData(brand.sentimentHistory, reportConfig.timeframe),
            sources: this.getSourceBreakdown(brand.sentimentHistory),
            aspects: this.getAspectAnalysis(reportConfig.brandId),
            alerts: this.getRecentAlerts(reportConfig.brandId)
        };

        // Generate insights
        report.insights = this.generateInsights(report.data);
        
        // Generate recommendations
        report.recommendations = this.generateRecommendations(report.data);

        return report;
    }

    getSentimentDistribution(history) {
        const distribution = { positive: 0, negative: 0, neutral: 0 };
        history.forEach(entry => {
            distribution[entry.sentiment]++;
        });
        return distribution;
    }

    getTimelineData(history, timeframe) {
        // Simplified timeline data
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 1;
        const timeline = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const dayEntries = history.filter(entry => {
                const entryDate = new Date(entry.timestamp);
                return entryDate.toDateString() === date.toDateString();
            });
            
            timeline.push({
                date: date.toISOString().split('T')[0],
                count: dayEntries.length,
                avgSentiment: dayEntries.length > 0 ? 
                    dayEntries.reduce((sum, entry) => sum + entry.score, 0) / dayEntries.length : 0
            });
        }
        
        return timeline;
    }

    getSourceBreakdown(history) {
        const sources = {};
        history.forEach(entry => {
            sources[entry.source] = (sources[entry.source] || 0) + 1;
        });
        return sources;
    }

    getAspectAnalysis(brandId) {
        // Simplified aspect analysis
        return {
            'user_experience': { sentiment: 0.3, mentions: 45 },
            'performance': { sentiment: -0.1, mentions: 32 },
            'features': { sentiment: 0.5, mentions: 28 }
        };
    }

    getRecentAlerts(brandId) {
        return Array.from(this.alerts.values())
            .filter(alert => alert.brandId === brandId && alert.status === 'active')
            .slice(-5);
    }

    generateInsights(data) {
        const insights = [];
        
        if (data.overview.trending === 'improving') {
            insights.push('Brand sentiment is trending positively');
        } else if (data.overview.trending === 'declining') {
            insights.push('Brand sentiment shows concerning decline');
        }
        
        if (data.overview.currentScore > 0.5) {
            insights.push('Overall brand sentiment is strongly positive');
        } else if (data.overview.currentScore < -0.3) {
            insights.push('Brand sentiment requires immediate attention');
        }
        
        return insights;
    }

    generateRecommendations(data) {
        const recommendations = [];
        
        if (data.overview.currentScore < 0) {
            recommendations.push('Implement proactive customer engagement strategy');
            recommendations.push('Address top negative sentiment drivers');
        }
        
        if (data.overview.trending === 'declining') {
            recommendations.push('Investigate recent changes that may impact perception');
            recommendations.push('Increase positive content and community engagement');
        }
        
        return recommendations;
    }

    getMetrics() {
        const sentiments = Array.from(this.sentiments.values());
        const avgSentiment = sentiments.length > 0 ?
            sentiments.reduce((sum, s) => sum + s.sentiment.polarity, 0) / sentiments.length : 0;

        return {
            ...this.metrics,
            avgSentimentScore: avgSentiment.toFixed(3),
            dailyAnalyses: sentiments.filter(s => 
                (Date.now() - s.createdAt.getTime()) < 24 * 60 * 60 * 1000
            ).length,
            activeAlerts: Array.from(this.alerts.values()).filter(a => a.status === 'active').length
        };
    }
}

module.exports = SentimentAnalysisService;