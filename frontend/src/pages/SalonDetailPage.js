import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  ClockIcon,
  CalendarDaysIcon,
  HeartIcon,
  ShareIcon,
  CameraIcon,
  UserGroupIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import * as salonService from '../services/salonService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const SalonDetailPage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadSalonDetails();
  }, [slug]);

  const loadSalonDetails = async () => {
    setLoading(true);
    try {
      // Load salon data
      const salonData = await salonService.getSalonById(slug);
      setSalon(salonData);

      // Load services
      const servicesData = await salonService.getSalonServices(salonData.id);
      setServices(servicesData || []);

      // Load reviews
      const reviewsData = await salonService.getSalonReviews(salonData.id);
      setReviews(reviewsData || []);

      // Load stylists (placeholder - would need API endpoint)
      setStylists([
        {
          id: '1',
          name: 'Maria Schmidt',
          specialties: ['Schnitt', 'Farbe'],
          rating: 4.9,
          avatar: '/api/placeholder/80/80',
        },
        {
          id: '2', 
          name: 'Thomas Weber',
          specialties: ['Herrenschnitt', 'Bart'],
          rating: 4.8,
          avatar: '/api/placeholder/80/80',
        }
      ]);

    } catch (error) {
      console.error('Error loading salon details:', error);
      toast.error('Salon konnte nicht geladen werden');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      toast.error('Bitte melden Sie sich an, um einen Termin zu buchen');
      navigate('/login');
      return;
    }
    navigate(`/booking/${salon.id}`);
  };

  const toggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Bitte melden Sie sich an');
      return;
    }
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Aus Favoriten entfernt' : 'Zu Favoriten hinzugefügt');
  };

  const shareUrl = () => {
    if (navigator.share) {
      navigator.share({
        title: salon.name,
        text: salon.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link kopiert!');
    }
  };

  const formatOpeningHours = (hours) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayNames = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    
    return days.map((day, index) => {
      const dayHours = hours[day];
      return {
        day: dayNames[index],
        hours: dayHours ? `${dayHours.open} - ${dayHours.close}` : 'Geschlossen'
      };
    });
  };

  const tabs = [
    { id: 'overview', label: 'Übersicht', count: null },
    { id: 'services', label: 'Services', count: services.length },
    { id: 'stylists', label: 'Team', count: stylists.length },
    { id: 'reviews', label: 'Bewertungen', count: reviews.length },
    { id: 'gallery', label: 'Galerie', count: salon?.images?.length || 0 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Salon nicht gefunden</h1>
          <Link to="/salons" className="btn-primary mt-4 inline-block">
            Zurück zur Suche
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900">
      {/* Header Image */}
      <div className="relative h-80 lg:h-96 bg-secondary-300 dark:bg-secondary-700">
        {salon.images && salon.images.length > 0 ? (
          <img
            src={salon.images[selectedImageIndex] || '/api/placeholder/1200/400'}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800">
            <CameraIcon className="w-20 h-20 text-primary-300" />
          </div>
        )}
        
        {/* Image Navigation */}
        {salon.images && salon.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {salon.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === selectedImageIndex
                    ? 'bg-white'
                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                }`}
              />
            ))}
          </div>
        )}

        {/* Overlay Actions */}
        <div className="absolute top-6 right-6 flex space-x-3">
          <button
            onClick={shareUrl}
            className="p-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full hover:bg-opacity-100 transition-all"
          >
            <ShareIcon className="w-5 h-5 text-secondary-600" />
          </button>
          <button
            onClick={toggleFavorite}
            className="p-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-full hover:bg-opacity-100 transition-all"
          >
            {isFavorite ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-secondary-600" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Salon Info Header */}
          <div className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-white">
                    {salon.name}
                  </h1>
                  {salon.verified && (
                    <CheckBadgeIcon className="w-8 h-8 text-blue-500" />
                  )}
                </div>

                <div className="flex items-center gap-4 mb-4 text-secondary-600 dark:text-secondary-400">
                  <div className="flex items-center">
                    <StarIcon className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-medium text-secondary-900 dark:text-white">
                      {salon.rating?.toFixed(1) || '0.0'}
                    </span>
                    <span className="ml-1">({salon.reviews_count || 0} Bewertungen)</span>
                  </div>
                  <div className="flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-1" />
                    <span>{salon.address}, {salon.city}</span>
                  </div>
                </div>

                <p className="text-secondary-600 dark:text-secondary-300 text-lg mb-6 max-w-2xl">
                  {salon.description || 'Willkommen in unserem Salon! Wir freuen uns auf Ihren Besuch.'}
                </p>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-center p-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <PhoneIcon className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">Telefon</p>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {salon.phone}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <ClockIcon className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">Heute</p>
                      <p className="font-medium text-secondary-900 dark:text-white">09:00 - 18:00</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-4 bg-secondary-50 dark:bg-secondary-700 rounded-lg">
                    <UserGroupIcon className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">Team</p>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {stylists.length} Stylisten
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="card p-6 sticky top-6">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-primary-600 mb-2">
                      Ab €{Math.min(...services.map(s => s.price || 50), 50)}
                    </div>
                    <p className="text-secondary-600 dark:text-secondary-400">pro Service</p>
                  </div>
                  
                  <button
                    onClick={handleBooking}
                    className="w-full btn-primary py-3 text-lg font-semibold mb-4"
                  >
                    <CalendarDaysIcon className="w-6 h-6 mr-2 inline" />
                    Termin buchen
                  </button>
                  
                  <div className="text-center text-sm text-secondary-600 dark:text-secondary-400">
                    Kostenlose Stornierung bis 24h vorher
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-secondary-200 dark:border-secondary-700">
            <nav className="flex space-x-8 px-6 lg:px-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                    }
                  `}
                >
                  {tab.label}
                  {tab.count !== null && (
                    <span className="ml-2 bg-secondary-100 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-300 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6 lg:p-8">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* About */}
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                    Über uns
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-300">
                    {salon.description || 'Unser Salon bietet erstklassige Haar- und Beauty-Services in entspannter Atmosphäre. Unser erfahrenes Team freut sich darauf, Sie zu verwöhnen.'}
                  </p>
                </div>

                {/* Opening Hours */}
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                    Öffnungszeiten
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {formatOpeningHours(salon.opening_hours || {}).map((day, index) => (
                      <div key={index} className="flex justify-between py-2">
                        <span className="text-secondary-600 dark:text-secondary-400">{day.day}</span>
                        <span className="font-medium text-secondary-900 dark:text-white">{day.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-4">
                    Ausstattung
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(salon.amenities || ['WLAN', 'Parkplätze', 'Klimaanlage', 'Kaffee']).map((amenity, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-sm rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'services' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="service-card">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-lg font-semibold text-secondary-900 dark:text-white">
                        {service.name}
                      </h4>
                      <div className="service-price">€{service.price}</div>
                    </div>
                    <p className="text-secondary-600 dark:text-secondary-300 mb-3">
                      {service.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="service-duration">
                        <ClockIcon className="w-4 h-4 mr-1 inline" />
                        {service.duration_minutes} Min
                      </span>
                      <button
                        onClick={handleBooking}
                        className="btn-outline px-4 py-2 text-sm"
                      >
                        Buchen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'stylists' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {stylists.map((stylist) => (
                  <div key={stylist.id} className="card p-6 text-center">
                    <img
                      src={stylist.avatar}
                      alt={stylist.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                    />
                    <h4 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                      {stylist.name}
                    </h4>
                    <div className="flex items-center justify-center mb-3">
                      <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-medium">{stylist.rating}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {stylist.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-secondary-100 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-xs rounded-full"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="card p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mr-3">
                            <span className="text-primary-600 font-medium">
                              {review.customer_name?.[0] || 'K'}
                            </span>
                          </div>
                          <div>
                            <h5 className="font-medium text-secondary-900 dark:text-white">
                              {review.customer_name || 'Anonymer Kunde'}
                            </h5>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <StarIcon
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-500'
                                      : 'text-secondary-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-secondary-500">
                          {new Date(review.created_at).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-secondary-600 dark:text-secondary-300">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                      Noch keine Bewertungen
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      Seien Sie der erste, der diesen Salon bewertet!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {salon.images && salon.images.length > 0 ? (
                  salon.images.map((image, index) => (
                    <div
                      key={index}
                      className="aspect-square bg-secondary-200 dark:bg-secondary-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image}
                        alt={`Galerie ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <CameraIcon className="w-16 h-16 text-secondary-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 dark:text-white mb-2">
                      Keine Bilder verfügbar
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-400">
                      Bald werden hier Bilder des Salons zu sehen sein.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonDetailPage;