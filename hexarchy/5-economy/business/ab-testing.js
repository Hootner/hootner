/**
 * A/B Testing Service
 * Feature experimentation and statistical analysis
 */

class ABTesting {
  constructor() {
    this.experiments = new Map();
    this.assignments = new Map();
    this.results = new Map();
    this.segments = new Map();
  }

  async createExperiment({ name, description, variants, trafficAllocation = 0.5, targetMetric, hypothesis }) {
    console.log(`🧪 Creating A/B test: ${name} with variants: ${variants.join(', ')}`);
    
    const experimentId = `exp_${Date.now()}`;
    
    const experiment = {
      id: experimentId,
      name,
      description,
      variants,
      trafficAllocation,
      targetMetric,
      hypothesis,
      status: 'draft',
      createdAt: new Date().toISOString(),
      startDate: null,
      endDate: null,
      participants: 0,
      conversions: new Map(),
      statisticalSignificance: null
    };

    // Initialize conversion tracking for each variant
    variants.forEach(variant => {
      experiment.conversions.set(variant, {
        participants: 0,
        conversions: 0,
        conversionRate: 0,
        metrics: []
      });
    });

    this.experiments.set(experimentId, experiment);
    
    return experiment;
  }

  async startExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    experiment.status = 'running';
    experiment.startDate = new Date().toISOString();
    
    console.log(`▶️ Started A/B test: ${experiment.name}`);
    
