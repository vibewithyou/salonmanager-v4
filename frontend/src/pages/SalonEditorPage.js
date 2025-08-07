import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  SwatchIcon,
  PhotoIcon,
  PaintBrushIcon,
  CogIcon,
  MapPinIcon,
  ClockIcon,
  TagIcon,
  UserGroupIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const SalonEditorPage = () => {
  const { salonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salon, setSalon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('design');

  const [salonData, setSalonData] = useState({
    // Basic Info
    name: '',
    description: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    postal_code: '',
    
    // Design Settings
    primary_color: '#d4af37',
    secondary_color: '#1a1a1a',
    accent_color: '#8b6914',
    background_color: '#0d0d0d',
    text_color: '#ffffff',
    logo_url: '',
    header_image: '',
    
    // Business Hours
    business_hours: {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '10:00', close: '16:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: true },
    },
    
    // Services
    services: [],
    
    // Gallery
    gallery_images: [],
    
    // Team
    team_members: [],
    
    // Settings
    settings: {
      allow_online_booking: true,
      require_confirmation: false,
      advance_booking_days: 30,
      cancellation_hours: 24,
      show_prices: true,
      show_duration: true,
      enable_reviews: true,
      auto_confirm_bookings: false,
    }
  });

  const tabs = [
    { id: 'design', label: 'Design & Branding', icon: PaintBrushIcon },
    { id: 'info', label: 'Salon Info', icon: MapPinIcon },
    { id: 'hours', label: 'Öffnungszeiten', icon: ClockIcon },
    { id: 'services', label: 'Dienstleistungen', icon: TagIcon },
    { id: 'team', label: 'Team', icon: UserGroupIcon },
    { id: 'gallery', label: 'Galerie', icon: PhotoIcon },
    { id: 'settings', label: 'Einstellungen', icon: CogIcon },
  ];

  useEffect(() => {
    loadSalon();
  }, [salonId]);

  const loadSalon = async () => {
    try {
      // Load salon data from API
      const response = await fetch(`/api/salons/${salonId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSalon(data);
        setSalonData(prevData => ({ ...prevData, ...data }));
      }
    } catch (error) {
      console.error('Error loading salon:', error);
      toast.error('Fehler beim Laden der Salon-Daten');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/salons/${salonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(salonData)
      });

      if (response.ok) {
        toast.success('Salon erfolgreich aktualisiert!');
        loadSalon(); // Reload to get updated data
      } else {
        throw new Error('Failed to update salon');
      }
    } catch (error) {
      console.error('Error saving salon:', error);
      toast.error('Fehler beim Speichern der Änderungen');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setSalonData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setSalonData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      name: '',
      description: '',
      duration: 60,
      price: 0,
      category: 'Haarschnitt'
    };
    
    setSalonData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }));
  };

  const updateService = (index, field, value) => {
    setSalonData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const removeService = (index) => {
    setSalonData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const addTeamMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: '',
      role: 'Stylist',
      bio: '',
      specialties: [],
      image_url: '',
      available: true
    };
    
    setSalonData(prev => ({
      ...prev,
      team_members: [...prev.team_members, newMember]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Salon <span className="text-gradient-gold">Editor</span>
              </h1>
              <p className="text-gray-400 mt-1">
                Passe dein Salon-Profil individuell an
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-outline px-4 py-2"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-6 py-2"
              >
                {saving ? 'Speichern...' : 'Änderungen speichern'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <nav className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-yellow-500 bg-opacity-20 text-yellow-500'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card p-8">
              
              {/* Design & Branding Tab */}
              {activeTab === 'design' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Design & Branding
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Color Settings */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Farbschema</h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Primärfarbe
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={salonData.primary_color}
                              onChange={(e) => handleInputChange('primary_color', e.target.value)}
                              className="w-12 h-10 rounded-lg border border-gray-600 bg-transparent"
                            />
                            <input
                              type="text"
                              value={salonData.primary_color}
                              onChange={(e) => handleInputChange('primary_color', e.target.value)}
                              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Sekundärfarbe
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={salonData.secondary_color}
                              onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                              className="w-12 h-10 rounded-lg border border-gray-600 bg-transparent"
                            />
                            <input
                              type="text"
                              value={salonData.secondary_color}
                              onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Akzentfarbe
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={salonData.accent_color}
                              onChange={(e) => handleInputChange('accent_color', e.target.value)}
                              className="w-12 h-10 rounded-lg border border-gray-600 bg-transparent"
                            />
                            <input
                              type="text"
                              value={salonData.accent_color}
                              onChange={(e) => handleInputChange('accent_color', e.target.value)}
                              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Hintergrund
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={salonData.background_color}
                              onChange={(e) => handleInputChange('background_color', e.target.value)}
                              className="w-12 h-10 rounded-lg border border-gray-600 bg-transparent"
                            />
                            <input
                              type="text"
                              value={salonData.background_color}
                              onChange={(e) => handleInputChange('background_color', e.target.value)}
                              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Textfarbe
                          </label>
                          <div className="flex items-center space-x-2">
                            <input
                              type="color"
                              value={salonData.text_color}
                              onChange={(e) => handleInputChange('text_color', e.target.value)}
                              className="w-12 h-10 rounded-lg border border-gray-600 bg-transparent"
                            />
                            <input
                              type="text"
                              value={salonData.text_color}
                              onChange={(e) => handleInputChange('text_color', e.target.value)}
                              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Logo & Images */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Bilder</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Logo URL
                          </label>
                          <input
                            type="url"
                            value={salonData.logo_url}
                            onChange={(e) => handleInputChange('logo_url', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                            placeholder="https://example.com/logo.png"
                          />
                          <p className="text-sm text-gray-400 mt-1">
                            Empfohlene Größe: 200x200px
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Header-Bild URL
                          </label>
                          <input
                            type="url"
                            value={salonData.header_image}
                            onChange={(e) => handleInputChange('header_image', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                            placeholder="https://example.com/header.jpg"
                          />
                          <p className="text-sm text-gray-400 mt-1">
                            Empfohlene Größe: 1200x400px
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Vorschau</h3>
                      <div 
                        className="p-6 rounded-lg border-2 border-dashed border-gray-600"
                        style={{ 
                          backgroundColor: salonData.background_color,
                          color: salonData.text_color,
                          borderColor: salonData.primary_color + '40'
                        }}
                      >
                        <div className="flex items-center space-x-4 mb-4">
                          {salonData.logo_url && (
                            <img 
                              src={salonData.logo_url} 
                              alt="Logo" 
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <h4 className="text-xl font-bold" style={{ color: salonData.primary_color }}>
                              {salonData.name || 'Ihr Salon Name'}
                            </h4>
                            <p className="opacity-80">
                              {salonData.description || 'Salon Beschreibung'}
                            </p>
                          </div>
                        </div>
                        
                        <button 
                          className="px-4 py-2 rounded-lg font-semibold"
                          style={{ 
                            backgroundColor: salonData.primary_color, 
                            color: salonData.secondary_color 
                          }}
                        >
                          Beispiel Button
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Salon Info Tab */}
              {activeTab === 'info' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Salon Informationen
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Salon Name *
                        </label>
                        <input
                          type="text"
                          value={salonData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="Ihr Salon Name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Telefon
                        </label>
                        <input
                          type="tel"
                          value={salonData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="+49 123 456789"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          E-Mail
                        </label>
                        <input
                          type="email"
                          value={salonData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="info@salon.de"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={salonData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                          placeholder="https://www.salon.de"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Beschreibung
                      </label>
                      <textarea
                        value={salonData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={4}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                        placeholder="Beschreiben Sie Ihren Salon und was Sie besonders macht..."
                      />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Adresse</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Straße und Hausnummer
                          </label>
                          <input
                            type="text"
                            value={salonData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Musterstraße 123"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            PLZ
                          </label>
                          <input
                            type="text"
                            value={salonData.postal_code}
                            onChange={(e) => handleInputChange('postal_code', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="12345"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Stadt
                          </label>
                          <input
                            type="text"
                            value={salonData.city}
                            onChange={(e) => handleInputChange('city', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            placeholder="Berlin"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Opening Hours Tab */}
              {activeTab === 'hours' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Öffnungszeiten
                  </h2>
                  
                  <div className="space-y-4">
                    {Object.entries(salonData.business_hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg">
                        <div className="w-24">
                          <span className="text-white font-medium capitalize">
                            {day === 'monday' && 'Montag'}
                            {day === 'tuesday' && 'Dienstag'}
                            {day === 'wednesday' && 'Mittwoch'}
                            {day === 'thursday' && 'Donnerstag'}
                            {day === 'friday' && 'Freitag'}
                            {day === 'saturday' && 'Samstag'}
                            {day === 'sunday' && 'Sonntag'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => handleNestedInputChange('business_hours', day, {
                              ...hours,
                              closed: !e.target.checked
                            })}
                            className="text-yellow-500 bg-transparent border-gray-600 rounded focus:ring-yellow-500"
                          />
                          <span className="text-gray-300 text-sm">Geöffnet</span>
                        </div>
                        
                        {!hours.closed && (
                          <>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleNestedInputChange('business_hours', day, {
                                ...hours,
                                open: e.target.value
                              })}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                            <span className="text-gray-400">bis</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleNestedInputChange('business_hours', day, {
                                ...hours,
                                close: e.target.value
                              })}
                              className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            />
                          </>
                        )}
                        
                        {hours.closed && (
                          <span className="text-gray-500 italic">Geschlossen</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Services Tab */}
              {activeTab === 'services' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">
                      Dienstleistungen
                    </h2>
                    <button
                      onClick={addService}
                      className="btn-primary px-4 py-2"
                    >
                      Neue Dienstleistung
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {salonData.services.map((service, index) => (
                      <div key={service.id || index} className="card p-6 bg-gray-800">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Name
                            </label>
                            <input
                              type="text"
                              value={service.name}
                              onChange={(e) => updateService(index, 'name', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                              placeholder="z.B. Haarschnitt"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Kategorie
                            </label>
                            <select
                              value={service.category}
                              onChange={(e) => updateService(index, 'category', e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                            >
                              <option value="Haarschnitt">Haarschnitt</option>
                              <option value="Bart Styling">Bart Styling</option>
                              <option value="Rasur">Rasur</option>
                              <option value="Färbung">Färbung</option>
                              <option value="Styling">Styling</option>
                              <option value="Massage">Massage</option>
                              <option value="Sonstiges">Sonstiges</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Dauer (Min.)
                            </label>
                            <input
                              type="number"
                              value={service.duration}
                              onChange={(e) => updateService(index, 'duration', parseInt(e.target.value))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                              min="15"
                              step="15"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Preis (€)
                            </label>
                            <input
                              type="number"
                              value={service.price}
                              onChange={(e) => updateService(index, 'price', parseFloat(e.target.value))}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm"
                              min="0"
                              step="0.50"
                            />
                          </div>
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Beschreibung
                          </label>
                          <textarea
                            value={service.description}
                            onChange={(e) => updateService(index, 'description', e.target.value)}
                            rows={2}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm resize-none"
                            placeholder="Kurze Beschreibung der Dienstleistung..."
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => removeService(index)}
                            className="text-red-400 hover:text-red-300 p-2"
                          >
                            <XMarkIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {salonData.services.length === 0 && (
                      <div className="text-center py-12">
                        <TagIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">
                          Keine Dienstleistungen
                        </h3>
                        <p className="text-gray-400 mb-4">
                          Fügen Sie Ihre ersten Dienstleistungen hinzu.
                        </p>
                        <button
                          onClick={addService}
                          className="btn-primary px-6 py-2"
                        >
                          Erste Dienstleistung hinzufügen
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Buchungseinstellungen
                  </h2>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Online-Buchungen</h3>
                          <p className="text-gray-400 text-sm">Kunden können online Termine buchen</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={salonData.settings.allow_online_booking}
                          onChange={(e) => handleNestedInputChange('settings', 'allow_online_booking', e.target.checked)}
                          className="text-yellow-500 bg-transparent border-gray-600 rounded focus:ring-yellow-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Automatische Bestätigung</h3>
                          <p className="text-gray-400 text-sm">Termine werden automatisch bestätigt</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={salonData.settings.auto_confirm_bookings}
                          onChange={(e) => handleNestedInputChange('settings', 'auto_confirm_bookings', e.target.checked)}
                          className="text-yellow-500 bg-transparent border-gray-600 rounded focus:ring-yellow-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Preise anzeigen</h3>
                          <p className="text-gray-400 text-sm">Preise werden öffentlich angezeigt</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={salonData.settings.show_prices}
                          onChange={(e) => handleNestedInputChange('settings', 'show_prices', e.target.checked)}
                          className="text-yellow-500 bg-transparent border-gray-600 rounded focus:ring-yellow-500"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">Bewertungen aktivieren</h3>
                          <p className="text-gray-400 text-sm">Kunden können Bewertungen abgeben</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={salonData.settings.enable_reviews}
                          onChange={(e) => handleNestedInputChange('settings', 'enable_reviews', e.target.checked)}
                          className="text-yellow-500 bg-transparent border-gray-600 rounded focus:ring-yellow-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Buchbar im Voraus (Tage)
                        </label>
                        <input
                          type="number"
                          value={salonData.settings.advance_booking_days}
                          onChange={(e) => handleNestedInputChange('settings', 'advance_booking_days', parseInt(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                          min="1"
                          max="365"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                          Wie weit im Voraus können Kunden buchen?
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Stornierung bis (Stunden vorher)
                        </label>
                        <input
                          type="number"
                          value={salonData.settings.cancellation_hours}
                          onChange={(e) => handleNestedInputChange('settings', 'cancellation_hours', parseInt(e.target.value))}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                          min="1"
                          max="168"
                        />
                        <p className="text-sm text-gray-400 mt-1">
                          Bis wann können Kunden kostenfrei stornieren?
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonEditorPage;