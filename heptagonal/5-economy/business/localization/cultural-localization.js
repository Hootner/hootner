/**
 * Cultural Localization Service - Regional Content Adaptation
 * Manages cultural preferences and region-specific content customization
 */

class CulturalLocalizationService {
    constructor() {
        this.cultures = new Map();
        this.adaptations = new Map();
        this.contentRules = new Map();
        this.preferences = new Map();
        this.metrics = {
            supportedCultures: 0,
            adaptedContent: 0,
            culturalRules: 0,
            satisfactionScore: 0
        };
        this.initializeCultures();
    }

    // Cultural Profiles Initialization
    initializeCultures() {
        const cultures = [
            {
                code: 'US',
                name: 'United States',
                region: 'North America',
                preferences: {
                    colors: { primary: '#0066cc', avoid: [] },
                    imagery: ['diverse', 'professional', 'casual'],
                    communication: 'direct',
                    formality: 'informal',
                    timeOrientation: 'future'
                },
                contentRules: {
                    violence: 'moderate',
                    nudity: 'restricted',
                    language: 'english_preferred',
                    religion: 'neutral'
                },
                holidays: ['new_year', 'independence_day', 'thanksgiving', 'christmas'],
                workingHours: '09:00-17:00',
                weekend: ['saturday', 'sunday']
            },
            {
                code: 'JP',
                name: 'Japan',
                region: 'East Asia',
                preferences: {
                    colors: { primary: '#cc0000', avoid: ['green_white_combination'] },
                    imagery: ['respectful', 'harmonious', 'detailed'],
                    communication: 'indirect',
                    formality: 'formal',
                    timeOrientation: 'present'
                },
                contentRules: {
                    violence: 'minimal',
                    nudity: 'very_restricted',
                    language: 'polite_forms',
                    religion: 'respectful'
                },
                holidays: ['new_year', 'golden_week', 'obon', 'culture_day'],
                workingHours: '09:00-18:00',
                weekend: ['saturday', 'sunday']
            },
            {
                code: 'DE',
                name: 'Germany',
                region: 'Western Europe',
                preferences: {
                    colors: { primary: '#000000', avoid: [] },
                    imagery: ['precise', 'quality', 'efficient'],
                    communication: 'direct',
                    formality: 'formal',
                    timeOrientation: 'punctual'
                },
                contentRules: {
                    violence: 'restricted',
                    nudity: 'liberal',
                    language: 'precise_german',
                    religion: 'neutral'
                },
                holidays: ['new_year', 'easter', 'oktoberfest', 'christmas'],
                workingHours: '08:00-17:00',
                weekend: ['saturday', 'sunday']
            },
            {
                code: 'SA',
                name: 'Saudi Arabia',
                region: 'Middle East',
                preferences: {
                    colors: { primary: '#006633', avoid: ['inappropriate_combinations'] },
                    imagery: ['conservative', 'family_oriented', 'respectful'],
                    communication: 'respectful',
                    formality: 'formal',
                    timeOrientation: 'traditional'
                },
                contentRules: {
                    violence: 'minimal',
                    nudity: 'prohibited',
                    language: 'arabic_preferred',
                    religion: 'islamic_compliant'
                },
                holidays: ['eid_fitr', 'eid_adha', 'national_day', 'ramadan'],
                workingHours: '08:00-16:00',
                weekend: ['friday', 'saturday']
            },
            {
                code: 'IN',
                name: 'India',
                region: 'South Asia',
                preferences: {
                    colors: { primary: '#ff6600', avoid: [] },
                    imagery: ['colorful', 'diverse', 'family_centered'],
                    communication: 'respectful',
                    formality: 'mixed',
                    timeOrientation: 'flexible'
                },
                contentRules: {
                    violence: 'moderate',
                    nudity: 'restricted',
                    language: 'multilingual',
                    religion: 'inclusive'
                },
                holidays: ['diwali', 'holi', 'independence_day', 'dussehra'],
                workingHours: '09:30-18:30',
                weekend: ['saturday', 'sunday']
            }
        ];

        cultures.forEach(culture => {
            this.cultures.set(culture.code, culture);
            this.metrics.supportedCultures++;
        });
    }

    // Content Adaptation
    async adaptContentForCulture(contentConfig) {
        const culture = this.cultures.get(contentConfig.cultureCode);
        if (!culture) throw new Error('Culture not supported');

        const adaptation = {
            id: `ADAPT-${Date.now()}`,
            contentId: contentConfig.contentId,
            cultureCode: contentConfig.cultureCode,
            originalContent: contentConfig.content,
            adaptedContent: {},
            adaptations: [],
            status: 'processing',
            createdAt: new Date()
        };

        // Apply cultural adaptations
        adaptation.adaptedContent = await this.performCulturalAdaptation(
            contentConfig.content,
            culture
        );

        adaptation.adaptations = this.getAppliedAdaptations(
            contentConfig.content,
            adaptation.adaptedContent,
            culture
        );

        adaptation.status = 'completed';
        this.adaptations.set(adaptation.id, adaptation);
        this.metrics.adaptedContent++;

        return adaptation;
    }

