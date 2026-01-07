#!/usr/bin/env node
/**
 * Layer 5: DNS Server - Domain Name System resolver
 * Dependencies: Layer 0 (Binary), Layer 2 (Parser), Layer 4 (Process)
 */

class DNSServer {
  constructor() {
    this.records = new Map();
    this.cache = new Map();
    this.queries = [];
  }

  // Add DNS record
  addRecord(domain, type, value, ttl = 3600) {
    const key = `${domain}:${type}`;
    this.records.set(key, { domain, type, value, ttl, created: Date.now() });
  }

  // Parse DNS query
  parseQuery(query) {
    const parts = query.split(' ');
    return { domain: parts[0], type: parts[1] || 'A' };
  }

  // Resolve domain
  resolve(query) {
    const { domain, type } = this.parseQuery(query);
    const key = `${domain}:${type}`;
    
    this.queries.push({ domain, type, time: Date.now() });
    
    // Check cache
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.time < cached.ttl * 1000) {
        console.log(`[CACHE HIT] ${domain} ${type} -> ${cached.value}`);
        return cached.value;
      }
      this.cache.delete(key);
    }
    
    // Check records
    if (this.records.has(key)) {
      const record = this.records.get(key);
      this.cache.set(key, { value: record.value, time: Date.now(), ttl: record.ttl });
      console.log(`[RESOLVED] ${domain} ${type} -> ${record.value}`);
      return record.value;
    }
    
    console.log(`[NOT FOUND] ${domain} ${type}`);
    return null;
  }

  // Recursive resolution
  resolveRecursive(domain, type = 'A') {
    const parts = domain.split('.');
    const results = [];
    
    // Try each level: example.com, .com, .
    for (let i = 0; i < parts.length; i++) {
      const subdomain = parts.slice(i).join('.');
      const result = this.resolve(`${subdomain} ${type}`);
      if (result) results.push({ domain: subdomain, value: result });
    }
    
    return results;
  }

  // Get statistics
  stats() {
    return {
      records: this.records.size,
      cached: this.cache.size,
      queries: this.queries.length
    };
  }
}

// Demo
if (require.main === module) {
  const dns = new DNSServer();
  
  console.log('=== DNS Server Demo ===\n');
  
  // Add records
  dns.addRecord('example.com', 'A', '93.184.216.34');
  dns.addRecord('example.com', 'AAAA', '2606:2800:220:1:248:1893:25c8:1946');
  dns.addRecord('www.example.com', 'CNAME', 'example.com');
  dns.addRecord('example.com', 'MX', 'mail.example.com');
  dns.addRecord('example.com', 'TXT', 'v=spf1 include:_spf.example.com ~all');
  
  // Resolve queries
  dns.resolve('example.com A');
  dns.resolve('example.com A'); // Cache hit
  dns.resolve('www.example.com CNAME');
  dns.resolve('example.com MX');
  dns.resolve('unknown.com A');
  
  console.log('\nRecursive:', dns.resolveRecursive('www.example.com'));
  console.log('\nStats:', dns.stats());
}

module.exports = DNSServer;
