/**
 * Local Payment Methods Service - Regional Preferences
 * Manages region-specific payment methods and gateway integrations
 */

class LocalPaymentMethodsService {
    constructor() {
        this.paymentMethods = new Map();
        this.gateways = new Map();
        this.transactions = new Map();
        this.regionalPreferences = new Map();
        this.metrics = {
            supportedMethods: 0,
            supportedRegions: 0,
            totalTransactions: 0,
            successRate: 98.5
        };
        this.initializePaymentMethods();
    }

    // Payment Methods Initialization
    initializePaymentMethods() {
        const methods = [
            // North America
            {
                region: 'US',
                methods: [
                    { id: 'credit_card', name: 'Credit/Debit Card', popularity: 85, fees: 2.9 },
                    { id: 'paypal', name: 'PayPal', popularity: 70, fees: 3.5 },
                    { id: 'apple_pay', name: 'Apple Pay', popularity: 45, fees: 2.9 },
                    { id: 'google_pay', name: 'Google Pay', popularity: 35, fees: 2.9 },
                    { id: 'venmo', name: 'Venmo', popularity: 25, fees: 3.0 },
                    { id: 'zelle', name: 'Zelle', popularity: 20, fees: 0.0 }
                ]
            },
            {
                region: 'CA',
                methods: [
                    { id: 'credit_card', name: 'Credit/Debit Card', popularity: 80, fees: 2.9 },
                    { id: 'interac', name: 'Interac e-Transfer', popularity: 75, fees: 1.5 },
                    { id: 'paypal', name: 'PayPal', popularity: 60, fees: 3.5 },
                    { id: 'apple_pay', name: 'Apple Pay', popularity: 40, fees: 2.9 }
                ]
            },

            // Europe
            {
                region: 'DE',
                methods: [
                    { id: 'sepa', name: 'SEPA Direct Debit', popularity: 85, fees: 0.5 },
                    { id: 'sofort', name: 'Sofort', popularity: 70, fees: 1.4 },
                    { id: 'giropay', name: 'Giropay', popularity: 60, fees: 1.2 },
                    { id: 'credit_card', name: 'Credit Card', popularity: 55, fees: 2.9 },
                    { id: 'paypal', name: 'PayPal', popularity: 50, fees: 3.5 }
                ]
            },
            {
                region: 'NL',
                methods: [
                    { id: 'ideal', name: 'iDEAL', popularity: 90, fees: 0.3 },
                    { id: 'sepa', name: 'SEPA', popularity: 70, fees: 0.5 },
                    { id: 'credit_card', name: 'Credit Card', popularity: 45, fees: 2.9 },
                    { id: 'paypal', name: 'PayPal', popularity: 40, fees: 3.5 }
                ]
            },
            {
                region: 'SE',
                methods: [
                    { id: 'swish', name: 'Swish', popularity: 85, fees: 0.0 },
                    { id: 'klarna', name: 'Klarna', popularity: 75, fees: 3.5 },
                    { id: 'credit_card', name: 'Credit Card', popularity: 60, fees: 2.9 },
                    { id: 'trustly', name: 'Trustly', popularity: 50, fees: 2.0 }
                ]
            },

            // Asia
            {
                region: 'CN',
                methods: [
                    { id: 'alipay', name: 'Alipay', popularity: 95, fees: 0.6 },
                    { id: 'wechat_pay', name: 'WeChat Pay', popularity: 90, fees: 0.6 },
                    { id: 'unionpay', name: 'UnionPay', popularity: 70, fees: 1.5 },
                    { id: 'bank_transfer', name: 'Bank Transfer', popularity: 50, fees: 0.2 }
                ]
            },
            {
                region: 'JP',
                methods: [
                    { id: 'konbini', name: 'Konbini Payment', popularity: 80, fees: 3.0 },
                    { id: 'credit_card', name: 'Credit Card', popularity: 70, fees: 3.2 },
                    { id: 'bank_transfer', name: 'Bank Transfer', popularity: 60, fees: 1.0 },
                    { id: 'paypay', name: 'PayPay', popularity: 55, fees: 2.5 }
                ]
            },
            {
                region: 'IN',
                methods: [
                    { id: 'upi', name: 'UPI', popularity: 90, fees: 0.0 },
                    { id: 'paytm', name: 'Paytm', popularity: 75, fees: 1.8 },
                    { id: 'razorpay', name: 'Razorpay', popularity: 65, fees: 2.0 },
                    { id: 'net_banking', name: 'Net Banking', popularity: 60, fees: 1.5 },
                    { id: 'credit_card', name: 'Credit Card', popularity: 45, fees: 2.9 }
                ]
            },

            // Middle East
            {
                region: 'AE',
                methods: [
                    { id: 'credit_card', name: 'Credit Card', popularity: 75, fees: 2.9 },
                    { id: 'bank_transfer', name: 'Bank Transfer', popularity: 65, fees: 1.0 },
                    { id: 'cash_on_delivery', name: 'Cash on Delivery', popularity: 60, fees: 5.0 },
                    { id: 'apple_pay', name: 'Apple Pay', popularity: 35, fees: 2.9 }
                ]
            },

            // Latin America
            {
                region: 'BR',
                methods: [
                    { id: 'pix', name: 'PIX', popularity: 85, fees: 0.0 },
                    { id: 'boleto', name: 'Boleto Bancário', popularity: 70, fees: 2.5 },
                    { id: 'credit_card', name: 'Credit Card', popularity: 65, fees: 3.5 },
                    { id: 'mercado_pago', name: 'Mercado Pago', popularity: 55, fees: 4.0 }
                ]
            },
            {
                region: 'MX',
                methods: [
                    { id: 'oxxo', name: 'OXXO', popularity: 80, fees: 3.0 },
                    { id: 'spei', name: 'SPEI', popularity: 70, fees: 1.0 },
                    { id: 'credit_card', name: 'Credit Card', popularity: 60, fees: 3.2 },
                    { id: 'paypal', name: 'PayPal', popularity: 45, fees: 3.5 }
                ]
            }
        ];

        methods.forEach(regionMethods => {
            this.regionalPreferences.set(regionMethods.region, regionMethods.methods);
            regionMethods.methods.forEach(method => {
                const key = `${regionMethods.region}_${method.id}`;
                this.paymentMethods.set(key, {
                    ...method,
                    region: regionMethods.region,
                    supported: true
                });
                this.metrics.supportedMethods++;
            });
        });

        this.metrics.supportedRegions = methods.length;
    }

