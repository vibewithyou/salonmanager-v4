import api from './authService';

export const getAppointments = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('date_from', filters.dateFrom);
    if (filters.dateTo) params.append('date_to', filters.dateTo);
    if (filters.salonId) params.append('salon_id', filters.salonId);
    if (filters.stylistId) params.append('stylist_id', filters.stylistId);
    
    const response = await api.get(`/api/appointments?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await api.get(`/api/appointments/${appointmentId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const response = await api.post('/api/appointments', appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await api.put(`/api/appointments/${appointmentId}`, appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await api.put(`/api/appointments/${appointmentId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelAppointment = async (appointmentId, reason = '') => {
  try {
    const response = await api.put(`/api/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rescheduleAppointment = async (appointmentId, newDateTime) => {
  try {
    const response = await api.put(`/api/appointments/${appointmentId}/reschedule`, {
      new_date_time: newDateTime,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAvailableSlots = async (salonId, serviceId, date, stylistId = null) => {
  try {
    const params = new URLSearchParams({
      salon_id: salonId,
      service_id: serviceId,
      date: date,
    });
    
    if (stylistId) params.append('stylist_id', stylistId);
    
    const response = await api.get(`/api/appointments/available-slots?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getStylistAvailability = async (stylistId, dateFrom, dateTo) => {
  try {
    const params = new URLSearchParams({
      stylist_id: stylistId,
      date_from: dateFrom,
      date_to: dateTo,
    });
    
    const response = await api.get(`/api/appointments/stylist-availability?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAppointmentHistory = async (customerId) => {
  try {
    const response = await api.get(`/api/appointments/history/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const addAppointmentNote = async (appointmentId, note) => {
  try {
    const response = await api.post(`/api/appointments/${appointmentId}/notes`, { note });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAppointmentNotes = async (appointmentId) => {
  try {
    const response = await api.get(`/api/appointments/${appointmentId}/notes`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const sendAppointmentReminder = async (appointmentId) => {
  try {
    const response = await api.post(`/api/appointments/${appointmentId}/reminder`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const rateAppointment = async (appointmentId, rating, review = '') => {
  try {
    const response = await api.post(`/api/appointments/${appointmentId}/rate`, {
      rating,
      review,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getAppointmentStatistics = async (salonId, dateRange) => {
  try {
    const params = new URLSearchParams(dateRange);
    const response = await api.get(`/api/appointments/statistics/${salonId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const exportAppointments = async (filters, format = 'csv') => {
  try {
    const params = new URLSearchParams({ ...filters, format });
    const response = await api.get(`/api/appointments/export?${params.toString()}`, {
      responseType: 'blob',
    });
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `appointments.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Real-time appointment updates
export const subscribeToAppointmentUpdates = (appointmentId, callback) => {
  // This would be implemented with WebSocket or Server-Sent Events
  // For now, we'll use polling as a fallback
  const intervalId = setInterval(async () => {
    try {
      const appointment = await getAppointmentById(appointmentId);
      callback(appointment);
    } catch (error) {
      console.error('Error fetching appointment updates:', error);
    }
  }, 30000); // Poll every 30 seconds
  
  return () => clearInterval(intervalId);
};

// Appointment conflict detection
export const checkAppointmentConflicts = async (appointmentData) => {
  try {
    const response = await api.post('/api/appointments/check-conflicts', appointmentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Bulk operations
export const bulkUpdateAppointments = async (appointmentIds, updates) => {
  try {
    const response = await api.put('/api/appointments/bulk-update', {
      appointment_ids: appointmentIds,
      updates,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const bulkCancelAppointments = async (appointmentIds, reason) => {
  try {
    const response = await api.put('/api/appointments/bulk-cancel', {
      appointment_ids: appointmentIds,
      reason,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// AI-powered features
export const getAppointmentRecommendations = async (customerId) => {
  try {
    const response = await api.get(`/api/appointments/recommendations/${customerId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOptimalTimeSlots = async (salonId, serviceId, preferences = {}) => {
  try {
    const response = await api.post('/api/appointments/optimal-slots', {
      salon_id: salonId,
      service_id: serviceId,
      preferences,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};