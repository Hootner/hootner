/**
 * Age Verification Service
 * Regulatory compliance and identity validation
 */

const crypto = require('crypto');

class AgeVerification {
  constructor() {
    this.jurisdictions = {
      'US': { minAge: 13, adultAge: 18, methods: ['parental_consent', 'document', 'credit_card'] },
      'EU': { minAge: 16, adultAge: 18, methods: ['document', 'bank_verification'] },
      'UK': { minAge: 13, adultAge: 18, methods: ['document', 'credit_card'] },
      'CA': { minAge: 13, adultAge: 18, methods: ['parental_consent', 'document'] }
    };
    
    this.verificationMethods = {
      'document': { accuracy: 0.95, processingTime: '2-5 minutes' },
      'credit_card': { accuracy: 0.85, processingTime: 'instant' },
      'bank_verification': { accuracy: 0.98, processingTime: '1-2 hours' },
      'parental_consent': { accuracy: 0.90, processingTime: '24-48 hours' }
    };
  }

  async verifyAge({ userId, birthDate, method, jurisdiction = 'US', documentData = null }) {
    // Sanitize inputs to prevent XSS
    userId = String(userId).replace(/[<>"'&]/g, '');
    method = String(method).replace(/[<>"'&]/g, '');
    jurisdiction = String(jurisdiction).replace(/[<>"'&]/g, '');
    
    console.log(`🔍 Verifying age for user: ${userId} (${method})`);
    
    const verificationId = `age_${crypto.randomUUID()}`;
    const age = this.calculateAge(birthDate);
    const jurisdictionRules = this.jurisdictions[jurisdiction];
    
    if (!jurisdictionRules) {
      throw new Error(`Unsupported jurisdiction: ${jurisdiction}`);
    }

    const verification = {
      id: verificationId,
      userId,
      method,
      jurisdiction,
      age,
      status: 'pending',
      verified: false,
      meetsMinAge: age >= jurisdictionRules.minAge,
      isAdult: age >= jurisdictionRules.adultAge,
      verifiedAt: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
      confidence: 0
    };

    // Process verification based on method
    const result = await this.processVerification(method, { age, birthDate, documentData, jurisdiction });
    
    verification.status = result.success ? 'verified' : 'failed';
    verification.verified = result.success && verification.meetsMinAge;
    verification.confidence = result.confidence;
    verification.verifiedAt = new Date().toISOString();
    verification.failureReason = result.failureReason;

    return verification;
  }

  calculateAge(birthDate) {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  async processVerification(method, data) {
    const methodConfig = this.verificationMethods[method];
    
    if (!methodConfig) {
      return { success: false, confidence: 0, failureReason: 'Unsupported verification method' };
    }

    // Simulate verification processing
    await this.simulateProcessingTime(method);
    
    switch (method) {
      case 'document':
        return await this.verifyDocument(data);
      case 'credit_card':
        return await this.verifyCreditCard(data);
      case 'bank_verification':
        return await this.verifyBankAccount(data);
      case 'parental_consent':
        return await this.verifyParentalConsent(data);
      default:
        return { success: false, confidence: 0, failureReason: 'Unknown method' };
    }
  }

  async verifyDocument(data) {
    // Mock document verification - replace with actual ID verification service
    const success = Math.random() > 0.1; // 90% success rate
    
    return {
      success,
      confidence: success ? 0.95 : 0.2,
      failureReason: success ? null : 'Document verification failed'
    };
  }

  async verifyCreditCard(data) {
    // Mock credit card verification
    const success = Math.random() > 0.15; // 85% success rate
    
    return {
      success,
      confidence: success ? 0.85 : 0.3,
      failureReason: success ? null : 'Credit card verification failed'
    };
  }

  async verifyBankAccount(data) {
    // Mock bank verification
    const success = Math.random() > 0.05; // 95% success rate
    
    return {
      success,
      confidence: success ? 0.98 : 0.1,
      failureReason: success ? null : 'Bank verification failed'
    };
  }

  async verifyParentalConsent(data) {
    // Mock parental consent verification
    const success = Math.random() > 0.2; // 80% success rate
    
    return {
      success,
      confidence: success ? 0.90 : 0.4,
      failureReason: success ? null : 'Parental consent not verified'
    };
  }

  async simulateProcessingTime(method) {
    const delays = {
      'document': 2000, // 2 seconds
      'credit_card': 100, // instant
      'bank_verification': 5000, // 5 seconds
      'parental_consent': 1000 // 1 second (mock)
    };
    
    await new Promise(resolve => setTimeout(resolve, delays[method] || 1000));
  }

  async checkComplianceStatus(userId, jurisdiction = 'US') {
    // Mock compliance check - replace with actual database query
    const mockVerification = {
      userId,
      jurisdiction,
      verified: true,
      age: 25,
      isAdult: true,
      meetsMinAge: true,
      lastVerified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
      expiresAt: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000).toISOString(), // 335 days from now
      method: 'document',
      confidence: 0.95
    };
    
    return mockVerification;
  }

  async verify({ userId, method, jurisdiction = 'US' }) {
    console.log(`🔍 Age verification for user: ${userId} using ${method}`);
    
    // Mock birth date for demonstration
    const mockBirthDate = '1990-01-01';
    
    return await this.verifyAge({ userId, birthDate: mockBirthDate, method, jurisdiction });
  }
}

module.exports = new AgeVerification();