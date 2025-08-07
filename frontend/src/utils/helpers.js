// Utility Helper Functions

import { format, parseISO, formatDistanceToNow, isValid, addDays, startOfDay, endOfDay } from 'date-fns';
import { de } from 'date-fns/locale';
import { REGEX, DATE_FORMATS, ERROR_MESSAGES } from './constants';

// Date and Time Helpers
export const formatDate = (date, formatString = DATE_FORMATS.DISPLAY) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return format(dateObj, formatString, { locale: de });
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export const formatDateTime = (date) => {
  return formatDate(date, DATE_FORMATS.DISPLAY_WITH_TIME);
};

export const formatTimeAgo = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: de });
  } catch (error) {
    console.error('Time ago formatting error:', error);
    return '';
  }
};

export const formatTime = (date, format24h = true) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    
    const formatString = format24h ? 'HH:mm' : 'h:mm a';
    return format(dateObj, formatString, { locale: de });
  } catch (error) {
    console.error('Time formatting error:', error);
    return '';
  }
};

export const isToday = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

export const isTomorrow = (date) => {
  if (!date) return false;
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const tomorrow = addDays(new Date(), 1);
  return dateObj.toDateString() === tomorrow.toDateString();
};

export const generateDateRange = (startDate, endDate) => {
  const dates = [];
  const currentDate = startOfDay(startDate);
  const lastDate = endOfDay(endDate);
  
  while (currentDate <= lastDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// String Helpers
export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text || text.length <= maxLength) return text || '';
  return text.substring(0, maxLength).trim() + suffix;
};

export const slugify = (text) => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const generateInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return first + last;
};

// Number and Currency Helpers
export const formatCurrency = (amount, currency = 'EUR', locale = 'de-DE') => {
  if (typeof amount !== 'number') return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatNumber = (number, locale = 'de-DE') => {
  if (typeof number !== 'number') return '';
  return new Intl.NumberFormat(locale).format(number);
};

export const calculatePercentage = (value, total) => {
  if (!total || total === 0) return 0;
  return Math.round((value / total) * 100);
};

export const calculateDiscount = (originalPrice, discountedPrice) => {
  if (!originalPrice || originalPrice === 0) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
};

// Validation Helpers
export const validateEmail = (email) => {
  return REGEX.EMAIL.test(email);
};

export const validatePhone = (phone) => {
  return REGEX.PHONE.test(phone);
};

export const validatePassword = (password) => {
  return password && password.length >= 8;
};

export const validateURL = (url) => {
  return REGEX.URL.test(url);
};

export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const rule = rules[field];
    const value = data[field];
    
    // Required field validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = `${rule.label || field} ist erforderlich`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value) return;
    
    // Type validation
    if (rule.type === 'email' && !validateEmail(value)) {
      errors[field] = 'Ungültige E-Mail-Adresse';
    } else if (rule.type === 'phone' && !validatePhone(value)) {
      errors[field] = 'Ungültige Telefonnummer';
    } else if (rule.type === 'url' && !validateURL(value)) {
      errors[field] = 'Ungültige URL';
    }
    
    // Length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `Mindestens ${rule.minLength} Zeichen erforderlich`;
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `Maximal ${rule.maxLength} Zeichen erlaubt`;
    }
    
    // Custom validation
    if (rule.validate && typeof rule.validate === 'function') {
      const customError = rule.validate(value, data);
      if (customError) {
        errors[field] = customError;
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Array Helpers
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) {
      result[group] = [];
    }
    result[group].push(item);
    return result;
  }, {});
};

export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const removeDuplicates = (array, key) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const paginate = (array, page, pageSize) => {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    data: array.slice(startIndex, endIndex),
    currentPage: page,
    totalPages: Math.ceil(array.length / pageSize),
    totalItems: array.length,
    hasNextPage: endIndex < array.length,
    hasPreviousPage: page > 1
  };
};

// Object Helpers
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const pick = (obj, keys) => {
  const result = {};
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const omit = (obj, keys) => {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
};

// Local Storage Helpers
export const setLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return defaultValue;
  }
};

export const removeLocalStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// File Helpers
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename ? filename.split('.').pop().toLowerCase() : '';
};

export const isImageFile = (file) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = typeof file === 'string' ? getFileExtension(file) : getFileExtension(file.name);
  return imageTypes.includes(extension);
};

export const compressImage = (file, maxWidth = 800, quality = 0.8) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Color Helpers
export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const getContrastColor = (hexColor) => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) return '#000000';
  
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

// URL Helpers
export const buildURL = (baseURL, path, params = {}) => {
  let url = baseURL;
  if (path) {
    url += path.startsWith('/') ? path : '/' + path;
  }
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  const queryString = queryParams.toString();
  return queryString ? `${url}?${queryString}` : url;
};

export const parseURL = (url) => {
  try {
    const urlObj = new URL(url);
    return {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
      search: urlObj.search,
      params: Object.fromEntries(urlObj.searchParams)
    };
  } catch (error) {
    console.error('URL parsing error:', error);
    return null;
  }
};

// Performance Helpers
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, wait) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
};

// Error Helpers
export const getErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  
  if (error?.response?.data?.detail) return error.response.data.detail;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  
  if (error?.response?.status) {
    switch (error.response.status) {
      case 400:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 429:
        return ERROR_MESSAGES.RATE_LIMIT;
      case 500:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.SERVER_ERROR;
    }
  }
  
  return ERROR_MESSAGES.NETWORK_ERROR;
};

// Analytics Helpers
export const trackEvent = (eventName, properties = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties);
  }
  
  // Add other analytics providers here
  console.log('Analytics Event:', eventName, properties);
};

export const trackPageView = (pagePath) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.REACT_APP_GA_ID, {
      page_path: pagePath
    });
  }
};

// Device Detection
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isTablet = () => {
  return /iPad|Android/i.test(navigator.userAgent) && window.innerWidth >= 768;
};

export const isDesktop = () => {
  return !isMobile() && !isTablet();
};

// Feature Detection
export const supportsWebP = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

export const supportsNotifications = () => {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
};

export default {
  // Date helpers
  formatDate,
  formatDateTime,
  formatTimeAgo,
  formatTime,
  isToday,
  isTomorrow,
  generateDateRange,
  
  // String helpers
  capitalize,
  capitalizeWords,
  truncateText,
  slugify,
  generateInitials,
  
  // Number helpers
  formatCurrency,
  formatNumber,
  calculatePercentage,
  calculateDiscount,
  
  // Validation helpers
  validateEmail,
  validatePhone,
  validatePassword,
  validateURL,
  validateForm,
  
  // Array helpers
  groupBy,
  sortBy,
  removeDuplicates,
  paginate,
  
  // Object helpers
  deepClone,
  isEmpty,
  pick,
  omit,
  
  // Storage helpers
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  
  // File helpers
  formatFileSize,
  getFileExtension,
  isImageFile,
  compressImage,
  
  // Color helpers
  hexToRgb,
  rgbToHex,
  getContrastColor,
  
  // URL helpers
  buildURL,
  parseURL,
  
  // Performance helpers
  debounce,
  throttle,
  
  // Error helpers
  getErrorMessage,
  
  // Analytics helpers
  trackEvent,
  trackPageView,
  
  // Device detection
  isMobile,
  isTablet,
  isDesktop,
  
  // Feature detection
  supportsWebP,
  supportsNotifications
};