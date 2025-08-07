import React, { useState, useRef } from 'react';
import { useAuth } from '../App';
import {
  SparklesIcon,
  PhotoIcon,
  CameraIcon,
  BoltIcon,
  AdjustmentsHorizontalIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const AIFeaturesPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('haircut-suggestions');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const [haircutForm, setHaircutForm] = useState({
    face_shape: '',
    hair_type: '',
    lifestyle: '',
    maintenance: '',
    age_range: '',
    style_preference: ''
  });

  const [virtualTryOn, setVirtualTryOn] = useState({
    uploaded_image: null,
    selected_hairstyle: null,
    processing: false,
    result_image: null
  });

  const faceShapes = [
    { value: 'oval', label: 'Oval' },
    { value: 'round', label: 'Rund' },
    { value: 'square', label: 'Eckig' },
    { value: 'heart', label: 'Herzförmig' },
    { value: 'oblong', label: 'Länglich' },
    { value: 'diamond', label: 'Diamant' },
  ];

  const hairTypes = [
    { value: 'straight', label: 'Glatt' },
    { value: 'wavy', label: 'Wellig' },
    { value: 'curly', label: 'Lockig' },
    { value: 'coily', label: 'Kraus' },
    { value: 'thin', label: 'Dünn' },
    { value: 'thick', label: 'Dick' },
  ];

  const lifestyles = [
    { value: 'professional', label: 'Beruflich/Formal' },
    { value: 'casual', label: 'Lässig/Alltag' },
    { value: 'active', label: 'Sportlich/Aktiv' },
    { value: 'trendy', label: 'Trendig/Modisch' },
    { value: 'classic', label: 'Klassisch/Zeitlos' },
  ];

  const maintenanceLevels = [
    { value: 'low', label: 'Niedrig (wenig Aufwand)' },
    { value: 'medium', label: 'Mittel (moderater Aufwand)' },
    { value: 'high', label: 'Hoch (viel Aufwand)' },
  ];

  const ageRanges = [
    { value: '16-25', label: '16-25 Jahre' },
    { value: '26-35', label: '26-35 Jahre' },
    { value: '36-45', label: '36-45 Jahre' },
    { value: '46-55', label: '46-55 Jahre' },
    { value: '55+', label: '55+ Jahre' },
  ];

  const stylePreferences = [
    { value: 'edgy', label: 'Kantig/Rebellisch' },
    { value: 'elegant', label: 'Elegant/Sophisticated' },
    { value: 'minimalist', label: 'Minimalistisch/Clean' },
    { value: 'bohemian', label: 'Bohème/Künstlerisch' },
    { value: 'vintage', label: 'Vintage/Retro' },
  ];

  const popularHairstyles = [
    {
      id: 1,
      name: 'Modern Fade',
      image: '/api/placeholder/200/250',
      description: 'Klassischer Fade Cut mit modernem Touch'
    },
    {
      id: 2,
      name: 'Textured Crop',
      image: '/api/placeholder/200/250',
      description: 'Strukturierter Crop für natürlichen Look'
    },
    {
      id: 3,
      name: 'Classic Pompadour',
      image: '/api/placeholder/200/250',
      description: 'Zeitloser Pompadour-Style'
    },
    {
      id: 4,
      name: 'Messy Quiff',
      image: '/api/placeholder/200/250',
      description: 'Lässiger Quiff für den Alltag'
    },
    {
      id: 5,
      name: 'Side Part',
      image: '/api/placeholder/200/250',
      description: 'Professioneller Seitenscheitel'
    },
    {
      id: 6,
      name: 'Buzz Cut',
      image: '/api/placeholder/200/250',
      description: 'Pflegeleichter Buzz Cut'
    },
  ];

  const getHaircutSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/haircut-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(haircutForm)
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data);
      } else {
        throw new Error('Failed to get suggestions');
      }
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast.error('Fehler beim Abrufen der KI-Vorschläge');
      
      // Mock response for demonstration
      setResults({
        suggestions: [
          {
            style: 'Textured Crop',
            confidence: 95,
            description: 'Perfekt für Ihr Gesicht und Ihren Lifestyle',
            maintenance: 'Niedrig',
            image: '/api/placeholder/300/400'
          },
          {
            style: 'Modern Fade',
            confidence: 88,
            description: 'Zeitlos und professionell',
            maintenance: 'Mittel',
            image: '/api/placeholder/300/400'
          },
          {
            style: 'Side Part',
            confidence: 82,
            description: 'Klassisch und elegant',
            maintenance: 'Niedrig',
            image: '/api/placeholder/300/400'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bild ist zu groß. Maximum: 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setVirtualTryOn(prev => ({
        ...prev,
        uploaded_image: e.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const processVirtualTryOn = async () => {
    if (!virtualTryOn.uploaded_image || !virtualTryOn.selected_hairstyle) {
      toast.error('Bitte wählen Sie ein Bild und eine Frisur aus');
      return;
    }

    setVirtualTryOn(prev => ({ ...prev, processing: true }));

    try {
      const formData = new FormData();
      formData.append('image', virtualTryOn.uploaded_image);
      formData.append('hairstyle_id', virtualTryOn.selected_hairstyle);

      const response = await fetch('/api/ai/virtual-try-on', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getToken('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setVirtualTryOn(prev => ({
          ...prev,
          result_image: data.result_image_url,
          processing: false
        }));
        toast.success('Virtueller Try-On erfolgreich!');
      } else {
        throw new Error('Virtual try-on failed');
      }
    } catch (error) {
      console.error('Error processing virtual try-on:', error);
      toast.error('Fehler beim Virtual Try-On');
      
      // Mock result for demonstration
      setTimeout(() => {
        setVirtualTryOn(prev => ({
          ...prev,
          result_image: '/api/placeholder/400/500',
          processing: false
        }));
        toast.success('Virtueller Try-On abgeschlossen!');
      }, 3000);
    }
  };

  const tabs = [
    {
      id: 'haircut-suggestions',
      name: 'KI-Frisurenvorschläge',
      icon: SparklesIcon,
      description: 'Personalisierte Empfehlungen basierend auf Ihren Eigenschaften'
    },
    {
      id: 'virtual-try-on',
      name: 'Virtueller Try-On',
      icon: CameraIcon,
      description: 'Testen Sie verschiedene Frisuren an Ihrem eigenen Foto'
    },
    {
      id: 'style-matcher',
      name: 'Style-Matcher',
      icon: AdjustmentsHorizontalIcon,
      description: 'Finden Sie ähnliche Styles aus unserer Galerie'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <BoltIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              KI-gestützte <span className="text-gradient-purple">Hair-Tech</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Entdecken Sie die Zukunft der Frisurberatung mit künstlicher Intelligenz
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-6 rounded-2xl text-left transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-8 h-8 mb-3" />
              <h3 className="text-lg font-bold mb-2">{tab.name}</h3>
              <p className="text-sm opacity-80">{tab.description}</p>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="card p-8">
          {/* Haircut Suggestions Tab */}
          {activeTab === 'haircut-suggestions' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Personalisierte <span className="text-gradient-purple">Frisurenvorschläge</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Gesichtsform
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {faceShapes.map((shape) => (
                        <button
                          key={shape.value}
                          onClick={() => setHaircutForm(prev => ({ ...prev, face_shape: shape.value }))}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            haircutForm.face_shape === shape.value
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {shape.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Haartyp
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {hairTypes.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => setHaircutForm(prev => ({ ...prev, hair_type: type.value }))}
                          className={`p-3 rounded-lg text-sm font-medium transition-all ${
                            haircutForm.hair_type === type.value
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Lifestyle
                    </label>
                    <select
                      value={haircutForm.lifestyle}
                      onChange={(e) => setHaircutForm(prev => ({ ...prev, lifestyle: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    >
                      <option value="">Wählen Sie...</option>
                      {lifestyles.map((lifestyle) => (
                        <option key={lifestyle.value} value={lifestyle.value}>
                          {lifestyle.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Pflegeaufwand
                    </label>
                    <select
                      value={haircutForm.maintenance}
                      onChange={(e) => setHaircutForm(prev => ({ ...prev, maintenance: e.target.value }))}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white"
                    >
                      <option value="">Wählen Sie...</option>
                      {maintenanceLevels.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={getHaircutSuggestions}
                    disabled={loading || !haircutForm.face_shape || !haircutForm.hair_type}
                    className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="spinner w-6 h-6 mr-3"></div>
                        KI analysiert...
                      </div>
                    ) : (
                      'KI-Vorschläge erhalten'
                    )}
                  </button>
                </div>

                {/* Results */}
                <div>
                  {results ? (
                    <div>
                      <h3 className="text-xl font-bold text-white mb-6">
                        Ihre persönlichen Empfehlungen
                      </h3>
                      <div className="space-y-6">
                        {results.suggestions.map((suggestion, index) => (
                          <div key={index} className="bg-gray-800 rounded-xl p-6">
                            <div className="flex items-start space-x-4">
                              <img
                                src={suggestion.image}
                                alt={suggestion.style}
                                className="w-20 h-24 object-cover rounded-lg"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-lg font-bold text-white">
                                    {suggestion.style}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <div className="text-green-400 font-bold">
                                      {suggestion.confidence}%
                                    </div>
                                    <CheckCircleIcon className="w-5 h-5 text-green-400" />
                                  </div>
                                </div>
                                <p className="text-gray-400 mb-3">
                                  {suggestion.description}
                                </p>
                                <div className="flex items-center space-x-4 text-sm">
                                  <span className="bg-purple-500 bg-opacity-20 text-purple-400 px-3 py-1 rounded-full">
                                    Pflege: {suggestion.maintenance}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <SparklesIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Bereit für KI-Magie?
                      </h3>
                      <p className="text-gray-400">
                        Füllen Sie das Formular aus, um personalisierte Frisurenvorschläge zu erhalten.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Virtual Try-On Tab */}
          {activeTab === 'virtual-try-on' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Virtueller <span className="text-gradient-purple">Frisuren Try-On</span>
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload & Selection */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      1. Ihr Foto hochladen
                    </h3>
                    
                    {!virtualTryOn.uploaded_image ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 transition-colors"
                      >
                        <PhotoIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-white font-medium mb-2">
                          Klicken Sie hier, um ein Foto hochzuladen
                        </p>
                        <p className="text-gray-400 text-sm">
                          Unterstützt: JPG, PNG (max. 10MB)
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={virtualTryOn.uploaded_image}
                          alt="Uploaded"
                          className="w-full h-80 object-cover rounded-xl"
                        />
                        <button
                          onClick={() => setVirtualTryOn(prev => ({ ...prev, uploaded_image: null }))}
                          className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <XCircleIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">
                      2. Frisur auswählen
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4">
                      {popularHairstyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setVirtualTryOn(prev => ({ ...prev, selected_hairstyle: style.id }))}
                          className={`relative rounded-xl overflow-hidden transition-all ${
                            virtualTryOn.selected_hairstyle === style.id
                              ? 'ring-2 ring-purple-500'
                              : 'hover:scale-105'
                          }`}
                        >
                          <img
                            src={style.image}
                            alt={style.name}
                            className="w-full h-24 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                            <p className="text-white text-xs font-medium p-2">
                              {style.name}
                            </p>
                          </div>
                          {virtualTryOn.selected_hairstyle === style.id && (
                            <div className="absolute top-2 right-2">
                              <CheckCircleIcon className="w-5 h-5 text-purple-500 bg-white rounded-full" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={processVirtualTryOn}
                    disabled={!virtualTryOn.uploaded_image || !virtualTryOn.selected_hairstyle || virtualTryOn.processing}
                    className="btn-primary w-full py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {virtualTryOn.processing ? (
                      <div className="flex items-center justify-center">
                        <ArrowPathIcon className="w-6 h-6 mr-3 animate-spin" />
                        Verarbeitung läuft...
                      </div>
                    ) : (
                      'Virtuellen Try-On starten'
                    )}
                  </button>
                </div>

                {/* Result */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">
                    3. Ergebnis
                  </h3>
                  
                  {virtualTryOn.result_image ? (
                    <div className="space-y-4">
                      <img
                        src={virtualTryOn.result_image}
                        alt="Virtual try-on result"
                        className="w-full h-80 object-cover rounded-xl"
                      />
                      <div className="flex space-x-3">
                        <button className="flex-1 btn-primary py-3">
                          Termin buchen
                        </button>
                        <button className="flex-1 btn-outline py-3">
                          Speichern
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center">
                      <CameraIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">
                        Ihr Ergebnis wird hier angezeigt
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Style Matcher Tab */}
          {activeTab === 'style-matcher' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">
                Style <span className="text-gradient-purple">Matcher</span>
              </h2>
              
              <div className="text-center py-12">
                <AdjustmentsHorizontalIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Coming Soon
                </h3>
                <p className="text-gray-400">
                  Diese Funktion wird in Kürze verfügbar sein.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add purple gradient CSS class
const style = document.createElement('style');
style.textContent = `
  .text-gradient-purple {
    background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

export default AIFeaturesPage;