    async performCulturalAdaptation(content, culture) {
        const adapted = { ...content };

        // Color adaptations
        if (content.colors) {
            adapted.colors = this.adaptColors(content.colors, culture);
        }

        // Text adaptations
        if (content.text) {
            adapted.text = this.adaptText(content.text, culture);
        }

        // Image adaptations
        if (content.images) {
            adapted.images = this.adaptImages(content.images, culture);
        }

        // Layout adaptations
        if (content.layout) {
            adapted.layout = this.adaptLayout(content.layout, culture);
        }

        // Time/Date adaptations
        if (content.datetime) {
            adapted.datetime = this.adaptDateTime(content.datetime, culture);
        }

        return adapted;
    }

    adaptColors(colors, culture) {
        const adapted = { ...colors };
        
        // Apply cultural color preferences
        if (culture.preferences.colors.primary) {
            adapted.primary = culture.preferences.colors.primary;
        }

        // Remove culturally inappropriate colors
        culture.preferences.colors.avoid.forEach(avoidColor => {
            if (adapted[avoidColor]) {
                adapted[avoidColor] = culture.preferences.colors.primary;
            }
        });

        return adapted;
    }

    adaptText(text, culture) {
        const adapted = { ...text };

        // Adjust formality level
        if (culture.preferences.formality === 'formal') {
            adapted.greeting = this.makeFormal(adapted.greeting);
            adapted.buttons = this.makeFormal(adapted.buttons);
        }

        // Adjust communication style
        if (culture.preferences.communication === 'indirect') {
            adapted.messages = this.makeIndirect(adapted.messages);
        }

        return adapted;
    }

    makeFormal(text) {
        if (typeof text === 'string') {
            return text.replace(/Hi/g, 'Good day').replace(/Thanks/g, 'Thank you');
        }
        return text;
    }

    makeIndirect(text) {
        if (typeof text === 'string') {
            return text.replace(/You must/g, 'It would be appreciated if you could');
        }
        return text;
    }

    adaptImages(images, culture) {
        const adapted = { ...images };

        // Filter images based on cultural preferences
        culture.preferences.imagery.forEach(preference => {
            if (preference === 'conservative' && adapted.lifestyle) {
                adapted.lifestyle = adapted.lifestyle.filter(img => 
                    !img.tags.includes('revealing')
                );
            }
        });

        return adapted;
    }

    adaptLayout(layout, culture) {
        const adapted = { ...layout };

        // Adjust for reading direction
        const readingDirection = this.getReadingDirection(culture.code);
        if (readingDirection === 'rtl') {
            adapted.direction = 'rtl';
            adapted.alignment = 'right';
        }

        return adapted;
    }

    getReadingDirection(cultureCode) {
        const rtlCultures = ['SA', 'AE', 'EG', 'IL'];
        return rtlCultures.includes(cultureCode) ? 'rtl' : 'ltr';
    }

    adaptDateTime(datetime, culture) {
        const adapted = { ...datetime };

        // Adjust date format
        adapted.dateFormat = this.getDateFormat(culture.code);
        
        // Adjust time format
        adapted.timeFormat = this.getTimeFormat(culture.code);

        // Adjust calendar system
        adapted.calendar = this.getCalendarSystem(culture.code);

        return adapted;
    }

    getDateFormat(cultureCode) {
        const formats = {
            'US': 'MM/DD/YYYY',
            'DE': 'DD.MM.YYYY',
            'JP': 'YYYY/MM/DD',
            'SA': 'DD/MM/YYYY',
            'IN': 'DD/MM/YYYY'
        };
        return formats[cultureCode] || 'DD/MM/YYYY';
    }

    getTimeFormat(cultureCode) {
        const formats = {
            'US': '12h',
            'DE': '24h',
            'JP': '24h',
            'SA': '12h',
            'IN': '12h'
        };
        return formats[cultureCode] || '24h';
    }

    getCalendarSystem(cultureCode) {
        const calendars = {
            'SA': 'hijri',
            'JP': 'japanese',
            'IN': 'indian_national'
        };
        return calendars[cultureCode] || 'gregorian';
    }

