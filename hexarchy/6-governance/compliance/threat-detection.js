export class ThreatDetection {
  constructor() {
    this.threats = [];
    this.rules = new Map([
      ['brute_force', { threshold: 5, window: 60000 }],
      ['ddos', { threshold: 1000, window: 10000 }],
      ['sql_injection', { pattern: /(\bOR\b|\bAND\b|--|;)/i }]
    ]);
  }

  analyze(event) {
    const threats = [];
    
    if (event.type === 'login_attempt') {
      const recent = this.threats.filter(t => 
        t.ip === event.ip && Date.now() - t.timestamp < 60000
      );
      if (recent.length >= 5) threats.push({ type: 'brute_force', severity: 'high' });
    }

    if (event.type === 'query' && this.rules.get('sql_injection').pattern.test(event.data)) {
      threats.push({ type: 'sql_injection', severity: 'critical' });
    }

    threats.forEach(t => this.threats.push({ ...t, timestamp: Date.now(), event }));
    return threats;
  }

  getThreats(severity) {
    return severity 
      ? this.threats.filter(t => t.severity === severity)
      : this.threats;
  }
}

export default new ThreatDetection();