    // Payment Gateway Integration
    async integrateGateway(gatewayConfig) {
        const gateway = {
            id: `GW-${Date.now()}`,
            name: gatewayConfig.name,
            provider: gatewayConfig.provider,
            regions: gatewayConfig.regions || [],
            supportedMethods: gatewayConfig.methods || [],
            credentials: {
                apiKey: gatewayConfig.apiKey,
                secretKey: gatewayConfig.secretKey,
                merchantId: gatewayConfig.merchantId
            },
            fees: gatewayConfig.fees || {},
            features: gatewayConfig.features || [],
            status: 'active',
            createdAt: new Date()
        };

        this.gateways.set(gateway.id, gateway);
        return gateway;
    }

    // Payment Method Selection
    async getOptimalPaymentMethods(selectionConfig) {
        const region = selectionConfig.region;
        const amount = selectionConfig.amount || 0;
        const currency = selectionConfig.currency || 'USD';

        const regionalMethods = this.regionalPreferences.get(region);
        if (!regionalMethods) {
            throw new Error('Region not supported');
        }

        const optimizedMethods = regionalMethods
            .filter(method => this.isMethodAvailable(method, amount, currency))
            .map(method => ({
                ...method,
                totalCost: this.calculateTotalCost(amount, method.fees),
                processingTime: this.getProcessingTime(method.id),
                userExperience: this.getUserExperienceScore(method.id, region)
            }))
            .sort((a, b) => {
                // Sort by popularity and cost
                const aScore = a.popularity - (a.totalCost / amount * 100);
                const bScore = b.popularity - (b.totalCost / amount * 100);
                return bScore - aScore;
            });

        return {
            region,
            currency,
            amount,
            recommendedMethods: optimizedMethods.slice(0, 5),
            fallbackMethods: optimizedMethods.slice(5),
            totalMethods: optimizedMethods.length
        };
    }

    isMethodAvailable(method, amount, currency) {
        // Check amount limits
        const limits = this.getMethodLimits(method.id);
        if (amount < limits.min || amount > limits.max) {
            return false;
        }

        // Check currency support
        const supportedCurrencies = this.getSupportedCurrencies(method.id);
        return supportedCurrencies.includes(currency);
    }

