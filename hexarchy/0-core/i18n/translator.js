// Internationalization (i18n) Utilities
import fs from 'fs/promises';
import path from 'path';

const TRANSLATIONS_DIR = './locales';
const DEFAULT_LOCALE = 'en';

// Translation cache
const translations = new Map();

// Load translations
export const loadTranslations = async (locale) => {
  if (translations.has(locale)) {
    return translations.get(locale);
  }

  try {
    const filePath = path.join(TRANSLATIONS_DIR, `${locale}.json`);
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    translations.set(locale, data);
    return data;
  } catch (error) {
    console.warn(`Failed to load translations for ${locale}, using default`);
    if (locale !== DEFAULT_LOCALE) {
      return loadTranslations(DEFAULT_LOCALE);
    }
    return {};
  }
};

// Translate function
export const t = async (locale, key, params = {}) => {
  const messages = await loadTranslations(locale);
  let message = key.split('.').reduce((obj, k) => obj?.[k], messages) || key;

  // Replace parameters
  Object.entries(params).forEach(([param, value]) => {
    message = message.replace(`{${param}}`, value);
  });

  return message;
};

// i18n middleware
export const i18nMiddleware = (req, res, next) => {
  // Extract locale from header, query, or user preference
  const locale = 
    req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
    req.query.locale ||
    req.user?.locale ||
    DEFAULT_LOCALE;

  req.locale = locale;
  req.t = (key, params) => t(locale, key, params);

  next();
};

// Supported locales
export const SUPPORTED_LOCALES = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'pt'];

// Format number
export const formatNumber = (number, locale = DEFAULT_LOCALE) => {
  return new Intl.NumberFormat(locale).format(number);
};

// Format currency
export const formatCurrency = (amount, currency = 'USD', locale = DEFAULT_LOCALE) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount);
};

// Format date
export const formatDate = (date, locale = DEFAULT_LOCALE, options = {}) => {
  return new Intl.DateTimeFormat(locale, options).format(new Date(date));
};

export default {
  loadTranslations,
  t,
  i18nMiddleware,
  SUPPORTED_LOCALES,
  formatNumber,
  formatCurrency,
  formatDate
};
