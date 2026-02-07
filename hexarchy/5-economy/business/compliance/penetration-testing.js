/**
 * Penetration Testing Service
 * Regular security audits and vulnerability assessment
 */

class PenetrationTesting {
  constructor() {
    this.scans = new Map();
    this.vulnerabilities = new Map();
    this.scanTemplates = new Map();
    this.reports = new Map();
    
    this.initializeScanTemplates();
  }

  initializeScanTemplates() {
    const templates = [
      {
        id: 'web_application',
        name: 'Web Application Security',
        tests: ['sql_injection', 'xss', 'csrf', 'authentication', 'authorization', 'session_management'],
        duration: 240, // minutes
        severity: 'high'
      },
      {
        id: 'network_infrastructure',
        name: 'Network Infrastructure',
        tests: ['port_scan', 'service_enumeration', 'vulnerability_scan', 'firewall_test'],
        duration: 180,
        severity: 'medium'
      },
      {
        id: 'api_security',
        name: 'API Security Assessment',
        tests: ['authentication', 'authorization', 'input_validation', 'rate_limiting', 'data_exposure'],
        duration: 120,
        severity: 'high'
      },
      {
        id: 'social_engineering',
        name: 'Social Engineering',
        tests: ['phishing_simulation', 'physical_security', 'information_gathering'],
        duration: 480,
        severity: 'medium'
      }
    ];

    templates.forEach(template => {
      this.scanTemplates.set(template.id, template);
    });
  }

  async runScan({ target, type = 'web_application', scope = 'limited', authenticated = false }) {
    console.log(`🔍 Starting penetration test: ${type} on ${target}`);
    
    const scanId = `scan_${Date.now()}`;
    
    const scan = {
      id: scanId,
      target,
      type,
      scope,
      authenticated,
      status: 'running',
      startTime: new Date().toISOString(),
      template: this.scanTemplates.get(type),
      progress: 0,
      vulnerabilities: [],
      testResults: new Map()
    };

    this.scans.set(scanId, scan);
    
    try {
      const template = scan.template;
      if (!template) {
        throw new Error(`Unknown scan type: ${type}`);
      }

      // Execute each test in the template
      for (let i = 0; i < template.tests.length; i++) {
        const testName = template.tests[i];
        
        scan.progress = Math.round(((i + 1) / template.tests.length) * 100);
        
        const testResult = await this.executeTest(testName, target, authenticated);
        scan.testResults.set(testName, testResult);
        
        // Collect vulnerabilities
        if (testResult.vulnerabilities) {
          scan.vulnerabilities.push(...testResult.vulnerabilities);
        }
        
        console.log(`  ✓ Completed test: ${testName} (${scan.progress}%)`);
      }
      
      scan.status = 'completed';
      scan.endTime = new Date().toISOString();
      scan.duration = Date.now() - new Date(scan.startTime).getTime();
      
      // Generate report
      const report = await this.generateReport(scan);
      scan.reportId = report.id;
      
    } catch (error) {
      scan.status = 'failed';
      scan.error = error.message;
      scan.endTime = new Date().toISOString();
    }
    
    return scan;
  }

  async executeTest(testName, target, authenticated) {
    console.log(`    🧪 Executing test: ${testName}`);
    
    // Simulate test execution time
    const executionTime = Math.random() * 30000 + 10000; // 10-40 seconds
    await new Promise(resolve => setTimeout(resolve, Math.min(executionTime / 10, 3000))); // Max 3s for demo
    
    const testResult = {
      testName,
      target,
      authenticated,
      status: 'completed',
      executedAt: new Date().toISOString(),
      duration: executionTime,
      vulnerabilities: []
    };

    // Generate mock vulnerabilities based on test type
    const vulnerabilities = this.generateMockVulnerabilities(testName, target);
    testResult.vulnerabilities = vulnerabilities;
    
    return testResult;
  }

