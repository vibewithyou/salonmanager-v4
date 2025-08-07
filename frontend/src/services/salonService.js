import api from './authService';

export const getSalons = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('q', filters.search);
    if (filters.city) params.append('city', filters.city);
    if (filters.service) params.append('service', filters.service);
    if (filters.minRating) params.append('min_rating', filters.minRating);
    if (filters.skip) params.append('skip', filters.skip);
    if (filters.limit) params.append('limit', filters.limit);
    
    const response = await api.get(`/api/salons?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSalonById = async (salonId) => {
  try {
    const response = await api.get(`/api/salons/${salonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createSalon = async (salonData) => {
  try {
    const response = await api.post('/api/salons', salonData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateSalon = async (salonId, salonData) => {
  try {
    const response = await api.put(`/api/salons/${salonId}`, salonData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteSalon = async (salonId) => {
  try {
    const response = await api.delete(`/api/salons/${salonId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSalonServices = async (salonId) => {
  try {
    const response = await api.get(`/api/salons/${salonId}/services`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createService = async (serviceData) => {
  try {
    const response = await api.post('/api/services', serviceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateService = async (serviceId, serviceData) => {
  try {
    const response = await api.put(`/api/services/${serviceId}`, serviceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteService = async (serviceId) => {
  try {
    const response = await api.delete(`/api/services/${serviceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const searchSalons = async (searchQuery) => {
  try {
    const response = await api.get(`/api/search/salons?q=${encodeURIComponent(searchQuery)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSalonReviews = async (salonId) => {
  try {
    const response = await api.get(`/api/salons/${salonId}/reviews`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createReview = async (salonId, reviewData) => {
  try {
    const response = await api.post(`/api/salons/${salonId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const uploadSalonImage = async (salonId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(`/api/salons/${salonId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteSalonImage = async (salonId, imageId) => {
  try {
    const response = await api.delete(`/api/salons/${salonId}/images/${imageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getSalonAnalytics = async (salonId, dateRange) => {
  try {
    const response = await api.get(`/api/salons/${salonId}/analytics`, {
      params: dateRange,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const exportSalonData = async (salonId, format = 'csv') => {
  try {
    const response = await api.get(`/api/salons/${salonId}/export`, {
      params: { format },
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `salon-data.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};