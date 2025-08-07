// Application Constants

// API Endpoints
export const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  STYLIST: 'stylist',
  SALON_OWNER: 'salon_owner',
  ADMIN: 'admin'
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

// Service Categories
export const SERVICE_CATEGORIES = [
  'Haarschnitt',
  'Färbung',
  'Styling',
  'Behandlung',
  'Bartpflege',
  'Maniküre',
  'Pediküre',
  'Massage',
  'Kosmetik',
  'Permanent Make-up'
];

// Languages
export const LANGUAGES = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

// Time Slots (in minutes)
export const TIME_SLOTS = [
  { value: 15, label: '15 Min' },
  { value: 30, label: '30 Min' },
  { value: 45, label: '45 Min' },
  { value: 60, label: '1 Std' },
  { value: 90, label: '1,5 Std' },
  { value: 120, label: '2 Std' },
  { value: 180, label: '3 Std' },
  { value: 240, label: '4 Std' }
];

// Working Hours
export const WORKING_HOURS = {
  DEFAULT_OPEN: '09:00',
  DEFAULT_CLOSE: '18:00',
  MIN_HOUR: 6,
  MAX_HOUR: 23
};

// Days of Week
export const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Montag', short: 'Mo' },
  { key: 'tuesday', label: 'Dienstag', short: 'Di' },
  { key: 'wednesday', label: 'Mittwoch', short: 'Mi' },
  { key: 'thursday', label: 'Donnerstag', short: 'Do' },
  { key: 'friday', label: 'Freitag', short: 'Fr' },
  { key: 'saturday', label: 'Samstag', short: 'Sa' },
  { key: 'sunday', label: 'Sonntag', short: 'So' }
];

// Price Ranges
export const PRICE_RANGES = [
  { value: '€', label: 'Budget (€)', min: 0, max: 50 },
  { value: '€€', label: 'Mittel (€€)', min: 50, max: 100 },
  { value: '€€€', label: 'Premium (€€€)', min: 100, max: 200 },
  { value: '€€€€', label: 'Luxus (€€€€)', min: 200, max: 1000 }
];

// Rating Categories
export const RATING_CATEGORIES = [
  { key: 'overall', label: 'Gesamt', icon: '⭐' },
  { key: 'service', label: 'Service', icon: '👥' },
  { key: 'quality', label: 'Qualität', icon: '✨' },
  { key: 'ambiance', label: 'Ambiente', icon: '🏪' },
  { key: 'value', label: 'Preis-Leistung', icon: '💰' }
];

// Notification Types
export const NOTIFICATION_TYPES = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  PAYMENT_RECEIVED: 'payment_received',
  REVIEW_REQUEST: 'review_request',
  PROMOTIONAL: 'promotional',
  SYSTEM: 'system'
};

// File Upload Limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'text/plain', 'application/msword']
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [12, 24, 48, 96]
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  DISPLAY_WITH_TIME: 'dd.MM.yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
};

// Color Themes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Business Hours Status
export const BUSINESS_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  CLOSING_SOON: 'closing_soon',
  OPENING_SOON: 'opening_soon'
};

// Salon Amenities
export const SALON_AMENITIES = [
  { key: 'wifi', label: 'WLAN', icon: '📶' },
  { key: 'parking', label: 'Parkplätze', icon: '🚗' },
  { key: 'ac', label: 'Klimaanlage', icon: '❄️' },
  { key: 'coffee', label: 'Kaffee/Getränke', icon: '☕' },
  { key: 'wheelchair', label: 'Rollstuhlgerecht', icon: '♿' },
  { key: 'music', label: 'Musik', icon: '🎵' },
  { key: 'magazines', label: 'Zeitschriften', icon: '📖' },
  { key: 'kids_area', label: 'Kinderbereich', icon: '🧸' },
  { key: 'payment_cards', label: 'Kartenzahlung', icon: '💳' },
  { key: 'online_booking', label: 'Online-Buchung', icon: '📱' }
];

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 29.99,
    features: ['Bis zu 100 Termine/Monat', 'Grundlegende Berichte', 'E-Mail Support']
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 59.99,
    features: ['Unbegrenzte Termine', 'Erweiterte Analysen', 'SMS-Integration', 'Prioritäts-Support']
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99.99,
    features: ['Alle Features', 'Multi-Location', 'API-Zugang', 'Dedicated Support']
  }
};

