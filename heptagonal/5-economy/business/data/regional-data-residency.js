/**
 * Regional Data Residency Service - Data Sovereignty Laws
 * Manages data placement compliance with regional regulations
 */

class RegionalDataResidencyService {
    constructor() {
        this.regions = new Map();
        this.dataClassifications = new Map();
        this.residencyRules = new Map();
        this.dataLocations = new Map();
        this.metrics = {
            supportedRegions: 0,
            complianceRules: 0,
            dataAssets: 0,
            complianceRate: 100
        };
        this.initializeRegions();
    }

    // Regional Compliance Initialization
    initializeRegions() {
        const regions = [
            {
                code: 'EU',
                name: 'European Union',
                regulations: ['GDPR', 'DGA', 'NIS2'],
                dataResidency: 'strict',
                allowedCountries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'DK', 'FI'],
                crossBorderRules: {
                    adequacyDecisions: ['UK', 'CH', 'CA', 'JP', 'KR'],
                    requiresSCCs: true,
                    requiresDPIA: true
                },
                dataCategories: {
                    personal: 'must_remain',
                    sensitive: 'must_remain',
                    public: 'transferable',
                    operational: 'conditional'
                }
            },
            {
                code: 'US',
                name: 'United States',
                regulations: ['CCPA', 'CPRA', 'HIPAA', 'SOX'],
                dataResidency: 'moderate',
                allowedCountries: ['US', 'CA'],
                crossBorderRules: {
                    adequacyDecisions: [],
                    requiresSCCs: false,
                    requiresDPIA: false
                },
                dataCategories: {
                    personal: 'conditional',
                    sensitive: 'must_remain',
                    public: 'transferable',
                    operational: 'transferable'
                }
            },
            {
                code: 'CN',
                name: 'China',
                regulations: ['PIPL', 'CSL', 'DSL'],
                dataResidency: 'very_strict',
                allowedCountries: ['CN'],
                crossBorderRules: {
                    adequacyDecisions: [],
                    requiresSCCs: false,
                    requiresDPIA: true,
                    requiresApproval: true
                },
                dataCategories: {
                    personal: 'must_remain',
                    sensitive: 'must_remain',
                    public: 'conditional',
                    operational: 'must_remain'
                }
            },
            {
                code: 'RU',
                name: 'Russia',
                regulations: ['FZ-152', 'Data_Localization_Law'],
                dataResidency: 'strict',
                allowedCountries: ['RU'],
                crossBorderRules: {
                    adequacyDecisions: [],
                    requiresSCCs: false,
                    requiresDPIA: true
                },
                dataCategories: {
                    personal: 'must_remain',
                    sensitive: 'must_remain',
                    public: 'transferable',
                    operational: 'conditional'
                }
            },
            {
                code: 'IN',
                name: 'India',
                regulations: ['DPDP', 'IT_Rules'],
                dataResidency: 'moderate',
                allowedCountries: ['IN'],
                crossBorderRules: {
                    adequacyDecisions: [],
                    requiresSCCs: true,
                    requiresDPIA: true
                },
                dataCategories: {
                    personal: 'conditional',
                    sensitive: 'must_remain',
                    public: 'transferable',
                    operational: 'conditional'
                }
            },
            {
                code: 'BR',
                name: 'Brazil',
                regulations: ['LGPD'],
                dataResidency: 'moderate',
                allowedCountries: ['BR', 'AR', 'UY'],
                crossBorderRules: {
                    adequacyDecisions: ['EU'],
                    requiresSCCs: true,
                    requiresDPIA: false
                },
                dataCategories: {
                    personal: 'conditional',
                    sensitive: 'must_remain',
                    public: 'transferable',
                    operational: 'transferable'
                }
            }
        ];

