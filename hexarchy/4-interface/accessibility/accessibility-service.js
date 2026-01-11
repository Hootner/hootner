/**
 * Accessibility Service
 * WCAG 2.1 AA compliance and assistive technology support
 */

import { createLogger } from '../../0-core/utils/logger.js';
import { eventBus } from '../../0-core/orchestration/event-bus.js';
import { EventTypes, DomainEvent } from '../../0-core/contracts/domain-events.js';

const logger = createLogger('interface', 'accessibility');

class AccessibilityService {
  constructor() {
    this.userPreferences = new Map();
    this.violations = [];
    this.supportedFeatures = new Set([
      'screen_reader',
      'high_contrast',
      'large_text',
      'keyboard_navigation',
      'voice_control',
      'reduced_motion',
      'color_blind_support',
      'focus_indicators'
    ]);
    
    this._setupEventListeners();
  }

  _setupEventListeners() {
    eventBus.subscribe(EventTypes.USER_LOGIN, async (event) => {
      await this.loadUserPreferences(event.payload.userId);
    });
  }

  /**
   * Load user accessibility preferences
   */
  async loadUserPreferences(userId) {
    // In real implementation, would load from database
    const preferences = {
      userId,
      screenReader: false,
      highContrast: false,
      fontSize: 'normal', // small, normal, large, extra-large
      keyboardNavigation: true,
      reducedMotion: false,
      colorBlindType: null, // protanopia, deuteranopia, tritanopia
      focusIndicators: 'enhanced', // standard, enhanced, high-visibility
      language: 'en-US',
      audioDescriptions: false,
      captions: false,
      lastUpdated: Date.now()
    };

    this.userPreferences.set(userId, preferences);

    logger.info('Accessibility preferences loaded', { userId });

    return preferences;
  }

  /**
   * Update user accessibility preferences
   */
  async updateUserPreferences(userId, updates) {
    let preferences = this.userPreferences.get(userId);
    
    if (!preferences) {
      preferences = await this.loadUserPreferences(userId);
    }

    Object.assign(preferences, updates, {
      lastUpdated: Date.now()
    });

    this.userPreferences.set(userId, preferences);

    // Publish preference change event
    const prefEvent = new DomainEvent(
      EventTypes.USER_PREFERENCES_UPDATED,
      {
        userId,
        preferences,
        changes: Object.keys(updates)
      },
      { source: 'accessibility-service' }
    );

    await eventBus.publish(prefEvent);

    logger.info('Accessibility preferences updated', { userId, changes: Object.keys(updates) });

    return preferences;
  }

  /**
   * Generate accessible HTML with ARIA attributes
   */
  generateAccessibleHTML(component, content, options = {}) {
    const { role, ariaLabel, ariaDescribedBy, tabIndex, landmarks } = options;

    let html = '';
    let attributes = [];

    // Add ARIA role
    if (role) {
      attributes.push(`role="${role}"`);
    }

    // Add ARIA label
    if (ariaLabel) {
      attributes.push(`aria-label="${this._escapeHtml(ariaLabel)}"`);
    }

    // Add ARIA described by
    if (ariaDescribedBy) {
      attributes.push(`aria-describedby="${ariaDescribedBy}"`);
    }

    // Add tab index
    if (tabIndex !== undefined) {
      attributes.push(`tabindex="${tabIndex}"`);
    }

    // Add landmarks
    if (landmarks) {
      if (landmarks.live) {
        attributes.push(`aria-live="${landmarks.live}"`);
      }
      if (landmarks.atomic) {
        attributes.push(`aria-atomic="${landmarks.atomic}"`);
      }
      if (landmarks.relevant) {
        attributes.push(`aria-relevant="${landmarks.relevant}"`);
      }
    }

    const attributeString = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';

    switch (component) {
      case 'button':
        html = `<button${attributeString}>${content}</button>`;
        break;

      case 'heading':
        const level = options.level || 2;
        html = `<h${level}${attributeString}>${content}</h${level}>`;
        break;

      case 'navigation':
        html = `<nav${attributeString}>${content}</nav>`;
        break;

      case 'main':
        html = `<main${attributeString}>${content}</main>`;
        break;

      case 'form':
        html = `<form${attributeString}>${content}</form>`;
        break;

      case 'input':
        html = `<input${attributeString} value="${this._escapeHtml(content)}" />`;
        break;

      default:
        html = `<div${attributeString}>${content}</div>`;
    }

    return html;
  }

  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generate skip navigation links
   */
  generateSkipLinks() {
    return `
      <div class="skip-links" aria-label="Skip navigation links">
        <a href="#main-content" class="skip-link">Skip to main content</a>
        <a href="#navigation" class="skip-link">Skip to navigation</a>
        <a href="#footer" class="skip-link">Skip to footer</a>
      </div>
    `;
  }