// Social Media Platforms
export const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: '📷', baseUrl: 'https://instagram.com/' },
  { key: 'facebook', label: 'Facebook', icon: '👤', baseUrl: 'https://facebook.com/' },
  { key: 'tiktok', label: 'TikTok', icon: '🎵', baseUrl: 'https://tiktok.com/@' },
  { key: 'youtube', label: 'YouTube', icon: '📺', baseUrl: 'https://youtube.com/@' },
  { key: 'twitter', label: 'Twitter', icon: '🐦', baseUrl: 'https://twitter.com/' }
];

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Internetverbindung.',
  SERVER_ERROR: 'Serverfehler. Bitte versuchen Sie es später erneut.',
  VALIDATION_ERROR: 'Eingabedaten sind ungültig.',
  UNAUTHORIZED: 'Sie sind nicht berechtigt, diese Aktion auszuführen.',
  NOT_FOUND: 'Die angeforderte Ressource wurde nicht gefunden.',
  RATE_LIMIT: 'Zu viele Anfragen. Bitte warten Sie einen Moment.',
  PAYMENT_FAILED: 'Zahlung fehlgeschlagen. Bitte überprüfen Sie Ihre Zahlungsdaten.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  APPOINTMENT_BOOKED: 'Termin erfolgreich gebucht!',
  APPOINTMENT_CANCELLED: 'Termin erfolgreich storniert.',
  PROFILE_UPDATED: 'Profil erfolgreich aktualisiert.',
  PASSWORD_CHANGED: 'Passwort erfolgreich geändert.',
  PAYMENT_SUCCESSFUL: 'Zahlung erfolgreich abgeschlossen.',
  REVIEW_SUBMITTED: 'Bewertung erfolgreich abgegeben.',
  EMAIL_SENT: 'E-Mail erfolgreich gesendet.',
  DATA_EXPORTED: 'Daten erfolgreich exportiert.'
};

// Regular Expressions
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

// Default Values
export const DEFAULTS = {
  AVATAR: '/api/placeholder/150/150',
  SALON_IMAGE: '/api/placeholder/400/300',
  PAGINATION_SIZE: 12,
  SEARCH_DEBOUNCE: 300,
  TOAST_DURATION: 4000,
  MODAL_ANIMATION_DURATION: 200
};

// Feature Flags
export const FEATURES = {
  AI_SUGGESTIONS: true,
  VIRTUAL_TRY_ON: true,
  MULTI_LANGUAGE: true,
  VOICE_BOOKING: false,
  BIOMETRIC_LOGIN: false,
  BLOCKCHAIN_PAYMENTS: false,
  AR_PREVIEW: false,
  SMART_MIRROR: false
};

// Analytics Events
export const ANALYTICS_EVENTS = {
  APPOINTMENT_BOOKED: 'appointment_booked',
  SALON_VIEWED: 'salon_viewed',
  SEARCH_PERFORMED: 'search_performed',
  REVIEW_SUBMITTED: 'review_submitted',
  PAYMENT_COMPLETED: 'payment_completed',
  USER_REGISTERED: 'user_registered',
  APP_INSTALLED: 'app_installed'
};

// Cache Keys
export const CACHE_KEYS = {
  USER_PROFILE: 'user_profile',
  SALON_LIST: 'salon_list',
  APPOINTMENTS: 'user_appointments',
  SERVICES: 'salon_services',
  REVIEWS: 'salon_reviews',
  SETTINGS: 'app_settings'
};

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  RECENT_SEARCHES: 'recent_searches',
  FAVORITES: 'favorites',
  CART: 'shopping_cart'
};

export default {
  API_BASE_URL,
  USER_ROLES,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  SERVICE_CATEGORIES,
  LANGUAGES,
  TIME_SLOTS,
  WORKING_HOURS,
  DAYS_OF_WEEK,
  PRICE_RANGES,
  RATING_CATEGORIES,
  NOTIFICATION_TYPES,
  FILE_UPLOAD,
  PAGINATION,
  DATE_FORMATS,
  THEMES,
  BUSINESS_STATUS,
  SALON_AMENITIES,
  SUBSCRIPTION_PLANS,
  SOCIAL_PLATFORMS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REGEX,
  DEFAULTS,
  FEATURES,
  ANALYTICS_EVENTS,
  CACHE_KEYS,
  STORAGE_KEYS
};