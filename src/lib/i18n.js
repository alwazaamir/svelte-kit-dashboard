// src/lib/i18n.js - Alternativa sa addMessages
import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';
import en from './locales/en.json';
import si from './locales/si.json';

// Dodaj poruke (koristi samo addMessages, ne register)
addMessages('en', en);
addMessages('si', si);

// Inicijalizuj i18n
init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator() || 'en'
});

// Export za korišćenje
export { locale, t } from 'svelte-i18n';