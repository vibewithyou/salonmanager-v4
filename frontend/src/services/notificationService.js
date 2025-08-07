// Notification Service for PWA Push Notifications and Email/SMS
import api from './authService';

class NotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.init();
  }

  async init() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', this.registration);
        
        // Check for existing subscription
        this.subscription = await this.registration.pushManager.getSubscription();
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications');
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribeToPush() {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Notification permission not granted');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlB64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY || '')
      });

      // Send subscription to server
      await api.post('/api/notifications/subscribe', {
        subscription: subscription
      });

      this.subscription = subscription;
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush() {
    if (!this.subscription) {
      return;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Remove subscription from server
      await api.post('/api/notifications/unsubscribe');
      
      this.subscription = null;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw error;
    }
  }

  // Show local notification
  showNotification(title, options = {}) {
    if (Notification.permission === 'granted') {
      return new Notification(title, {
        icon: '/logo192.png',
        badge: '/logo192.png',
        ...options
      });
    }
  }

  // Send push notification (server-side)
  async sendPushNotification(userId, notification) {
    try {
      const response = await api.post('/api/notifications/send-push', {
        user_id: userId,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        actions: notification.actions
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Send email notification
  async sendEmailNotification(recipients, notification) {
    try {
      const response = await api.post('/api/notifications/send-email', {
        recipients: Array.isArray(recipients) ? recipients : [recipients],
        subject: notification.subject,
        body: notification.body,
        template: notification.template,
        data: notification.data
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Send SMS notification
  async sendSMSNotification(phoneNumbers, message) {
    try {
      const response = await api.post('/api/notifications/send-sms', {
        phone_numbers: Array.isArray(phoneNumbers) ? phoneNumbers : [phoneNumbers],
        message: message
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Schedule notification
  async scheduleNotification(notification, scheduleTime) {
    try {
      const response = await api.post('/api/notifications/schedule', {
        ...notification,
        schedule_time: scheduleTime
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get notification history
  async getNotificationHistory(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.dateFrom) params.append('date_from', filters.dateFrom);
      if (filters.dateTo) params.append('date_to', filters.dateTo);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/api/notifications/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings) {
    try {
      const response = await api.put('/api/notifications/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    try {
      const response = await api.get('/api/notifications/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Mark notifications as read
  async markAsRead(notificationIds) {
    try {
      const response = await api.put('/api/notifications/mark-read', {
        notification_ids: Array.isArray(notificationIds) ? notificationIds : [notificationIds]
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Delete notifications
  async deleteNotifications(notificationIds) {
    try {
      const response = await api.delete('/api/notifications', {
        data: {
          notification_ids: Array.isArray(notificationIds) ? notificationIds : [notificationIds]
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Send appointment reminders
  async sendAppointmentReminder(appointmentId, reminderType = 'email') {
    try {
      const response = await api.post(`/api/appointments/${appointmentId}/reminder`, {
        type: reminderType // 'email', 'sms', 'push'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Bulk send promotional notifications
  async sendPromotionalNotification(campaign) {
    try {
      const response = await api.post('/api/notifications/promotional', campaign);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Get notification templates
  async getNotificationTemplates(type = null) {
    try {
      const params = type ? `?type=${type}` : '';
      const response = await api.get(`/api/notifications/templates${params}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Create notification template
  async createNotificationTemplate(template) {
    try {
      const response = await api.post('/api/notifications/templates', template);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Update notification template
  async updateNotificationTemplate(templateId, template) {
    try {
      const response = await api.put(`/api/notifications/templates/${templateId}`, template);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  // Utility function to convert VAPID key
  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Check if notifications are supported
  isSupported() {
    return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Get current permission status
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }

  // Check if subscribed to push
  isSubscribed() {
    return this.subscription !== null;
  }

  // Auto-setup notifications for new users
  async autoSetup() {
    if (!this.isSupported()) {
      console.log('Notifications not supported');
      return false;
    }

    if (this.getPermissionStatus() === 'default') {
      // Don't auto-request permission, wait for user action
      return false;
    }

    if (this.getPermissionStatus() === 'granted' && !this.isSubscribed()) {
      try {
        await this.subscribeToPush();
        return true;
      } catch (error) {
        console.error('Auto-setup failed:', error);
        return false;
      }
    }

    return this.isSubscribed();
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Predefined notification types for easy use
export const NotificationTypes = {
  APPOINTMENT_REMINDER: 'appointment_reminder',
  APPOINTMENT_CONFIRMED: 'appointment_confirmed',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment_rescheduled',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_FAILED: 'payment_failed',
  REVIEW_REQUEST: 'review_request',
  PROMOTIONAL_OFFER: 'promotional_offer',
  SYSTEM_UPDATE: 'system_update',
  WELCOME: 'welcome'
};

// Predefined templates
export const NotificationTemplates = {
  appointmentReminder: (appointment) => ({
    title: 'Termin-Erinnerung',
    body: `Ihr Termin bei ${appointment.salon_name} ist morgen um ${appointment.time}`,
    data: { appointmentId: appointment.id, type: 'reminder' },
    actions: [
      { action: 'view', title: 'Termin ansehen' },
      { action: 'cancel', title: 'Stornieren' }
    ]
  }),

  appointmentConfirmed: (appointment) => ({
    title: 'Termin bestätigt',
    body: `Ihr Termin bei ${appointment.salon_name} wurde bestätigt`,
    data: { appointmentId: appointment.id, type: 'confirmation' }
  }),

  paymentReceived: (payment) => ({
    title: 'Zahlung erhalten',
    body: `Ihre Zahlung von €${payment.amount} wurde erfolgreich verarbeitet`,
    data: { paymentId: payment.id, type: 'payment' }
  })
};

export default notificationService;