    getMethodLimits(methodId) {
        const limits = {
            'credit_card': { min: 1, max: 50000 },
            'paypal': { min: 1, max: 10000 },
            'bank_transfer': { min: 10, max: 100000 },
            'upi': { min: 1, max: 1000 },
            'alipay': { min: 1, max: 5000 },
            'pix': { min: 1, max: 20000 }
        };
        return limits[methodId] || { min: 1, max: 10000 };
    }

    getSupportedCurrencies(methodId) {
        const currencies = {
            'credit_card': ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD'],
            'paypal': ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
            'alipay': ['CNY', 'USD', 'EUR'],
            'upi': ['INR'],
            'pix': ['BRL'],
            'sepa': ['EUR']
        };
        return currencies[methodId] || ['USD'];
    }

    calculateTotalCost(amount, feePercentage) {
        return amount * (feePercentage / 100);
    }

    getProcessingTime(methodId) {
        const times = {
            'credit_card': 'instant',
            'paypal': 'instant',
            'bank_transfer': '1-3 days',
            'sepa': '1-2 days',
            'upi': 'instant',
            'alipay': 'instant',
            'pix': 'instant',
            'boleto': '1-3 days'
        };
        return times[methodId] || 'instant';
    }

    getUserExperienceScore(methodId, region) {
        // Score based on ease of use and familiarity in region
        const scores = {
            'US': { 'credit_card': 9, 'paypal': 8, 'apple_pay': 9 },
            'CN': { 'alipay': 10, 'wechat_pay': 10, 'credit_card': 6 },
            'IN': { 'upi': 10, 'paytm': 8, 'credit_card': 7 },
            'BR': { 'pix': 10, 'boleto': 8, 'credit_card': 7 }
        };
        return scores[region]?.[methodId] || 7;
    }

    // Transaction Processing
    async processPayment(paymentConfig) {
        const transaction = {
            id: `TXN-${Date.now()}`,
            amount: paymentConfig.amount,
            currency: paymentConfig.currency,
            method: paymentConfig.method,
            region: paymentConfig.region,
            gateway: paymentConfig.gateway,
            customer: paymentConfig.customer,
            status: 'processing',
            fees: this.calculateFees(paymentConfig),
            createdAt: new Date()
        };

        // Simulate payment processing
        const result = await this.simulatePaymentProcessing(transaction);
        transaction.status = result.status;
        transaction.gatewayResponse = result.response;
        transaction.processedAt = new Date();

        this.transactions.set(transaction.id, transaction);
        this.metrics.totalTransactions++;

        return transaction;
    }

    calculateFees(paymentConfig) {
        const methodKey = `${paymentConfig.region}_${paymentConfig.method}`;
        const method = this.paymentMethods.get(methodKey);
        
        if (!method) return 0;

        const baseFee = paymentConfig.amount * (method.fees / 100);
        const gatewayFee = 0.30; // Fixed gateway fee
        
        return baseFee + gatewayFee;
    }

    async simulatePaymentProcessing(transaction) {
        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate success/failure (98.5% success rate)
        const isSuccess = Math.random() < 0.985;

        if (isSuccess) {
            return {
                status: 'completed',
                response: {
                    transactionId: `GW_${Date.now()}`,
                    authCode: this.generateAuthCode(),
                    processingTime: '1.2s'
                }
            };
        } else {
            return {
                status: 'failed',
                response: {
                    errorCode: 'DECLINED',
                    errorMessage: 'Payment declined by issuer'
                }
            };
        }
    }

    generateAuthCode() {
        return Array.from({length: 6}, () => 
            Math.floor(Math.random() * 36).toString(36)
        ).join('').toUpperCase();
    }

    // Regional Compliance
    async checkRegionalCompliance(region, method) {
        const compliance = {
            region,
            method,
            compliant: true,
            requirements: [],
            certifications: [],
            restrictions: []
        };

        // Add region-specific compliance requirements
        const requirements = this.getComplianceRequirements(region);
        compliance.requirements = requirements;

        // Check method-specific restrictions
        const restrictions = this.getMethodRestrictions(region, method);
        compliance.restrictions = restrictions;

        // Validate compliance
        compliance.compliant = restrictions.length === 0;

        return compliance;
    }

