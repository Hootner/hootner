/**
 * Internationalization (i18n) Service
 * Multi-language support
 */

import { createLogger } from '../../0-core/utils/logger.js'

const logger = createLogger('communication', 'i18n')

class I18nService {
  constructor() {
    this.languages = {
      en: { name: 'English', translations: {} },
      es: { name: 'Español', translations: {} },
      fr: { name: 'Français', translations: {} },
      de: { name: 'Deutsch', translations: {} },
      zh: { name: '中文', translations: {} },
      ja: { name: '日本語', translations: {} },
    }
    this.defaultLanguage = 'en'
    this.fallbackLanguage = 'en'
    this._loadTranslations()
  }

  _loadTranslations() {
    // Example translations
    this.languages.en.translations = {
      welcome: 'Welcome',
      'tutoring.session.started': 'Your tutoring session has started',
      'concept.mastered': 'Congratulations! You mastered {concept}',
      'reward.earned': 'You earned {amount} tokens!',
    }

    this.languages.es.translations = {
      welcome: 'Bienvenido',
      'tutoring.session.started': 'Tu sesión de tutoría ha comenzado',
      'concept.mastered': '¡Felicitaciones! Dominaste {concept}',
      'reward.earned': '¡Ganaste {amount} tokens!',
    }

    // More languages would be loaded from files/database
  }

  /**
   * Translate a key to target language
   */
  translate(key, language = this.defaultLanguage, params = {}) {
    const lang = this.languages[language] || this.languages[this.fallbackLanguage]
    let translation = lang.translations[key]

    if (!translation) {
      logger.warn('Translation missing', { key, language })
      // Try fallback
      translation = this.languages[this.fallbackLanguage].translations[key] || key
    }

    // Replace parameters
    Object.entries(params).forEach(([param, value]) => {
      translation = translation.replace(`{${param}}`, value)
    })

    return translation
  }

  /**
   * Get all translations for a language
   */
  getTranslations(language) {
    return this.languages[language]?.translations || {}
  }

  /**
   * Add translation
   */
  addTranslation(language, key, value) {
    if (!this.languages[language]) {
      logger.warn('Language not supported', { language })
      return false
    }

    this.languages[language].translations[key] = value
    logger.debug('Translation added', { language, key })
    return true
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return Object.entries(this.languages).map(([code, lang]) => ({
      code,
      name: lang.name,
    }))
  }

  /**
   * Detect user's language from browser/preferences
   */
  detectLanguage(acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map((lang) => lang.split(';')[0].trim().toLowerCase())

    for (const lang of languages) {
      const code = lang.split('-')[0] // en-US -> en
      if (this.languages[code]) {
        return code
      }
    }

    return this.defaultLanguage
  }
}

export const i18nService = new I18nService()
export default i18nService