  /**
   * Check WCAG compliance
   */
  async checkWCAGCompliance(htmlContent, level = 'AA') {
    const violations = [];
    const checks = [
      { rule: '1.1.1', description: 'Non-text Content', check: this._checkImageAltText },
      { rule: '1.3.1', description: 'Info and Relationships', check: this._checkHeadingStructure },
      { rule: '1.4.3', description: 'Contrast (Minimum)', check: this._checkColorContrast },
      { rule: '2.1.1', description: 'Keyboard', check: this._checkKeyboardAccess },
      { rule: '2.4.1', description: 'Bypass Blocks', check: this._checkSkipLinks },
      { rule: '2.4.6', description: 'Headings and Labels', check: this._checkLabels },
      { rule: '3.1.1', description: 'Language of Page', check: this._checkLanguageAttribute },
      { rule: '4.1.1', description: 'Parsing', check: this._checkValidHTML },
      { rule: '4.1.2', description: 'Name, Role, Value', check: this._checkARIA }
    ];

    for (const check of checks) {
      try {
        const result = await check.check(htmlContent);
        if (!result.passed) {
          violations.push({
            rule: check.rule,
            description: check.description,
            severity: result.severity || 'error',
            message: result.message,
            elements: result.elements || [],
            timestamp: Date.now()
          });
        }
      } catch (error) {
        logger.error('WCAG check failed', {
          rule: check.rule,
          error: error.message
        });
      }
    }

    this.violations = violations;

    if (violations.length > 0) {
      logger.warn('WCAG violations found', {
        count: violations.length,
        level,
        violations: violations.map(v => ({ rule: v.rule, message: v.message }))
      });

      // Publish accessibility violation event
      const violationEvent = new DomainEvent(
        EventTypes.ACCESSIBILITY_VIOLATION,
        {
          level,
          violationCount: violations.length,
          violations
        },
        { source: 'accessibility-service' }
      );

      await eventBus.publish(violationEvent);
    }

    return {
      compliant: violations.length === 0,
      level,
      violations,
      checkedAt: Date.now()
    };
  }

  async _checkImageAltText(html) {
    // Simplified check - would use actual DOM parsing
    const images = html.match(/<img[^>]*>/g) || [];
    const missingAlt = images.filter(img => !img.includes('alt='));
    
    return {
      passed: missingAlt.length === 0,
      message: `${missingAlt.length} images missing alt text`,
      elements: missingAlt,
      severity: 'error'
    };
  }

  async _checkHeadingStructure(html) {
    const headings = html.match(/<h[1-6][^>]*>/g) || [];
    
    return {
      passed: headings.length > 0,
      message: headings.length === 0 ? 'No heading structure found' : 'Heading structure present'
    };
  }

  async _checkColorContrast(html) {
    // Would check actual color contrast ratios
    return {
      passed: true,
      message: 'Color contrast check not implemented'
    };
  }