    return experiment;
  }

  async assignUser({ userId, experimentId, forceVariant = null }) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user already assigned
    const existingAssignment = this.assignments.get(`${userId}_${experimentId}`);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Determine if user should be included
    const userHash = this.hashUserId(userId);
    const shouldInclude = userHash < experiment.trafficAllocation;
    
    if (!shouldInclude && !forceVariant) {
      return null;
    }

    // Assign variant
    const variant = forceVariant || this.selectVariant(experiment.variants, userHash);
    
    const assignment = {
      userId,
      experimentId,
      variant,
      assignedAt: new Date().toISOString(),
      converted: false,
      metrics: {}
    };

    this.assignments.set(`${userId}_${experimentId}`, assignment);
    
    // Update experiment participant count
    experiment.participants++;
    const variantData = experiment.conversions.get(variant);
    variantData.participants++;
    
    console.log(`👤 Assigned user ${userId} to variant: ${variant}`);
    
    return assignment;
  }

  hashUserId(userId) {
    // Simple hash function - replace with proper hash in production
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  selectVariant(variants, userHash) {
    const variantIndex = Math.floor(userHash * variants.length);
    return variants[variantIndex];
  }

  async trackConversion({ userId, experimentId, metricValue = 1, customMetrics = {} }) {
    const assignmentKey = `${userId}_${experimentId}`;
    const assignment = this.assignments.get(assignmentKey);
    
    if (!assignment) {
      console.log(`⚠️ No assignment found for user ${userId} in experiment ${experimentId}`);
      return null;
    }

    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Mark as converted
    if (!assignment.converted) {
      assignment.converted = true;
      assignment.convertedAt = new Date().toISOString();
      assignment.metricValue = metricValue;
      assignment.customMetrics = customMetrics;
      
      // Update experiment conversion data
      const variantData = experiment.conversions.get(assignment.variant);
      variantData.conversions++;
      variantData.conversionRate = variantData.conversions / variantData.participants;
      variantData.metrics.push({
        userId,
        value: metricValue,
        customMetrics,
        timestamp: assignment.convertedAt
      });
      
      console.log(`✅ Conversion tracked for user ${userId} in variant: ${assignment.variant}`);
    }

    return assignment;
  }

  async analyzeExperiment(experimentId) {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    console.log(`📊 Analyzing A/B test: ${experiment.name}`);
    
    const analysis = {
      experimentId,
      name: experiment.name,
      status: experiment.status,
      participants: experiment.participants,
      variants: [],
      winner: null,
      confidence: 0,
      statisticalSignificance: false,
      recommendation: 'continue'
    };

    // Analyze each variant
    for (const [variantName, data] of experiment.conversions.entries()) {
      const variantAnalysis = {
        name: variantName,
        participants: data.participants,
        conversions: data.conversions,
        conversionRate: data.conversionRate,
        confidenceInterval: this.calculateConfidenceInterval(data),
        avgMetricValue: this.calculateAverageMetric(data.metrics)
      };
      
      analysis.variants.push(variantAnalysis);
    }

    // Statistical significance test
    if (analysis.variants.length >= 2) {
      const significance = this.calculateStatisticalSignificance(analysis.variants);
      analysis.statisticalSignificance = significance.significant;
      analysis.confidence = significance.confidence;
      analysis.pValue = significance.pValue;
      
      if (significance.significant) {
        analysis.winner = significance.winner;
        analysis.recommendation = 'implement_winner';
      }
    }

    // Minimum sample size check
    const minSampleSize = 100; // Configurable
    if (experiment.participants < minSampleSize) {
      analysis.recommendation = 'continue';
      analysis.reason = `Need more participants (${experiment.participants}/${minSampleSize})`;
    }

    this.results.set(experimentId, analysis);
    
    return analysis;
  }

  calculateConfidenceInterval(variantData) {
    if (variantData.participants === 0) return { lower: 0, upper: 0 };
    
    const p = variantData.conversionRate;
    const n = variantData.participants;
    const z = 1.96; // 95% confidence
    
    const margin = z * Math.sqrt((p * (1 - p)) / n);
    
    return {
      lower: Math.max(0, p - margin),
      upper: Math.min(1, p + margin)
    };
  }

  calculateAverageMetric(metrics) {
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  calculateStatisticalSignificance(variants) {
    if (variants.length < 2) {
      return { significant: false, confidence: 0, pValue: 1 };
    }

    // Simple z-test for proportions
    const [control, treatment] = variants;
    
    const p1 = control.conversionRate;
    const n1 = control.participants;
    const p2 = treatment.conversionRate;
    const n2 = treatment.participants;
    
    if (n1 === 0 || n2 === 0) {
      return { significant: false, confidence: 0, pValue: 1 };
    }

    const pooledP = (control.conversions + treatment.conversions) / (n1 + n2);
    const se = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    
    if (se === 0) {
      return { significant: false, confidence: 0, pValue: 1 };
    }

    const z = Math.abs(p1 - p2) / se;
    const pValue = 2 * (1 - this.normalCDF(z)); // Two-tailed test
    
    const significant = pValue < 0.05;
    const confidence = (1 - pValue) * 100;
    const winner = p2 > p1 ? treatment.name : control.name;
    
    return { significant, confidence, pValue, winner };
  }

  normalCDF(x) {
    // Approximation of normal CDF
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  erf(x) {
    // Approximation of error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  async stopExperiment(experimentId, reason = 'completed') {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    experiment.status = 'stopped';
    experiment.endDate = new Date().toISOString();
    experiment.stopReason = reason;
    
    // Generate final analysis
    const finalAnalysis = await this.analyzeExperiment(experimentId);
    
    console.log(`⏹️ Stopped A/B test: ${experiment.name} - ${reason}`);
    
    return { experiment, analysis: finalAnalysis };
  }

  async assign({ userId, experiment, trafficAllocation = 0.5 }) {
    console.log(`🧪 Assigning user ${userId} to experiment: ${experiment}`);
    
    // Find experiment by name
    const exp = Array.from(this.experiments.values()).find(e => e.name === experiment);
    if (!exp) {
      throw new Error(`Experiment ${experiment} not found`);
    }

    return await this.assignUser({ userId, experimentId: exp.id });
  }

  async getExperimentResults(experimentId) {
    return this.results.get(experimentId) || await this.analyzeExperiment(experimentId);
  }

  async listExperiments() {
    return Array.from(this.experiments.values()).map(exp => ({
      id: exp.id,
      name: exp.name,
      status: exp.status,
      participants: exp.participants,
      variants: exp.variants,
      createdAt: exp.createdAt,
      startDate: exp.startDate
    }));
  }
}

module.exports = new ABTesting();