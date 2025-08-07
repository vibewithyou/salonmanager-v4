import api from './authService';

export const createPaymentIntent = async (appointmentId, amount, currency = 'eur') => {
  try {
    const response = await api.post('/api/payments/create-intent', {
      appointment_id: appointmentId,
      amount: amount,
      currency: currency
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const confirmPayment = async (paymentIntentId, paymentMethodId) => {
  try {
    const response = await api.post('/api/payments/confirm', {
      payment_intent_id: paymentIntentId,
      payment_method_id: paymentMethodId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPaymentHistory = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/api/payments/history?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const refundPayment = async (paymentIntentId, amount, reason) => {
  try {
    const response = await api.post('/api/payments/refund', {
      payment_intent_id: paymentIntentId,
      amount: amount,
      reason: reason
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createVoucher = async (voucherData) => {
  try {
    const response = await api.post('/api/vouchers', voucherData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const validateVoucher = async (code) => {
  try {
    const response = await api.get(`/api/vouchers/${code}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const useVoucher = async (code, appointmentId) => {
  try {
    const response = await api.post(`/api/vouchers/${code}/use`, {
      appointment_id: appointmentId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getVouchers = async (salonId) => {
  try {
    const response = await api.get(`/api/vouchers?salon_id=${salonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Subscription management
export const createSubscription = async (priceId, paymentMethodId) => {
  try {
    const response = await api.post('/api/subscriptions', {
      price_id: priceId,
      payment_method_id: paymentMethodId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelSubscription = async (subscriptionId) => {
  try {
    const response = await api.post(`/api/subscriptions/${subscriptionId}/cancel`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSubscription = async (subscriptionId, updates) => {
  try {
    const response = await api.put(`/api/subscriptions/${subscriptionId}`, updates);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSubscriptionPlans = async () => {
  try {
    const response = await api.get('/api/subscription-plans');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Invoice management
export const generateInvoice = async (appointmentId) => {
  try {
    const response = await api.post(`/api/invoices/generate`, {
      appointment_id: appointmentId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const downloadInvoice = async (invoiceId) => {
  try {
    const response = await api.get(`/api/invoices/${invoiceId}/download`, {
      responseType: 'blob'
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${invoiceId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getInvoices = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.status) params.append('status', filters.status);
    
    const response = await api.get(`/api/invoices?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Payment methods management
export const getPaymentMethods = async () => {
  try {
    const response = await api.get('/api/payment-methods');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addPaymentMethod = async (paymentMethodId) => {
  try {
    const response = await api.post('/api/payment-methods', {
      payment_method_id: paymentMethodId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const removePaymentMethod = async (paymentMethodId) => {
  try {
    const response = await api.delete(`/api/payment-methods/${paymentMethodId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const setDefaultPaymentMethod = async (paymentMethodId) => {
  try {
    const response = await api.put(`/api/payment-methods/${paymentMethodId}/default`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Analytics for salon owners
export const getPaymentAnalytics = async (salonId, dateRange) => {
  try {
    const response = await api.get(`/api/analytics/payments/${salonId}`, {
      params: dateRange
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Tip handling
export const addTip = async (appointmentId, tipAmount) => {
  try {
    const response = await api.post(`/api/appointments/${appointmentId}/tip`, {
      tip_amount: tipAmount
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Split payments
export const createSplitPayment = async (appointmentId, splits) => {
  try {
    const response = await api.post('/api/payments/split', {
      appointment_id: appointmentId,
      splits: splits // Array of {email, amount}
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  createPaymentIntent,
  confirmPayment,
  getPaymentHistory,
  refundPayment,
  createVoucher,
  validateVoucher,
  useVoucher,
  getVouchers,
  createSubscription,
  cancelSubscription,
  updateSubscription,
  getSubscriptionPlans,
  generateInvoice,
  downloadInvoice,
  getInvoices,
  getPaymentMethods,
  addPaymentMethod,
  removePaymentMethod,
  setDefaultPaymentMethod,
  getPaymentAnalytics,
  addTip,
  createSplitPayment
};