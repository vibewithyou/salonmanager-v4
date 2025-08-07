import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import {
  UserIcon,
  CameraIcon,
  KeyIcon,
  BellIcon,
  GlobeAltIcon,
  TrashIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/outline';
import * as authService from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    language: user?.language || 'de',
    avatar_url: user?.avatar_url || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    appointmentReminders: true,
    promotionalOffers: false,
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: UserIcon },
    { id: 'password', label: 'Passwort', icon: KeyIcon },
    { id: 'notifications', label: 'Benachrichtigungen', icon: BellIcon },
    { id: 'privacy', label: 'Datenschutz', icon: ShieldCheckIcon },
  ];

  const languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'it', name: 'Italiano' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ru', name: 'Русский' },
    { code: 'ar', name: 'العربية' },
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.updateProfile(profileData);
      toast.success('Profil erfolgreich aktualisiert');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Profil konnte nicht aktualisiert werden');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwörter stimmen nicht überein');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    setLoading(true);
    
    try {
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast.success('Passwort erfolgreich geändert');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Password change error:', error);
      toast.error('Passwort konnte nicht geändert werden');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte wählen Sie eine Bilddatei aus');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Bild ist zu groß. Maximum 5MB erlaubt.');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      // TODO: Implement avatar upload API
      // const response = await authService.uploadAvatar(formData);
      // setProfileData(prev => ({ ...prev, avatar_url: response.url }));
      
      toast.success('Profilbild erfolgreich hochgeladen');
    } catch (error) {
      console.error('Avatar upload error:', error);
      toast.error('Profilbild konnte nicht hochgeladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      await authService.exportUserData();
      toast.success('Datenexport gestartet. Sie erhalten eine E-Mail mit dem Download-Link.');
    } catch (error) {
      console.error('Data export error:', error);
      toast.error('Datenexport fehlgeschlagen');
    }
  };

  const handleAccountDeletion = async () => {
    const confirmation = window.prompt(
      'Um Ihr Konto zu löschen, geben Sie "LÖSCHEN" ein:'
    );
    
    if (confirmation !== 'LÖSCHEN') {
      return;
    }

    const finalConfirmation = window.confirm(
      'Sind Sie sich wirklich sicher? Diese Aktion kann nicht rückgängig gemacht werden.'
    );

    if (!finalConfirmation) return;

    try {
      await authService.deleteAccount();
      toast.success('Konto erfolgreich gelöscht');
      logout();
    } catch (error) {
      console.error('Account deletion error:', error);
      toast.error('Konto konnte nicht gelöscht werden');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">
            Profil & Einstellungen
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mt-2">
            Verwalten Sie Ihre persönlichen Informationen und Einstellungen
          </p>
        </div>

        <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-700 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-secondary-200 dark:border-secondary-700">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }
                  `}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
                  Persönliche Informationen
                </h2>

                {/* Avatar Section */}
                <div className="flex items-center space-x-6 mb-8">
                  <div className="relative">
                    <div className="profile-avatar">
                      {profileData.avatar_url ? (
                        <img
                          src={profileData.avatar_url}
                          alt="Profilbild"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-12 h-12" />
                      )}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
                    >
                      <CameraIcon className="w-4 h-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
                      {profileData.first_name} {profileData.last_name}
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      {user?.role === 'customer' ? 'Kunde' : 
                       user?.role === 'stylist' ? 'Stylist' :
                       user?.role === 'salon_owner' ? 'Salon-Inhaber' : 'Admin'}
                    </p>
                    <p className="text-sm text-secondary-500">
                      Mitglied seit {new Date(user?.created_at || '').toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">Vorname</label>
                      <input
                        type="text"
                        value={profileData.first_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                        className="form-input"
                        placeholder="Ihr Vorname"
                      />
                    </div>

                    <div>
                      <label className="form-label">Nachname</label>
                      <input
                        type="text"
                        value={profileData.last_name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                        className="form-input"
                        placeholder="Ihr Nachname"
                      />
                    </div>

                    <div>
                      <label className="form-label">E-Mail-Adresse</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className="form-input"
                        placeholder="ihre@email.com"
                      />
                    </div>

                    <div>
                      <label className="form-label">Telefonnummer</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="form-input"
                        placeholder="+49 123 456789"
                      />
                    </div>

                    <div>
                      <label className="form-label">Sprache</label>
                      <select
                        value={profileData.language}
                        onChange={(e) => setProfileData(prev => ({ ...prev, language: e.target.value }))}
                        className="form-select"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <LoadingSpinner size="sm" color="white" />
                          <span className="ml-2">Speichern...</span>
                        </div>
                      ) : (
                        'Änderungen speichern'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
                  Passwort ändern
                </h2>

                <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                  <div>
                    <label className="form-label">Aktuelles Passwort</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="form-input"
                      placeholder="Ihr aktuelles Passwort"
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Neues Passwort</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="form-input"
                      placeholder="Ihr neues Passwort"
                      required
                      minLength={8}
                    />
                    <p className="text-sm text-secondary-500 mt-1">
                      Mindestens 8 Zeichen
                    </p>
                  </div>

                  <div>
                    <label className="form-label">Neues Passwort bestätigen</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="form-input"
                      placeholder="Neues Passwort wiederholen"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Ändern...' : 'Passwort ändern'}
                  </button>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
                  Benachrichtigungseinstellungen
                </h2>

                <div className="space-y-6">
                  {Object.entries(notificationSettings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-secondary-900 dark:text-white">
                          {key === 'emailNotifications' && 'E-Mail-Benachrichtigungen'}
                          {key === 'pushNotifications' && 'Push-Benachrichtigungen'}
                          {key === 'smsNotifications' && 'SMS-Benachrichtigungen'}
                          {key === 'marketingEmails' && 'Marketing E-Mails'}
                          {key === 'appointmentReminders' && 'Termin-Erinnerungen'}
                          {key === 'promotionalOffers' && 'Werbeangebote'}
                        </h3>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">
                          {key === 'emailNotifications' && 'Erhalten Sie wichtige Updates per E-Mail'}
                          {key === 'pushNotifications' && 'Browser-Benachrichtigungen aktivieren'}
                          {key === 'smsNotifications' && 'Erhalten Sie SMS-Nachrichten'}
                          {key === 'marketingEmails' && 'Informationen über neue Features und Tipps'}
                          {key === 'appointmentReminders' && 'Erinnerungen vor Ihren Terminen'}
                          {key === 'promotionalOffers' && 'Sonderangebote und Rabatte'}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => setNotificationSettings(prev => ({ 
                            ...prev, 
                            [key]: e.target.checked 
                          }))}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-secondary-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-secondary-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <button className="btn-primary">
                    Einstellungen speichern
                  </button>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold text-secondary-900 dark:text-white mb-6">
                  Datenschutz & Sicherheit
                </h2>

                <div className="space-y-8">
                  {/* Data Export */}
                  <div className="card p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <DocumentArrowDownIcon className="w-8 h-8 text-blue-600 mr-4" />
                        <div>
                          <h3 className="font-medium text-secondary-900 dark:text-white">
                            Daten exportieren
                          </h3>
                          <p className="text-sm text-secondary-600 dark:text-secondary-400 mt-1">
                            Laden Sie eine Kopie Ihrer persönlichen Daten herunter
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleDataExport}
                        className="btn-outline"
                      >
                        Export starten
                      </button>
                    </div>
                  </div>

                  {/* Account Deletion */}
                  <div className="card p-6 border-red-200 dark:border-red-800">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <TrashIcon className="w-8 h-8 text-red-600 mr-4" />
                        <div>
                          <h3 className="font-medium text-red-900 dark:text-red-300">
                            Konto löschen
                          </h3>
                          <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                            Löschen Sie Ihr Konto und alle zugehörigen Daten permanent
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleAccountDeletion}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Konto löschen
                      </button>
                    </div>
                  </div>

                  {/* Privacy Information */}
                  <div className="bg-secondary-50 dark:bg-secondary-700 rounded-lg p-6">
                    <h3 className="font-medium text-secondary-900 dark:text-white mb-4">
                      Ihre Daten bei uns
                    </h3>
                    <ul className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
                      <li>• Wir speichern nur die notwendigen Daten für die App-Funktionalität</li>
                      <li>• Ihre Daten werden nicht an Dritte verkauft oder weitergegeben</li>
                      <li>• Sie können jederzeit eine Kopie Ihrer Daten anfordern</li>
                      <li>• Bei Kontolöschung werden alle Daten permanent entfernt</li>
                    </ul>
                    <div className="mt-4">
                      <a
                        href="/privacy"
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        Vollständige Datenschutzerklärung →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;