    getComplianceRequirements(region) {
        const requirements = {
            'US': ['PCI DSS', 'SOX compliance'],
            'EU': ['PSD2', 'GDPR', 'PCI DSS'],
            'CN': ['PBOC regulations', 'Anti-money laundering'],
            'IN': ['RBI guidelines', 'KYC requirements'],
            'BR': ['Central Bank regulations', 'LGPD']
        };
        return requirements[region] || ['PCI DSS'];
    }

    getMethodRestrictions(region, method) {
        const restrictions = [];

        // Example restrictions
        if (region === 'CN' && method === 'paypal') {
            restrictions.push('PayPal not available for domestic transactions');
        }

        if (region === 'IN' && method === 'credit_card') {
            restrictions.push('Additional authentication required');
        }

        return restrictions;
    }

    // Payment Analytics
    async getPaymentAnalytics(region) {
        const transactions = Array.from(this.transactions.values())
            .filter(txn => !region || txn.region === region);

        const analytics = {
            region: region || 'global',
            overview: {
                totalTransactions: transactions.length,
                totalVolume: transactions.reduce((sum, txn) => sum + txn.amount, 0),
                successRate: this.calculateSuccessRate(transactions),
                avgTransactionValue: this.calculateAvgTransactionValue(transactions)
            },
            byMethod: this.getTransactionsByMethod(transactions),
            byRegion: region ? null : this.getTransactionsByRegion(transactions),
            trends: {
                popularMethods: this.getPopularMethods(transactions),
                growingMethods: this.getGrowingMethods(transactions),
                declineMethods: this.getDecliningMethods(transactions)
            },
            performance: {
                avgProcessingTime: '1.2s',
                peakHours: this.getPeakHours(transactions),
                failureReasons: this.getFailureReasons(transactions)
            }
        };

        return analytics;
    }

    calculateSuccessRate(transactions) {
        if (transactions.length === 0) return 0;
        const successful = transactions.filter(txn => txn.status === 'completed').length;
        return (successful / transactions.length * 100).toFixed(2) + '%';
    }

    calculateAvgTransactionValue(transactions) {
        if (transactions.length === 0) return 0;
        const total = transactions.reduce((sum, txn) => sum + txn.amount, 0);
        return (total / transactions.length).toFixed(2);
    }

    getTransactionsByMethod(transactions) {
        const byMethod = {};
        transactions.forEach(txn => {
            byMethod[txn.method] = (byMethod[txn.method] || 0) + 1;
        });
        return byMethod;
    }

    getTransactionsByRegion(transactions) {
        const byRegion = {};
        transactions.forEach(txn => {
            byRegion[txn.region] = (byRegion[txn.region] || 0) + 1;
        });
        return byRegion;
    }

    getPopularMethods(transactions) {
        const methodCounts = this.getTransactionsByMethod(transactions);
        return Object.entries(methodCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([method, count]) => ({ method, count }));
    }

    getGrowingMethods(transactions) {
        // Simplified - would compare with previous period
        return ['upi', 'pix', 'apple_pay'];
    }

    getDecliningMethods(transactions) {
        // Simplified - would compare with previous period
        return ['bank_transfer', 'cash_on_delivery'];
    }

    getPeakHours(transactions) {
        const hours = {};
        transactions.forEach(txn => {
            const hour = new Date(txn.createdAt).getHours();
            hours[hour] = (hours[hour] || 0) + 1;
        });

        const peakHour = Object.entries(hours)
            .sort(([,a], [,b]) => b - a)[0];

        return peakHour ? `${peakHour[0]}:00` : 'No data';
    }

    getFailureReasons(transactions) {
        const failed = transactions.filter(txn => txn.status === 'failed');
        const reasons = {};
        
        failed.forEach(txn => {
            const reason = txn.gatewayResponse?.errorCode || 'UNKNOWN';
            reasons[reason] = (reasons[reason] || 0) + 1;
        });

        return reasons;
    }

    getMetrics() {
        const transactions = Array.from(this.transactions.values());
        const successful = transactions.filter(txn => txn.status === 'completed').length;

        return {
            ...this.metrics,
            successRate: transactions.length > 0 ? 
                (successful / transactions.length * 100).toFixed(1) + '%' : '98.5%',
            avgProcessingTime: '1.2s',
            globalCoverage: this.metrics.supportedRegions + ' regions',
            complianceRate: '100%'
        };
    }
}

module.exports = LocalPaymentMethodsService;