        regions.forEach(region => {
            this.regions.set(region.code, region);
            this.metrics.supportedRegions++;
        });
    }

    // Data Classification
    async classifyData(dataConfig) {
        const classification = {
            id: `CLASS-${Date.now()}`,
            dataId: dataConfig.dataId,
            dataType: dataConfig.type,
            category: this.determineDataCategory(dataConfig),
            sensitivity: this.determineSensitivity(dataConfig),
            personalData: this.containsPersonalData(dataConfig),
            region: dataConfig.region,
            complianceRequirements: [],
            createdAt: new Date()
        };

        // Determine compliance requirements
        classification.complianceRequirements = await this.getComplianceRequirements(
            classification.category,
            classification.region,
            classification.personalData
        );

        this.dataClassifications.set(classification.id, classification);
        return classification;
    }

    determineDataCategory(dataConfig) {
        const categories = {
            'user_profile': 'personal',
            'payment_info': 'sensitive',
            'health_data': 'sensitive',
            'biometric': 'sensitive',
            'video_content': 'operational',
            'analytics': 'operational',
            'public_content': 'public',
            'marketing': 'public'
        };

        return categories[dataConfig.type] || 'operational';
    }

    determineSensitivity(dataConfig) {
        const sensitiveTypes = ['payment_info', 'health_data', 'biometric', 'government_id'];
        return sensitiveTypes.includes(dataConfig.type) ? 'high' : 'medium';
    }

    containsPersonalData(dataConfig) {
        const personalDataTypes = ['user_profile', 'payment_info', 'health_data', 'biometric'];
        return personalDataTypes.includes(dataConfig.type);
    }

    async getComplianceRequirements(category, region, isPersonalData) {
        const regionConfig = this.regions.get(region);
        if (!regionConfig) return [];

        const requirements = [];

        // Add region-specific requirements
        regionConfig.regulations.forEach(regulation => {
            requirements.push({
                regulation,
                requirement: this.getRegulationRequirement(regulation, category, isPersonalData)
            });
        });

        return requirements;
    }

    getRegulationRequirement(regulation, category, isPersonalData) {
        const requirements = {
            'GDPR': isPersonalData ? 'data_residency_eu' : 'standard_protection',
            'CCPA': isPersonalData ? 'privacy_rights' : 'standard_protection',
            'PIPL': 'data_localization_china',
            'LGPD': isPersonalData ? 'consent_management' : 'standard_protection'
        };

        return requirements[regulation] || 'standard_protection';
    }

    // Data Placement Engine
    async determineDataPlacement(placementConfig) {
        const placement = {
            id: `PLACE-${Date.now()}`,
            dataId: placementConfig.dataId,
            userRegion: placementConfig.userRegion,
            dataCategory: placementConfig.dataCategory,
            recommendedLocations: [],
            prohibitedLocations: [],
            transferMechanisms: [],
            complianceScore: 0,
            createdAt: new Date()
        };

        const regionConfig = this.regions.get(placementConfig.userRegion);
        if (!regionConfig) throw new Error('Region not supported');

        // Determine allowed locations
        placement.recommendedLocations = await this.getRecommendedLocations(
            regionConfig,
            placementConfig.dataCategory
        );

        // Determine prohibited locations
        placement.prohibitedLocations = await this.getProhibitedLocations(
            regionConfig,
            placementConfig.dataCategory
        );

        // Determine transfer mechanisms
        placement.transferMechanisms = await this.getTransferMechanisms(
            regionConfig,
            placement.recommendedLocations
        );

        // Calculate compliance score
        placement.complianceScore = this.calculateComplianceScore(placement, regionConfig);

        return placement;
    }

    async getRecommendedLocations(regionConfig, dataCategory) {
        const categoryRule = regionConfig.dataCategories[dataCategory];
        
        if (categoryRule === 'must_remain') {
            return regionConfig.allowedCountries;
        } else if (categoryRule === 'conditional') {
            return [...regionConfig.allowedCountries, ...regionConfig.crossBorderRules.adequacyDecisions];
        } else if (categoryRule === 'transferable') {
            return ['global']; // Can be stored anywhere with proper safeguards
        }

        return regionConfig.allowedCountries;
    }

    async getProhibitedLocations(regionConfig, dataCategory) {
        const prohibited = [];
        
        // Add countries without adequacy decisions for personal data
        if (dataCategory === 'personal' || dataCategory === 'sensitive') {
            const highRiskCountries = ['CN', 'RU', 'IR', 'KP'];
            prohibited.push(...highRiskCountries);
        }

        return prohibited;
    }

    async getTransferMechanisms(regionConfig, recommendedLocations) {
        const mechanisms = [];

        if (regionConfig.crossBorderRules.requiresSCCs) {
            mechanisms.push('standard_contractual_clauses');
        }

        if (regionConfig.crossBorderRules.requiresDPIA) {
            mechanisms.push('data_protection_impact_assessment');
        }

        if (regionConfig.crossBorderRules.requiresApproval) {
            mechanisms.push('regulatory_approval');
        }

        mechanisms.push('encryption_in_transit');
        mechanisms.push('encryption_at_rest');

        return mechanisms;
    }

    calculateComplianceScore(placement, regionConfig) {
        let score = 100;

        // Deduct points for cross-border transfers
        if (placement.recommendedLocations.includes('global')) {
            score -= 20;
        }

        // Deduct points for complex transfer mechanisms
        if (placement.transferMechanisms.includes('regulatory_approval')) {
            score -= 30;
        }

        // Add points for adequacy decisions
        const adequacyCount = placement.recommendedLocations.filter(loc => 
            regionConfig.crossBorderRules.adequacyDecisions.includes(loc)
        ).length;
        score += adequacyCount * 5;

        return Math.max(0, Math.min(100, score));
    }

    // Data Location Tracking
    async trackDataLocation(trackingConfig) {
        const tracking = {
            id: `TRACK-${Date.now()}`,
            dataId: trackingConfig.dataId,
            currentLocation: trackingConfig.location,
            dataCenter: trackingConfig.dataCenter,
            region: trackingConfig.region,
            compliance: await this.validateCompliance(trackingConfig),
            lastUpdated: new Date(),
            history: []
        };

        this.dataLocations.set(tracking.id, tracking);
        this.metrics.dataAssets++;

        return tracking;
    }

    async validateCompliance(trackingConfig) {
        const validation = {
            isCompliant: true,
            violations: [],
            warnings: [],
            score: 100
        };

        // Check if location is allowed for data type
        const regionConfig = this.regions.get(trackingConfig.region);
        if (regionConfig) {
            const dataCategory = trackingConfig.dataCategory || 'operational';
            const categoryRule = regionConfig.dataCategories[dataCategory];

            if (categoryRule === 'must_remain' && 
                !regionConfig.allowedCountries.includes(trackingConfig.location)) {
                validation.isCompliant = false;
                validation.violations.push({
                    type: 'data_residency_violation',
                    message: `${dataCategory} data must remain in ${regionConfig.allowedCountries.join(', ')}`,
                    severity: 'high'
                });
                validation.score -= 50;
            }
        }

        return validation;
    }

    // Cross-Border Transfer Management
    async requestCrossBorderTransfer(transferConfig) {
        const transfer = {
            id: `TRANSFER-${Date.now()}`,
            dataId: transferConfig.dataId,
            fromRegion: transferConfig.fromRegion,
            toRegion: transferConfig.toRegion,
            dataCategory: transferConfig.dataCategory,
            justification: transferConfig.justification,
            mechanisms: [],
            approvals: [],
            status: 'pending',
            createdAt: new Date()
        };

        // Determine required mechanisms
        transfer.mechanisms = await this.getRequiredMechanisms(
            transferConfig.fromRegion,
            transferConfig.toRegion,
            transferConfig.dataCategory
        );

        // Check if approval is required
        const fromRegionConfig = this.regions.get(transferConfig.fromRegion);
        if (fromRegionConfig?.crossBorderRules.requiresApproval) {
            transfer.approvals.push({
                type: 'regulatory_approval',
                authority: this.getRegulatoryAuthority(transferConfig.fromRegion),
                status: 'required'
            });
        }

        // Auto-approve if adequacy decision exists
        const toRegionConfig = this.regions.get(transferConfig.toRegion);
        if (fromRegionConfig?.crossBorderRules.adequacyDecisions.includes(transferConfig.toRegion)) {
            transfer.status = 'approved';
            transfer.approvals.push({
                type: 'adequacy_decision',
                authority: 'automatic',
                status: 'approved',
                approvedAt: new Date()
            });
        }

        return transfer;
    }

    async getRequiredMechanisms(fromRegion, toRegion, dataCategory) {
        const mechanisms = ['encryption_in_transit', 'encryption_at_rest'];
        
        const fromRegionConfig = this.regions.get(fromRegion);
        if (fromRegionConfig?.crossBorderRules.requiresSCCs) {
            mechanisms.push('standard_contractual_clauses');
        }

        if (fromRegionConfig?.crossBorderRules.requiresDPIA) {
            mechanisms.push('data_protection_impact_assessment');
        }

        return mechanisms;
    }

    getRegulatoryAuthority(region) {
        const authorities = {
            'EU': 'European Data Protection Board',
            'US': 'Federal Trade Commission',
            'CN': 'Cyberspace Administration of China',
            'RU': 'Roskomnadzor',
            'IN': 'Data Protection Board of India',
            'BR': 'National Data Protection Authority'
        };

        return authorities[region] || 'Local Data Protection Authority';
    }

    // Compliance Monitoring
    async monitorCompliance() {
        const monitoring = {
            timestamp: new Date(),
            overallCompliance: 0,
            regionCompliance: {},
            violations: [],
            recommendations: []
        };

        let totalAssets = 0;
        let compliantAssets = 0;

        // Check compliance for each data location
        for (const [id, location] of this.dataLocations) {
            totalAssets++;
            const compliance = await this.validateCompliance(location);
            
            if (compliance.isCompliant) {
                compliantAssets++;
            } else {
                monitoring.violations.push({
                    dataId: location.dataId,
                    location: location.currentLocation,
                    violations: compliance.violations
                });
            }

            // Track by region
            const region = location.region;
            if (!monitoring.regionCompliance[region]) {
                monitoring.regionCompliance[region] = { total: 0, compliant: 0 };
            }
            monitoring.regionCompliance[region].total++;
            if (compliance.isCompliant) {
                monitoring.regionCompliance[region].compliant++;
            }
        }

        monitoring.overallCompliance = totalAssets > 0 ? 
            (compliantAssets / totalAssets * 100).toFixed(2) + '%' : '100%';

        // Generate recommendations
        if (monitoring.violations.length > 0) {
            monitoring.recommendations.push('Relocate non-compliant data to approved regions');
            monitoring.recommendations.push('Implement additional transfer mechanisms');
        }

        return monitoring;
    }

    // Data Residency Analytics
    async getResidencyAnalytics() {
        const locations = Array.from(this.dataLocations.values());
        const classifications = Array.from(this.dataClassifications.values());

        return {
            overview: {
                supportedRegions: this.metrics.supportedRegions,
                trackedAssets: locations.length,
                complianceRate: this.metrics.complianceRate + '%',
                activeRules: this.residencyRules.size
            },
            byRegion: this.getDataByRegion(locations),
            byCategory: this.getDataByCategory(classifications),
            compliance: {
                violations: this.getViolationCount(locations),
                warnings: this.getWarningCount(locations),
                recommendations: this.getRecommendationCount()
            },
            trends: {
                crossBorderTransfers: 'Decreasing',
                complianceScore: 'Improving',
                dataLocalization: 'Increasing'
            }
        };
    }

    getDataByRegion(locations) {
        const byRegion = {};
        locations.forEach(location => {
            byRegion[location.region] = (byRegion[location.region] || 0) + 1;
        });
        return byRegion;
    }

    getDataByCategory(classifications) {
        const byCategory = {};
        classifications.forEach(classification => {
            byCategory[classification.category] = (byCategory[classification.category] || 0) + 1;
        });
        return byCategory;
    }

    getViolationCount(locations) {
        return locations.filter(loc => 
            loc.compliance && !loc.compliance.isCompliant
        ).length;
    }

    getWarningCount(locations) {
        return locations.filter(loc => 
            loc.compliance && loc.compliance.warnings.length > 0
        ).length;
    }

    getRecommendationCount() {
        return 5; // Simplified count
    }

    getMetrics() {
        const locations = Array.from(this.dataLocations.values());
        const compliant = locations.filter(loc => 
            loc.compliance && loc.compliance.isCompliant
        ).length;

        return {
            ...this.metrics,
            complianceRate: locations.length > 0 ? 
                (compliant / locations.length * 100).toFixed(1) + '%' : '100%',
            dataLocations: locations.length,
            crossBorderTransfers: 'Monitored',
            regulatoryReadiness: '100%'
        };
    }
}

module.exports = RegionalDataResidencyService;