    getAppliedAdaptations(original, adapted, culture) {
        const adaptations = [];

        if (JSON.stringify(original.colors) !== JSON.stringify(adapted.colors)) {
            adaptations.push({
                type: 'color_adaptation',
                reason: 'Cultural color preferences',
                changes: 'Updated primary colors'
            });
        }

        if (culture.preferences.formality === 'formal') {
            adaptations.push({
                type: 'formality_adjustment',
                reason: 'Cultural formality expectations',
                changes: 'Increased text formality'
            });
        }

        return adaptations;
    }

    // Cultural Rules Management
    async createCulturalRule(ruleConfig) {
        const rule = {
            id: `RULE-${Date.now()}`,
            name: ruleConfig.name,
            cultureCode: ruleConfig.cultureCode,
            category: ruleConfig.category, // content, imagery, text, behavior
            condition: ruleConfig.condition,
            action: ruleConfig.action,
            priority: ruleConfig.priority || 'medium',
            active: true,
            createdAt: new Date()
        };

        this.contentRules.set(rule.id, rule);
        this.metrics.culturalRules++;
        return rule;
    }

    // Holiday and Event Management
    async getHolidayCalendar(cultureCode, year) {
        const culture = this.cultures.get(cultureCode);
        if (!culture) throw new Error('Culture not supported');

        const holidays = culture.holidays.map(holiday => ({
            name: holiday,
            date: this.getHolidayDate(holiday, year, cultureCode),
            type: this.getHolidayType(holiday),
            significance: this.getHolidaySignificance(holiday, cultureCode)
        }));

        return {
            cultureCode,
            year,
            holidays,
            workingDays: this.calculateWorkingDays(holidays, culture.weekend, year)
        };
    }

    getHolidayDate(holiday, year, cultureCode) {
        // Simplified holiday date calculation
        const dates = {
            'new_year': `${year}-01-01`,
            'christmas': `${year}-12-25`,
            'independence_day': cultureCode === 'US' ? `${year}-07-04` : `${year}-08-15`,
            'diwali': `${year}-11-04`, // Approximate
            'eid_fitr': `${year}-05-13` // Approximate
        };
        return dates[holiday] || `${year}-01-01`;
    }

    getHolidayType(holiday) {
        const types = {
            'new_year': 'national',
            'christmas': 'religious',
            'independence_day': 'national',
            'diwali': 'religious',
            'eid_fitr': 'religious'
        };
        return types[holiday] || 'cultural';
    }

    getHolidaySignificance(holiday, cultureCode) {
        return {
            holiday,
            cultureCode,
            businessImpact: 'high',
            contentRecommendation: 'themed_content'
        };
    }

    calculateWorkingDays(holidays, weekend, year) {
        const totalDays = this.isLeapYear(year) ? 366 : 365;
        const weekendDays = Math.floor(totalDays / 7) * weekend.length;
        const holidayDays = holidays.length;
        return totalDays - weekendDays - holidayDays;
    }

    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    // Cultural Analytics
    async getCulturalAnalytics() {
        const adaptations = Array.from(this.adaptations.values());
        const cultures = Array.from(this.cultures.values());

        return {
            overview: {
                supportedCultures: cultures.length,
                totalAdaptations: adaptations.length,
                activeRules: this.contentRules.size,
                avgSatisfaction: '4.2/5.0'
            },
            byRegion: this.getAdaptationsByRegion(adaptations, cultures),
            byCategory: this.getAdaptationsByCategory(adaptations),
            performance: {
                adaptationTime: '15 minutes avg',
                accuracyRate: '94%',
                userSatisfaction: '92%'
            },
            trends: {
                mostAdaptedContent: 'UI text',
                growingRegions: ['Asia-Pacific', 'Middle East'],
                emergingNeeds: ['voice_adaptation', 'gesture_recognition']
            }
        };
    }

    getAdaptationsByRegion(adaptations, cultures) {
        const byRegion = {};
        adaptations.forEach(adaptation => {
            const culture = cultures.find(c => c.code === adaptation.cultureCode);
            if (culture) {
                const region = culture.region;
                byRegion[region] = (byRegion[region] || 0) + 1;
            }
        });
        return byRegion;
    }

    getAdaptationsByCategory(adaptations) {
        const byCategory = {};
        adaptations.forEach(adaptation => {
            adaptation.adaptations.forEach(adapt => {
                byCategory[adapt.type] = (byCategory[adapt.type] || 0) + 1;
            });
        });
        return byCategory;
    }

    getMetrics() {
        const adaptations = Array.from(this.adaptations.values());
        const completed = adaptations.filter(a => a.status === 'completed').length;

        return {
            ...this.metrics,
            adaptedContent: adaptations.length,
            completionRate: adaptations.length > 0 ? (completed / adaptations.length * 100).toFixed(1) + '%' : '0%',
            satisfactionScore: '4.2/5.0',
            globalCoverage: '95% of target markets'
        };
    }
}

module.exports = CulturalLocalizationService;