  generateMockVulnerabilities(testName, target) {
    const vulnerabilityTemplates = {
      sql_injection: [
        { type: 'SQL Injection', severity: 'high', confidence: 0.9, location: '/api/users' },
        { type: 'Blind SQL Injection', severity: 'medium', confidence: 0.7, location: '/search' }
      ],
      xss: [
        { type: 'Reflected XSS', severity: 'medium', confidence: 0.8, location: '/profile' },
        { type: 'Stored XSS', severity: 'high', confidence: 0.95, location: '/comments' }
      ],
      authentication: [
        { type: 'Weak Password Policy', severity: 'medium', confidence: 0.9, location: '/auth' },
        { type: 'Missing Account Lockout', severity: 'low', confidence: 0.8, location: '/login' }
      ],
      port_scan: [
        { type: 'Open Port', severity: 'low', confidence: 1.0, location: 'port 22' },
        { type: 'Unnecessary Service', severity: 'medium', confidence: 0.7, location: 'port 3306' }
      ]
    };

    const templates = vulnerabilityTemplates[testName] || [];
    
    // Randomly select some vulnerabilities to simulate realistic findings
    return templates.filter(() => Math.random() > 0.6).map(vuln => ({
      ...vuln,
      id: `vuln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      target,
      discoveredAt: new Date().toISOString(),
      description: this.generateVulnerabilityDescription(vuln.type),
      recommendation: this.generateRecommendation(vuln.type),
      cvss: this.calculateCVSS(vuln.severity),
      references: this.generateReferences(vuln.type)
    }));
  }

  generateVulnerabilityDescription(type) {
    const descriptions = {
      'SQL Injection': 'Application is vulnerable to SQL injection attacks through user input fields.',
      'Reflected XSS': 'User input is reflected in the response without proper sanitization.',
      'Stored XSS': 'Malicious scripts can be stored and executed when viewed by other users.',
      'Weak Password Policy': 'Password requirements do not meet security best practices.',
      'Open Port': 'Unnecessary network port is exposed to external access.',
      'Missing Account Lockout': 'No protection against brute force authentication attacks.'
    };
    
    return descriptions[type] || `Security vulnerability of type: ${type}`;
  }

  generateRecommendation(type) {
    const recommendations = {
      'SQL Injection': 'Use parameterized queries and input validation.',
      'Reflected XSS': 'Implement proper input sanitization and output encoding.',
      'Stored XSS': 'Validate and sanitize all user input before storage.',
      'Weak Password Policy': 'Implement strong password requirements (length, complexity, history).',
      'Open Port': 'Close unnecessary ports and restrict access to required services.',
      'Missing Account Lockout': 'Implement account lockout after failed login attempts.'
    };
    
    return recommendations[type] || `Address the ${type} vulnerability according to security best practices.`;
  }

  calculateCVSS(severity) {
    const cvssRanges = {
      low: { min: 0.1, max: 3.9 },
      medium: { min: 4.0, max: 6.9 },
      high: { min: 7.0, max: 8.9 },
      critical: { min: 9.0, max: 10.0 }
    };
    
    const range = cvssRanges[severity] || cvssRanges.medium;
    return (Math.random() * (range.max - range.min) + range.min).toFixed(1);
  }

  generateReferences(type) {
    const references = {
      'SQL Injection': ['OWASP-A03', 'CWE-89'],
      'Reflected XSS': ['OWASP-A07', 'CWE-79'],
      'Stored XSS': ['OWASP-A07', 'CWE-79'],
      'Weak Password Policy': ['OWASP-A07', 'CWE-521'],
      'Open Port': ['CWE-200'],
      'Missing Account Lockout': ['OWASP-A07', 'CWE-307']
    };
    
    return references[type] || ['CWE-200'];
  }

  async generateReport(scan) {
    console.log(`📊 Generating penetration test report for scan: ${scan.id}`);
    
    const reportId = `report_${Date.now()}`;
    
    const vulnerabilities = scan.vulnerabilities;
    const severityCounts = this.countBySeverity(vulnerabilities);
    
    const report = {
      id: reportId,
      scanId: scan.id,
      target: scan.target,
      scanType: scan.type,
      generatedAt: new Date().toISOString(),
      executiveSummary: {
        totalVulnerabilities: vulnerabilities.length,
        riskLevel: this.calculateOverallRisk(vulnerabilities),
        testsConducted: scan.template.tests.length,
        scanDuration: scan.duration,
        severityBreakdown: severityCounts
      },
      findings: vulnerabilities.map(vuln => ({
        id: vuln.id,
        title: vuln.type,
        severity: vuln.severity,
        cvss: vuln.cvss,
        location: vuln.location,
        description: vuln.description,
        recommendation: vuln.recommendation,
        references: vuln.references,
        confidence: vuln.confidence
      })),
      recommendations: this.generateOverallRecommendations(vulnerabilities),
      compliance: this.assessCompliance(vulnerabilities),
      nextSteps: this.generateNextSteps(vulnerabilities)
    };
    
    this.reports.set(reportId, report);
    
    return report;
  }

  countBySeverity(vulnerabilities) {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    
    vulnerabilities.forEach(vuln => {
      counts[vuln.severity] = (counts[vuln.severity] || 0) + 1;
    });
    
    return counts;
  }

  calculateOverallRisk(vulnerabilities) {
    if (vulnerabilities.length === 0) return 'low';
    
    const severityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
    const totalWeight = vulnerabilities.reduce((sum, vuln) => sum + severityWeights[vuln.severity], 0);
    const avgWeight = totalWeight / vulnerabilities.length;
    
    if (avgWeight >= 3.5) return 'critical';
    if (avgWeight >= 2.5) return 'high';
    if (avgWeight >= 1.5) return 'medium';
    return 'low';
  }

  generateOverallRecommendations(vulnerabilities) {
    const recommendations = [
      'Implement a regular vulnerability scanning schedule',
      'Establish a security patch management process',
      'Conduct security awareness training for development teams',
      'Implement secure coding practices and code reviews'
    ];
    
    if (vulnerabilities.some(v => v.type.includes('SQL'))) {
      recommendations.push('Review and implement database security best practices');
    }
    
    if (vulnerabilities.some(v => v.type.includes('XSS'))) {
      recommendations.push('Implement comprehensive input validation and output encoding');
    }
    
    return recommendations;
  }

  assessCompliance(vulnerabilities) {
    const frameworks = {
      'OWASP Top 10': this.assessOWASPCompliance(vulnerabilities),
      'PCI DSS': this.assessPCICompliance(vulnerabilities),
      'ISO 27001': this.assessISOCompliance(vulnerabilities)
    };
    
    return frameworks;
  }

  assessOWASPCompliance(vulnerabilities) {
    const owaspVulns = vulnerabilities.filter(v => 
      v.references.some(ref => ref.startsWith('OWASP'))
    );
    
    const complianceScore = Math.max(0, 100 - (owaspVulns.length * 10));
    
    return {
      score: complianceScore,
      status: complianceScore >= 80 ? 'compliant' : 'non-compliant',
      findings: owaspVulns.length
    };
  }

  assessPCICompliance(vulnerabilities) {
    const pciRelevantVulns = vulnerabilities.filter(v => 
      ['SQL Injection', 'XSS', 'Weak Password Policy'].includes(v.type)
    );
    
    const complianceScore = Math.max(0, 100 - (pciRelevantVulns.length * 15));
    
    return {
      score: complianceScore,
      status: complianceScore >= 90 ? 'compliant' : 'non-compliant',
      findings: pciRelevantVulns.length
    };
  }

  assessISOCompliance(vulnerabilities) {
    const complianceScore = Math.max(0, 100 - (vulnerabilities.length * 8));
    
    return {
      score: complianceScore,
      status: complianceScore >= 85 ? 'compliant' : 'non-compliant',
      findings: vulnerabilities.length
    };
  }

  generateNextSteps(vulnerabilities) {
    const steps = [];
    
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'critical');
    const highVulns = vulnerabilities.filter(v => v.severity === 'high');
    
    if (criticalVulns.length > 0) {
      steps.push({
        priority: 1,
        action: 'Immediate remediation of critical vulnerabilities',
        timeline: '24-48 hours',
        vulnerabilities: criticalVulns.length
      });
    }
    
    if (highVulns.length > 0) {
      steps.push({
        priority: 2,
        action: 'Address high-severity vulnerabilities',
        timeline: '1-2 weeks',
        vulnerabilities: highVulns.length
      });
    }
    
    steps.push({
      priority: 3,
      action: 'Schedule follow-up penetration test',
      timeline: '30 days after remediation',
      vulnerabilities: 'all'
    });
    
    return steps;
  }

  async schedule({ frequency = 'quarterly', scope = 'full_infrastructure', compliance = [] }) {
    console.log(`📅 Scheduling penetration tests: ${frequency} - ${scope}`);
    
    const schedule = {
      id: `schedule_${Date.now()}`,
      frequency,
      scope,
      compliance,
      createdAt: new Date().toISOString(),
      status: 'active',
      nextScan: this.calculateNextScanDate(frequency),
      scanTypes: this.getScanTypesForScope(scope),
      complianceRequirements: compliance
    };
    
    return schedule;
  }

  calculateNextScanDate(frequency) {
    const now = new Date();
    const intervals = {
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      annually: 365
    };
    
    const days = intervals[frequency] || 90;
    return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  getScanTypesForScope(scope) {
    const scopes = {
      'web_application': ['web_application', 'api_security'],
      'network_infrastructure': ['network_infrastructure'],
      'full_infrastructure': ['web_application', 'api_security', 'network_infrastructure', 'social_engineering'],
      'compliance_focused': ['web_application', 'network_infrastructure']
    };
    
    return scopes[scope] || scopes['web_application'];
  }

  async getScanResults(scanId) {
    return this.scans.get(scanId) || null;
  }

  async getReport(reportId) {
    return this.reports.get(reportId) || null;
  }

  async getVulnerabilityMetrics(timeRange = '30d') {
    const scans = Array.from(this.scans.values());
    const allVulnerabilities = scans.flatMap(scan => scan.vulnerabilities || []);
    
    return {
      timeRange,
      generatedAt: new Date().toISOString(),
      totalScans: scans.length,
      totalVulnerabilities: allVulnerabilities.length,
      vulnerabilityTrends: this.calculateVulnerabilityTrends(scans),
      severityDistribution: this.countBySeverity(allVulnerabilities),
      topVulnerabilityTypes: this.getTopVulnerabilityTypes(allVulnerabilities),
      complianceStatus: this.getOverallComplianceStatus(scans),
      remediationMetrics: {
        averageRemediationTime: '5.2 days',
        openVulnerabilities: allVulnerabilities.filter(v => v.severity === 'high' || v.severity === 'critical').length,
        closedVulnerabilities: Math.floor(allVulnerabilities.length * 0.7)
      }
    };
  }

  calculateVulnerabilityTrends(scans) {
    // Mock trend calculation
    return {
      thisMonth: scans.length,
      lastMonth: Math.floor(scans.length * 0.8),
      trend: 'increasing'
    };
  }

  getTopVulnerabilityTypes(vulnerabilities) {
    const typeCounts = {};
    
    vulnerabilities.forEach(vuln => {
      typeCounts[vuln.type] = (typeCounts[vuln.type] || 0) + 1;
    });
    
    return Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  }

  getOverallComplianceStatus(scans) {
    const reports = Array.from(this.reports.values());
    
    if (reports.length === 0) {
      return { overall: 'unknown', frameworks: {} };
    }
    
    // Calculate average compliance scores
    const frameworks = ['OWASP Top 10', 'PCI DSS', 'ISO 27001'];
    const frameworkScores = {};
    
    frameworks.forEach(framework => {
      const scores = reports.map(r => r.compliance[framework]?.score || 0);
      frameworkScores[framework] = scores.length > 0 ? 
        scores.reduce((sum, score) => sum + score, 0) / scores.length : 0;
    });
    
    const overallScore = Object.values(frameworkScores).reduce((sum, score) => sum + score, 0) / frameworks.length;
    
    return {
      overall: overallScore >= 80 ? 'compliant' : 'non-compliant',
      overallScore: Math.round(overallScore),
      frameworks: frameworkScores
    };
  }

  async listScans() {
    return Array.from(this.scans.values()).map(scan => ({
      id: scan.id,
      target: scan.target,
      type: scan.type,
      status: scan.status,
      startTime: scan.startTime,
      vulnerabilities: scan.vulnerabilities?.length || 0
    }));
  }

  async getScanTemplates() {
    return Array.from(this.scanTemplates.values());
  }
}

module.exports = new PenetrationTesting();