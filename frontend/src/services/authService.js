import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (email, password) => {
  try {
    // Backend expects query parameters for login
    const response = await axios.post(`${API_BASE_URL}/api/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/api/auth/profile', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.put('/api/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const resetPassword = async (token, password) => {
  try {
    const response = await api.post('/api/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteAccount = async () => {
  try {
    const response = await api.delete('/api/auth/account');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const exportUserData = async () => {
  try {
    const response = await api.get('/api/auth/export-data', {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'user-data.json');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;