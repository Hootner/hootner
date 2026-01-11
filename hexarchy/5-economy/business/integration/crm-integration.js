/**
 * CRM Integration Service - Salesforce Customer Management
 * Manages customer relationships and sales processes
 */

class CRMIntegrationService {
    constructor() {
        this.connections = new Map();
        this.customers = new Map();
        this.leads = new Map();
        this.opportunities = new Map();
        this.metrics = {
            customers: 0,
            leads: 0,
            conversions: 0,
            revenue: 0
        };
    }

    // Salesforce Integration
    async connectSalesforce(config) {
        const connection = {
            type: 'Salesforce',
            instanceUrl: config.instanceUrl,
            accessToken: config.accessToken,
            apiVersion: 'v58.0',
            objects: ['Account', 'Contact', 'Lead', 'Opportunity', 'Case'],
            status: 'connected'
        };
        
        this.connections.set('salesforce', connection);
        return { success: true, objects: connection.objects };
    }

    // HubSpot Integration
    async connectHubSpot(config) {
        const connection = {
            type: 'HubSpot',
            apiKey: config.apiKey,
            portalId: config.portalId,
            objects: ['contacts', 'companies', 'deals', 'tickets'],
            status: 'connected'
        };
        
        this.connections.set('hubspot', connection);
        return { success: true, objects: connection.objects };
    }

    // Customer Management
    async createCustomer(customerData) {
        const customer = {
            id: `CUST-${Date.now()}`,
            name: customerData.name,
            email: customerData.email,
            company: customerData.company,
            status: 'active',
            createdAt: new Date(),
            lifetime_value: 0,
            interactions: []
        };
        
        this.customers.set(customer.id, customer);
        this.metrics.customers++;
        
        return customer;
    }

    async updateCustomer(customerId, updates) {
        const customer = this.customers.get(customerId);
        if (!customer) throw new Error('Customer not found');
        
        Object.assign(customer, updates, { updatedAt: new Date() });
        return customer;
    }

    // Lead Management
    async createLead(leadData) {
        const lead = {
            id: `LEAD-${Date.now()}`,
            name: leadData.name,
            email: leadData.email,
            source: leadData.source || 'website',
            score: this.calculateLeadScore(leadData),
            status: 'new',
            createdAt: new Date()
        };
        
        this.leads.set(lead.id, lead);
        this.metrics.leads++;
        
        return lead;
    }

    calculateLeadScore(leadData) {
        let score = 0;
        
        // Company size scoring
        if (leadData.companySize > 1000) score += 30;
        else if (leadData.companySize > 100) score += 20;
        else score += 10;
        
        // Industry scoring
        const highValueIndustries = ['technology', 'finance', 'healthcare'];
        if (highValueIndustries.includes(leadData.industry)) score += 25;
        
        // Engagement scoring
        if (leadData.emailOpens > 5) score += 15;
        if (leadData.websiteVisits > 10) score += 20;
        
        return Math.min(score, 100);
    }

    // Sales Automation
    async createOpportunity(opportunityData) {
        const opportunity = {
            id: `OPP-${Date.now()}`,
            name: opportunityData.name,
            amount: opportunityData.amount,
            stage: 'prospecting',
            probability: 10,
            closeDate: opportunityData.closeDate,
            accountId: opportunityData.accountId,
            createdAt: new Date()
        };
        
        this.opportunities.set(opportunity.id, opportunity);
        return opportunity;
    }

    async updateOpportunityStage(opportunityId, stage) {
        const opportunity = this.opportunities.get(opportunityId);
        if (!opportunity) throw new Error('Opportunity not found');
        
        const stageProbability = {
            'prospecting': 10,
            'qualification': 25,
            'proposal': 50,
            'negotiation': 75,
            'closed_won': 100,
            'closed_lost': 0
        };
        
        opportunity.stage = stage;
        opportunity.probability = stageProbability[stage];
        opportunity.updatedAt = new Date();
        
        if (stage === 'closed_won') {
            this.metrics.conversions++;
            this.metrics.revenue += opportunity.amount;
        }
        
        return opportunity;
    }

    // Customer Analytics
    async getCustomerInsights(customerId) {
        const customer = this.customers.get(customerId);
        if (!customer) throw new Error('Customer not found');
        
        return {
            profile: customer,
            engagement: {
                totalInteractions: customer.interactions.length,
                lastActivity: customer.interactions[customer.interactions.length - 1]?.date,
                preferredChannels: ['email', 'phone', 'chat']
            },
            value: {
                lifetimeValue: customer.lifetime_value,
                averageOrderValue: customer.lifetime_value / (customer.orders || 1),
                churnRisk: this.calculateChurnRisk(customer)
            }
        };
    }

    calculateChurnRisk(customer) {
        const daysSinceLastActivity = customer.interactions.length > 0 
            ? (Date.now() - new Date(customer.interactions[customer.interactions.length - 1].date)) / (1000 * 60 * 60 * 24)
            : 365;
        
        if (daysSinceLastActivity > 90) return 'high';
        if (daysSinceLastActivity > 30) return 'medium';
        return 'low';
    }

    // Sales Pipeline
    async getSalesPipeline() {
        const pipeline = {};
        
        for (const [id, opp] of this.opportunities) {
            if (!pipeline[opp.stage]) {
                pipeline[opp.stage] = {
                    count: 0,
                    totalValue: 0,
                    opportunities: []
                };
            }
            
            pipeline[opp.stage].count++;
            pipeline[opp.stage].totalValue += opp.amount;
            pipeline[opp.stage].opportunities.push(opp);
        }
        
        return pipeline;
    }

    getMetrics() {
        return {
            ...this.metrics,
            conversionRate: this.metrics.leads > 0 ? (this.metrics.conversions / this.metrics.leads * 100).toFixed(2) + '%' : '0%',
            avgDealSize: this.metrics.conversions > 0 ? (this.metrics.revenue / this.metrics.conversions).toFixed(0) : 0,
            pipelineValue: Array.from(this.opportunities.values()).reduce((sum, opp) => sum + opp.amount, 0)
        };
    }
}

module.exports = CRMIntegrationService;