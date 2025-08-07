import api from './authService';

// AI-powered appointment suggestions
export const getAppointmentSuggestions = async (customerId, preferences = {}) => {
  try {
    const response = await api.post('/api/ai/appointment-suggestions', {
      customer_id: customerId,
      preferences: preferences
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// AI hairstyle suggestions based on photo
export const getHairstyleSuggestions = async (imageFile, preferences = {}) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('preferences', JSON.stringify(preferences));
    
    const response = await api.post('/api/ai/hairstyle-suggestions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Virtual hairstyle try-on
export const virtualTryOn = async (imageFile, hairstyleId) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('hairstyle_id', hairstyleId);
    
    const response = await api.post('/api/ai/virtual-try-on', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// AI chatbot for customer support
export const chatWithBot = async (message, conversationId = null, context = {}) => {
  try {
    const response = await api.post('/api/ai/chatbot', {
      message: message,
      conversation_id: conversationId,
      context: context
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get optimal time slots based on preferences
export const getOptimalTimeSlots = async (salonId, serviceId, preferences = {}) => {
  try {
    const response = await api.post('/api/ai/optimal-slots', {
      salon_id: salonId,
      service_id: serviceId,
      preferences: preferences
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// AI-powered review sentiment analysis
export const analyzeReviewSentiment = async (reviews) => {
  try {
    const response = await api.post('/api/ai/sentiment-analysis', {
      reviews: reviews
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Price optimization suggestions
export const getPriceOptimization = async (salonId, serviceId, marketData = {}) => {
  try {
    const response = await api.post('/api/ai/price-optimization', {
      salon_id: salonId,
      service_id: serviceId,
      market_data: marketData
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Customer behavior prediction
export const predictCustomerBehavior = async (customerId, analysisType = 'churn') => {
  try {
    const response = await api.post('/api/ai/customer-prediction', {
      customer_id: customerId,
      analysis_type: analysisType // 'churn', 'lifetime_value', 'next_service'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Personalized recommendations
export const getPersonalizedRecommendations = async (customerId, type = 'services') => {
  try {
    const response = await api.get(`/api/ai/recommendations/${customerId}`, {
      params: { type: type } // 'services', 'salons', 'stylists', 'products'
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Smart scheduling optimization
export const optimizeSchedule = async (salonId, dateRange, constraints = {}) => {
  try {
    const response = await api.post('/api/ai/schedule-optimization', {
      salon_id: salonId,
      date_range: dateRange,
      constraints: constraints
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Inventory management predictions
export const predictInventoryNeeds = async (salonId, timeframe = 30) => {
  try {
    const response = await api.post('/api/ai/inventory-prediction', {
      salon_id: salonId,
      timeframe_days: timeframe
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Face shape analysis for hairstyle recommendations
export const analyzeFaceShape = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post('/api/ai/face-shape-analysis', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Color matching for hair dye
export const getColorMatching = async (imageFile, preferences = {}) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('preferences', JSON.stringify(preferences));
    
    const response = await api.post('/api/ai/color-matching', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Trend analysis and predictions
export const getHairstyleTrends = async (location = null, demographic = null) => {
  try {
    const params = {};
    if (location) params.location = location;
    if (demographic) params.demographic = demographic;
    
    const response = await api.get('/api/ai/hairstyle-trends', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Business insights for salon owners
export const getBusinessInsights = async (salonId, timeframe = '3months') => {
  try {
    const response = await api.get(`/api/ai/business-insights/${salonId}`, {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Smart marketing suggestions
export const getMarketingSuggestions = async (salonId, targetAudience = 'all') => {
  try {
    const response = await api.post('/api/ai/marketing-suggestions', {
      salon_id: salonId,
      target_audience: targetAudience
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Image enhancement for salon gallery
export const enhanceImage = async (imageFile, enhancementType = 'auto') => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('enhancement_type', enhancementType);
    
    const response = await api.post('/api/ai/image-enhancement', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob'
    });
    
    return URL.createObjectURL(response.data);
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Voice-to-text for appointment booking
export const transcribeAudio = async (audioFile, language = 'de') => {
  try {
    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('language', language);
    
    const response = await api.post('/api/ai/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Smart notifications and reminders
export const generateSmartNotification = async (customerId, notificationType, context = {}) => {
  try {
    const response = await api.post('/api/ai/smart-notification', {
      customer_id: customerId,
      notification_type: notificationType,
      context: context
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getAppointmentSuggestions,
  getHairstyleSuggestions,
  virtualTryOn,
  chatWithBot,
  getOptimalTimeSlots,
  analyzeReviewSentiment,
  getPriceOptimization,
  predictCustomerBehavior,
  getPersonalizedRecommendations,
  optimizeSchedule,
  predictInventoryNeeds,
  analyzeFaceShape,
  getColorMatching,
  getHairstyleTrends,
  getBusinessInsights,
  getMarketingSuggestions,
  enhanceImage,
  transcribeAudio,
  generateSmartNotification
};