import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  StarIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  SparklesIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import * as salonService from '../services/salonService';
import LoadingSpinner from '../components/LoadingSpinner';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [featuredSalons, setFeaturedSalons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedSalons();
  }, []);

  const loadFeaturedSalons = async () => {
    try {
      const salons = await salonService.getSalons({ limit: 6, minRating: 4.0 });
      setFeaturedSalons(salons || []);
    } catch (error) {
      console.error('Error loading featured salons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append('search', searchQuery);
    if (searchCity.trim()) params.append('city', searchCity);
    
    navigate(`/salons?${params.toString()}`);
  };

  const features = [
    {
      icon: CalendarDaysIcon,
      title: 'Einfache Terminbuchung',
      description: 'Buche deinen Termin online in wenigen Klicks - 24/7 verfügbar.',
    },
    {
      icon: MapPinIcon,
      title: 'Salons in deiner Nähe',
      description: 'Finde die besten Salons und Studios in deiner Stadt.',
    },
    {
      icon: StarIcon,
      title: 'Bewertungen & Reviews',
      description: 'Echte Bewertungen helfen dir bei der Auswahl des perfekten Salons.',
    },
    {
      icon: CreditCardIcon,
      title: 'Sichere Zahlung',
      description: 'Bezahle sicher online mit verschiedenen Zahlungsmethoden.',
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile App',
      description: 'Verwalte deine Termine unterwegs mit unserer PWA-App.',
    },
    {
      icon: SparklesIcon,
      title: 'KI-Empfehlungen',
      description: 'Erhalte personalisierte Frisur- und Terminvorschläge.',
    },
  ];

  const salonFeatures = [
    {
      icon: UserGroupIcon,
      title: 'Kundenverwaltung',
      description: 'Verwalte alle Kunden zentral mit detaillierten Profilen.',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Terminplanung',
      description: 'Intelligente Terminplanung mit Konfliktprüfung.',
    },
    {
      icon: ChartBarIcon,
      title: 'Analytics & Reports',
      description: 'Detaillierte Auswertungen und Geschäftsanalysen.',
    },
  ];

  const stats = [
    { number: '5.000+', label: 'Zufriedene Kunden' },
    { number: '250+', label: 'Partner Salons' },
    { number: '50.000+', label: 'Termine gebucht' },
    { number: '4.8/5', label: 'Durchschnittsbewertung' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section hero-pattern relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900 dark:to-primary-800"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 dark:text-white mb-6">
              Der moderne Weg zu
              <span className="text-gradient-primary"> deinem Traumtermin</span>
            </h1>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 mb-8 max-w-3xl mx-auto">
              Entdecke die besten Salons in deiner Stadt, buche Termine online 
              und genieße eine erstklassige Beauty-Erfahrung.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white dark:bg-secondary-800 rounded-2xl shadow-lg">
                <div className="flex-1 relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Salon, Service oder Stylist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Stadt oder PLZ..."
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-primary-500 dark:bg-secondary-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary px-8 py-3 rounded-xl font-semibold whitespace-nowrap"
                >
                  Suchen
                </button>
              </div>
            </form>

            {/* Quick Actions */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="btn-primary px-8 py-3 rounded-xl font-semibold"
                >
                  Kostenlos registrieren
                </Link>
                <Link
                  to="/salons"
                  className="btn-outline px-8 py-3 rounded-xl font-semibold dark:border-secondary-600 dark:text-secondary-300"
                >
                  Salons entdecken
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-secondary-600 dark:text-secondary-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Salons */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
              Beliebte Salons
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              Entdecke die bestbewerteten Salons in deiner Nähe
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredSalons.map((salon) => (
                <Link
                  key={salon.id}
                  to={`/salon/${salon.slug}`}
                  className="salon-card group"
                >
                  <div className="relative">
                    <img
                      src={salon.images?.[0] || '/api/placeholder/300/200'}
                      alt={salon.name}
                      className="salon-card-image"
                    />
                    <div className="salon-card-overlay group-hover:opacity-70" />
                    <div className="salon-card-badge">
                      <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                      {salon.rating?.toFixed(1) || '0.0'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-2">
                      {salon.name}
                    </h3>
                    <p className="text-secondary-600 dark:text-secondary-300 mb-3 line-clamp-2">
                      {salon.description}
                    </p>
                    <div className="flex items-center text-secondary-500 dark:text-secondary-400 text-sm">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      {salon.city}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/salons"
              className="btn-primary px-8 py-3 rounded-xl font-semibold"
            >
              Alle Salons ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Features for Customers */}
      <section className="py-20 bg-white dark:bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
              Warum SalonManager?
            </h2>
            <p className="text-xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto">
              Moderne Features für die beste Beauty-Erfahrung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center p-8 hover-lift">
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-600 dark:text-secondary-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Salons Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Für Salon-Inhaber
            </h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Moderne Salon-Verwaltung leicht gemacht
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {salonFeatures.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  {feature.title}
                </h3>
                <p className="text-primary-100">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/register"
              className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-all duration-200"
            >
              Salon registrieren
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-secondary-900 dark:text-white mb-6">
            Bereit für deinen nächsten Termin?
          </h2>
          <p className="text-xl text-secondary-600 dark:text-secondary-300 mb-8">
            Registriere dich kostenlos und entdecke die Zukunft der Terminbuchung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary px-8 py-3 rounded-xl font-semibold"
            >
              Jetzt registrieren
            </Link>
            <Link
              to="/salons"
              className="btn-outline px-8 py-3 rounded-xl font-semibold"
            >
              Salons entdecken
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;