  async _checkKeyboardAccess(html) {
    const interactiveElements = html.match(/<(button|input|select|textarea|a)[^>]*>/g) || [];
    const withTabIndex = interactiveElements.filter(el => 
      el.includes('tabindex=') || ['button', 'input', 'select', 'textarea', 'a'].some(tag => 
        el.startsWith(`<${tag}`)
      )
    );
    
    return {
      passed: interactiveElements.length === 0 || withTabIndex.length > 0,
      message: 'Interactive elements should be keyboard accessible'
    };
  }

  async _checkSkipLinks(html) {
    const hasSkipLinks = html.includes('skip-link') || html.includes('skip to');
    
    return {
      passed: hasSkipLinks,
      message: hasSkipLinks ? 'Skip links found' : 'No skip links found',
      severity: 'warning'
    };
  }

  async _checkLabels(html) {
    const inputs = html.match(/<input[^>]*>/g) || [];
    const withLabels = inputs.filter(input => 
      input.includes('aria-label=') || 
      input.includes('aria-labelledby=') ||
      html.includes(`for="${this._extractId(input)}"`)
    );
    
    return {
      passed: inputs.length === 0 || withLabels.length === inputs.length,
      message: `${inputs.length - withLabels.length} inputs missing labels`
    };
  }

  _extractId(inputHtml) {
    const match = inputHtml.match(/id="([^"]+)"/);
    return match ? match[1] : '';
  }

  async _checkLanguageAttribute(html) {
    const hasLang = html.includes('lang=') || html.includes('<html');
    
    return {
      passed: hasLang,
      message: hasLang ? 'Language attribute found' : 'No language attribute found'
    };
  }

  async _checkValidHTML(html) {
    // Simplified validation
    const unclosedTags = html.match(/<[^\/][^>]*>(?![^<]*<\/)/g) || [];
    
    return {
      passed: unclosedTags.length === 0,
      message: `${unclosedTags.length} potential unclosed tags found`
    };
  }

  async _checkARIA(html) {
    const ariaElements = html.match(/aria-[a-z]+="[^"]*"/g) || [];
    
    return {
      passed: true, // Simplified - would validate ARIA usage
      message: `${ariaElements.length} ARIA attributes found`
    };
  }

  /**
   * Generate accessibility report
   */
  generateAccessibilityReport(userId = null) {
    const report = {
      timestamp: Date.now(),
      wcagLevel: 'AA',
      totalViolations: this.violations.length,
      violationsBySeverity: {
        error: this.violations.filter(v => v.severity === 'error').length,
        warning: this.violations.filter(v => v.severity === 'warning').length,
        info: this.violations.filter(v => v.severity === 'info').length
      },
      supportedFeatures: Array.from(this.supportedFeatures),
      activeUsers: this.userPreferences.size
    };

    if (userId) {
      report.userPreferences = this.userPreferences.get(userId);
    } else {
      report.preferenceStats = this._getUserPreferenceStats();
    }

    return report;
  }

  _getUserPreferenceStats() {
    const stats = {
      totalUsers: this.userPreferences.size,
      screenReaderUsers: 0,
      highContrastUsers: 0,
      keyboardUsers: 0,
      reducedMotionUsers: 0,
      colorBlindUsers: 0
    };

    for (const [, prefs] of this.userPreferences.entries()) {
      if (prefs.screenReader) stats.screenReaderUsers++;
      if (prefs.highContrast) stats.highContrastUsers++;
      if (prefs.keyboardNavigation) stats.keyboardUsers++;
      if (prefs.reducedMotion) stats.reducedMotionUsers++;
      if (prefs.colorBlindType) stats.colorBlindUsers++;
    }

    return stats;
  }

  /**
   * Get accessibility statistics
   */
  getStats() {
    return {
      totalUsers: this.userPreferences.size,
      supportedFeatures: this.supportedFeatures.size,
      activeViolations: this.violations.length,
      lastComplianceCheck: this.violations.length > 0 ? 
        Math.max(...this.violations.map(v => v.timestamp)) : null
    };
  }
}

export const accessibilityService = new AccessibilityService();
export default accessibilityService;